import { assert } from "./../../deps.ts";

/**
 * Fetches data from Airtable based on the provided parameters.
 *
 * @param {string} apiKey - The Airtable API key.
 * @param {string} baseId - The ID of the Airtable base.
 * @param {string} tableName - The name of the table in the base.
 * @param {string} filterByFormula - The formula to filter records by.
 * @returns {Promise<any>} A promise that resolves to the fetched data.
 * @throws Will throw an error if the Airtable API call fails.
 * 
 * @example
 *   const baseId = "YOUR_BASE_ID";
 *   const tableName = "YOUR_TABLE_NAME";
 *   const formula = "YOUR_FORMULA";
 *   const apiKey = "YOUR_API_KEY";
 *   fetchAirtableData(baseId, tableName, formula, apiKey)
 *     .then(data => console.log(data))
 *     .catch(error => console.error(error));
 */
export async function fetchAirtableData( apiKey: string, baseId: string, tableName: string, filterByFormula: string): Promise<any> {
    // Construct the endpoint URL with the provided parameters
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula=${encodeURIComponent(filterByFormula)}`;
    
    // Set up headers for the request
    const headers = new Headers({
        "Authorization": `Bearer ${apiKey}`,  // API key as a Bearer token
        "Content-Type": "application/json"
    });

    // Make the GET request to the Airtable API
    const response = await fetch(url, { method: "GET", headers });
    
    // If the response is not successful, throw an error
    if (!response.ok) {
        throw new Error(`Airtable API call failed with status: ${response.status}`);
    }
    
    // Parse and return the JSON data from the response
    return response.json();
}
