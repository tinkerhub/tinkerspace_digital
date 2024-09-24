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

// Function to generate random data
// function generateDummyData(count) {
//   const dummyData = [];
//   const roles = ["Maker", "Mentor"];
//   const purposes = ["Self Learning", "Working on a project", "Attending an event", ""];
//   const workingOnOptions = ["React", "Flutter", "Django", "React Native", "Redux", "Pytorch", ""];

//   for (let i = 0; i < count; i++) {
//     dummyData.push({
//       id: i + 1,
//       avatar: `https://fastly.picsum.photos/id/616/200/300.jpg?hmac=OPqWGCOp_eJVWmNlthIO-AKugNYYIBYh3Y7mO6MS_eg`,
//       checkInTime: new Date().toISOString(),
//       checkOutTime: new Date().toISOString(),
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       membershipId: i + 1,
//       mid: i + 1,
//       name: `User ${i + 1}`,
//       purpose: purposes[Math.floor(Math.random() * purposes.length)],
//       role: roles[Math.floor(Math.random() * roles.length)],
//       roleId: Math.random() > 0.5 ? 4 : 3,
//       workingOn: workingOnOptions[Math.floor(Math.random() * workingOnOptions.length)],
//       isMentor: Math.random() > 0.5, // Randomly assign as mentor or not
//     });
//   }

//   return dummyData;
// }

// Example usage to generate 100 dummy data entries
// const dummyData = generateDummyData(44);

// Pass this dummyData as a prop to your Cards component

// Main component
function Cards(props) {
  const datas = props.data;
  // const datas = dummyData;

// Remove duplicates based on membershipId
const uniqueDatas = datas.reduce((acc, current) => {
  const existingItem = acc.find(item => item.membershipId === current.membershipId);
  if (!existingItem) {
    acc.push(current);
  }
  return acc;
}, []);

// console.log('Unique Datas:', uniqueDatas);


// Filter mentors and mentees from uniqueDatas
// const mentors = uniqueDatas.filter(data => data.isMentor === true);
const mentees = uniqueDatas;

  // dividing cards for sliders
  let firstCardsNine = [];
  let secondCardsNine = [];
  let thirdCardsNine = [];
  // let firstCardsNine = [];

  let existingCards = [];

  firstCardsNine = mentees.slice(0, 10);
  secondCardsNine = mentees.slice(10, 20);
  thirdCardsNine = mentees.slice(20, 30);
  existingCards = mentees.slice(30);

// Function to render mentee card
const renderCardMentee = (data) => {

    return (
        <div key={data.id}>
            <div className="w-[140px] h-[225.66px] ml-[13px] mb-4 rounded-[11.77px] border" style={{borderColor: '#AEAEAE',background: 'linear-gradient(160.58deg, rgba(231, 231, 231, 0) 1.42%, rgba(255, 226, 151, 0.2) 98.11%, rgba(255, 215, 75, 0.2) 98.11%)'}}>
                <div className="w-[133.35px] h-[217.39px] p-2 rounded-[9.41px] space-y-3 " style={{background: 'linear-gradient(332.32deg, #F7F7F7 1.92%, #FFFFFF 83.83%)'}}>
                    {/* <img className="w-[117.66px] h-[117.66px] object-cover rounded-[4px]" src={url ? url : "/images/alt.jpg"} alt="Profile" /> */}
                    <img className="w-[117.66px] h-[117.66px] object-cover rounded-[4px]" src={data.avatar ? data.avatar : `${process.env.PUBLIC_URL}/images/alt.jpg`} alt="Profile" />
                    <h2 className="w-[117.66px] h-[13px] text-[15.69px] font-bold">{truncate(data['name'], 11)}</h2>
                    <hr className=' border-t-[1px]' style={{borderColor: '#876100'}} />
                    <p className="w-[117.66px] h-[8px] text-[14.12px]">{data["workingOn"] ? truncate(data["workingOn"],10) : 'Guest' }</p>
                    <p className="w-[117.66px] h-[17px] text-[14.12px] " style={{color: '#876100'}}>{data["purpose"] ? truncate(data["purpose"],17) : 'Not Specified'}</p>
                </div>  
            </div>
        </div>
    );
};


  var numberOfCards0 = firstCardsNine.length;
  var firstCardsNineSettings = {
    infinite: false,
    slidesToShow: Math.min(numberOfCards0, 10),
    
  };

  var numberOfCards1 = secondCardsNine.length;
  var secondCardsNineSettings = {
    infinite: false,
    slidesToShow: Math.min(numberOfCards1, 10),
    
  };

  var numberOfCards2 = thirdCardsNine.length;
  var thirdCardsNineSettings = {
    infinite: false,
    slidesToShow: Math.min(numberOfCards2, 10),
    
  };

  var numberOfCards3 = existingCards.length;
  var existingCardsSettings = {
    infinite: true,
    slidesToShow: Math.min(numberOfCards3, 10),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000, 
    
  };
  
// Render the component
return (
    <>

      <div className='flex pt-10 pl-[95px]'>

        <div className='w-[1695px] font-sans'>
          
          <Slider {...firstCardsNineSettings} className="mentees-slider" >
          {firstCardsNine.map(renderCardMentee)}
        </Slider>

        <Slider {...secondCardsNineSettings} className="mentees-slider" >
          {secondCardsNine.map(renderCardMentee)}
        </Slider>

        <Slider {...thirdCardsNineSettings} className="mentees-slider" >
          {thirdCardsNine.map(renderCardMentee)}
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