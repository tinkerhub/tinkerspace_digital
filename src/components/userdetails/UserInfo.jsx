import React from 'react';

export default function CardContent({ card, textRef, containerRef, isOverflowing, purpose, purposeColor, scale = 1 }) {
  return (
    <div
      className="flex flex-col w-full flex-1 bg-transparent"
      style={{
        paddingLeft: `${Math.max(4, 16 * scale)}px`,
        paddingRight: `${Math.max(4, 16 * scale)}px`,
        paddingTop: `${Math.max(3, 12 * scale)}px`,
        paddingBottom: `${Math.max(3, 12 * scale)}px`,
        gap: `${Math.max(1, 4 * scale)}px`,
      }}
    >
      <div
        className="leading-tight font-semibold text-gray-800 dark:text-gray-100 tracking-tight whitespace-nowrap transition-colors duration-500"
        style={{ fontSize: `${Math.max(9, 16.8 * scale)}px` }}
      >
        <div ref={containerRef} className="overflow-hidden relative pb-1">
          <div
            ref={textRef}
            className="whitespace-nowrap inline-block"
            style={{
              animation: isOverflowing ? 'nameScroll 10s ease-in-out infinite alternate' : 'none',
              paddingRight: isOverflowing ? '20px' : '0',
            }}
          >
            {card.name}
          </div>
        </div>
      </div>
      <div
        className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis leading-none transition-colors duration-500"
        style={{ fontSize: `${Math.max(7, 11.2 * scale)}px`, marginTop: `${Math.max(1, 4 * scale)}px` }}
      >
        {card.workingOn || card.projectName || ' '}
      </div>
    </div>
  );
}
