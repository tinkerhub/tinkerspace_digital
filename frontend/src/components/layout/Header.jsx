import React, { useState, useEffect } from 'react';

export default function Header({ content }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).replace(/\//g, '/');
  };

  const totalMakers = content.split('•')[2].trim().split(' ')[0];

  return (
    <div style={{
      width: '100%',
      padding: '32px 48px',
      height: '48px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(28, 28, 28, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(60, 60, 60, 0.6)',
      color: '#ffffff',
      fontSize: '20px',
      fontWeight: 600,
      letterSpacing: '0.3px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'sticky',
      zIndex: 1,
    }}>
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#ff3b30',
          animation: 'pulse 3s ease-in-out infinite',
        }} />
        <span style={{ 
          fontWeight: 600,
          color: '#ff3b30',
          fontSize: '18px'
        }}>
          LiveFeed
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span role="img" aria-label="users" style={{ fontSize: '18px' }}>👨‍💻</span>
          <span>{totalMakers} Makers</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span role="img" aria-label="calendar" style={{ fontSize: '18px' }}>📅</span>
          <span>{formatDate(currentTime)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span role="img" aria-label="clock" style={{ fontSize: '18px' }}>🕐</span>
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.7; }
          }
        `}
      </style>
    </div>
  );
}