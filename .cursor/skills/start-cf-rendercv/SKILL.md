---
name: start-cf-rendercv
description: >-
  Boots and validates local development for the cf-rendercv monorepo (Worker +
  MCP + container-backed PDF API). Use when onboarding, “how do I run this
  repo”, “worker only” without the standalone render API, starting dev servers,
  local MCP setup, or first-time setup after clone.
---

# Start cf-rendercv (local dev)

## Prerequisites

- **Docker** running locally (Docker Desktop or compatible daemon). **`pnpm run dev:http` requires Docker to be up** so Wrangler can use **Cloudflare Containers** for this Worker.
- **Node.js** >= 20
- **pnpm** >= 10.30.x (repo pins a version in root `package.json`; use `corepack enable` if needed)
- **`rendercv` CLI** on the host only if you use **`pnpm run dev:api`** or other host-side RenderCV workflows ([RenderCV get started](https://docs.rendercv.com/user_guide/#__tabbed_1_1)). **Worker only** (`dev:http`) uses the CLI inside the container image instead.

## Auth for local MCP / Worker

Google OAuth creds are required for local MCP flows:

- Create an OAuth client in Google Cloud and set **`GOOGLE_CLIENT_ID`** and **`GOOGLE_CLIENT_SECRET`** where the Worker reads them (typically `apps/http` — e.g. `.dev.vars` for Wrangler).
- Without these, MCP-related local behavior may fail even if HTTP routes work.

## Boot sequence (repo root)

Run from the **repository root** (`cf-rendercv/`).

### Worker only (no standalone Node API)

Use this when you only need the **Cloudflare Worker** (Hono routes, MCP, Durable Objects, container orchestration). Do **not** start `pnpm run dev:api`.

1. **Install**

   ```bash
   pnpm install
   ```

2. **Worker** (Wrangler) — start Docker first, then:

   ```bash
   pnpm run dev:http
   ```

The Worker proxies PDF work to **Cloudflare Containers**, which runs the `rendercv`-app **inside the container image**, not the separate `@cf-rendercv/rendercv-app` dev process.

`pnpm run dev:api` is an optional convenience: it runs that same Node API **on your machine** as its own server. Skip it for “Worker only”.

### Worker + host-side render API (optional)

If you explicitly want the render app as a **second local process** (in addition to Wrangler), use a **second terminal**:

```bash
pnpm run dev:api
```

## Quick validation

- **HTTP generate** (Worker URL is usually Wrangler’s default, often `http://localhost:8787` — confirm in the `wrangler dev` output):

  ```bash
  curl -X POST http://localhost:8787/api/v1/generate \
    -H "Content-Type: application/json" \
    --data-binary @path/to/rendercv.json \
    --output resume.pdf
  ```

- **Unit tests** (scope to what you touched):
  - Worker: `pnpm run test:http`
  - Render app: `pnpm run test:api`

- **MCP debugging**: `npx @modelcontextprotocol/inspector@latest`

## Mental model (where to look)

| Piece                   | Path                 | Role                                              |
| ----------------------- | -------------------- | ------------------------------------------------- |
| Worker, MCP, DOs, proxy | `apps/http`          | Orchestration; does not run `rendercv` in workerd |
| PDF generation API      | `apps/rendercv-app`  | Runs `rendercv`; returns `application/pdf`        |
| Shared schemas          | `packages/contracts` | Zod/OpenAPI types                                 |

Longer context: root **`README.md`**, **`AGENTS.md`**, and **`CLAUDE.md`**.
