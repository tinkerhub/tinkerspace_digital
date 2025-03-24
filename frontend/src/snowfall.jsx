import React from "react";
import Snowfall from "react-snowfall";

// Use URLs for public assets
const images = [
    `${process.env.PUBLIC_URL}/images/snowflake-1.png`,
    `${process.env.PUBLIC_URL}/images/snowflake-2.png`,
];

const Demo = () => {
    return (
        <Snowfall
            style={{
                background: "#fff", // Set the background color
            }}
            snowflakeCount={200} // Number of snowflakes
            images={images} // Custom snowflake images
        />
    );
};

export default Demo;
