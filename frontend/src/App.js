import React, { useEffect, useState } from 'react';
import Navbarr from './components/Navbar/Navbar';
import Cards from './components/Cards/Cards';
import './fonts/fonts.css';
import WPage from './components/WelcomePage/WPage';

function App() {
    const [data, setData] = useState([]);
    const [showWPage, setShowWPage] = useState(true);

    useEffect(() => {
        // Define async function to fetch records
        const fetchRecords = async () => {
            try {
                const response = await fetch('https://app-api.tinkerhub.org/checkin/active');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Parse the response as JSON
                const records = await response.json();

                // console.log('records :', records);

                setData(records);

            } catch (error) {
                // Log any errors to the console
                console.error('Fetch failed:', error);
            }
        };

        // Fetch records immediately
        fetchRecords();

        // Fetch records every 20 seconds
        const interval = setInterval(fetchRecords, 20000);

        // Clear interval when component unmounts
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // console.log('Updated data in app:', data);
    }, [data]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWPage(false);
        }, 6500); // Show <WPage /> for 30 seconds

        return () => clearTimeout(timer);
    }, []);


    return (
       
        <div className='tailwind-scope' style={{ fontFamily: 'ClashDisplay' }}>
             {showWPage ? (
                <WPage />
            ) : ( 
                <>
                    <Navbarr data={data} />
                    <Cards data={data} />
                </>
            )} 

        </div>
    );
}

export default App;

