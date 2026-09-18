import { useState, useEffect } from 'react';

// colsOverride: when given (e.g. the admin-configured makersPerRow), it acts
// as a floor, not a fixed value — the grid always fills at least as densely
// as the viewport naturally fits at the reference card size, and the
// override can only pack MORE (smaller) columns in beyond that, never fewer
// with the rest of the screen left empty.
export default function useGridLayout(cardWidth, cardHeight, gap, colsOverride) {
  const [layout, setLayout] = useState({ cols: colsOverride || 7, rows: 3 });

  useEffect(() => {
    function updateLayout() {
      // Calculate available width and height with 48px padding on each side (px-12)
      const availableWidth = window.innerWidth - 96;
      const availableHeight = window.innerHeight - 180; // 180px for header + padding

      const naturalCols = Math.floor((availableWidth + gap) / (cardWidth + gap));
      let cols = Math.max(naturalCols, colsOverride || 0);
      let rows = Math.floor((availableHeight + gap) / (cardHeight + gap));

      // Ensure at least 1 row and 1 col
      if (cols < 1) cols = 1;
      if (rows < 1) rows = 1;

      setLayout({ cols, rows });
    }
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [cardWidth, cardHeight, gap, colsOverride]);

  return layout;
}
