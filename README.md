# cf-rendercv

cf-rendercv is an **HTTP API + MCP server** for generating resume PDFs using the `rendercv` **CLI**.

`rendercv` is a CLI tool and is not readily portable to run inside Cloudflare `workerd`. To work around this, the repo uses **Cloudflare Containers** to run a **Docker container** that has the `rendercv` CLI available. A Node.js server wraps the CLI and exposes an HTTP endpoint; the Cloudflare Worker proxies requests to it.

## Projects

The apps are:

- `./apps/http`
  - Cloudflare Worker (Hono)
  - MCPAgent (MCP tool/agent wiring)
  - hosts an MCP server that registers the `rendercv` tool, plus a prompt and a JSON schema resource
  - handles MCP tool calls by routing them to the container-backed PDF generator
  - Cloudflare Container (starts/manages the Docker container lifecycle)
- `./apps/rendercv-app` (lives inside the Docker container)
  - Node.js HTTP server
  - Hono + Swagger routes
  - Executes `rendercv` to generate the returned `application/pdf`

## Architecture

- **Cloudflare Worker (`./apps/http`)**
  - Boots a Docker container when needed.
  - Proxies incoming HTTP traffic to the Node.js app running inside the container.

- **Node.js Resume Generator (`./apps/rendercv-app`)**
  - **Endpoint**: `POST /api/v1/generate`
  - **Request Body**: RenderCV configuration provided as JSON (a JSON equivalent of the RenderCV YAML file).
  - **Response**:
    - `Content-Type: application/pdf`
    - Body is the generated resume PDF.

## Diagrams

### Sequence (HTTP)

Rendering a resume via HTTP request

```mermaid
sequenceDiagram
  participant C as HTTP Client
  participant W as Cloudflare Worker (Hono)
  box Blue Durable Objects
    participant D as RendercvDo (MCPAgent durable object)
    participant K as DockerRendercvApp (Container)
  end
  box Purple Container
    participant A as rendercv-app (Node.js + Hono)
    participant R as rendercv CLI
  end


  C->>W: POST /api/v1/generate (RenderCV JSON)
  W->>D: stub.fetch(request)
  D->>K: callContainerService(path, method, body)
  K->>A: HTTP POST /api/v1/generate
  A->>R: rendercv (generate PDF)
  R-->>A: PDF binary
  A-->>K: application/pdf response
  K-->>D: proxy response
  D-->>W: proxy response
  W-->>C: application/pdf
```

### Sequence (MCP)

MCP is the Model Context Protocol, a protocol for building agents that can interact with other agents and tools.

```mermaid
sequenceDiagram
  participant M as MCP Client (agent)
  participant R2 as R2 Bucket
  box Blue Durable Objects
    participant D as RendercvDo (MCPAgent durable object)
    participant T as MCP tool: rendercv
    participant K as DockerRendercvApp (Container)
  end
  box Purple Container
    participant A as rendercv-app (Node.js + Hono)
    participant R as rendercv CLI
  end


  M->>D: MCP request to RendercvDo (/mcp)
  D->>T: invoke tool rendercv (content, format)
  T->>K: callContainerService('/api/v1/generate', body)
  K->>A: HTTP POST /api/v1/generate
  A->>R: rendercv (generate PDF)
  R-->>A: PDF binary
  A-->>K: application/pdf

  rect rgba(33, 66, 99, 0.12)
    K-->>T: proxy response (PDF)
    T-->>R2: upload to R2 bucket
  end

  T-->>D: tool result (PDF URL)
  D-->>M: MCP response (PDF URL)
```

### MCP Discovery (tools/resources/prompts)

Discovery is the process of the MCP client (agent) discovering the tools, resources, and prompts available on the MCP server.

```mermaid
sequenceDiagram
  participant M as MCP Client (agent)
  participant D as RendercvDo (MCPAgent durable object)
  participant G as GitHub: rendercv/schema.json

  M->>D: MCP initialize

  M->>D: tools/list
  D-->>M: tools include rendercv (input schema: RenderCV JSON)

  M->>D: resources/list
  D-->>M: resources include rendercv://schema-and-prompt

  M->>D: resources/read(rendercv://schema-and-prompt)
  D->>G: fetch schema.json
  G-->>D: schema.json (raw JSON)
  D->>D: parse JSON + JSON.stringify(schema, 2)
  D-->>M: resource text (application/json) containing the RenderCV schema

  M->>D: prompts/list
  D-->>M: prompts include rendercv

  M->>D: prompts/get('rendercv')
  D-->>M: prompt text with examples/instructions to build content (see rendercv://schema-and-prompt for the full schema)
  Note over M,D: Using the tool list + prompt examples + the schema resource, <br/>the LLM knows how to build a valid `content` payload, then calls the MCP tool when the user asks to generate a resume.
  M->>D: tool call rendercv { content, format: "url" }
```

### Rendering via HTTP and MCP

This Worker supports using RenderCV in two ways:

- **HTTP API**: `POST /api/v1/generate` (RenderCV configuration as JSON) returns a generated PDF.
- **MCP tool**: the Worker registers an MCP tool named `rendercv` that accepts `{ content, format }` and returns a generated PDF URL (or base64 when `format: "base64"`).

The Worker also registers:

- a prompt named `rendercv`
- a resource at `rendercv://schema-and-prompt` containing the RenderCV JSON schema

See `./apps/rendercv-app/README.md` for detailed API docs and examples.

## Development

At a high level, you will:

### Prerequisites

- `docker`
- node >= 20
- pnpm >= 10.30.3

### Steps

1. Install dependencies at the repo root:

   ```bash
   pnpm install
   ```

2. Start the cloudflare worker and api locally from the repo root:

   ```bash
   pnpm run dev:http
   ```

3. Start the Node.js API locally from the repo root:

   ```bash
   pnpm run dev:api
   ```

4. Send a `POST` request to `http://localhost:<port>/api/v1/generate` with your RenderCV JSON payload and save the `application/pdf` response.

You must have **rendercv** installed on your local machine for PDF generation to work. See the official RenderCV “Get Started” guide for installation instructions: [Get Started - RenderCV](https://docs.rendercv.com/user_guide/#__tabbed_1_1).

To develop or deploy the Cloudflare Worker in `./apps/http`, refer to that app’s own configuration and scripts (e.g., `wrangler.toml`, `package.json`) for the precise commands.

## Debugging

Use the `@modelcontextprotocol/inspector` tool to debug the MCP server.

```bash
npx @modelcontextprotocol/inspector@latest
```
