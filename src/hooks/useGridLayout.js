import { useState, useEffect } from 'react';
import { CARD_TIERS } from '../utils/layout/makerGrid';

export default function useGridLayout(makerCount) {
  const [layout, setLayout] = useState({ cols: 7, rows: 3, ...CARD_TIERS[0] });

  useEffect(() => {
    function updateLayout() {
      for (let i = 0; i < CARD_TIERS.length; i++) {
        const tier = CARD_TIERS[i];
        const availableWidth = window.innerWidth - 2 * tier.padding;
        const availableHeight = window.innerHeight - 180; // 180px for header + padding

        const cols = Math.max(1, Math.floor((availableWidth + tier.gap) / (tier.width + tier.gap)));
        const rows = Math.max(1, Math.floor((availableHeight + tier.gap) / (tier.height + tier.gap)));

        const isFallback = i === CARD_TIERS.length - 1;
        if (cols * rows >= makerCount || isFallback) {
          setLayout({ cols, rows, ...tier });
          return;
        }
      }
    }
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [makerCount]);

  return layout;
}
