// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
console.log("Hello from Functions!")

Deno.serve(async (req) => {
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
  // get data info


  const body = await req.json()
  // struct in body
  // {
  //   "type": "INSERT",
  //   "table": "raw_data",
  //   "record": {
  //     "id": 13,
  //     "content": "fdsfsdsfdsfd",
  //     "created_at": "2023-12-16T22:22:08.542514+00:00"
  //   },
  //   "schema": "public",
  //   "old_record": null
  // }

  // call the faas system to handle it.
  await fetch('https://faas.movespace.xyz/api/v1/run?name=Contracts.Bodhi&func_name=supabase_raw_to_text_data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({"params": [body]}),
  })
  .then(response => 
      response.json()
  )
  .then(
    async (data) => {
    if (data.result != "pass" && data.result != null) {

      // insert to next dataset
      await supabase
      .from('bodhi_text_assets')
      .insert({ 
        id_on_chain: data.result.id_on_chain,
        content: data.result.content,
        creator: data.result.creator,
      })

      // change the status of the original dataset
      await supabase
      .from('bodhi_raw_assets')
      .update({
        if_handled_to_bodhi_text_assets: true
      })
      .eq('id_on_chain', data.result.id_on_chain)
    }
  })

  // insert the result into database.
  // const { __res } = await supabase
  //   .from('handled_data')
  //   .insert({ content: 'opps' })

  return new Response(
    JSON.stringify(body),
    { headers: { "Content-Type": "application/json" } },
  )
})

// To invoke:
// curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
