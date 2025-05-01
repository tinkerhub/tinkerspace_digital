import React from 'react';

export default function CardContent({ card, textRef, containerRef, isOverflowing }) {
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