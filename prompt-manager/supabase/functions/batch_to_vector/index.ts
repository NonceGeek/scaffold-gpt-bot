// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  v4 as uuidV4,
} from "https://deno.land/std@0.143.0/uuid/mod.ts";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
console.log("Hello from batch_to_new_column!")
const router = new Router();

router
.get("/table", async (context) => {
  console.log("table");
  const tableName = context.request.url.searchParams.get("name");
  console.log("tableName:", tableName);
  if (!tableName) {
    context.response.status = 400;
    context.response.body = { error: "Table name is required." };
    return;
  }

  const supabase = createClient(
    // Supabase API URL - env var exported by default.
    Deno.env.get('SUPABASE_URL') ?? '',
    // Supabase API ANON KEY - env var exported by default.
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    // Create client with Auth context of the user that called the function.
    // This way your row-level-security (RLS) policies are applied.
    // { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const { data, error } = await supabase
  .from(tableName)
  .select()
  .is('uuid', null);
  // console.log(data);

  let idx;
  for(idx in data){
    let raw_data = data[idx].data.trim();
    // Continue to the next iteration if raw_data is empty after trimming
    if (raw_data.length === 0) {
      
      console.log("Skipping empty or space-only raw_data.");
      continue;
    }

    if (raw_data.length <=1000 && raw_data.length > 0){
      console.log("raw_data.length: ", raw_data.length);
      // let metadata = data[idx].metadata;
      // call smart-prompt to insert data.
      const body = JSON.stringify({
        text: raw_data,  // Assuming 'raw_text' is the text you want to embed
        key: Deno.env.get('ADMIN_KEY')
      });
      console.log("raw_data:", raw_data);
      // call faas to insert data
      const response = await fetch('http://66.135.11.204/api/simple_ath/embedding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      })

      console.log(response);

      // if (!response.ok) {
      //   console.error('Failed to fetch:', response.status, response.statusText);
      //   return; // Early return on fetch error
      // }

      const result = await response.json();
      console.log(result);
      const uuid = uuidV4.generate();
      const embedding = await JSON.parse(result.data.vector);
      console.log("embedding: ", embedding);
      const { error } = await supabase
      .from(tableName)
      .update({ uuid: uuid, embedding: embedding, if_vectored: true})
      .eq('id', data[idx].id);
      console.log(error);
      await delay(1000);
    }

  }

  return new Response(
    JSON.stringify({"task": "finished"}),
    { headers: { "Content-Type": "application/json" } },
  )

  })
  .get("/", async (_context: any) => {
  const supabase = createClient(
    // Supabase API URL - env var exported by default.
    Deno.env.get('SUPABASE_URL') ?? '',
    // Supabase API ANON KEY - env var exported by default.
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    // Create client with Auth context of the user that called the function.
    // This way your row-level-security (RLS) policies are applied.
    // { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const { data, error } = await supabase
  .from('bodhi_text_assets_k_v')
  .select()
  .is('uuid', null);
  // console.log(data);

  let idx;
  for(idx in data){
    let raw_data = data[idx].data.trim();
    
    // Continue to the next iteration if raw_data is empty after trimming
    
    if (raw_data.length === 0) {
      console.log("Skipping empty or space-only raw_data.");
      continue;
    }
    if (raw_data.length > 1000) {
      console.log("Skipping the too long raw_data.");
      continue;
    }
    // TODO: if the data is too long, we will skip it, but I think it should be optimize in the future.
    // TODO: maybe split the data into small pieces and then insert them into the database.
    if (raw_data.length <=1000 && raw_data.length > 0){
      console.log("raw_data.length: ", raw_data.length);
      // let metadata = data[idx].metadata;
      // call smart-prompt to insert data.
      const body = JSON.stringify({
        text: raw_data,  // Assuming 'raw_text' is the text you want to embed
        key: Deno.env.get('ADMIN_KEY')
      });
      // call faas to insert data
      const response = await fetch('http://66.135.11.204/api/simple_ath/embedding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      })

      console.log(response);

      // if (!response.ok) {
      //   console.error('Failed to fetch:', response.status, response.statusText);
      //   return; // Early return on fetch error
      // }

      const result = await response.json();
      console.log(result);
      const uuid = uuidV4.generate();
      const embedding = await JSON.parse(result.data.vector);
      console.log("embedding: ", embedding);
      const { error } = await supabase
      .from('bodhi_text_assets_k_v')
      .update({ uuid: uuid, embedding: embedding, if_vectored: true})
      .eq('id', data[idx].id);
      console.log(data[idx].data.id + error);
      await delay(1000);
    }
  }

  return new Response(
    JSON.stringify({"task": "finished"}),
    { headers: { "Content-Type": "application/json" } },
  )


})

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });