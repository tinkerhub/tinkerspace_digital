import React, { useEffect, useState } from 'react';

const TinkerSparks = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate 30 random particles
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 4 + 2}px`,
      duration: `${Math.random() * 10 + 10}s`,
      delay: `${Math.random() * 5}s`,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1] dark:hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full transition-colors duration-1000 
                     bg-slate-400/20 dark:bg-amber-400/80 
                     dark:shadow-[0_0_8px_rgba(251,191,36,0.8)]"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animation: `floatUp ${p.duration} linear infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20vh) scale(1.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default TinkerSparks;
