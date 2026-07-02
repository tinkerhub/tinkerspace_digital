import React, { useState, useRef, useEffect } from 'react';
import { USER_BADGES } from '../../utils/constants/badgeConfig';
import UserImage from '../userdetails/UserImage';
import UserBadges from '../userdetails/UserBadges';
import UserInfo from '../userdetails/UserInfo';

// Color mapping for different user purposes with soft pastel colors
const PURPOSE_COLORS = {
  'Attending an event': '#FFD1D1', // Soft Red
  'On duty': '#FFE5B4', // Soft Orange
  'Visiting': '#D1FFD1', // Soft Green
  'Working on a project': '#D1E8FF', // Soft Blue
  'Self Learning': '#E8D1FF', // Soft Purple
  'default': '#FFF3B0' // Soft Yellow
};

const UserCard = ({ card, CARD_HEIGHT }) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef(null);
  const containerRef = useRef(null);

  const userBadges = USER_BADGES[card.name] || [];
  const hasSecurityBadge = userBadges.includes('guard');
  const displayPurpose = hasSecurityBadge ? 'On duty' : card.purpose;
  const purposeColor = PURPOSE_COLORS[displayPurpose] || PURPOSE_COLORS['default'];

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const textWidth = textRef.current.scrollWidth;
      const containerWidth = containerRef.current.clientWidth;
      setIsOverflowing(textWidth - containerWidth > 1);
    }
  }, [card.name]);

  return (
    <div 
      className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl rounded-lg border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden flex flex-col items-center transition-all duration-300"
      style={{
        width: '100%',
        height: `${CARD_HEIGHT}px`
      }}
    >
      <UserImage
        src={card.avatar}
        alt={card.name}
        purpose={displayPurpose}
        purposeColor={purposeColor}
      />
      <UserBadges name={card.name} />
      <UserInfo
        card={card}
        textRef={textRef}
        containerRef={containerRef}
        isOverflowing={isOverflowing}
      />
    </div>
  );
};

export default React.memo(UserCard);