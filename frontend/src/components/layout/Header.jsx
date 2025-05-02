import React, { useState, useEffect } from 'react';
import { getCurrentWeather } from '../../utils/api/weatherService';
import RainAnimation from '../animations/RainAnimation';

export default function Header({ content }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      const weatherData = await getCurrentWeather();
      setWeather(weatherData);
    };
    fetchWeather();
    // Update weather every 5 minutes
    const weatherTimer = setInterval(fetchWeather, 300000);
    return () => clearInterval(weatherTimer);
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

  const getWeatherIcon = (description) => {
    switch (description?.toLowerCase()) {
      case 'thunderstorm': return '⛈️';
      case 'rain showers':
      case 'raining': return '🌧️';
      case 'drizzle': return '🌦️';
      case 'foggy': return '🌫️';
      case 'partly cloudy': return '⛅';
      case 'clear sky': return '☀️';
      default: return '🌡️';
    }
  };

  const totalMakers = content.split('•')[2].trim().split(' ')[0];

  const statusItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const iconStyle = {
    fontSize: '18px'
  };

  return (
    <div style={{
      width: '100%',
      padding: '24px 48px',
      height: '80px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(28, 28, 28, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(60, 60, 60, 0.6)',
      color: '#ffffff',
      fontSize: '18px',
      fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 700,
      position: 'sticky',
      top: 0,
      zIndex: 1,
      overflow: 'hidden'  // Add this to contain the rain animation
    }}>
      <RainAnimation />
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: '#ff3b30',
          animation: 'pulse 2s ease-in-out infinite',
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
        gap: '40px',
      }}>
        <div style={statusItemStyle}>
          <span role="img" aria-label="users" style={iconStyle}>👨‍💻</span>
          <span>{totalMakers} Makers</span>
        </div>
        {weather && (
          <div style={statusItemStyle}>
            <span role="img" aria-label="weather" style={iconStyle}>
              {getWeatherIcon(weather.description)}
            </span>
            <span>{weather.temperature}°C</span>
          </div>
        )}
        <div style={statusItemStyle}>
          <span role="img" aria-label="calendar" style={iconStyle}>📅</span>
          <span>{formatDate(currentTime)}</span>
        </div>
        <div style={statusItemStyle}>
          <span role="img" aria-label="clock" style={iconStyle}>🕐</span>
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
          }
        `}
      </style>
    </div>
  );
}