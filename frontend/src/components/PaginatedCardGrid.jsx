import React, { useEffect, useState, useRef } from 'react';
import { teamMembers, projectContributor, guard } from '../utils/badgeRoles';

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

const CARD_WIDTH = 220;
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
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
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
        padding: '24px',
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
            <div style={{
              width: '100%',
              height: '200px',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <img
                src={card.avatar || `${process.env.PUBLIC_URL}/images/alt.jpg`}
                alt={card.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  //filter: 'grayscale(0.7)',
                }}
              />
              
              {/* Badge Container */}
              
            </div>
            <div style={{
                position: 'absolute',
                top: '200px',
                right: '4px',
                width: '56px',
                height: '56px',
                transform: 'translateY(-50%)',
                zIndex: 2,
              }}>
                {teamMembers.includes(card.name) && (
                  <img 
                    src={`${process.env.PUBLIC_URL}/images/Team-Member-Bronze.png`}
                    alt="Team Member"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                )}
                {projectContributor.includes(card.name) && (
                  <img 
                    src={`${process.env.PUBLIC_URL}/images/Project-contributor.png`}
                    alt="Project Contributor"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                )}
                {guard.includes(card.name) && (
                  <img 
                    src={`${process.env.PUBLIC_URL}/images/quard.png`}
                    alt="Guard"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                )}
              </div>
            <div style={{ 
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              flex: 1,
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#fff',
                lineHeight: '1.2'
              }}>
                {card.name}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#999',
                lineHeight: '1.4'
              }}>
                {card.purpose}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.4',
                marginTop: 'auto'
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