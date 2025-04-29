import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

const RootComponent = () => {
  // const videoRef = useRef(null);
  // const [currentVideo, setCurrentVideo] = useState(`${process.env.PUBLIC_URL}/videos/video3.mp4`);
  // const [isMuted, setIsMuted] = useState(true); // Start with muted video for autoplay compliance

  // useEffect(() => {
  //   const checkNewYear = () => {
  //     const now = new Date();
  //     const isNewYear = now.getMonth() === 0 && now.getDate() === 1; // Check if it's New Year's Day

  //     if (isNewYear) {
  //       const timeRanges = [
  //         { start: new Date(now.getFullYear(), 0, 1, 0, 0, 0), end: new Date(now.getFullYear(), 0, 1, 0, 5, 0) }, // 12:00 AM - 12:05 AM
  //         { start: new Date(now.getFullYear(), 0, 1, 10, 0, 0), end: new Date(now.getFullYear(), 0, 1, 10, 2, 0) }, // 10:00 AM - 10:02 AM
  //         { start: new Date(now.getFullYear(), 0, 1, 11, 55, 0), end: new Date(now.getFullYear(), 0, 1, 11, 57, 0) }, // 11:55 AM - 11:57 AM
  //         { start: new Date(now.getFullYear(), 0, 1, 15, 0, 0), end: new Date(now.getFullYear(), 0, 1, 15, 2, 0) }, // 3:00 PM - 3:02 PM
  //         { start: new Date(now.getFullYear(), 0, 1, 17, 0, 0), end: new Date(now.getFullYear(), 0, 1, 17, 2, 0) }, // 5:00 PM - 5:02 PM
  //         { start: new Date(now.getFullYear(), 0, 1, 18, 0, 0), end: new Date(now.getFullYear(), 0, 1, 18, 2, 0) }, // 6:00 PM - 6:02 PM
  //         { start: new Date(now.getFullYear(), 0, 1, 19, 0, 0), end: new Date(now.getFullYear(), 0, 1, 19, 2, 0) }, // 7:00 PM - 7:02 PM
  //         { start: new Date(now.getFullYear(), 0, 1, 20, 0, 0), end: new Date(now.getFullYear(), 0, 1, 20, 2, 0) }, // 8:00 PM - 8:02 PM
  //         { start: new Date(now.getFullYear(), 0, 1, 21, 0, 0), end: new Date(now.getFullYear(), 0, 1, 21, 2, 0) }, // 9:00 PM - 9:02 PM
  //         { start: new Date(now.getFullYear(), 0, 1, 22, 0, 0), end: new Date(now.getFullYear(), 0, 1, 22, 2, 0) }, // 10:00 PM - 10:02 PM
  //         { start: new Date(now.getFullYear(), 0, 1, 23, 0, 0), end: new Date(now.getFullYear(), 0, 1, 23, 2, 0) }, // 11:00 PM - 11:02 PM
  //       ];

  //       const isInFirecrackerTime = timeRanges.some(
  //         ({ start, end }) => now >= start && now < end
  //       );

  //       if (isInFirecrackerTime) {
  //         setCurrentVideo(`${process.env.PUBLIC_URL}/videos/firecraker.mp4`);
  //       } else {
  //         setCurrentVideo(`${process.env.PUBLIC_URL}/videos/video3.mp4`);
  //       }
  //     } else {
  //       setCurrentVideo(`${process.env.PUBLIC_URL}/videos/video3.mp4`);
  //     }
  //   };

  //   const interval = setInterval(checkNewYear, 1000);

  //   return () => clearInterval(interval);
  // }, []);

  // useEffect(() => {
  //   if (videoRef.current) {
  //     videoRef.current.src = currentVideo;
  //     videoRef.current.muted = isMuted; // Ensure muted setting is applied
  //     videoRef.current.play().catch((error) => {
  //       console.error('Autoplay failed:', error);
  //     });
  //   }
  // }, [currentVideo, isMuted]);

  // const handleUnmute = () => {
  //   if (videoRef.current) {
  //     setIsMuted(false);
  //     videoRef.current.muted = false; // Unmute video after user interaction
  //     videoRef.current.play().catch((error) => {
  //       console.error('Play failed after unmute:', error);
  //     });
  //   }
  // };

  return (
    <React.StrictMode>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Background video
        <video
          autoPlay
          loop
          playsInline
          muted
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -2,
          }}
        >
          <source src={`${process.env.PUBLIC_URL}/videos/video3.mp4`} type="video/mp4" />
        </video> */}

        {/* Dotted grid overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: -1,
            backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundColor: '#18181b',
          }}
        />

        {/* Main application */}
        <App />
      </div>
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RootComponent />);
