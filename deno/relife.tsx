import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";
import { ethers } from "https://cdn.skypack.dev/ethers@5.6.8";
// import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0'

console.log("Hello from Relife!");

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

// Function to verify a signature
async function verify(address: string, message: string, signature: string): Promise<boolean> {
  try {
    // Hash the message using MD5
    const messageBytes = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('MD5', messageBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Prefix the hash according to EIP-191
    const prefixedMessage = `\x19Ethereum Signed Message:\n${hashHex.length}${hashHex}`;
    
    // Recover the address from the signature
    const recoveredAddress = ethers.utils.verifyMessage(prefixedMessage, signature);
    
    // Compare the recovered address with the provided address
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

const docs = `# ReLife API Documentation

Base URL: \`https://relife.deno.dev\`

## Table of Contents
- [Prompt Management](#prompt-management)
- [Life Simulation](#life-simulation)
- [Events and Choices](#events-and-choices)
- [Talents](#talents)
- [Miscellaneous](#miscellaneous)

## Prompt Management

### Get All Prompts
Retrieves all prompts from the database.

**Endpoint:** \`GET /prompts\`

**Curl Example:**
\`\`\`bash
curl -X GET https://relife.deno.dev/prompts
\`\`\`

**Response:**
\`\`\`json
[
  {
    "id": 1,
    "created_at": "2024-01-24T05:54:22.032169+00:00",
    "prompt": "...",
    "name": "prompt_name",
    "controllers": ["0x..."]
  },
  ...
]
\`\`\`

### Get Prompt by ID
Retrieves a specific prompt by its ID.

**Endpoint:** \`GET /prompt/:id\`

**URL Parameters:**
- \`id\` - The ID of the prompt to retrieve

**Curl Example:**
\`\`\`bash
curl -X GET https://relife.deno.dev/prompt/5
\`\`\`

**Response:**
\`\`\`json
{
  "id": 5,
  "created_at": "2024-01-24T05:54:22.032169+00:00",
  "prompt": "...",
  "name": "prompt_name",
  "controllers": ["0x..."]
}
\`\`\`

### Get Prompt by ID (Query Parameter)
Alternative way to retrieve a prompt using a query parameter.

**Endpoint:** \`GET /prompt?id=<id>\`

**Query Parameters:**
- \`id\` - The ID of the prompt to retrieve

**Curl Example:**
\`\`\`bash
curl -X GET https://relife.deno.dev/prompt?id=5
\`\`\`

**Response:**
\`\`\`
Prompt text content
\`\`\`

### Update Prompt with Password
Updates a prompt using password authentication.

**Endpoint:** \`POST /prompt_set_by_password\`

**Curl Example:**
\`\`\`bash
curl -X POST https://relife.deno.dev/prompt_set_by_password \\
  -H "Content-Type: application/json" \\
  -d '{"id": 5, "password": "your_password", "prompt": "New prompt content", "name": "New prompt name"}'
\`\`\`

**Request Body:**
\`\`\`json
{
  "id": 5,
  "password": "your_password",
  "prompt": "New prompt content",
  "name": "New prompt name"
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "the prompt is set successfully."
}
\`\`\`

### Update Prompt with Signature
Updates a prompt using cryptographic signature authentication.

**Endpoint:** \`POST /prompt_set\`

**Curl Example:**
\`\`\`bash
curl -X POST https://relife.deno.dev/prompt_set \\
  -H "Content-Type: application/json" \\
  -d '{"id": 5, "prompt": "New prompt content", "signature": "0x...", "addr": "0x..."}'
\`\`\`

**Request Body:**
\`\`\`json
{
  "id": 5,
  "prompt": "New prompt content",
  "signature": "0x...",
  "addr": "0x..."
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "the prompt is set successfully.[data]"
}
\`\`\`

## Life Simulation

### Begin a New Life
Retrieves the initial prompt to start a new life simulation.

**Endpoint:** \`GET /begin_a_new_life\`

**Curl Example:**
\`\`\`bash
curl -X GET https://relife.deno.dev/begin_a_new_life
\`\`\`

**Response:**
\`\`\`
Initial prompt text content
\`\`\`

### Get Event by Age
Retrieves a random event for a specific age.

**Endpoint:** \`POST /\`

**Curl Example:**
\`\`\`bash
curl -X POST https://relife.deno.dev/ \\
  -H "Content-Type: application/json" \\
  -d '{"age": 18}'
\`\`\`

**Request Body:**
\`\`\`json
{
  "age": 18
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": 123,
  "age": 18,
  "content": "Event description",
  ...
}
\`\`\`

### Get Batch Events
Retrieves multiple events for a range of ages and optional talents.

**Endpoint:** \`POST /batch\`

**Curl Example:**
\`\`\`bash
curl -X POST https://relife.deno.dev/batch \\
  -H "Content-Type: application/json" \\
  -d '{"ages": [1, 2, 3, 4, 5], "type": ["normal"]}'
\`\`\`

**Request Body:**
\`\`\`json
{
  "ages": [1, 2, 3, 4, 5],
  "type": ["normal"]
}
\`\`\`

**Response:**
\`\`\`json
{
  "events": [
    {
      "id": 123,
      "age": 1,
      "content": "Event description",
      ...
    },
    ...
  ],
  "talents": [
    {
      "id": 456,
      "name": "Talent name",
      "description": "Talent description",
      ...
    },
    ...
  ]
}
\`\`\`

### Get Batch Events Without Talents
Retrieves multiple events for a range of ages without talents.

**Endpoint:** \`POST /batch_without_talents\`

**Curl Example:**
\`\`\`bash
curl -X POST https://relife.deno.dev/batch_without_talents \\
  -H "Content-Type: application/json" \\
  -d '{"ages": [1, 2, 3, 4, 5]}'
\`\`\`

**Request Body:**
\`\`\`json
{
  "ages": [1, 2, 3, 4, 5]
}
\`\`\`

**Response:**
\`\`\`json
{
  "events": [
    {
      "id": 123,
      "age": 1,
      "content": "Event description",
      ...
    },
    ...
  ]
}
\`\`\`

### Get Batch Events Without Talents (Coze Format)
Similar to the above but with a different input format for Coze integration.

**Endpoint:** \`POST /batch_without_talents_coze\`

**Curl Example:**
\`\`\`bash
curl -X POST https://relife.deno.dev/batch_without_talents_coze \\
  -H "Content-Type: application/json" \\
  -d '{"ages": "[1, 2, 3, 4, 5]"}'
\`\`\`

**Request Body:**
\`\`\`json
{
  "ages": "[1, 2, 3, 4, 5]"
}
\`\`\`

**Response:**
\`\`\`json
{
  "events": [
    {
      "id": 123,
      "age": 1,
      "content": "Event description",
      ...
    },
    ...
  ]
}
\`\`\`

## Events and Choices

### Get Events with Choices
Retrieves events that offer choices for a specific age.

**Endpoint:** \`POST /events_be_choiced\`

**Curl Example:**
\`\`\`bash
curl -X POST https://relife.deno.dev/events_be_choiced \\
  -H "Content-Type: application/json" \\
  -d '{"age": 18}'
\`\`\`

**Request Body:**
\`\`\`json
{
  "age": 18
}
\`\`\`

**Response:**
\`\`\`
The events is [event content]. The branches are[{"choice":"Option 1","result":"Result 1"},{"choice":"Option 2","result":"Result 2"}], the uuid of this event is: abc-123
\`\`\`

### Get Results for a Choice
Retrieves the results for a specific event choice.

**Endpoint:** \`POST /result\`

**Curl Example:**
\`\`\`bash
curl -X POST https://relife.deno.dev/result \\
  -H "Content-Type: application/json" \\
  -d '{"uuid": "abc-123"}'
\`\`\`

**Request Body:**
\`\`\`json
{
  "uuid": "abc-123"
}
\`\`\`

**Response:**
\`\`\`
The results are [{"choice":"Option 1","result":"Result 1"},{"choice":"Option 2","result":"Result 2"}]
\`\`\`

## Talents

### Get Random Talents
Retrieves random talents of a specific type.

**Endpoint:** \`GET /talents?type=<type>\`

**Query Parameters:**
- \`type\` (optional) - The type of talents to retrieve (defaults to "normal")

**Curl Example:**
\`\`\`bash
curl -X GET https://relife.deno.dev/talents?type=normal
\`\`\`

**Response:**
\`\`\`json
{
  "talents": [
    {
      "id": 456,
      "name": "Talent name",
      "description": "Talent description",
      "type": "[\\\"normal\\\"]",
      ...
    },
    ...
  ]
}
\`\`\`

## Miscellaneous

### Get Documentation
Retrieves API documentation.

**Endpoint:** \`GET /docs\`

**Curl Example:**
\`\`\`bash
curl -X GET https://relife.deno.dev/docs
\`\`\`

**Response:**
\`\`\`
API documentation content
\`\`\`

### Get Privacy Policy
Retrieves the privacy policy.

**Endpoint:** \`GET /policy\`

**Curl Example:**
\`\`\`bash
curl -X GET https://relife.deno.dev/policy
\`\`\`

**Response:**
\`\`\`
# Privacy Policy for ChatGPT Bot with Arweave Query Functionality
...
\`\`\`

### Get Random Book
Retrieves a random book title.

**Endpoint:** \`GET /random_book\`

**Curl Example:**
\`\`\`bash
curl -X GET https://relife.deno.dev/random_book
\`\`\`

**Response:**
\`\`\`
辟邪剑谱
\`\`\`
(Response will be one of: "辟邪剑谱", "金刚经", "金瓶梅", "非欧几何")
`;

router
  .get("/docs", async (context) => {
    context.response.body = docs;
  })
  .get("/prompts", async (context) => {
    // TODO: get all prompts from supabase.
    const { data, error } = await supabase
      .from("sim_life_prompts")
      .select();
    
    if (error) {
      context.response.status = 500;
      context.response.body = { error: error.message };
      return;
    }
    
    context.response.body = data;
  })
  .get("/prompt/:id", async (context) => {
    // TODO: get the prompt from supabase.
    const id = context.params.id;
    
    if (!id) {
      context.response.status = 400;
      context.response.body = { error: "Missing prompt ID" };
      return;
    }
    
    const { data, error } = await supabase
      .from("sim_life_prompts")
      .select()
      .eq("id", id)
      .single();
    
    if (error) {
      context.response.status = error.code === "PGRST116" ? 404 : 500;
      context.response.body = { error: error.message };
      return;
    }
    
    context.response.body = data;
  })
  // A simple way for set password.
  .post("/prompt_set_by_password", async (context) => {
    let content = await context.request.body.text();
    content = JSON.parse(content);
    const id = content.id;
    const password = content.password;
    const new_prompt = content.prompt;
    const name = content.name;
    // const controllers = content.controllers;
    // check the password if = env password.
    if (password !== Deno.env.get("PASSWORD")) {
      context.response.status = 403;
      context.response.body = { error: "the password is not correct." };
      return;
    }
    // set the prompt, name, controllers to supabase, but all the params maybe be null
    
    // Create an update object with only the provided fields
    const updateData: any = {};
    if (new_prompt !== undefined) updateData.prompt = new_prompt;
    if (name !== undefined) updateData.name = name;
    // if (controllers !== undefined) updateData.controllers = controllers;
    
    const { data, error } = await supabase
      .from("sim_life_prompts")
      .update(updateData)
      .eq("id", id)
      .single();
    
    console.log("data:", data);

    if (error) {
      context.response.status = 500;
      context.response.body = { error: error.message };
      return;
    }
    context.response.body = { message: "the prompt is set successfully."};
  })
  // A standard way, for multiple controllers.
  .post("/prompt_set", async (context) => {
    let content = await context.request.body.text();
    content = JSON.parse(content);
    const id = content.id;
    const new_prompt = content.prompt;
    const signature = content.signature;
    let addr = content.addr;
    // step1. get the old prompt from supabase.
    const { data, error } = await supabase
      .from("sim_life_prompts")
      .select()
      .eq("id", id)
      .single();
    // {"id":5,"created_at":"2024-01-24T05:54:22.032169+00:00","prompt":"如果要进行内容上传，目前有两种选择：\n1. 上传 500 字以内内容，调用 Arweave 托管钱包进行免费上传；\n2. 上传 500 字以上内容，通过 dApp 进行上传，请进行你的选择。\nif choice=1, ask for the content, then call the arweave-query.deno.dev API with the uploadContent operation with content = content","name":"upload_to_arweave","controllers":["0x73c7448760517E3E6e416b2c130E3c6dB2026A1d"]}
    // step2. verify the addr in the controller list.
    let controllers = data.controllers;
    // downcase the addr and controllers.
    addr = addr.toLowerCase();
    controllers = controllers.map(controller => controller.toLowerCase());
    if (!controllers.includes(addr)) {
      context.response.status = 403;
      context.response.body = { error: "the addr is not in the controller list." };
      return;
    }
    // step3. verify the signature, the signatue is the sig for the md5(old prompt)
    const sig = await verify(addr, data.prompt, signature);
    if (!sig) {
      context.response.status = 403;
      context.response.body = { error: "the signature is not valid." };
      return;
    }
    // step4. set the new_prompt to supabase.
    const { new_data, new_error } = await supabase
      .from("sim_life_prompts")
      .update({ prompt: new_prompt })
      .eq("id", id)
      .single();
    if (error) {
      context.response.status = 500;
      context.response.body = { error: error.message };
      return;
    }
    context.response.body = { message: "the prompt is set successfully." + JSON.stringify(new_data) };
  })
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
    context.response.body =
      "The events is " +
      data[randomIndex].content +
      ". The branches are" +
      JSON.stringify(data[randomIndex].branches) +
      ", the uuid of this event is: " +
      data[randomIndex].uuid;
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
    context.response.body = "The results are " + JSON.stringify(results);
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
    const type = content.type ? content.type : ["normal"];
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

    const { data, error } = await supabase
      .from("sim_life_talents")
      .select()
      .eq("type", JSON.stringify(type));
    console.log("data:", data);
    // Assuming 'data' is an array of items
    const shuffledData = shuffleArray(data);

    // Get the first three items from the shuffled array
    const randomThreeItems = shuffledData.slice(0, 3);
    const results = { events: events, talents: randomThreeItems };
    context.response.body = results;
  })
  .post("/batch_without_talents_coze", async (context) => {
    let content = await context.request.body.text();
    content = JSON.parse(content);
    const ages = JSON.parse(content.ages);
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
    const results = { events: events };
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
    const results = { events: events };
    context.response.body = results;
  })
  .get("/random_book", async (context) => {
    const data = ["辟邪剑谱", "金刚经", "金瓶梅", "非欧几何"];
    const randomIndex = Math.floor(Math.random() * data.length);
    context.response.body = data[randomIndex];
  })
  .get("/talents", async (context) => {
    const queryParams = context.request.url.searchParams;
    let typeString = queryParams.get("type"); // 'id' will be a string or null if not present
    if (typeString === "冰与火之歌") {
      typeString = "ice_and_fire";
    }
    const type = typeString ? [typeString] : ["normal"];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data, error } = await supabase
      .from("sim_life_talents")
      .select()
      .eq("type", JSON.stringify(type));

    // Assuming 'data' is an array of items
    const shuffledData = shuffleArray(data);

    // Get the first three items from the shuffled array
    const randomThreeItems = shuffledData.slice(0, 3);
    context.response.body = { talents: randomThreeItems };
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
      .eq("id", id)
      .single();
    context.response.body = data.prompt;
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
