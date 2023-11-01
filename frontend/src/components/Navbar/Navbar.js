import React from 'react';
import { CurrentDate, CurrentTime } from './CurrentDate';

function Navbarr() {
  const commentText = '//'
  return (
    <div className='flex w-full h-[75px]'>
      <div className='w-2/3 min-h-fit pt-[50px] flex items-center justify-ringht font-bold text-[30px] pl-[100px]' style={{color: '#FF0000'}}>
        <div className="w-2 h-2 bg-red-700 rounded-full animate-ping"></div>
        <p className='pl-2'>Live Feed</p>  
        <p className='pl-4'><CurrentTime /></p>
        <span className='pl-2 pr-2 text-black'>{commentText}</span>
        <p className='pl-1'><CurrentDate /></p>
      </div>

      <div className='w-1/3 min-h-fit flex flex-col items-end justify-center pt-[79px] pr-[125px]'>
        <img className='w-1/3' src={"/images/TKS1.jpg"} alt='TinkerSpace' />
        <img className='w-1/4' src={"/images/TKS2.jpg"} alt='TinkerHub' />
      </div>
    </div>
  );
}

export default Navbarr;
