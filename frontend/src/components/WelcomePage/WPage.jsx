// import React, { useEffect } from 'react';
// import './style.css';

// function WPage() {
//   useEffect(() => {
//     const text = document.querySelector('.text-netflix');
//     const letters = text.textContent.split('');
//     text.textContent = ''; // Clear the original text content

//     letters.forEach((letter, index) => {
//       const span = document.createElement('span');
//       span.textContent = letter === ' ' ? '\u00A0' : letter; // Convert spaces to non-breaking spaces
//       span.style.animationDelay = `${index * 0.1}s`; // Adjust delay for each letter
//       span.style.color = `hsl(${index * 10}, 100%, 50%)`; // Apply different color to each letter
//       text.appendChild(span);
//     });

//     setTimeout(() => {
//       const spans = document.querySelectorAll('.text-letter span');
//       spans.forEach((span, index) => {
//         setTimeout(() => {
//           span.style.animation = 'pop-down 0.5s ease forwards';
//         }, index * 100); // Adjust delay for removal animation
//       });

//       setTimeout(() => {
//         const newText = document.querySelector('.text-letter');
//         newText.innerHTML = 'MAKE&nbsp;CONNECTION...'; // Set new text with spaces
//         const newLetters = newText.textContent.split('');
//         newText.textContent = ''; // Clear the original text content

//         newLetters.forEach((letter, index) => {
//           const span = document.createElement('span');
//           span.textContent = letter === ' ' ? '\u00A0' : letter; // Convert spaces to non-breaking spaces
//           span.style.animationDelay = `${index * 0.1}s`; // Adjust delay for each letter
//           span.style.color = `hsl(${index * 10}, 100%, 50%)`; // Apply different color to each letter
//           newText.appendChild(span);
//         });

//         newText.style.fontSize = '9rem'; // Initial font size for the second text
//         newText.style.transition = 'all 0.5s ease'; // Adding transition effect

//         setTimeout(() => {
//           newText.style.transform = 'scale(20)'; // Increase size using scale transformation
//           newText.style.opacity = '1'; // Fade out
//         }, 2000); // Delay before animating the second text
//       }, 2000); // Delay before showing the second text
//     }, 2000); // Adjust delay before removal animation
//   }, []);

//   return (
//     <div className='flex flex-col items-center justify-center h-screen'>
//       <h1 className='text-letter'>TINKER SPACE</h1>
//     </div>
//   );
// }

// export default WPage;

// WPage.jsx

import React, { useEffect } from 'react';
import './style.css';

function WPage() {
  useEffect(() => {
    const text = document.querySelector('.text-letter'); // Updated query selector
    const letters = text.textContent.split('');
    text.textContent = ''; // Clear the original text content

    letters.forEach((letter, index) => {
      const span = document.createElement('span');
      span.textContent = letter === ' ' ? '\u00A0' : letter; // Convert spaces to non-breaking spaces
      span.style.animationDelay = `${index * 0.1}s`; // Adjust delay for each letter
      span.style.color = `hsl(${index * 10}, 100%, 50%)`; // Apply different color to each letter
      text.appendChild(span);
    });

    setTimeout(() => {
      const spans = document.querySelectorAll('.text-letter span'); // Correct class name
      spans.forEach((span, index) => {
        setTimeout(() => {
          span.style.animation = 'pop-down 0.5s ease forwards';
        }, index * 100); // Adjust delay for removal animation
      });

      setTimeout(() => {
        const newText = document.querySelector('.text-letter');
        newText.innerHTML = 'MAKE&nbsp;CONNECTIONS...'; // Set new text with spaces
        const newLetters = newText.textContent.split('');
        newText.textContent = ''; // Clear the original text content

        newLetters.forEach((letter, index) => {
          const span = document.createElement('span');
          span.textContent = letter === ' ' ? '\u00A0' : letter; // Convert spaces to non-breaking spaces
          span.style.animationDelay = `${index * 0.1}s`; // Adjust delay for each letter
          span.style.color = `hsl(${index * 10}, 100%, 50%)`; // Apply different color to each letter
          newText.appendChild(span);
        });

        newText.style.fontSize = '9rem'; // Initial font size for the second text
        newText.style.transition = 'all 0.5s ease'; // Adding transition effect

        setTimeout(() => {
          newText.style.transform = 'scale(20)'; // Increase size using scale transformation
          newText.style.opacity = '1'; // Fade out
        }, 2000); // Delay before animating the second text
      }, 2000); // Delay before showing the second text
    }, 2000); // Adjust delay before removal animation
  }, []);

  return (
    <div className='flex flex-col items-center justify-center h-screen'
    style={{
      backgroundImage: `url('https://www.tinkerhub.org/files/Ext.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
    >
      <h1 className='text-letter'>TINKER SPACE</h1>
    </div>
  );
}

export default WPage;
