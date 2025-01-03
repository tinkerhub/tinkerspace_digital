import React, { useEffect, useState } from 'react';
import Navbarr from './components/Navbar/Navbar';
import Cards from './components/Cards/Cards';
import './fonts/fonts.css';
import WPage from './components/WelcomePage/WPage';
import { useTimer } from './utils/useTimer'; 
import { fetchData } from './utils/fetchData';
import { removeDuplicates } from './utils/removeDuplicates'
import Lottie from 'lottie-react';
import animationData from './components/animations/snoman.json';
// import animationData1 from './components/animations/lottieAnim1.json';
import animationData2 from './components/animations/lottieAnim2.json';
import animationData3 from './components/animations/lottieAnim3.json';
// import animationData4 from './components/animations/lottieAnim4.json';
import animationData5 from './components/animations/lottieAnim5.json';

function App() {
    const [data, setData] = useState([]);
    const [showWPage, setShowWPage] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const records = await fetchData(); 
                setData(removeDuplicates(records));
            } catch (error) {
                console.error('Fetch failed:', error);
            }
        };

        fetchRecords();
        const interval = setInterval(fetchRecords, 20000);
        return () => clearInterval(interval);
    }, []);

    // Use the custom timer hook
    useTimer(6500, () => setShowWPage(false)); // Call setShowWPage after 6500ms

    return (
        <div className='tailwind-scope' style={{ fontFamily: 'ClashDisplay' }}>
              {/* {showWPage ? <WPage /> : <> */}
                <Navbarr count={data.length} />
                <Cards data={data} />
            
             {/* Lottie animation */}
{/* 
            <Lottie 
                className="absolute z-10 "
                style={{ width: '90px', right: '130px', bottom: '10px', }}
                animationData={animationData} 
                loop 
                autoplay 
            />

            <Lottie 
                className="absolute z-10 "
                style={{ width: '100px', left: '150px', bottom: '10px', }}
                animationData={animationData2} 
                loop 
                autoplay 
            />

            <Lottie 
                className="absolute z-10 "
                style={{ width: '160px', left: '10px', bottom: '10px', }}
                animationData={animationData3} 
                loop 
                autoplay 
            />

            <Lottie 
                className="absolute z-10 "
                style={{ width: '130px', right: '10px', bottom: '10px', }}
                animationData={animationData5} 
                loop 
                autoplay 
            /> */}
            
            {/* </>} */}
        </div>
    );
}

export default App;
