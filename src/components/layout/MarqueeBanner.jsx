import React from 'react';

export default function MarqueeBanner({ content }) {
  return (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      position: 'relative',
    }}>
      <div style={{
        display: 'inline-flex',
        animation: 'marquee 80s linear infinite',
      }}>
        {[1, 2].map((_, index) => (
          <div key={index} style={{
            display: 'inline-flex',
            fontSize: '24px',
            color: '#B3D9FF',
            fontWeight: '900',
            fontFamily: 'Geist'
          }}>
            {content.repeat(5)}
          </div>
        ))}
      </div>
    </div>
  );
}