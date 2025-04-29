import React, { useEffect, useState, useRef } from 'react';

function useGridLayout(cardWidth, cardHeight, gap) {
  const [layout, setLayout] = useState({ cols: 5, rows: 3 });

  useEffect(() => {
    function updateLayout() {
      setLayout({ cols: 5, rows: 3 });
    }
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [cardWidth, cardHeight, gap]);

  return layout;
}

const CARD_WIDTH = 220;
const CARD_HEIGHT = 280;
const GAP = 20;
const PAGE_INTERVAL = 5000;

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
  const currentDate = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }).replace(/\//g, '/');

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      //background: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{
          color: '#ff3b30',
          fontSize: '24px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>LiveFeed</span>
          <span style={{ color: '#666' }}>{currentTime} // {currentDate} // {data.length} Makers</span>
        </div>
        <img 
          src={process.env.PUBLIC_URL + '/images/SpaceLogo.png'}
          alt="TinkerHub"
          style={{
            height: '48px',
          }}
        />
      </div>

      {/* Card Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${CARD_WIDTH}px)`,
        gridTemplateRows: `repeat(${rows}, ${CARD_HEIGHT}px)`,
        gap: `${GAP}px`,
        justifyContent: 'center',
        alignContent: 'start',
        padding: '20px 40px',
        flex: 1,
      }}>
        {pageCards.map((card, i) => (
          <div
            key={card.id || card.name || i}
            style={{
              background: '#242424',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              height: `${CARD_HEIGHT}px`,
              position: 'relative',
            }}
          >
            {/* Purpose Badge */}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              zIndex: 2,
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}>
              {(card.subtitle || card.purpose) && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#fff',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {card.purpose}
                </div>
              )}
            </div>

            {/* Image Container */}
            <div style={{
              width: '100%',
              height: '200px',
              overflow: 'hidden',
              backgroundColor: '#1a1a1a',
              position: 'relative',
            }}>
              <img
                src={card.avatar || 'https://www.gravatar.com/avatar/?d=mp&f=y'}
                alt={card.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {/* Gradient Overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100px',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)',
              }} />
            </div>

            {/* Text Content */}
            <div style={{ 
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              flex: 1,
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#fff',
                lineHeight: '1.3',
                marginBottom: '4px',
              }}>
                {card.name}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.4',
              }}>
                {card.workingOn}
              </div>
            </div>
          </div>
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div key={`empty-${i}`} style={{ background: 'transparent' }} />
        ))}
      </div>
    </div>
  );
} 