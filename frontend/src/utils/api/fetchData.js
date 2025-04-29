export const fetchData = async () => {
    const API_URL = process.env.REACT_APP_API_BASE_URL;
    console.log(API_URL);
    
    
    try {
        const response = await fetch(`${API_URL}/checkin/active`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add any required authentication headers here
            },
            credentials: 'same-origin' // or 'include' if needed
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};