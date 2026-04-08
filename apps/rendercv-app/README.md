## RenderCV Resume Generator (Node.js)

This app is a small Node.js HTTP service that exposes a single API endpoint to generate a PDF resume using [RenderCV](https://github.com/rendercv/rendercv)-compatible data.

- **Endpoint**: `POST /api/v1/generate`
- **Description**: Accepts a RenderCV YAML configuration (sent as JSON) and returns a generated resume as a PDF.
- **Response Content-Type**: `application/pdf`

### API

- **URL**: `POST /api/v1/generate`
- **Request Body**: JSON object representing the RenderCV YAML file. It should be a direct JSON translation of the YAML configuration you would normally pass to RenderCV.
  - **Content-Type**: `application/json`
  - **Example**:

            ```json

        `    {

    "cv": {
    "name": "Jane Doe",
    "location": "San Francisco, CA",
    "email": "jane.doe@example.com",
    "phone": "+1 555 123 4567",
    "sections": [
    {
    "type": "experience",
    "items": [
    {
    "title": "Senior Software Engineer",
    "company": "Acme Corp",
    "location": "San Francisco, CA",
    "start": "2020-01",
    "end": "Present",
    "highlights": [
    "Led development of a high-traffic Node.js API.",
    "Improved resume generation pipeline performance by 40%."
    ]
    }
    ]
    }
    ]
    }
    }`

        ```

        ```

- **Successful Response**:
  - **Status**: `200 OK`
  - **Headers**:
    - `Content-Type: application/pdf`
    - `Content-Disposition: inline; filename="resume.pdf"` (exact value may vary)
  - **Body**: Binary PDF data for the generated resume.

- **Error Responses** (examples, actual shape may vary depending on implementation):
  - `400 Bad Request`: Invalid or missing JSON, or invalid RenderCV structure.
  - `500 Internal Server Error`: Unexpected error during resume generation.

### Example Usage

#### `curl`

```bash
curl -X POST http://localhost:8787/api/v1/generate \
  -H "Content-Type: application/json" \
  --data-binary @rendercv.json \
  --output resume.pdf
```

Where `rendercv.json` is your RenderCV YAML converted to JSON.

#### Node.js (fetch)

```javascript
import fs from 'node:fs/promises';

const payload = {
  cv: {
    name: 'Jane Doe',
    email: 'jane.doe@example.com'
    // ...rest of your RenderCV config
  }
};

const res = await fetch('http://localhost:8787/api/v1/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});

if (!res.ok) {
  throw new Error(`Failed to generate resume: ${res.status} ${res.statusText}`);
}

const buffer = Buffer.from(await res.arrayBuffer());
await fs.writeFile('resume.pdf', buffer);
```

### Local Development

1. Install dependencies at the repo root:

   ```bash
   bun install
   ```

2. From the repo root, start the Node.js API:

   ```bash
   bun run dev:api
   ```

3. Ensure **RenderCV** is installed on your local machine; this service shells out to RenderCV to generate the PDF. Follow the official installation instructions here: [Get Started - RenderCV](https://docs.rendercv.com/user_guide/#__tabbed_1_1).

4. Send requests to `POST /api/v1/generate` on the local server URL (for example, `http://localhost:8787/api/v1/generate`).
