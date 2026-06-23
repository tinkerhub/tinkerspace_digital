import React from 'react';

export default function CardContent({ card, textRef, containerRef, isOverflowing, purpose, purposeColor }) {
  return (
    <div className="px-4 py-3 flex flex-col gap-1 w-full flex-1 bg-transparent">
      <div className="text-[1.15rem] leading-tight font-semibold text-gray-800 dark:text-gray-100 tracking-tight whitespace-nowrap transition-colors duration-500">
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
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis leading-none mt-1 transition-colors duration-500">
        {card.workingOn || card.projectName || '\u00A0'}
      </div>
    </div>
  );
}