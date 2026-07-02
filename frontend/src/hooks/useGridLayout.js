import { useState, useEffect } from 'react';

export default function useGridLayout(cardWidth, cardHeight, gap) {
  const [layout, setLayout] = useState({ cols: 7, rows: 3 });

  useEffect(() => {
    function updateLayout() {
      // Calculate available width and height with 48px padding on each side (px-12)
      const availableWidth = window.innerWidth - 96; 
      const availableHeight = window.innerHeight - 180; // 180px for header + padding
      
      let cols = Math.floor((availableWidth + gap) / (cardWidth + gap));
      let rows = Math.floor((availableHeight + gap) / (cardHeight + gap));
      
      // Ensure at least 1 row and 1 col
      if (cols < 1) cols = 1;
      if (rows < 1) rows = 1;
      
      setLayout({ cols, rows });
    }
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [cardWidth, cardHeight, gap]);

  return layout;
}
