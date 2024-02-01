import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";
// import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0'

console.log("Hello from Dataset Query!");

const router = new Router();

// Function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const supabase = createClient(
  // Supabase API URL - env var exported by default.
  Deno.env.get("SUPABASE_URL") ?? "",
  // Supabase API ANON KEY - env var exported by default.
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  // Create client with Auth context of the user that called the function.
  // This way your row-level-security (RLS) policies are applied.
  // { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
);


router
  .post("/", async (context) => {
    let content = await context.request.body.text();
    content = JSON.parse(content);
    const age = content.age;
    // const content = await context.request.body().value;
    // const age = content.age;
    const supabase = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get("SUPABASE_URL") ?? "",
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      // { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 1. create a item in bodhi_user_search.
    const { data, error } = await supabase
      .from("sim_life_events")
      .select()
      .eq("age", age);
    const randomIndex = Math.floor(Math.random() * data.length);
    context.response.body = data[randomIndex];
  })
  .get("/policy", async (context) => {
    context.response.body =
      "# Privacy Policy for ChatGPT Bot with Arweave Query Functionality\n\n1. Introduction:\nThis Privacy Policy applies to the ChatGPT Bot integrated with Arweave Query functionality, hereafter referred to as 'the Bot'. The Bot is designed to provide users with the ability to query public data stored on the Arweave network.\n\n2. Data Collection:\nThe Bot collects data in two primary ways:\n- User-Provided Data: Information that users input directly, including queries and any personal data shared during interaction.\n- Automated Data Collection: Data collected automatically, such as user interaction patterns and usage statistics.\n\n3. Use of Data:\nCollected data is used for:\n- Responding to user queries.\n- Improving the Bot's functionality and user experience.\n- Research and development purposes.\n\n4. Data Sharing and Disclosure:\nPersonal data is not shared with third parties, except:\n- When required by law.\n- For safeguarding the rights and safety of individuals.\n- In an anonymized or aggregated format for research.\n\n5. Data Security:\nWe implement security measures to protect against unauthorized data access or breaches. However, absolute security cannot be guaranteed.\n\n6. User Rights:\nUsers have the right to:\n- Access personal data held by the Bot.\n- Request correction of incorrect data.\n- Request deletion of their data under certain conditions.\n\n7. Changes to This Policy:\nWe reserve the right to modify this policy. Changes will be communicated through the Bot's platform.\n\n8. Contact Information:\nFor queries regarding this policy, please contact [insert contact details].\n\n\n";
  })
  .post("/events_be_choiced", async (context) => {
    let content = await context.request.body.text();
    content = JSON.parse(content);
    const age = content.age;
    // const content = await context.request.body().value;
    // const age = content.age;
    const { data, error } = await supabase
      .from("sim_life_events_could_choiced")
      .select()
      .eq("age", age);
    const randomIndex = Math.floor(Math.random() * data.length);
    context.response.body = "The events is " + data[randomIndex].content + ". The branches are" + JSON.stringify(data[randomIndex].branches) + ", the uuid of this event is: " + data[randomIndex].uuid
  })
  .post("/result", async (context) => {
    let content = await context.request.body.text();
    content = JSON.parse(content);
    const uuid = content.uuid;
    // const content = await context.request.body().value;
    // const age = content.age;
    const { data, error } = await supabase
      .from("sim_life_events_could_choiced")
      .select()
      .eq("uuid", uuid);
    const results = data[0].results;
    context.response.body = "The results are " + JSON.stringify(results)
  })
  .get("/begin_a_new_life", async (context) => {
    const supabase = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get("SUPABASE_URL") ?? "",
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      // { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data, error } = await supabase
      .from("sim_life_prompts")
      .select()
      .eq("id", 3);
    console.log(data);
    context.response.body = data[0].prompt;
  })
  .post("/batch", async (context) => {
    let content = await context.request.body.text();
    content = JSON.parse(content);
    const ages = content.ages;
    // const content = await context.request.body().value;
    // const ages = content.ages;
    console.log("ages", ages);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let events = [];

    for (const age of ages) {
      const { data, error } = await supabase
        .from("sim_life_events")
        .select()
        .eq("age", age);

      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        events.push(data[randomIndex]);
      }
    }

    const { data, error } = await supabase.from("sim_life_talents").select();

    // Assuming 'data' is an array of items
    const shuffledData = shuffleArray(data);

    // Get the first three items from the shuffled array
    const randomThreeItems = shuffledData.slice(0, 3);
    const results = { events: events, talents: randomThreeItems };
    context.response.body = results;
  })
  .post("/batch_without_talents", async (context) => {
    let content = await context.request.body.text();
    content = JSON.parse(content);
    const ages = content.ages;
    // const content = await context.request.body().value;
    // const ages = content.ages;
    console.log("ages", ages);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let events = [];

    for (const age of ages) {
      const { data, error } = await supabase
        .from("sim_life_events")
        .select()
        .eq("age", age);

      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        events.push(data[randomIndex]);
      }
    }
    const results = { events: events};
    context.response.body = results;
  })
  .get("/random_book", async (context) => {
    const data = ['辟邪剑谱', '金刚经', '金瓶梅', '非欧几何'];
    const randomIndex = Math.floor(Math.random() * data.length);
    context.response.body = data[randomIndex];
  }) 
  .get("/talents", async (context) => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data, error } = await supabase.from("sim_life_talents").select();

    // Assuming 'data' is an array of items
    const shuffledData = shuffleArray(data);

    // Get the first three items from the shuffled array
    const randomThreeItems = shuffledData.slice(0, 3);
    context.response.body = randomThreeItems;
  })
  .get("/prompt", async (context) => {
    const queryParams = context.request.url.searchParams;
    const idString = queryParams.get("id"); // 'id' will be a string or null if not present
    const id = idString ? parseInt(idString) : null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data, error } = await supabase
      .from("sim_life_prompts")
      .select()
      .eq("id", id);
    context.response.body = data;
  });

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());

console.info("CORS-enabled web server listening on port 8000");

// app.use(async (ctx) => {
//     if (!ctx.request.hasBody) {
//       ctx.throw(415);
//     }
//     const reqBody = await ctx.request.body().value;
//     console.log("a=", reqBody.a);
//     ctx.response.status = 200;
//   });

await app.listen({ port: 8000 });
