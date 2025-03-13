// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Hello from Functions!")

const router = new Router();


router
  .get("/", async(context) =>{
    // Create a Supabase client with the Auth context of the logged in user.
    const supabase = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      // { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 1. get the index now.
    const { data, _error } = await supabase
      .from('bodhi_indexer')
      .select('index')
      .eq('name', 'spaceFactory')
    
    // await fetch('https://webhook.site/b6badf85-a897-4342-ab5d-a3bb2efb565b?from=indexer', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({"params": data.index}),
    // })

    let index_now = data[0].index;

    const indexResponse = await fetch('https://faas.movespace.xyz/api/v1/run?name=Contracts.Bodhi&func_name=get_space_index', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ "params": [] }),
    });
    const indexData = await indexResponse.json();
    const index_on_chain = indexData.result;
    console.log("index_on_chain", index_on_chain);
    if (index_on_chain > index_now) {
      const spaceResponse = await fetch('https://faas.movespace.xyz/api/v1/run?name=Contracts.Bodhi&func_name=get_spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "params": [index_now, index_on_chain - 1] }),  // Adjusted params to include a range if needed
      });
      const spacesData = await spaceResponse.json();
      console.log("spacesData", spacesData);

      for (let item of spacesData.result) {

        const { error } = await supabase
          .from('bodhi_spaces')
          .insert({
            // TODO: update here.
            contract_addr: item
          });
        if (error) console.error(error);
        index_now += 1;
        console.log('index_now', index_now);
      }

      const updateResponse = await supabase
        .from('bodhi_indexer')
        .update({ index: index_now })
        .eq('name', "spaceFactory");
      console.log("updateResponse", updateResponse);
      if (updateResponse.error) console.error(updateResponse.error);
    }

    // response.
    context.response.body = { "index_now": index_now }
  })
  .get("/batch_to_text_database", async(context) =>{
    const supabase = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      // { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data, error } = await supabase
    .from("bodhi_text_assets")
    .select()
    .is('space_contract_addr', null)
    .order('id', { ascending: false });  // Sorts the data by 'id' in descending order
    console.log("error", error);
    let item;
    for(item in data){
      console.log(data[item].creator);
      const { data: spacesData, error: spacesError } = await supabase
      .from('bodhi_spaces')
      .select()
      .eq('contract_addr', data[item].creator)

      console.log("spacesData", spacesData);
      console.log("spacesError", spacesError);

      if (spacesData.length === 0) {
        await supabase
        .from('bodhi_text_assets')
        .update({
          space_contract_addr: '0x0', 
          author_true: data[item].creator
        })
        .eq('id_on_chain',  data[item].id_on_chain)
      }else{
        // get_true_creator

        const creatorResp = await fetch('https://faas.movespace.xyz/api/v1/run?name=Contracts.Bodhi&func_name=get_true_creator', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ "params": [data[item].creator, data[item].id_on_chain] }),  // Adjusted params to include a range if needed
        });

        const creatorRespData = await creatorResp.json();
        console.log("creatorRespData", creatorRespData.result);
        await supabase
        .from('bodhi_text_assets')
        .update({
          space_contract_addr: data[item].creator,
          author_true: creatorRespData.result
        })
        .eq('id_on_chain',  data[item].id_on_chain)
      }
    }
    context.response.body = { "result": "done" }
  })

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });
