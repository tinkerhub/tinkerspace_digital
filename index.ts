// import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
// import { Airtable } from "https://deno.land/x/airtable/mod.ts";
// import { config } from "https://deno.land/x/dotenv/mod.ts";
// import { oakCors } from "https://deno.land/x/cors/mod.ts";

// // Create a new Oak application
// const app = new Application();
// const PORT = 8000;

// // Enable CORS for all routes
// app.use(oakCors());

// // Define a middleware function for the '/recodes' endpoint
// app.use(async (ctx) => {
//   if (ctx.request.url.pathname === "/recodes") {
//     // Initialize Airtable with API key, base ID, and table name from environment variables
//     const airtable = new Airtable({
//       apiKey: config().REACT_APP_AIRTABLE_API_KEY,
//       baseId: config().REACT_APP_AIRTABLE_BASE_ID,
//       tableName: config().REACT_APP_AIRTABLE_TABLE_NAME
//     });
    
//     try {
//       // Fetch records from Airtable
//       // const records = await airtable.select();
      
//       // Log the fetched data and send it as the response body
//       // console.log(`Data: ${records}`);
//       // ctx.response.body = records.records;

//       let allRecords : any [] = [];
//       let fetching = true;
//       let offset = undefined;

//       while (fetching) {
//         const page = await airtable.select({ offset });
//         allRecords = [...allRecords, ...page.records];
//         offset = page.offset;
//         fetching = !!offset;
//       }
      
//       // Log the fetched data and send it as the response body
//       console.log(`Data: ${allRecords}`);
//       ctx.response.body = allRecords;


//     } catch (err) {
//       // Log any errors and send them as the response body with a 500 status code
//       console.error(err);
//       ctx.response.status = 500;
//       ctx.response.body = err;
//     }
//   }
// });

// // Start the application on port 8000
// await app.listen({ port: PORT });


// #################################


import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { Airtable } from "https://deno.land/x/airtable/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

// Create a new Oak application
const app = new Application();
const PORT = 8000;

// Enable CORS for all routes
app.use(oakCors());

var airtableCallCounter = 0;

// Define a middleware function for the '/recodes' endpoint
app.use(async (ctx) => {
  if (ctx.request.url.pathname === "/recodes") {
    airtableCallCounter+=1;
    console.log("airtableCallCounter :: ", airtableCallCounter);


    // Initialize Airtable with API key, base ID, and table name from environment variables
    const airtable = new Airtable({
      apiKey: config().REACT_APP_AIRTABLE_API_KEY,
      baseId: config().REACT_APP_AIRTABLE_BASE_ID,
      tableName: config().REACT_APP_AIRTABLE_TABLE_NAME
    });
    
    try {
      // Fetch records from Airtable
    
      // const records = await airtable.select({
      //   filterByFormula: "DATETIME_FORMAT({Loged in time}, 'YYYY-MM-DD') = '2023-10-31'"
        
      // });
      const records = await airtable.select({
        // filterByFormula: "DATETIME_FORMAT({Loged in time}, 'YYYY-MM-DD') = '2023-10-31'"
      });
      // DATETIME_FORMAT(SET_TIMEZONE({Loged in time}, 'Asia/Kolkata'), 'YYYY-MM-DD
      // filterByFormula: "DATETIME_FORMAT({createdTime}, 'YYYY-MM-DD',) = DATETIME_FORMAT(TODAY(), 'YYYY-MM-DD')"
      // filterByFormula: " DATETIME_FORMAT(SET_TIMEZONE({Loged in time}, 'Asia/Kolkata'), 'YYYY-MM-DD"
      
      // Log the fetched data and send it as the response body
      console.log(`Data: ${records}`);
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

// ###########################

// import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
// import { Airtable } from "https://deno.land/x/airtable/mod.ts";
// import { config } from "https://deno.land/x/dotenv/mod.ts";
// import { oakCors } from "https://deno.land/x/cors/mod.ts";

// // Create a new Oak application
// const app = new Application();
// const PORT = 8000;

// // Enable CORS for all routes
// app.use(oakCors());

// // Define a middleware function for the '/recodes' endpoint
// app.use(async (ctx) => {
//   if (ctx.request.url.pathname === "/recodes") {
//     // Initialize Airtable with API key, base ID, and table name from environment variables
//     const airtable = new Airtable({
//       apiKey: config().REACT_APP_AIRTABLE_API_KEY,
//       baseId: config().REACT_APP_AIRTABLE_BASE_ID,
//       tableName: config().REACT_APP_AIRTABLE_TABLE_NAME
//     });
    
//     try {
//       // Fetch records from Airtable
//       const records = await airtable.select();
      
//       // Log the fetched data and send it as the response body
//       console.log(`Data: ${records}`);
//       ctx.response.body = records.records;
//     } catch (err) {
//       // Log any errors and send them as the response body with a 500 status code
//       console.error(err);
//       ctx.response.status = 500;
//       ctx.response.body = err;
//     }
//   }
// });

// // Start the application on port 8000
// await app.listen({ port: PORT });
