import React, { useState } from 'react';

export default function CardImage({ src, alt, purpose, purposeColor }) {
  const [imageError, setImageError] = useState(false);
  const firstLetter = alt ? alt.charAt(0).toUpperCase() : '?';

  return (
    <div className="w-full h-[210px] overflow-hidden relative border-b border-gray-100 bg-gray-50 rounded-t-3xl">
      {(!src || imageError) ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
          <span className="text-6xl font-bold">{firstLetter}</span>
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
        <div className="absolute bottom-2 left-2 z-10">
          <span 
            className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md"
            style={{ backgroundColor: `${purposeColor}dd`, color: '#222' }}
          >
            {purpose}
          </span>
        </div>
      )}
    </div>
  );
}