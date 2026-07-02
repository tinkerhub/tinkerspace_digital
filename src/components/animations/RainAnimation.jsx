import React, { useEffect, useState } from 'react';
import { getCurrentWeather } from '../../utils/api/weatherService';

const RainAnimation = () => {
  const [isRaining, setIsRaining] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      const weather = await getCurrentWeather();
      if (weather) {
        setIsRaining(weather.isRaining);
      }
    };

    // Fetch initially
    fetchWeather();

    // Update weather every 5 minutes
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isRaining) return null;

  return (
    <>
      <style>
        {`
          @keyframes rain {
            0% {
              transform: translateY(-10px);
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(60px);
              opacity: 0;
            }
          }
          @keyframes splash {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            50% {
              transform: translate(var(--dx), var(--dy)) scale(0.5);
              opacity: 0.5;
            }
            100% {
              transform: translate(var(--dx), var(--dy)) scale(0.1);
              opacity: 0;
            }
          }
          .rain-drop {
            position: absolute;
            width: 2px;
            height: 15px;
            background: linear-gradient(
              to bottom,
              transparent 0%,
              rgba(147, 183, 190, 0.5) 30%,
              rgba(147, 183, 190, 0.8) 50%,
              rgba(147, 183, 190, 0.3) 80%,
              transparent 100%
            );
            opacity: 0;
            pointer-events: none;
            border-radius: 50%/10%;
            transform-origin: top center;
          }
          .splash {
            position: absolute;
            width: 2px;
            height: 2px;
            background: #93B7BE;
            opacity: 0;
            pointer-events: none;
            border-radius: 50%;
          }
        `}
      </style>
      {Array.from({ length: 50 }).map((_, i) => (
        <React.Fragment key={i}>
          <div
            className="rain-drop"
            style={{
              left: `${Math.random() * 100}%`,
              animation: `rain ${0.5 + Math.random() * 0.5}s linear ${Math.random() * 2}s infinite`,
              opacity: 0,
            }}
          />
          {Array.from({ length: 3 }).map((_, j) => {
            const angle = (j * 120 + Math.random() * 30) * (Math.PI / 180);
            const distance = 10 + Math.random() * 5;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            const delay = 0.5 + Math.random() * 0.5;
            
            return (
              <div
                key={`splash-${i}-${j}`}
                className="splash"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: '0',
                  animation: `splash 0.5s ease-out ${delay}s infinite`,
                  '--dx': `${dx}px`,
                  '--dy': `${-dy}px`,
                  opacity: 0,
                }}
              />
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
};

export default RainAnimation;