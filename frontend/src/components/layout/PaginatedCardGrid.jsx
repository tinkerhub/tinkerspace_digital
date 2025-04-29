import React, { useEffect, useState, useRef } from 'react';
import Header from './Header';
import CardItem from '../cards/CardItem';

function useGridLayout(cardWidth, cardHeight, gap) {
  const [layout, setLayout] = useState({ cols: 7, rows: 3 });

  useEffect(() => {
    function updateLayout() {
      setLayout({ cols: 7, rows: 3 });
    }
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [cardWidth, cardHeight, gap]);

  return layout;
}

const CARD_WIDTH = 210;
const CARD_HEIGHT = 280;
const GAP = 20;
const PAGE_INTERVAL = 10000;

export default function PaginatedCardGrid({ data }) {
  const { cols, rows } = useGridLayout(CARD_WIDTH, CARD_HEIGHT, GAP);
  const cardsPerPage = cols * rows;
  const totalPages = Math.ceil(data.length / cardsPerPage);
  const [page, setPage] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    setPage(0);
  }, [cols, rows]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPage((p) => (p + 1) % totalPages);
    }, PAGE_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [totalPages]);

  const start = page * cardsPerPage;
  const end = start + cardsPerPage;
  const pageCards = data.slice(start, end);
  const emptySlots = cardsPerPage - pageCards.length;

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true 
  });
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }).replace(/\//g, '/');

  const space = '\u00A0\u00A0\u00A0\u00A0\u00A0';
  const content = `${space}${currentTime}${space}•${space}${currentDate}${space}•${space}${data.length} Makers${space}•`;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <Header content={content} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${CARD_WIDTH}px)`,
        gridTemplateRows: `repeat(${rows}, ${CARD_HEIGHT}px)`,
        gap: `${GAP}px`,
        justifyContent: 'center',
        alignContent: 'start',
        padding: '24px',
        flex: 1,
      }}>
        {pageCards.map((card, i) => (
          <CardItem key={card.id || card.name || i} card={card} CARD_HEIGHT={CARD_HEIGHT} />
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div key={`empty-${i}`} style={{ background: 'transparent' }} />
        ))}
      </div>
    </div>
  );
}