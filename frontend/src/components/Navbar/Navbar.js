import React, { useEffect } from 'react';
import { CurrentDate, CurrentTime } from './CurrentDate';
import './style.css';
import lottie from 'lottie-web';
import flag from './flag.json';
import plane from './plan.json';

function Navbarr() {
  const commentText = '//'

  useEffect(() => {
    // Load Lottie animations when the component mounts
    const leftAnimationContainer = document.getElementById('left-animation');
    const rightAnimationContainer = document.getElementById('right-animation');

    if (leftAnimationContainer && !leftAnimationContainer.hasChildNodes()) {
      lottie.loadAnimation({
        container: leftAnimationContainer,
        animationData: flag,
        loop: true,
        autoplay: true,
      });
    }

    if (rightAnimationContainer && !rightAnimationContainer.hasChildNodes()) {
      lottie.loadAnimation({
        container: rightAnimationContainer,
        animationData: plane,
        loop: true,
        autoplay: true,
      });
    }
  }, []);

  return (
    <div className='flex w-full h-[75px] '>
      <div className='w-2/3 min-h-fit pt-[50px] flex items-center justify-ringht font-bold text-[30px] pl-[100px]' style={{ color: '#FF0000' }}>
        <div className="w-2 h-2 bg-red-700 rounded-full animate-ping"></div>
        <p className='pl-2'>Live Feed</p>
        <p className='pl-4'><CurrentTime /></p>
        <span className='pl-2 pr-2 text-black'>{commentText}</span>
        <p className='pl-1'><CurrentDate /></p>
      </div>

      <div className='w-1/3 min-h-fit flex flex-col items-end justify-center pt-[79px] pr-[125px]'>
        {/* <img className='w-1/3' src={"/images/TKS1.jpg"} alt='TinkerSpace' />
        <img className='w-1/4' src={"/images/TKS2.jpg"} alt='TinkerHub' /> */}
        {/* here i need add lottie.son files  */}

        {/* <div id="right-animation" className='w-[200px] lottie_plane'></div> */}
        <img className='w-1/3' src={process.env.PUBLIC_URL + '/images/TKS1.jpg'} alt='TinkerSpace' />
        <img className='w-1/4' src={process.env.PUBLIC_URL + '/images/TKS2.jpg'} alt='TinkerHub' />
        {/* <div className='flex '> */}
        {/* <div id="left-animation" className='w-[50px] w-1/3 lottie_flag relative z-10'></div> */}

        {/* <div id="right-animation" className='w-[200px] w-1/3 lottie_plane'></div> */}
        {/* </div> */}
      </div>
    </div>
  );
}

export default Navbarr;
