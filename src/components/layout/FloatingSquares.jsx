import React from 'react';

const FloatingSquares = () => {
  // Define a few square positions and animation durations
  const squares = [
    { top: '20%', left: '10%', size: '12px', delay: '0s', duration: '6s' },
    { top: '60%', left: '80%', size: '16px', delay: '1s', duration: '8s' },
    { top: '80%', left: '20%', size: '10px', delay: '2s', duration: '7s' },
    { top: '30%', left: '70%', size: '14px', delay: '0.5s', duration: '9s' },
    { top: '10%', left: '50%', size: '8px', delay: '3s', duration: '5s' },
    { top: '90%', left: '60%', size: '12px', delay: '1.5s', duration: '6s' },
    { top: '50%', left: '5%', size: '15px', delay: '2.5s', duration: '8s' }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
      {squares.map((sq, i) => (
        <div
          key={i}
          className="absolute bg-[#e100ff]"
          style={{
            top: sq.top,
            left: sq.left,
            width: sq.size,
            height: sq.size,
            animation: `float ${sq.duration} ease-in-out infinite alternate`,
            animationDelay: sq.delay,
            opacity: 0.7,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-20px) rotate(15deg); }
        }
      `}</style>
    </div>
  );
};

export default FloatingSquares;
