import './Cards.css'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { teamMembers, projectContributor, guard } from '../../utils/badgeRoles';
import { truncate } from '../../utils/truncate';
import { divideCardsForSliders, getSliderSettings } from '../../utils/sliderUtils';
import { generateDummyData } from '../../utils/DemoCards';
import { useEffect, useRef } from 'react';

// Main component
function Cards(props) {

  const datas = props.data;
  console.log('data :',datas);
  

  // for testing ..!
  // const datas = generateDummyData(41);

  // Dividing cards for sliders
  const { firstCardsNine, secondCardsNine, thirdCardsNine, existingCards } = divideCardsForSliders(datas);

  // Slider settings
  const { firstCardsNineSettings, secondCardsNineSettings, thirdCardsNineSettings, existingCardsSettings } = getSliderSettings(firstCardsNine, secondCardsNine, thirdCardsNine, existingCards);
  console.log('existingCardsSettings :', existingCards);

  // Custom code for reloading when slider hits a certain length scenario
  const armedRef = useRef(false);

  useEffect(() => {
    // If the length of existingCards is not 10,
    // set the armed flag so that when it returns to 10, we can reload.
    if (existingCards.length !== 10) {
      armedRef.current = true;
    } else {
      // existingCards.length === 10
      if (armedRef.current) {
        // We've returned to length 10 after being away, so reload
        window.location.reload();
        armedRef.current = false; // Reset armed state
      }
    }
  }, [existingCards]);


  // Function to render mentee card
  const renderCardMentee = (data) => {

    return (
      <div key={data.id}>
        <div className="w-[140px] h-[225.66px] ml-[13px] mb-4 rounded-[11.77px] border" style={{ borderColor: '#AEAEAE', background: 'linear-gradient(160.58deg, rgba(231, 231, 231, 0) 1.42%, rgba(255, 226, 151, 0.2) 98.11%, rgba(255, 215, 75, 0.2) 98.11%)' }}>
          <div className="w-[133.35px] h-[217.39px] p-2 rounded-[9.41px] space-y-3 " style={{ background: 'linear-gradient(332.32deg, #F7F7F7 1.92%, #FFFFFF 83.83%)' }}>
            <img className="w-[117.66px] h-[117.66px] object-cover rounded-[4px]" src={data.avatar ? data.avatar : `${process.env.PUBLIC_URL}/images/alt.jpg`} alt="Profile" />

            {/* Conditionally render the badge */}
            {teamMembers.includes(data['name']) && (
              <img className='w-8 absolute top-[98px]' src="https://ik.imagekit.io/dbq6giy6mr/Tinker%20Space%20Badge's%20/Team-Member-Bronze.png?updatedAt=1727358881914" alt='TinkerSpace' />
            )}
            {projectContributor.includes(data['name']) && (
              <img className='w-8 absolute top-[98px]' src="https://ik.imagekit.io/dbq6giy6mr/Tinker%20Space%20Badge's%20/Project-contributor.png?updatedAt=1727358881890" alt='projectContributor' />
            )}
            {/* {projectContributor.includes(data['name']) && (
                      <img className='w-8 absolute top-[98px]' src={process.env.PUBLIC_URL + '/images/maker.svg'} alt='TinkerSpace' />
                    )} */}
            {guard.includes(data['name']) && (
              <img className='w-8 absolute top-[98px]' src="https://ik.imagekit.io/dbq6giy6mr/Tinker%20Space%20Badge's%20/quard.png?updatedAt=1727358881953" alt='TinkerSpace' />
            )}
            <h2 className="w-[117.66px] h-[13px] text-[15.69px] font-bold">{truncate(data['name'], 11)}</h2>
            <hr className=' border-t-[1px]' style={{ borderColor: '#876100' }} />
            <p className="w-[117.66px] h-[8px] text-[14.12px]">{data["workingOn"] ? truncate(data["workingOn"], 10) : 'Guest'}</p>
            <p className="w-[117.66px] h-[17px] text-[14.12px] " style={{ color: '#876100' }}>{data["purpose"] ? truncate(data["purpose"], 17) : 'Not Specified'}</p>
          </div>
        </div>
      </div>
    );
  };

  // Render the component
  return (
    <>
      <div className='flex pt-10 pl-[95px]'>
        <div className='w-[1695px] font-sans'>
          <Slider {...firstCardsNineSettings} className="card-slider"> {firstCardsNine.map(renderCardMentee)} </Slider>
          <Slider {...secondCardsNineSettings} className="card-slider"> {secondCardsNine.map(renderCardMentee)} </Slider>
          <Slider {...thirdCardsNineSettings} className="card-slider"> {thirdCardsNine.map(renderCardMentee)} </Slider>
          <Slider {...existingCardsSettings} className="card-slider"> {existingCards.map(renderCardMentee)} </Slider>
        </div>
      </div>
    </>
  );
}

export default Cards;