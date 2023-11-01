// import React, { useEffect, useState } from 'react';
// import Navbarr from './components/Navbar/Navbar';
// import Cards from './components/Cards/Cards';
// import './fonts/fonts.css';


// function App() {
//     const [datas, setData] = useState([]);

//     useEffect(() => {
//         // Function to fetch records from Express server
//         const fetchRecords = async () => {
//             try {
//                 const response = await fetch('http://localhost:8000/recodes');
//                 // console.log(response)
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! status: ${response.status}`);
//                 }
//                 const records = await response.json();
//                 // Update state with fetched records
//                 setData(records);
//                 // console.log(records)

//             } catch (error) {
//                 console.error('Fetch failed:', error);
//             }
//         };
    
//         // Fetch records immediately on component mount
//         fetchRecords();
    
//         // Set up an interval to fetch records every 5 seconds
//         const interval = setInterval(fetchRecords, 5000);
    
//         // Clear the interval when the component unmounts
//         return () => clearInterval(interval);
//     }, []);

//     return (
//         <div className='App' style={{ fontFamily: 'ClashDisplay' }}>

//             <Navbarr />
//             <Cards datas={datas} />

//         </div>
//     );
// }

// export default App;


import React, { useEffect, useState } from 'react';
import Navbarr from './components/Navbar/Navbar';
import Cards from './components/Cards/Cards';
import './fonts/fonts.css';
import moment from 'moment';


function App() {
    const [datas, setData] = useState([]);

    // useEffect(() => {
    //     // Function to fetch records from Express server
    //     const fetchRecords = async () => {
    //         try {
    //             // Fetch data from the server
    //             const response = await fetch('http://localhost:8000/recodes');
    //             if (!response.ok) {
    //                 throw new Error(`HTTP error! status: ${response.status}`);
    //             }
    //             // Parse the response as JSON
    //             const records = await response.json();
    //             // Update state with fetched records
    //             setData(records);
    //             console.log(records)
    //         } catch (error) {
    //             console.error('Fetch failed:', error);
    //         }
    //     };
    
    //     // Fetch records immediately on component mount
    //     fetchRecords();
    
    //     // Set up an interval to fetch records every 5 seconds
    //     const interval = setInterval(fetchRecords, 5000);
    
    //     // Clear the interval when the component unmounts
    //     return () => clearInterval(interval);
    // }, []);


    useEffect(() => {
        // Function to fetch records from Express server
        const fetchRecords = async () => {
          try {
            // Fetch data from the server
            const response = await fetch('http://localhost:8000/recodes');
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Parse the response as JSON
            let records = await response.json();
      
            // Filter records based on your criteria
            // records = records.filter(record => /* YOUR_FILTER_CRITERIA */);
            records = records.filter(record => {
                const loggedInTime = moment(record.fields['Loged in time']);
                const targetDate = moment('2023-11-01');
                return loggedInTime.isSame(targetDate, 'day');
              });
      
            // Update state with fetched records
            setData(records);
          } catch (error) {
            console.error('Fetch failed:', error);
          }
        };
      
        // Fetch records immediately on component mount
        fetchRecords();
      
        // Set up an interval to fetch records every 5 seconds
        const interval = setInterval(fetchRecords, 5000);
      
        // Clear the interval when the component unmounts
        return () => clearInterval(interval);
      }, []);
      

    return (
        <div className='App' style={{ fontFamily: 'ClashDisplay' }}>
            <Navbarr />
            {/* Pass the fetched data to the Cards component */}
            <Cards datas={datas} />
        </div>
    );
}

export default App;
