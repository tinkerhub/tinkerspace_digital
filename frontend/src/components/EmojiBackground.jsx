import React from 'react';

const EmojiBackground = () => {
  // Tech-related emojis
  const emojis = [
    '💻', '📱', '⌨️', '🖥️', '🔌', '🖨️', '💾', '💿', 
    '📀', '🎮', '🕹️', '🎯', '📡', '📱', '🤖', '⚡️',
    '🔋', '🌐', '📶', '🛜', '💡', '⚙️', '🔧', '🔨',
    '🛠️', '⚡️', '📊', '📈', '🔍', '🔎', '🔐', '🔑'
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#1a1a1a',
      zIndex: 0,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, 80px)',
      gap: '40px',
      padding: '40px',
      overflow: 'hidden',
      opacity: 0.2,
    }}>
      {Array(200).fill(null).map((_, index) => (
        <div
          key={index}
          style={{
            fontSize: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: `float${index % 3} 10s infinite ease-in-out`,
            filter: 'grayscale(0.5)',
          }}
        >
          <style>
            {`
              @keyframes float0 {
                0%, 100% { transform: translateY(0) rotate(-5deg); }
                50% { transform: translateY(-15px) rotate(5deg); }
              }
              @keyframes float1 {
                0%, 100% { transform: translateY(-10px) rotate(5deg); }
                50% { transform: translateY(15px) rotate(-5deg); }
              }
              @keyframes float2 {
                0%, 100% { transform: translateY(10px) rotate(0deg); }
                50% { transform: translateY(-12px) rotate(8deg); }
              }
            `}
          </style>
          {emojis[index % emojis.length]}
        </div>
      ))}
    </div>
  );
};

export default EmojiBackground; 