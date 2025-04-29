import React, { useState, useRef, useEffect } from 'react';
import { USER_BADGES, BADGE_METADATA } from '../../utils/constants/badgeConfig';

// Updated purpose color mapping with pastel colors
const PURPOSE_COLORS = {
  'Attending an event': '#FFB3B3',    // Pastel red
  'Visiting': '#B3FFB3',              // Pastel green
  'Working on a project': '#B3D9FF',  // Pastel blue
  'Self Learning': '#FFE0B3',         // Pastel orange
  'default': '#D9D9D9'                // Pastel gray
};

export default function CardItem({ card, CARD_HEIGHT }) {
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
        borderLeft: `4px solid ${PURPOSE_COLORS[card.purpose] || PURPOSE_COLORS.default}`,
        boxShadow: `inset 0 0 20px rgba(${getPurposeRGBA(card.purpose)}, 0.1)` // Subtle glow effect
      }}
    >
      <CardImage src={card.avatar} alt={card.name} />
      <BadgeContainer name={card.name} />
      <CardContent 
        card={card} 
        textRef={textRef} 
        containerRef={containerRef} 
        isOverflowing={isOverflowing}
        purposeColor={PURPOSE_COLORS[card.purpose] || PURPOSE_COLORS.default}
      />
    </div>
  );
}

// Helper function to convert hex to RGBA
function getPurposeRGBA(purpose) {
  const hex = PURPOSE_COLORS[purpose] || PURPOSE_COLORS.default;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function CardImage({ src, alt }) {
  return (
    <div style={{
      width: '100%',
      height: '180px',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '180px',
          objectFit: 'cover',
        }}
      />
    </div>
  );
}

function BadgeContainer({ name }) {
  const userBadges = USER_BADGES[name] || [];
  
  return (
    <div style={{
      position: 'absolute',
      top: '180px',
      right: '4px',
      width: '56px',
      height: '56px',
      transform: 'translateY(-50%)',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }}>
      {userBadges
        .sort((a, b) => BADGE_METADATA[a].priority - BADGE_METADATA[b].priority)
        .map((badgeType) => (
          <Badge 
            key={badgeType}
            type={badgeType}
            alt={BADGE_METADATA[badgeType].alt}
          />
        ))}
    </div>
  );
}

function Badge({ type, alt }) {
  return (
    <img 
      src={`${process.env.PUBLIC_URL}/images/${type}.png`}
      alt={alt}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
    />
  );
}

function CardContent({ card, textRef, containerRef, isOverflowing, purposeColor }) {
  return (
    <div style={{ 
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      flex: 1,
    }}>
      <div style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#fff',
        letterSpacing: '0.5px',
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
        color: purposeColor,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        lineHeight: '1.2',
        fontWeight: '600',
        opacity: 0.9, // Slightly reduced opacity for better pastel effect
        textShadow: '0 0 10px rgba(0,0,0,0.1)' // Subtle text shadow
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
  );
}