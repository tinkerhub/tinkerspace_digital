import React, { useEffect, useState } from 'react';
import Navbarr from './components/Navbar/Navbar';
import Cards from './components/Cards/Cards';
import './fonts/fonts.css';

function App() {
    // Initialize state to hold fetched data
    const [data, setData] = useState([]);

    // Use useEffect to fetch data when the component mounts
    useEffect(() => {
        // Define async function to fetch records
        const fetchRecords = async () => {
            try {
                // Fetch data from the server
                const response = await fetch('https://tinker-backend-bbjncdnbpby9.deno.dev/records');              
                
                // Throw an error if the response is not ok
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                // Parse the response as JSON
                const records = await response.json();
                
                // Update state with fetched records
                setData(records.records);
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

    return (
        <div className='App' style={{ fontFamily: 'ClashDisplay' }}>
            <Navbarr />
            <Cards data={data} /> 
        </div>
    );
}

export default App;

