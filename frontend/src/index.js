// import React, { useEffect, useState } from 'react';
// import ReactDOM from 'react-dom/client';
// import Snowfall from 'react-snowfall';
// import App from './App';
// import './index.css';

// const imageUrls = [
//   `${process.env.PUBLIC_URL}/images/snowflake-1.png`,
//   `${process.env.PUBLIC_URL}/images/snowflake-2.png`,
// ];

// const RootComponent = () => {
//   const [loadedImages, setLoadedImages] = useState([]);

//   useEffect(() => {
//     // Preload images and set them in the state
//     Promise.all(
//       imageUrls.map((src) => {
//         const img = new Image();
//         img.src = src;
//         return new Promise((resolve, reject) => {
//           img.onload = () => resolve(img); // Resolve with the Image object
//           img.onerror = reject; // Handle any errors
//         });
//       })
//     )
//       .then(setLoadedImages) // Set the array of Image objects
//       .catch((err) => console.error('Failed to preload images:', err));
//   }, []);

//   return (
//     <React.StrictMode>
//       {loadedImages.length > 0 && (
//         <Snowfall
//           snowflakeCount={100}
//           Speed={[-1,0]}
//           radius={[2, 20]}
//           Wind={[0,1]}
//           images={loadedImages} 
//           />
//       )}
//       <App />
//     </React.StrictMode>
//   );
// };

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<RootComponent />);


import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const RootComponent = () => {
  return (
    <React.StrictMode>
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1, // Ensures video stays behind other content
          }}
        >
          <source src={`${process.env.PUBLIC_URL}/videos/video2.mp4`} type="video/mp4" />
        </video>

        {/* Main application */}
        <App />
      </div>
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RootComponent />);
