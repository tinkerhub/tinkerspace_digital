export const fetchData = async () => {
    const API_URL = process.env.REACT_APP_API_BASE_URL;
    console.log(API_URL);
    
    try {
        if (!API_URL) {
            throw new Error('REACT_APP_API_BASE_URL is not set. Please configure it in your .env file.');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);        
        const response = await fetch(`${API_URL}/checkin/active`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add any required authentication headers here
            },
            credentials: 'same-origin' // or 'include' if needed
        });

        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Response is not JSON. The backend server may not be running or the API URL is incorrect.");
        }

      const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error('API returned non-array data');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};
