import React, { useState } from 'react';

export default function CardImage({ src, alt, purpose, purposeColor, scale = 1 }) {
  const [imageError, setImageError] = useState(false);
  const firstLetter = alt ? alt.charAt(0).toUpperCase() : '?';

  return (
    <div className="w-full aspect-square overflow-hidden relative border-b border-gray-100 bg-gray-50 rounded-t-lg">
      {(!src || imageError) ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
          <span className="font-bold" style={{ fontSize: `${Math.max(12, 60 * scale)}px` }}>{firstLetter}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-all"
        />
      )}
      {purpose && (
        <div style={{ position: 'absolute', bottom: `${Math.max(2, 8 * scale)}px`, left: `${Math.max(2, 8 * scale)}px`, zIndex: 10 }}>
          <span
            className="inline-block rounded-full font-bold uppercase tracking-wider shadow-sm backdrop-blur-md"
            style={{
              backgroundColor: `${purposeColor}dd`,
              color: '#222',
              padding: `${Math.max(2, 4 * scale)}px ${Math.max(4, 12 * scale)}px`,
              fontSize: `${Math.max(5, 10 * scale)}px`,
            }}
          >
            {purpose}
          </span>
        </div>
      )}
    </div>
  );
}
