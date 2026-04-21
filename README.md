# cf-rendercv

cf-rendercv is an **HTTP API + MCP server** for generating resume PDFs from [RenderCV](https://github.com/rendercv/rendercv)-style YAML or JSON. PDFs are produced **inside Cloudflare Workers** (`workerd`): templates use **Jinja2-compatible** rendering via WASM, and layout is compiled to PDF with **Typst** WASM modules—no subprocesses and no Docker.

<p>
  <a href="https://cursor.com/en-US/install-mcp?name=rendercv&config=eyJ1cmwiOiJodHRwczovL3JlbmRlcmN2LWh0dHAueHZ6Zi53b3JrZXJzLmRldi9tY3AifQ%3D%3D">
    <img alt="Install to Cursor" src="https://img.shields.io/badge/Install_to_Cursor-1F6FEB?style=for-the-badge&logo=cursor&logoColor=white" />
  </a>
</p>

WebAssembly npm packages used in this repo (optimized for `workerd`):

- [`@jchoi2x/minijinja` (`^0.0.13`)](https://github.com/jchoi2x/minijinja) — Jinja2-style templating
- [`@jchoi2x/typst.ts` (`0.7.4`)](https://github.com/jchoi2x/typst.ts.git)
- [`@jchoi2x/typst-ts-renderer` (`0.7.5`)](https://github.com/jchoi2x/typst.ts.git)
- [`@jchoi2x/typst-ts-web-compiler` (`^0.7.11`)](https://github.com/jchoi2x/typst.ts.git)

## Projects

The apps are:

- `./apps/http`
  - Cloudflare Worker ([Hono](https://hono.dev))
  - MCPAgent (MCP tool/agent wiring)
  - hosts an MCP server that registers the `rendercv` tool, prompts, and JSON schema resources (see `./apps/http/src/durable/mcp/rendercv/`)
  - renders PDFs in the Durable Object using Minijinja + Typst WASM (same pipeline as HTTP)

## Architecture

- **Cloudflare Worker (`./apps/http`)**
  - Proxies HTTP and MCP traffic to a **Durable Object** (`RendercvDo`) that hosts the Hono app, MCP server, and rendering pipeline.
  - **Rendering**: validate RenderCV JSON/YAML → build Typst source (Jinja via Minijinja WASM) → compile PDF with Typst WASM.
  - Exposes `POST /api/v3/rendercv/render` (PDF) and `POST /api/v3/rendercv/typst` (Typst source). Request bodies accept RenderCV as JSON or YAML (see OpenAPI/Swagger).

## Rendering via HTTP and MCP

This Worker supports using RenderCV in two ways:

- **HTTP API**: `POST /api/v3/rendercv/render` returns a generated PDF (`application/pdf`). `POST /api/v3/rendercv/typst` returns Typst source (`application/text`). Bodies may be RenderCV JSON or YAML.
- **MCP tool**: the Worker registers an MCP tool named `rendercv` that accepts `{ content, format }` and returns a generated PDF URL (or base64 when `format: "base64"`).

The Worker also registers:

- a prompt named `rendercv`
- a resource at `rendercv://schema-and-prompt` containing the RenderCV JSON schema

## Deployment

The application is deployed at **[https://rendercv-http.xvzf.workers.dev/](https://rendercv-http.xvzf.workers.dev/)** (HTTP API, OpenAPI/Swagger UI, and MCP).

### OpenAPI (Swagger UI)

![OpenAPI / Swagger UI for the RenderCV HTTP API](docs/assets/swagger.gif)

### MCP Inspector

Run the Model Context Protocol Inspector and connect to the deployed MCP server:

```bash
npx @modelcontextprotocol/inspector@latest
```

![Connecting via MCP using npx @modelcontextprotocol/inspector](docs/assets/mcp.gif)

## Development

At a high level, you will:

### Prerequisites

- node >= 20
- bun >= 1.1.0

### Google OAuth (required for local MCP)

The HTTP/MCP server uses Google OAuth for authentication.

To run locally, you must set up a Google OAuth client application in the Google Cloud console: https://console.cloud.google.com/auth/clients/create
After creating the app, configure the resulting `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for the worker.

### Steps

1. Install dependencies at the repo root:

   ```bash
   bun install
   ```

2. Start the cloudflare worker locally from the repo root:

   ```bash
   bun run dev:http
   ```

3. Send a `POST` request to `http://localhost:<port>/api/v3/rendercv/render` with your RenderCV JSON or YAML body and save the `application/pdf` response. Use `POST /api/v3/rendercv/typst` for Typst source output.

For document structure and field semantics, see the official RenderCV user guide: [RenderCV — User guide](https://docs.rendercv.com/user_guide/).

To develop or deploy the Cloudflare Worker in `./apps/http`, refer to that app’s own configuration and scripts (e.g., `wrangler.jsonc`, `package.json`) for the precise commands.

## Testing

- **Unit tests** live next to source under `apps/**/src/**/__tests__/` (see `.cursor/rules/unit-testing.mdc`). From the repo root run `bun run test`, `bun run test:http`, or `bun run test:unit` as documented in `package.json`.

End-to-end checks that exercise the full Typst compilation path (for example a successful `POST /api/v3/rendercv/render` with a complete RenderCV document) require `bun run dev:http` or a deployed Worker.

## Debugging

Use the `@modelcontextprotocol/inspector` tool to debug the MCP server.

```bash
npx @modelcontextprotocol/inspector@latest
```

## Diagrams

<details>

<summary>Sequence Diagram (HTTP)</summary>

### Sequence (HTTP)

Rendering a resume via HTTP request

```mermaid
sequenceDiagram
  participant C as HTTP Client
  participant W as Worker (edge)
  box Blue Durable Object
    participant D as RendercvDo (Hono + MCP)
    participant J as Minijinja WASM (templates)
    participant Y as Typst WASM (compile)
  end

  C->>W: POST /api/v3/rendercv/render (JSON or YAML)
  W->>D: stub.fetch(request)
  D->>D: parse + validate RenderCV document
  D->>J: build Typst source from templates
  J-->>D: Typst document text
  D->>Y: compile PDF
  Y-->>D: PDF bytes
  D-->>W: application/pdf
  W-->>C: application/pdf
```

</details>

<details>

<summary>Sequence Diagram (MCP)</summary>

### Sequence (MCP)

MCP is the Model Context Protocol, a protocol for building agents that can interact with other agents and tools.

```mermaid
sequenceDiagram
  participant M as MCP Client (agent)
  participant D as RendercvDo (MCPAgent)
  participant T as MCP tool: rendercv
  participant Y as Typst WASM
  participant S as Object storage (S3-compatible)

  M->>D: MCP request (/mcp)
  D->>T: invoke rendercv (content, format)
  T->>D: renderCvTypstPdf (same pipeline as HTTP)
  D->>Y: compile PDF
  Y-->>D: PDF bytes

  rect rgba(33, 66, 99, 0.12)
    D->>S: upload PDF for public URL (when format is url)
    S-->>D: URL + path
  end

  T-->>D: tool result (PDF URL or base64)
  D-->>M: MCP response
```

</details>

<details>
<summary>Sequence Diagram (MCP Discovery)</summary>

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

</details>
