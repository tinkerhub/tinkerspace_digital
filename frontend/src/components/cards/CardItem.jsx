import React, { useState, useRef, useEffect } from 'react';
import { USER_BADGES, BADGE_METADATA } from '../../utils/constants/badgeConfig';

// Color mapping for different user purposes with pastel colors
const PURPOSE_COLORS = {
  'Attending an event': '#FFB3B3',    // Pastel red
  'On duty': '#FFB3B3',    // Pastel red
  'Visiting': '#B3FFB3',              // Pastel green
  'Working on a project': '#B3D9FF',  // Pastel blue
  'Self Learning': '#FFE0B3',         // Pastel orange
  'default': '#D9D9D9'                // Pastel gray
};

export default function CardItem({ card, CARD_HEIGHT }) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollAmount, setScrollAmount] = useState(0);
  const textRef = useRef(null);
  const containerRef = useRef(null);

  const userBadges = USER_BADGES[card.name] || [];
  const hasSecurityBadge = userBadges.includes('guard');
  const displayPurpose = hasSecurityBadge ? 'On duty' : card.purpose;

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const textWidth = textRef.current.scrollWidth;
      const containerWidth = containerRef.current.clientWidth;
      const overflow = textWidth - containerWidth;
      setIsOverflowing(overflow > 1);
      setScrollAmount(overflow > 0 ? overflow : 0);
    }
  }, [card.name]);

  return (
    // Main card container with dynamic height and purpose-based styling
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
      <CardImage 
        src={card.avatar} 
        alt={card.name} 
        purpose={displayPurpose}
        purposeColor={PURPOSE_COLORS[displayPurpose] || PURPOSE_COLORS.default}
      />
      <BadgeContainer name={card.name} />
      <CardContent 
        card={{...card, purpose: displayPurpose}}
        textRef={textRef} 
        containerRef={containerRef} 
        isOverflowing={isOverflowing}
        scrollAmount={scrollAmount}
        purposeColor={PURPOSE_COLORS[displayPurpose] || PURPOSE_COLORS.default}
      />
    </div>
  );
}


function CardImage({ src, alt, purpose, purposeColor }) {
  return (
    // Image container with fixed height and relative positioning
    <div style={{
      width: '100%',
      height: '190px',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '8px',
        background: purposeColor,
        padding: '8px 8px 4px 8px',  // Reduced and made consistent padding
        borderRadius: '4px',
        zIndex: 1,
        opacity: 0.9,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <span style={{
          color: '#242424',
          fontSize: '10px',
          fontWeight: '600',
          letterSpacing: '0.2px',
          textTransform: 'uppercase',
          lineHeight: '0.8',  // Added to ensure vertical centering
          display: 'block'  // Added to ensure consistent block layout
        }}>
          {purpose}
        </span>
      </div>
      {/* User avatar image */}
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '190px',
          objectFit: 'cover',
        }}
      />
    </div>
  );
}

function BadgeContainer({ name }) {
  const userBadges = USER_BADGES[name] || [];
  return (
    // Badge container positioned over the avatar image
    <div style={{
      position: 'absolute',
      top: '170px',
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
    // Individual badge image
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

function CardContent({ card, textRef, containerRef, isOverflowing, scrollAmount}) {
  return (
    // Content container for user information
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
        height: '24px',
      }}>
        <div ref={containerRef} style={{ 
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div
            ref={textRef}
            style={{
              whiteSpace: 'nowrap',
              display: 'inline-block',
              animation: isOverflowing ? 'nameScroll 10s ease-in-out infinite alternate' : 'none',
              paddingRight: isOverflowing ? '20px' : '0',
            }}
          >
            {card.name}
          </div>
        </div>
      </div>
      {/* Working on text with ellipsis overflow */}
      <div style={{
        fontSize: '14px',
        color: '#666',
        fontWeight: '600',
        letterSpacing: '0.3px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        lineHeight: '1',
      }}>
        {card.workingOn || '\u00A0'}
      </div>
    </div>
  );
}