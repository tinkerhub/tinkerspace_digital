import React, { useEffect, useState, useRef } from 'react';
import CardItem from '../cards/UserCard';
import useGridLayout from '../../hooks/useGridLayout';
import { getMakerCardsPerPage } from '../../utils/layout/makerGrid';

const CARD_WIDTH = 211;
const CARD_HEIGHT = 257;
const GAP = 32;
const PAGE_INTERVAL = 20000;

export default function PaginatedCardGrid({ data, isActive = true }) {
  const { cols, rows } = useGridLayout(CARD_WIDTH, CARD_HEIGHT, GAP);
  const totalSlots = cols * rows;
  // Keep the bottom-right grid cell clear for the fixed mascot overlay.
  const cardsPerPage = getMakerCardsPerPage(cols, rows);
  const totalPages = Math.ceil(data.length / cardsPerPage) || 1;
  const [page, setPage] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    if (isActive) {
      setPage(0);
    }
  }, [isActive, cols, rows]);

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setPage((p) => {
        // Stop at the last page instead of looping back to 0, 
        // because the orchestrator will transition to the calendar view.
        if (p + 1 >= totalPages) return p;
        return p + 1;
      });
    }, PAGE_INTERVAL);
    
    return () => clearInterval(intervalRef.current);
  }, [totalPages, isActive]);

  const start = page * cardsPerPage;
  const end = start + cardsPerPage;
  const pageCards = data.slice(start, end);
  const emptySlots = totalSlots - pageCards.length;

  return (
    <div className="flex flex-col w-full h-full relative font-mono">
      <div 
        className="flex-1 w-full flex justify-between content-start py-[clamp(1rem,2vh,1.5rem)] mt-[clamp(1rem,2vh,1.5rem)] px-12"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${CARD_WIDTH}px)`,
          gridTemplateRows: `repeat(${rows}, ${CARD_HEIGHT}px)`,
          justifyContent: 'space-between',
          alignContent: 'start',
          rowGap: `${GAP}px`
        }}
      >
        {pageCards.map((card, index) => {
          return (
            <div 
              key={card.id || card.name || index} 
              className="transition-opacity duration-500"
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT
              }}
            >
              <CardItem card={card} CARD_HEIGHT={CARD_HEIGHT} />
            </div>
          );
        })}
        {Array.from({ length: emptySlots }).map((_, i) => {
          return (
            <div 
              key={`empty-${i}`} 
              style={{ background: 'transparent', width: CARD_WIDTH, height: CARD_HEIGHT }} 
            />
          );
        })}
      </div>

      {/* Page Number Indicator */}
      {totalPages > 1 && (
        <div className="absolute bottom-8 left-12 flex items-center gap-3 z-50 pointer-events-none drop-shadow-sm transition-colors duration-500">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                i === page
                  ? 'bg-gray-800 dark:bg-white scale-125 shadow-md'
                  : 'bg-gray-400/50 dark:bg-white/20 hover:bg-gray-500/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
