import React, { useEffect, useState } from 'react';
import { fetchData } from './utils/fetchData';
import { removeDuplicates } from './utils/removeDuplicates';
import PaginatedCardGrid from './components/PaginatedCardGrid';
import EmojiBackground from './components/EmojiBackground';

function App() {
    const [data, setData] = useState([]);

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

    return (
        <div style={{ 
            position: 'relative',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            fontFamily: 'Geist'
        }}>
            <EmojiBackground />
            <PaginatedCardGrid data={data} />
        </div>
    );
}

export default App;
