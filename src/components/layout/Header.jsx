import React from 'react';
import { timeStringSignal, dateCharsSignal } from '../../signals/clockSignal';
import { weatherSignal } from '../../signals/weatherSignal';

const getWeatherIcon = (description) => {
  const desc = (description || '').toLowerCase();
  if (desc.includes('rain') || desc.includes('drizzle')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="16" y1="13" x2="16" y2="21" />
        <line x1="8" y1="13" x2="8" y2="21" />
        <line x1="12" y1="15" x2="12" y2="23" />
        <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
      </svg>
    );
  }
  if (desc.includes('thunderstorm')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" />
        <polyline points="13 11 9 17 15 17 11 23" />
      </svg>
    );
  }
  if (desc.includes('cloud') || desc.includes('fog')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  );
};

export default React.memo(function Header({ totalMakers, isDarkMode, setManualTheme }) {
  const weather = weatherSignal.value;

  return (
    <div className="w-full flex flex-col items-center z-10 sticky top-0 pt-[clamp(1rem,4vh,3rem)] pb-[clamp(0.5rem,2vh,1.5rem)] font-geist pointer-events-none">
      <div className="flex items-center gap-6 bg-white/80 dark:bg-black/60 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/20 px-6 py-3 rounded-full pointer-events-auto transition-all duration-500 scale-[1.06]">
        
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="font-bold tracking-widest text-gray-800 dark:text-gray-200 text-sm uppercase transition-colors duration-500">
            LiveFeed
          </span>
        </div>

        <div className="w-px h-6 bg-gray-300/50 dark:bg-gray-600/50 transition-colors duration-500" />

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium transition-colors duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400 transition-colors duration-500">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>{totalMakers} Makers</span>
          </div>
          {weather && (
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium transition-colors duration-500">
              <div className="text-gray-500 dark:text-gray-400 transition-colors duration-500">
                {getWeatherIcon(weather.description)}
              </div>
              <span>{weather.temperature}°C</span>
            </div>
          )}
        </div>

        {/* Theme Toggle inside Pill */}
        <div className="w-px h-6 bg-gray-300/50 dark:bg-gray-600/50 transition-colors duration-500" />
        <button
            onClick={() => setManualTheme && setManualTheme(isDarkMode ? 'light' : 'dark')}
            className="p-1.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all active:scale-95 pointer-events-auto cursor-pointer"
            aria-label="Toggle Theme"
        >
            {isDarkMode ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )}
        </button>
      </div>
      
      {/* Large Minimalist Time & Date Display */}
      <div className="absolute top-6 right-12 flex flex-col items-end z-20 pointer-events-none opacity-90 text-gray-900 dark:text-white transition-colors duration-500">
        <div className="text-6xl font-black tracking-tighter whitespace-nowrap">
          {timeStringSignal}
        </div>
        <div className="flex justify-between w-full text-xs font-bold text-gray-500 mt-1 uppercase">
          {dateCharsSignal.value.map((char, i) => (
            <span key={i}>{char === ' ' ? '\u00A0' : char}</span>
          ))}
        </div>
      </div>
    </div>
  );
});
