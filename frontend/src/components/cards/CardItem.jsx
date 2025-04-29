import React, { useState, useRef, useEffect } from 'react';
import { teamMembers, projectContributor, guard } from '../../utils/constants/badgeRoles';

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
      }}
    >
      <CardImage src={card.avatar} alt={card.name} />
      <BadgeContainer name={card.name} />
      <CardContent card={card} textRef={textRef} containerRef={containerRef} isOverflowing={isOverflowing} />
    </div>
  );
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
  return (
    <div style={{
      position: 'absolute',
      top: '180px',
      right: '4px',
      width: '56px',
      height: '56px',
      transform: 'translateY(-50%)',
      zIndex: 2,
    }}>
      {teamMembers.includes(name) && <Badge type="Team-Member-Bronze" alt="Team Member" />}
      {projectContributor.includes(name) && <Badge type="Project-contributor" alt="Project Contributor" />}
      {guard.includes(name) && <Badge type="quard" alt="Guard" />}
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

function CardContent({ card, textRef, containerRef, isOverflowing }) {
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
  );
}