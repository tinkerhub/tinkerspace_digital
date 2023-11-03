import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { fetchAirtableData } from "./util/AirtablUtil.ts"

// Create a new Oak application
const app = new Application();
const PORT = 8000;

// Enable CORS for all routes
app.use(oakCors());

// Define a middleware function for the '/recodes' endpoint
app.use(async (ctx) => {
  if (ctx.request.url.pathname === "/recods") {
    const currentDate = new Date();
    // Format the date as 'YYYY-MM-DD'
    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    
    try {
      // const filterByFormula = "DATETIME_FORMAT({Loged in time}, 'YYYY-MM-DD') = '2023-11-02'";
      const filterByFormula = `DATETIME_FORMAT({Loged in time}, 'YYYY-MM-DD') = '${formattedDate}'`;
      // const filterByFormula = `DATETIME_FORMAT(SET_TIMEZONE({Loged in time}, 'Asia/Kolkata'), 'YYYY-MM-DD') = '${formattedDate}'`;

      // Fetch records from Airtable
      const records = await fetchAirtableData(config().AIRTABLE_API_KEY,config().AIRTABLE_BASE_ID,config().AIRTABLE_TABLE_NAME,filterByFormula);

      ctx.response.body = records;
    } catch (err) {
      // Log any errors and send them as the response body with a 500 status code
      console.error(err);
      ctx.response.status = 500;
      ctx.response.body = err;
    }
  }
});

// Start the application on port 8000
await app.listen({ port: PORT });