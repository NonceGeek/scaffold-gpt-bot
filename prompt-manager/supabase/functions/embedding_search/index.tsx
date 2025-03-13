// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
// export to deno.
import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0'

console.log("Hello from searching!")

const router = new Router();
router
  .post("/", async (context) => {
    console.log("searching...");
  let content = await context.request.body.text();
  content = JSON.parse(content);
  const txt = content.text;
  // const content = await context.request.body().value;
  // const txt = content.text;
  const supabase = createClient(
    // Supabase API URL - env var exported by default.
    Deno.env.get('SUPABASE_URL') ?? '',
    // Supabase API ANON KEY - env var exported by default.
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    // Create client with Auth context of the user that called the function.
    // This way your row-level-security (RLS) policies are applied.
    // { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  // 0. find that if the vector exist in dataset.
  const response =
  await supabase.
  from('bodhi_user_search')
  .select()
  .eq('search_data', txt)

  console.log(response.data);
  if(response.data.length==0){
  // 1. create a item in bodhi_user_search.
  const {data, error} = await supabase.
  from('bodhi_user_search')
  .insert({search_data: txt})
  .select()


  const the_id = data[0].id;

  const body = JSON.stringify({
    text: txt,  // Assuming 'raw_text' is the text you want to embed
    key: Deno.env.get('ADMIN_KEY')
  });
  const response = await fetch('http://66.135.11.204/api/simple_ath/embedding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body,
  })
  const result = await response.json();
  const embedding = await JSON.parse(result.data.vector);

  const resp = await supabase.rpc('match_full_dataset', {
    query_embedding: embedding,
    match_threshold: 0.78, // Choose an appropriate threshold for your data
    match_count: 5, // Choose the number of matches
  })

  await supabase
  .from('bodhi_user_search')
  .update({
    embedding: embedding,
    resp: resp
  })
  .eq('id', the_id)

  // await fetch('https://faas.movespace.xyz/api/v1/run?name=VectorAPI&func_name=get_embedding', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //       body: JSON.stringify({"params": [Deno.env.get('MOVESPACE_API_KEY'), txt]}),
  //     })
  //     .then(response => 
  //       response.json()
  //     )
  //     .then(async result => {
  //       console.log("calling faas result:" + result);
  //     const embedding = JSON.parse(result.result.data.vector);
  //     // In production we should handle possible errors
  //     // const { data: resp } = 
  //     await supabase.rpc('match_full_dataset', {
  //       query_embedding: embedding,
  //       match_threshold: 0.78, // Choose an appropriate threshold for your data
  //       match_count: 5, // Choose the number of matches
  //     })
  //     .then(async (resp: any) =>{
  //       await supabase
  //       .from('bodhi_user_search')
  //       .update({
  //         embedding: embedding,
  //         resp: resp
  //       })
  //       .eq('id', the_id)
  //       .then(result => {
  //         console.log("update result: "+ JSON.stringify(result));
  //       })

  //     })
  //   })

  context.response.body = { "item_id": the_id }
}else{
  console.log("search_times+1");
  const the_id = response.data[0].id;
  // 2. update the query result.
  const embedding = JSON.parse(response.data[0].embedding);
  supabase.rpc('match_full_dataset', {
      query_embedding: embedding,
      match_threshold: 0.78, // Choose an appropriate threshold for your data
      match_count: 5, // Choose the number of matches
  })
  .then(async (resp: any) => {
  // 3. times += 1.
  await supabase
      .from('bodhi_user_search')
      .update({
      embedding: embedding,
      resp: resp,
      search_times: response.data[0].search_times + 1
      })
      .eq('id', the_id)
      .then((result: any) => {
      console.log("update result: " + JSON.stringify(result));
      })

  })

  context.response.body = { "item_id": the_id }
}

})

// To invoke:
// curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'


const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });