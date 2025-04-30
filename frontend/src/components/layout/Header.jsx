import React from 'react';
import MarqueeBanner from './MarqueeBanner';

export default function Header({ content }) {
  return (
    <div style={{
      width: '100%',
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
      borderBottom: '1px solid #333',
      animation: 'gradientMove 8s linear infinite',
    }}>
      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes glow {
            0% { text-shadow: 0 0 5px #ff3b30, 0 0 10px #ff3b30; }
            50% { text-shadow: 0 0 20px #ff3b30, 0 0 30px #ff3b30; }
            100% { text-shadow: 0 0 5px #ff3b30, 0 0 10px #ff3b30; }
          }
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        gap: '12px',
      }}>
        <div style={{
          color: '#ff3b30',
          fontSize: '32px',
          fontWeight: '700',
          letterSpacing: '2px',
          animation: 'glow 2s ease-in-out infinite',
          fontFamily: 'Geist'
        }}>
          LiveFeed
        </div>
        <MarqueeBanner content={content} />
      </div>
    </div>
  );
}