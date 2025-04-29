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

const CARD_WIDTH = 210;
const CARD_HEIGHT = 280;
const GAP = 20;
const PAGE_INTERVAL = 10000;

function CardItem({ card }) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
    }
  }, [card.name]);

  return (
    <div
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
        height: '180px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <img
          src={card.avatar}
          alt={card.name}
          style={{
            width: '100%',
            height: '180px',
            objectFit: 'cover',
          }}
        />
      </div>
      {/* Badge Container */}
      <div style={{
        position: 'absolute',
        top: '180px',
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
          lineHeight: '1.1',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          marginBottom: '4px',
        }}>
          <div ref={containerRef} style={{ overflow: 'hidden' }}>
            <div
              ref={textRef}
              style={{
                whiteSpace: 'nowrap',
                display: 'inline-block',
                animation: isOverflowing ? 'nameScroll 10s ease-in-out infinite' : 'none',
              }}
            >
              {card.name}
            </div>
          </div>
        </div>
        <div style={{
          fontSize: '14px',
          color: '#999',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: '1.2',
        }}>
          {card.purpose}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#666',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: '1',
        }}>
          {card.workingOn}
        </div>
      </div>
    </div>
  );
}

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

const space = '\u00A0\u00A0\u00A0\u00A0\u00A0'; // 5 non-breaking spaces
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
      {/* Header */}
      <div style={{
        width: '100%',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
        borderBottom: '1px solid #333',
        animation: 'gradientMove 8s linear infinite',
      }}>
        <style>
          {`
            @keyframes gradientMove {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            @keyframes glow {
              0% { text-shadow: 0 0 5px #ff3b30, 0 0 10px #ff3b30; }
              50% { text-shadow: 0 0 20px #ff3b30, 0 0 30px #ff3b30; }
              100% { text-shadow: 0 0 5px #ff3b30, 0 0 10px #ff3b30; }
            }
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            @keyframes nameScroll {
              0% { transform: translateX(0); }
              10% { transform: translateX(0); }
              60% { transform: translateX(calc(-100% + 200px)); }
              70% { transform: translateX(calc(-100% + 200px)); }
              100% { transform: translateX(0); }
            }
          `}
        </style>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          gap: '12px',
        }}>
          <div style={{
            color: '#ff3b30',
            fontSize: '32px',
            fontWeight: '700',
            letterSpacing: '2px',
            animation: 'glow 2s ease-in-out infinite',
          }}>
            LiveFeed
          </div>
          {/* Marquee Banner */}
          <div style={{
            width: '100%',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            position: 'relative',
          }}>
            <div style={{
              display: 'inline-flex',  // flex not block
              animation: 'marquee 80s linear infinite',
            }}>
              <div style={{
                display: 'inline-flex',
                fontSize: '24px',
                color: '#93B7BE',
                fontWeight: '500',
              }}>
                {content.repeat(10)}
              </div>
              <div style={{
                display: 'inline-flex',
                fontSize: '24px',
                color: '#93B7BE',
                fontWeight: '500',
              }}>
                {content.repeat(10)}
              </div>
            </div>
          </div>
          {/* Marquee Ends */}

        </div>
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
          <CardItem key={card.id || card.name || i} card={card} />
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div key={`empty-${i}`} style={{ background: 'transparent' }} />
        ))}
      </div>
    </div>
  );
} 