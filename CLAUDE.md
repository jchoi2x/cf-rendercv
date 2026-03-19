# Claude Code Guide (`cf-rendercv`)

This repo is an **HTTP API + MCP server** for generating resume PDFs using the [`rendercv`](https://github.com/rendercv/rendercv) CLI.

Because `rendercv` is not readily portable to Cloudflare `workerd`, PDF generation is done via a **Docker container** that runs a **Node.js API** which shells out to `rendercv`. A **Cloudflare Worker** proxies requests to the container-backed API.

---

## What to know first (high-signal)

- **Two ways to render PDFs**:
  - **HTTP**: `POST /api/v1/generate` → returns `application/pdf`
  - **MCP tool**: a tool named **`rendercv`** that accepts `{ content, format }` and returns **a PDF URL** (or **base64** when `format: "base64"`).
- **Cloudflare Worker owns orchestration**: it **boots the container on-demand** and proxies traffic to the Node app inside it.
- **Local MCP auth requires Google OAuth**:
  - You must configure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for local development of the HTTP/MCP server.

---

## Repo layout (mental model)

### `apps/http` — Cloudflare Worker + MCP server + container orchestration

- Cloudflare Worker built with **Hono**
- Hosts an **MCP server** (MCPAgent wiring)
- Durable Objects are used for the MCP/agent flow (see diagrams in the root README)
- Registers:
  - **Tool**: `rendercv`
  - **Prompt**: `rendercv`
  - **Resource**: `rendercv://schema-and-prompt` (RenderCV JSON schema)
- When the tool is invoked, the Worker routes the request to the container-backed PDF generator and (for URL responses) uploads the PDF to R2.

Key concepts from the root README:
- The MCP server registers the `rendercv` tool, a prompt, and a schema resource.
- Tool calls are routed to the container-backed generator.

### `apps/rendercv-app` — Node.js API inside the Docker container

- Node.js HTTP service (Hono + Swagger routes)
- Executes `rendercv` and returns the generated PDF
- Main endpoint:
  - **`POST /api/v1/generate`**
  - Request body: **RenderCV configuration as JSON** (a JSON equivalent of the RenderCV YAML file)
  - Response: `Content-Type: application/pdf` with PDF bytes

### `packages/contracts` — shared schemas/types (zod-openapi)

This package is described as shared **zod-openapi schemas** with:
- **Entities**: data models with Zod schema + OpenAPI metadata + inferred TS types
- **API**: request/response/query schemas grouped by endpoints

Notes:
- The `packages/contracts/README.md` describes a contracts package in a generic way (and mentions `@suno-mcp/contracts`). Treat it as: “this repo uses a shared contracts package pattern” unless the code indicates otherwise.

---

## Development prerequisites

From the root README:
- `docker`
- Node.js **>= 20**
- `pnpm` **>= 10.30.3**
- RenderCV installed locally (for local PDF generation workflows): follow RenderCV docs: [Get Started - RenderCV](https://docs.rendercv.com/user_guide/#__tabbed_1_1)

---

## Common commands (from READMEs)

From the root README:

- Install dependencies (repo root):

```bash
pnpm install
```

- Start Cloudflare worker + API locally (repo root):

```bash
pnpm run dev:http
```

- Start the Node.js API locally (repo root):

```bash
pnpm run dev:api
```

---

## How to validate changes (practical)

### If you changed the Worker (`apps/http`)

- Ensure the Worker still:
  - Boots the container when needed
  - Proxies `/api/v1/generate`
  - Registers MCP discovery objects (tool/prompt/resource)

### If you changed the Node API (`apps/rendercv-app`)

- Verify `POST /api/v1/generate` still:
  - Accepts JSON that is a direct translation of RenderCV YAML
  - Returns a PDF with `Content-Type: application/pdf`

Quick smoke test (from `apps/rendercv-app/README.md`):

```bash
curl -X POST http://localhost:8787/api/v1/generate \
  -H "Content-Type: application/json" \
  --data-binary @rendercv.json \
  --output resume.pdf
```

---

## MCP behavior (what Claude Code should preserve)

The Worker supports MCP discovery + tool calls:

- **tools/list** should include `rendercv` with an input schema compatible with RenderCV JSON
- **resources/list** should include `rendercv://schema-and-prompt`
- **resources/read(rendercv://schema-and-prompt)** should return the RenderCV JSON schema text
- **prompts/list** should include `rendercv`
- **prompts/get('rendercv')** should return prompt text that points to the schema resource

Tool call outcome:
- Input: `{ content, format }`
- Output:
  - `format: "url"` → returns a downloadable URL (PDF stored in R2)
  - `format: "base64"` → returns base64 PDF content

---

## Where to start when editing

- **Change rendering behavior**: start in `apps/rendercv-app` (the Node service that invokes `rendercv`).
- **Change routing/auth/MCP exposure**: start in `apps/http` (Worker + MCP server + Durable Objects + container proxy).
- **Change request/response shapes**: start in `packages/contracts` (schemas/types), then update both apps accordingly.

---

## Debugging MCP

The root README suggests using the MCP inspector:

```bash
npx @modelcontextprotocol/inspector@latest
```

---

## Implementation constraints / gotchas

- **`rendercv` cannot run inside `workerd`**: avoid trying to “port” the CLI into the Worker runtime; keep it in the container.
- **OAuth for local MCP**: local MCP usage expects Google OAuth client credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
- **PDF responses are binary**: preserve correct headers and avoid accidental JSON encoding.

---

## Contribution hygiene (repo-specific)

- Prefer small, focused changes that keep the boundary clear:
  - Worker = orchestration + proxy + MCP
  - Container app = invoke `rendercv` + return PDF
  - Contracts = schemas/types shared by both
- Don’t commit generated artifacts (e.g. coverage output) unless the repo explicitly wants them.

