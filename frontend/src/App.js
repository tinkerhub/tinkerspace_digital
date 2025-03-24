import React, { useEffect, useState } from "react";

import NavBar from "./components/Navbar";
import Cards from "./components/Cards/Cards";

import { useTimer } from "./utils/useTimer";
import { fetchData } from "./utils/fetchData";
import { removeDuplicates } from "./utils/removeDuplicates";

import "./fonts/fonts.css";

function App() {
    const [data, setData] = useState([]);
    const [showWPage, setShowWPage] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const records = await fetchData();
                setData(removeDuplicates(records));
            } catch (error) {
                console.error("Fetch failed:", error);
            }
        };

        fetchRecords();
        const interval = setInterval(fetchRecords, 20000);
        return () => clearInterval(interval);
    }, []);

    // Use the custom timer hook
    useTimer(6500, () => setShowWPage(false)); // Call setShowWPage after 6500ms

    return (
        <div className="tailwind-scope" style={{ fontFamily: "ClashDisplay" }}>
            <NavBar count={data.length} />
            <Cards data={data} />
        </div>
    );
}

export default App;
