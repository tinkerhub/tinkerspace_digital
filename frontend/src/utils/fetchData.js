export const fetchData = async () => {
    const response = await fetch(
        "https://app-api.tinkerhub.org/checkin/active"
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
};
