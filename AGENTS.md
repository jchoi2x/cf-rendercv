# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**cf-rendercv** is a pnpm monorepo with three packages:

| Package | Description |
|---|---|
| `apps/rendercv-app` | Node.js API (Hono + OpenAPI) that shells out to the `rendercv` Python CLI to generate PDFs |
| `apps/http` | Cloudflare Worker that proxies to the container-backed API + MCP server (optional for local dev) |
| `packages/contracts` | Shared Zod schemas and entity types |

### Running the development environment

- **API server**: `pnpm run dev:api` — starts `apps/rendercv-app` on port 8080 (tsx watch with hot reload)
- **Cloudflare Worker**: `pnpm run dev:http` — optional, requires Cloudflare credentials

### Key commands

| Task | Command |
|---|---|
| Install deps | `pnpm install` |
| Lint (ESLint) | `pnpm run lint` |
| Format (Biome) | `pnpm run format` |
| Build API | `pnpm run build:api` |
| Run API tests | `pnpm run test:api` |
| Run HTTP tests | `pnpm run test:http` |
| Dev API server | `pnpm run dev:api` |

### Non-obvious caveats

- **rendercv Python CLI**: The API shells out to the `rendercv` CLI. It must be installed via `pip install "rendercv[full]"` (not just `pip install rendercv`). The binary is installed to `~/.local/bin` which must be on `PATH`.
- **No test files yet**: As of this writing, neither `apps/http` nor `apps/rendercv-app` contain any test files. The vitest configs exist but `pnpm run test` will exit with code 1 due to "no test files found".
- **.env file**: `apps/rendercv-app` requires a `.env` file. Copy from `.env.example` (`PORT=8080`, `NODE_ENV=development`).
- **`apps/http` (Cloudflare Worker)** requires Cloudflare credentials and wrangler setup. It is not needed for core API development/testing.
- The `@modelcontextprotocol/ext-apps` postinstall script may warn about a missing `setup-bun.mjs` — this is harmless and can be ignored.
