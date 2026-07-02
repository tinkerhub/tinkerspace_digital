import React from 'react';

const LedMarquee = () => {
  const text = "WELCOME TO TINKERSPACE • WELCOME TO TINKERSPACE • WELCOME TO TINKERSPACE • WELCOME TO TINKERSPACE • ";
  
  return (
    <div className="w-full flex justify-center bg-transparent pointer-events-none">
      <div className="w-full overflow-hidden flex items-center h-8 relative led-matrix-container">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          <div className="led-matrix-text inline-block font-['DotGothic16',sans-serif] text-2xl text-gray-800 dark:text-emerald-400 bg-white dark:bg-zinc-900 py-1 rounded-md tracking-widest shadow-sm transition-colors duration-500">{text}</div>
          <div className="led-matrix-text inline-block font-['DotGothic16',sans-serif] text-2xl text-gray-800 dark:text-emerald-400 bg-white dark:bg-zinc-900 py-1 rounded-md tracking-widest shadow-sm transition-colors duration-500">{text}</div>
        </div>
        
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');
          
          .led-matrix-container {
            /* Mask edges for a cleaner look */
            -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
            mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          }

          @keyframes marquee {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          
          .animate-marquee {
            animation: marquee 25s linear infinite;
            will-change: transform;
            /* Force hardware acceleration */
            transform: translateZ(0); 
            backface-visibility: hidden;
            perspective: 1000;
          }
        `}</style>
      </div>
    </div>
  );
};

export default LedMarquee;
