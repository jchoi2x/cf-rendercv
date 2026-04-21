---
name: start-cf-rendercv
description: >-
  Two-step local dev for cf-rendercv: (1) start or reuse Worker + MCP
  Inspector, (2) verify MCP via @Browser (Streamable HTTP to /mcp, OAuth).
  Use for onboarding, dev:http, Inspector, local MCP setup.
---

# Start cf-rendercv (local dev)

## Prerequisites

- **Docker** running locally (Docker Desktop or compatible daemon). **`bun run dev:http` requires Docker to be up** so Wrangler can use **Cloudflare Containers** for this Worker.
- **Node.js** >= 20
- **Bun** >= 1.1.0
- **`rendercv` CLI** on the host only if you run host-side RenderCV workflows directly ([RenderCV get started](https://docs.rendercv.com/user_guide/#__tabbed_1_1)). **Worker-only** development (`dev:http`) uses the CLI inside the container image instead.

## Auth for local MCP / Worker

Google OAuth creds are required for local MCP flows:

- Create an OAuth client in Google Cloud and set **`GOOGLE_CLIENT_ID`** and **`GOOGLE_CLIENT_SECRET`** where the Worker reads them (typically `apps/http` — e.g. `.dev.vars` for Wrangler).
- Without these, MCP-related local behavior may fail even if HTTP routes work.

## Boot sequence (repo root)

Run from the **repository root** (`cf-rendercv/`).

### Worker (api in docker container)

Use this when you need the **Cloudflare Worker** (Hono routes, MCP, Durable Objects, container orchestration).

1. **Install**

   ```bash
   bun install
   ```

2. **Worker** (Wrangler) — start Docker first, then:

   ```bash
   bun run dev:http
   ```

The Worker proxies PDF work to **Cloudflare Containers**, which runs the render API inside the container image.

## Quick validation

- **HTTP generate** (Worker URL is usually Wrangler’s default, often `http://localhost:8787` — confirm in the `wrangler dev` output):

  ```bash
  curl -X POST http://localhost:8787/api/v1/generate \
    -H "Content-Type: application/json" \
    --data-binary @path/to/rendercv.json \
    --output resume.pdf
  ```

- **Unit tests** (scope to what you touched):
  - Worker: `bun run test:http`

- **MCP debugging (manual launch)**: `npx @modelcontextprotocol/inspector@latest`

### MCP Inspector auth smoke test (required for MCP login flow)

This skill is basically two things:

1. **Start (or reuse) CF Worker + MCP Inspector** — get `pnpm run dev:http` and the Inspector proxy listening, with a printed token URL for the UI.
2. **Check connectable in browser** — use **@Browser** (Cursor’s Browser tool) to open MCP Inspector, set **`http://localhost:8787/mcp`**, **Connect**, and complete OAuth until Inspector shows **connected**. Do **not** substitute a wall of copy-paste steps for the user unless **@Browser** is unavailable in this session.

---

#### 1. Start (or reuse) Worker + Inspector

- **Prefer existing Cursor terminals** — do not kill a healthy Worker or Inspector that is already running.
  - Inspect Cursor terminal sessions (`command` / `last_command`).
  - **Worker:** if `pnpm run dev:http` is already running, **reuse it** after confirming:

    ```bash
    curl -i http://localhost:8787/health
    ```

    HTTP 200 + healthy payload → skip starting a new Worker.

  - **Inspector:** if `npx @modelcontextprotocol/inspector@latest` is already running (with or without `MCP_AUTO_OPEN_ENABLED=false`), **reuse it**. Use the printed URL `http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=...`. If `6274`/`6277` listen and that URL works, skip a second Inspector.

- **Worker — only if needed**
  - Preflight `8787`: `lsof -nP -iTCP:8787 -sTCP:LISTEN` — if a **wrong** process holds the port, `kill -9 <PID>` and re-check.
  - In **its own** terminal: `bun run dev:http` — wait for e.g. `Ready on http://localhost:8787`.

- **Health** (always before browser):

  ```bash
  curl -i http://localhost:8787/health
  ```

  Expect HTTP 200 (e.g. `{"ok":true}`).

- **Inspector — only if needed**
  - Preflight `6274` / `6277`: `lsof -nP -iTCP:6274 -sTCP:LISTEN` and same for `6277`. Free **stale** listeners only when starting a **new** Inspector; leave ports alone if reusing a running Inspector.
  - In **its own** terminal (separate from Worker):

    ```bash
    MCP_AUTO_OPEN_ENABLED=false npx @modelcontextprotocol/inspector@latest
    ```

  - Copy the printed token URL from the terminal output. Step 2 uses **@Browser** with that URL (do **not** use `open` / host default browser as the primary path).

---

#### 2. Check connectable via Inspector in browser

**Agents — use @Browser (required):**

- Invoke **@Browser** and navigate to the full tokenized Inspector URL from the terminal (`http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=...`).
- Drive the UI from there: **Connect**, then on the **approval** page (`/authorize?…`, “MCP Inspector is requesting access”) **refresh @Browser once** (reload the page) **before** clicking **Approve** so CSRF/session cookies are in sync—then **Approve**, Auth0 login if needed. Keep the session on the Inspector/browser tab (not `about:blank`).
- **Do not** dump long manual “paste this in Simple Browser” instructions as the default outcome—actually run the flow via **@Browser** unless the environment truly has no Browser capability (then say so in one line and offer Simple Browser as fallback).

**Inspector UI (every run):**

- **Transport Type:** Streamable HTTP
- **URL:** `http://localhost:8787/mcp`
- **Connection Type:** Direct
- Click **Connect**

**If @Browser fails** (stale refs, **`POST /authorize` 400** / CSRF / `__Host-CSRF_TOKEN`): retry once with a fresh snapshot; then **Simple Browser** (*Command Palette* → **Simple Browser: Show**) with the same URL; last resort external browser, documented in the summary.

**Humans (no agent):** **Simple Browser** → paste token URL → same Inspector fields as above—avoid `open` / default OS browser for this skill.

**OAuth:**

- After redirect to the **approval** page: **refresh @Browser** (reload) **once**, then click **Approve** → form **`POST /authorize`** → expect **HTTP 302** to Auth0 (or toward `/auth/callback`). (Same refresh-then-approve rule in **Simple Browser** if not using @Browser.)
- Auth0 then shows login **or** redirects to `http://localhost:8787/auth/callback` if already logged in.
- If login is required: `testman1@mailinator.com` / `Test_123!`
- **Pass:** Inspector shows an **active/authenticated** connection to `http://localhost:8787/mcp`, no auth loop.

**Validation checklist:**

- Reused Worker/Inspector when healthy; otherwise cleared ports only as needed and started fresh processes.
- `GET /health` OK before browser test.
- **@Browser** was used to exercise Inspector + OAuth when an agent ran this skill; Simple Browser / external browser only if **@Browser** was unavailable or failed (state which).
- `POST /authorize` returned **302** (not 400/500) and OAuth completed.

## Mental model (where to look)

| Piece                   | Path                 | Role                                              |
| ----------------------- | -------------------- | ------------------------------------------------- |
| Worker, MCP, DOs, proxy | `apps/http`          | Orchestration; does not run `rendercv` in workerd |
| PDF generation API      | Cloudflare Container | Runs `rendercv`; returns `application/pdf`        |
| Shared schemas          | `packages/contracts` | Zod/OpenAPI types                                 |

Longer context: root **`README.md`**, **`AGENTS.md`**, and **`CLAUDE.md`**.
