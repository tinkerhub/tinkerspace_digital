import React from 'react';

export default function CardImage({ src, alt, purpose, purposeColor }) {
  return (
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
        padding: '8px 8px 4px 8px',
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
          lineHeight: '0.8',
          display: 'block'
        }}>
          {purpose}
        </span>
      </div>
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