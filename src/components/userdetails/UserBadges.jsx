
import React from 'react';
import { USER_BADGES, BADGE_METADATA } from '../../utils/constants/badgeConfig';

function AchievementBadge({ type, alt }) {
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

export default function UserBadges({ name }) {
  const userBadges = USER_BADGES[name] || [];
  return (
    <div style={{
      position: 'absolute',
      top: '170px',
      right: '4px',
      width: '56px',
      height: '56px',
      transform: 'translateY(-50%)',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }}>
      {userBadges
        .sort((a, b) => BADGE_METADATA[a].priority - BADGE_METADATA[b].priority)
        .map((badgeType) => (
          <AchievementBadge 
            key={badgeType}
            type={badgeType}
            alt={BADGE_METADATA[badgeType].alt}
          />
        ))}
    </div>
  );
}