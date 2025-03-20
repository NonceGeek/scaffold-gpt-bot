I'll update the README.md to include curl command examples for each API endpoint. This will make it easier for users to test and understand how to interact with the API.

```markdown:deno/README.md
# ReLife API Documentation

Base URL: `https://relife.deno.dev`

## Table of Contents
- [Prompt Management](#prompt-management)
- [Life Simulation](#life-simulation)
- [Events and Choices](#events-and-choices)
- [Talents](#talents)
- [Miscellaneous](#miscellaneous)

## Prompt Management

### Get All Prompts
Retrieves all prompts from the database.

**Endpoint:** `GET /prompts`

**Curl Example:**
```bash
curl -X GET https://relife.deno.dev/prompts
```

**Response:**
```json
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
```

### Get Prompt by ID
Retrieves a specific prompt by its ID.

**Endpoint:** `GET /prompt/:id`

**URL Parameters:**
- `id` - The ID of the prompt to retrieve

**Curl Example:**
```bash
curl -X GET https://relife.deno.dev/prompt/5
```

**Response:**
```json
{
  "id": 5,
  "created_at": "2024-01-24T05:54:22.032169+00:00",
  "prompt": "...",
  "name": "prompt_name",
  "controllers": ["0x..."]
}
```

### Get Prompt by ID (Query Parameter)
Alternative way to retrieve a prompt using a query parameter.

**Endpoint:** `GET /prompt?id=<id>`

**Query Parameters:**
- `id` - The ID of the prompt to retrieve

**Curl Example:**
```bash
curl -X GET https://relife.deno.dev/prompt?id=5
```

**Response:**
```
Prompt text content
```

### Update Prompt with Password
Updates a prompt using password authentication.

**Endpoint:** `POST /prompt_set_by_password`

**Curl Example:**
```bash
curl -X POST https://relife.deno.dev/prompt_set_by_password \
  -H "Content-Type: application/json" \
  -d '{"id": 5, "password": "your_password", "prompt": "New prompt content", "name": "New prompt name"}'
```

**Request Body:**
```json
{
  "id": 5,
  "password": "your_password",
  "prompt": "New prompt content",
  "name": "New prompt name"
}
```

**Response:**
```json
{
  "message": "the prompt is set successfully."
}
```

### Update Prompt with Signature
Updates a prompt using cryptographic signature authentication.

**Endpoint:** `POST /prompt_set`

**Curl Example:**
```bash
curl -X POST https://relife.deno.dev/prompt_set \
  -H "Content-Type: application/json" \
  -d '{"id": 5, "prompt": "New prompt content", "signature": "0x...", "addr": "0x..."}'
```

**Request Body:**
```json
{
  "id": 5,
  "prompt": "New prompt content",
  "signature": "0x...",
  "addr": "0x..."
}
```

**Response:**
```json
{
  "message": "the prompt is set successfully.[data]"
}
```

## Life Simulation

### Begin a New Life
Retrieves the initial prompt to start a new life simulation.

**Endpoint:** `GET /begin_a_new_life`

**Curl Example:**
```bash
curl -X GET https://relife.deno.dev/begin_a_new_life
```

**Response:**
```
Initial prompt text content
```

### Get Event by Age
Retrieves a random event for a specific age.

**Endpoint:** `POST /`

**Curl Example:**
```bash
curl -X POST https://relife.deno.dev/ \
  -H "Content-Type: application/json" \
  -d '{"age": 18}'
```

**Request Body:**
```json
{
  "age": 18
}
```

**Response:**
```json
{
  "id": 123,
  "age": 18,
  "content": "Event description",
  ...
}
```

### Get Batch Events
Retrieves multiple events for a range of ages and optional talents.

**Endpoint:** `POST /batch`

**Curl Example:**
```bash
curl -X POST https://relife.deno.dev/batch \
  -H "Content-Type: application/json" \
  -d '{"ages": [1, 2, 3, 4, 5], "type": ["normal"]}'
```

**Request Body:**
```json
{
  "ages": [1, 2, 3, 4, 5],
  "type": ["normal"]
}
```

**Response:**
```json
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
```

### Get Batch Events Without Talents
Retrieves multiple events for a range of ages without talents.

**Endpoint:** `POST /batch_without_talents`

**Curl Example:**
```bash
curl -X POST https://relife.deno.dev/batch_without_talents \
  -H "Content-Type: application/json" \
  -d '{"ages": [1, 2, 3, 4, 5]}'
```

**Request Body:**
```json
{
  "ages": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
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
```

### Get Batch Events Without Talents (Coze Format)
Similar to the above but with a different input format for Coze integration.

**Endpoint:** `POST /batch_without_talents_coze`

**Curl Example:**
```bash
curl -X POST https://relife.deno.dev/batch_without_talents_coze \
  -H "Content-Type: application/json" \
  -d '{"ages": "[1, 2, 3, 4, 5]"}'
```

**Request Body:**
```json
{
  "ages": "[1, 2, 3, 4, 5]"
}
```

**Response:**
```json
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
```

## Events and Choices

### Get Events with Choices
Retrieves events that offer choices for a specific age.

**Endpoint:** `POST /events_be_choiced`

**Curl Example:**
```bash
curl -X POST https://relife.deno.dev/events_be_choiced \
  -H "Content-Type: application/json" \
  -d '{"age": 18}'
```

**Request Body:**
```json
{
  "age": 18
}
```

**Response:**
```
The events is [event content]. The branches are[{"choice":"Option 1","result":"Result 1"},{"choice":"Option 2","result":"Result 2"}], the uuid of this event is: abc-123
```

### Get Results for a Choice
Retrieves the results for a specific event choice.

**Endpoint:** `POST /result`

**Curl Example:**
```bash
curl -X POST https://relife.deno.dev/result \
  -H "Content-Type: application/json" \
  -d '{"uuid": "abc-123"}'
```

**Request Body:**
```json
{
  "uuid": "abc-123"
}
```

**Response:**
```
The results are [{"choice":"Option 1","result":"Result 1"},{"choice":"Option 2","result":"Result 2"}]
```

## Talents

### Get Random Talents
Retrieves random talents of a specific type.

**Endpoint:** `GET /talents?type=<type>`

**Query Parameters:**
- `type` (optional) - The type of talents to retrieve (defaults to "normal")

**Curl Example:**
```bash
curl -X GET https://relife.deno.dev/talents?type=normal
```

**Response:**
```json
{
  "talents": [
    {
      "id": 456,
      "name": "Talent name",
      "description": "Talent description",
      "type": "[\"normal\"]",
      ...
    },
    ...
  ]
}
```

## Miscellaneous

### Get Documentation
Retrieves API documentation.

**Endpoint:** `GET /docs`

**Curl Example:**
```bash
curl -X GET https://relife.deno.dev/docs
```

**Response:**
```
docs
```

### Get Privacy Policy
Retrieves the privacy policy.

**Endpoint:** `GET /policy`

**Curl Example:**
```bash
curl -X GET https://relife.deno.dev/policy
```

**Response:**
```
# Privacy Policy for ChatGPT Bot with Arweave Query Functionality
...
```

### Get Random Book
Retrieves a random book title.

**Endpoint:** `GET /random_book`

**Curl Example:**
```bash
curl -X GET https://relife.deno.dev/random_book
```

**Response:**
```
辟邪剑谱
```
(Response will be one of: "辟邪剑谱", "金刚经", "金瓶梅", "非欧几何")
```

I've added curl command examples for each API endpoint, making it easier for users to test the API directly from the command line. Each curl command includes the appropriate HTTP method, endpoint URL, headers (when needed), and request body (for POST requests).