// import React, { useState, useEffect } from 'react';
import './Cards.css'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// Function to truncate a string to a certain length
function truncate(str, length) {
  if (str === undefined) {
      return null;
  } else {
      if (str.length > length) {
          const end = str.lastIndexOf(' ', 11);
          return end === -1 ? str.substring(0, length) : `${str.substring(0, end)}`;
      }
      return str;
  }
}

// Main component
function Cards(props) {
  const datas = props.data;



// Remove duplicates based on membershipId
const uniqueDatas = datas.reduce((acc, current) => {
  const existingItem = acc.find(item => item.membershipId === current.membershipId);
  if (!existingItem) {
    acc.push(current);
  }
  return acc;
}, []);

console.log('Unique Datas:', uniqueDatas);


// Filter mentors and mentees from uniqueDatas
const mentors = uniqueDatas.filter(data => data.isMentor === true);
const mentees = uniqueDatas.filter(data => data.isMentor === false);

  // const mentors = datas.filter(data => data.isMentor === true);
  
  // const mentees = datas.filter(data => data.isMentor === false);
  
  // console.log('====================================');
 
  //   console.log('Mentor :', mentees);

  // console.log('====================================');

  // console.log('====================================');
  // mentees.forEach(mentees => {
  //   console.log('Mentees Name:', mentees.name);
  // });
  // console.log('====================================');
  

  // dividing cards for sliders
  let firstCardsNine = [];
  let existingCards = [];

  if (mentees.length <= 9) {
    firstCardsNine = mentees;
  } else {
    firstCardsNine = mentees.slice(0, 9);
    existingCards = mentees.slice(9);
  }

  // Count the number of mentors and mentees
  const mentorCount = mentors.length;
  const menteerCount = mentees.length;

  // Function to render mentor card
  const renderCardMentor = (data) => {

    // If the name is not present, return null
    // if (!data.fields['name']) {
    //   return null;
    // }

    // let data.fields['avatar'];
   
    
    return (
      <div key={data.id}>
        <div className="w-[178px] h-auto p-1 rounded-[15px] bg-yellow-200 space-y-4" style={{background: 'linear-gradient(160.58deg, rgba(231, 231, 231, 0) 1.42%, #FFE297 98.11%)'}}>
          <div className="w-[170px] h-auto p-3 rounded-[12px] space-y-3" style={{background: 'linear-gradient(332.32deg, #FFCD4B 1.92%, #FFFFFF 83.83%)'}}>
            {/* <img className="w-[150px] h-[150px] object-cover rounded-[4px]" src={url ? url : "/images/alt.jpg"} alt="Profile" /> */}
            <img className="w-[150px] h-[150px] object-cover rounded-[4px]" src={data.avatar ? data.avatar : `${process.env.PUBLIC_URL}/images/alt.jpg`} alt="Profile" />
            <h2 className="w-[150px] h-[24px] text-[20px] font-bold">{truncate(data['name'], 11)}</h2>
            <hr className=' border-t-[2px]' style={{borderColor: '#876100'}} />
            {/* <p className="w-[150px] h-[22px] text-[18px]">{data.fields["Which domain you would like to give mentorship?"] ? truncate(data.fields["Which domain you would like to give mentorship?"],10) : 'Not Specified' }</p> */}
            <p className="w-[150px] h-[22px] text-[18px]" style={{color: '#876100'}}>{data["purpose"] ? truncate(data["purpose"],19) : 'Not Specified'}</p>
          </div>
        </div>
      </div>
    );
   
};

// Function to render mentee card
const renderCardMentee = (data) => {

  // If the name is not present, return null
  // if (!data.fields['First name (from Your name)']) {
  //   return null;
  // }

    // let url;
    // if (
    //   data.fields &&
    //   data.fields["Enter your Photo (from Your name)"] &&
    //   data.fields["Enter your Photo (from Your name)"].length > 0 &&
    //   data.fields["Enter your Photo (from Your name)"][0].thumbnails &&
    //   data.fields["Enter your Photo (from Your name)"][0].thumbnails.large
    // ) {
    //   url = data.fields["Enter your Photo (from Your name)"][0].thumbnails.large.url;
    // }

    return (
        <div key={data.id}>
            <div className="w-[140px] h-[225.66px] ml-[13px] mb-12 rounded-[11.77px] border" style={{borderColor: '#AEAEAE',background: 'linear-gradient(160.58deg, rgba(231, 231, 231, 0) 1.42%, rgba(255, 226, 151, 0.2) 98.11%, rgba(255, 215, 75, 0.2) 98.11%)'}}>
                <div className="w-[133.35px] h-[217.39px] p-2 rounded-[9.41px] space-y-3 " style={{background: 'linear-gradient(332.32deg, #F7F7F7 1.92%, #FFFFFF 83.83%)'}}>
                    {/* <img className="w-[117.66px] h-[117.66px] object-cover rounded-[4px]" src={url ? url : "/images/alt.jpg"} alt="Profile" /> */}
                    <img className="w-[117.66px] h-[117.66px] object-cover rounded-[4px]" src={data.avatar ? data.avatar : `${process.env.PUBLIC_URL}/images/alt.jpg`} alt="Profile" />
                    <h2 className="w-[117.66px] h-[13px] text-[15.69px] font-bold">{truncate(data['name'], 11)}</h2>
                    <hr className=' border-t-[1px]' style={{borderColor: '#876100'}} />
                    {/* <p className="w-[117.66px] h-[8px] text-[14.12px]">{data.fields["Enter the domain that you will be working on."] ? truncate(data.fields["Enter the domain that you will be working on."],10) : 'Not Specified' }</p> */}
                    <p className="w-[117.66px] h-[17px] text-[14.12px]" style={{color: '#876100'}}>{data["purpose"] ? truncate(data["purpose"],19) : 'Not Specified'}</p>
                </div>  
            </div>
        </div>
    );
};

// react-slick settings 
var numberOfCards1 = mentors.length; // get the number of cards after sorting
  var mentorsSettings = {
    infinite: numberOfCards1 >= 9,
    speed: 700,
    slidesToShow: Math.min(numberOfCards1, 8),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000, 
  };

  var numberOfCards2 = firstCardsNine.length;
  var firstCardsNineSettings = {
    infinite: false,
    slidesToShow: Math.min(numberOfCards2, 9),
    
  };

  var numberOfCards3 = existingCards.length;
  var existingCardsSettings = {
    infinite: true,
    slidesToShow: Math.min(numberOfCards3, 9),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000, 
    
  };
  
// Render the component
return (
    <>
      <div className='pl-[100px]'>
      {mentors.length > 0 && (
        <div className='flex'>
          <h2 className='text-[80px] font-bold'>Mentors</h2>
          <span className='w-[46px] h-[50px] bg-black text-white rounded-full flex items-center justify-center mt-[40px] ml-[20px] text-[30px] font-semibold'>{mentorCount}</span>
        </div>
        )}
        <div className='w-[1799px] pb-4 font-sans'>
          <Slider {...mentorsSettings} className="mentors-slider">
             {mentors.map(renderCardMentor)}
          </Slider>
        </div>   
      </div>

      <div className='flex pt-10 pl-[95px]'>
      {mentees.length > 0 && (
        <div className='pt-[40px] mb-12'>
          <h2 className='text-[80px] font-bold rotate-180' style={{ writingMode: 'vertical-rl' }}>Learners</h2>  
          <span className='w-[61.54px] h-[65.54px] bg-white text-black border-black border rounded-full font-bold flex items-center justify-center mt-[20px] ml-[30px] text-[30px] pr-1 text-[31.85px]'>{menteerCount}</span>
        </div>
        )}

        <div className='w-[1530px] font-sans'>
          
          <Slider {...firstCardsNineSettings} className="mentees-slider" >
          {firstCardsNine.map(renderCardMentee)}
          </Slider>

          <Slider {...existingCardsSettings} className="mentees-slider" >
          {existingCards.map(renderCardMentee)}
          </Slider>
        </div>

      </div>
    </>
  );
}

export default Cards;