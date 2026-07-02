import React from 'react';

export default function Badge({ type, alt }) {
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