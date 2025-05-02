import React, { useState, useRef, useEffect } from 'react';
import { USER_BADGES } from '../../utils/constants/badgeConfig';
import UserImage from '../userdetails/UserImage';
import UserBadges from '../userdetails/UserBadges';
import UserInfo from '../userdetails/UserInfo';

// Color mapping for different user purposes with pastel colors
const PURPOSE_COLORS = {
  'Attending an event': '#FFB3B3',
  'On duty': '#FFB3B3',
  'Visiting': '#B3FFB3',
  'Working on a project': '#B3D9FF',
  'Self Learning': '#FFE0B3',
  'default': '#D9D9D9'
};

export default function UserCard({ card, CARD_HEIGHT }) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef(null);
  const containerRef = useRef(null);

  const userBadges = USER_BADGES[card.name] || [];
  const hasSecurityBadge = userBadges.includes('guard');
  const displayPurpose = hasSecurityBadge ? 'On duty' : card.purpose;

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const textWidth = textRef.current.scrollWidth;
      const containerWidth = containerRef.current.clientWidth;
      setIsOverflowing(textWidth - containerWidth > 1);
    }
  }, [card.name]);

  return (
    <div
      style={{
        background: '#242424',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: `${CARD_HEIGHT}px`,
        position: 'relative',
      }}
    >
      <UserImage 
        src={card.avatar} 
        alt={card.name} 
        purpose={displayPurpose}
        purposeColor={PURPOSE_COLORS[displayPurpose] || PURPOSE_COLORS.default}
      />
      <UserBadges name={card.name} />
      <UserInfo 
        card={{...card, purpose: displayPurpose}}
        textRef={textRef} 
        containerRef={containerRef} 
        isOverflowing={isOverflowing}
      />
    </div>
  );
}