# AGENTS.md

Guidance for coding agents working in this repository.

## Project overview

This monorepo provides an HTTP API and MCP server for generating resume PDFs with the `rendercv` CLI.

- `apps/http`: Cloudflare Worker (Hono) + MCP server + container orchestration/proxy
- `packages/contracts`: shared Zod/OpenAPI schemas and entities

Keep the architectural boundary clear:

- Worker handles orchestration, auth, MCP registration, and proxying.
- Render app handles PDF generation and returns binary `application/pdf`.
- Contracts package owns shared request/response/entity schemas.

## Prerequisites

- Node.js >= 20
- Bun >= 1.1.0
- Docker
- Local `rendercv` installation for local PDF generation flows

## Setup and common commands

From repo root:

- Install deps: `bun install`
- Start Worker/MCP stack: `bun run dev:http`
- Build all: `bun run build`
- Lint all: `bun run lint`
- Unit tests (all): `bun run test`
- Worker tests only: `bun run test:http`
- Worker integration tests (workerd / Vitest pool): `bun run test:integration`

## File structure conventions

### Integration tests (repo root)

- **Directory**: `./integration/` — Worker integration specs for this monorepo.
- **Config**: `vitest.integration.config.ts` at the repo root (Wrangler project: `apps/http/wrangler.jsonc`).
- **Naming**: `*.integration.spec.ts` (e.g. `integration/worker/http.worker.integration.spec.ts`).
- **Runtime**: Tests execute in the Workers runtime via `@cloudflare/vitest-pool-workers`; use `exports.default.fetch()` from `cloudflare:workers` for integration-style requests (see Cloudflare Vitest integration docs).

### Apps (`apps/**/src`)

- App entrypoint wiring belongs in `src/index.ts`.
- Route modules belong in `src/routes/*`.
- Route modules should export:
  - `const route`
  - `const handler`
  - `export const <name>Route = { route, handler }`
- Re-export route modules through `src/routes/index.ts`.
- Shared app helpers belong in `src/helpers/*`.
- App-local types (for example `Env`) belong in `src/types.ts`.
- Prefer `@/*` imports for app-internal imports where configured.

### Contracts (`packages/contracts/src`)

- `src/api/*` for API schemas/types.
- `src/entities/*` for domain entities.
- Re-export package surface from `src/index.ts`.

## Implementation guardrails

- Do not move endpoint logic into app entrypoints.
- Do not put domain/entity definitions in route files.
- Do not try to run `rendercv` in Cloudflare `workerd`; keep CLI execution in container-backed Node app.
- Preserve binary PDF behavior (`Content-Type: application/pdf`) for generate endpoints.
- Keep changes focused and avoid unrelated refactors.

## MCP behavior to preserve

- Tool list includes `rendercv`.
- Resources include `rendercv://schema-and-prompt`.
- Prompt list includes `rendercv`.
- Tool supports `{ content, format }`:
  - `format: "url"` returns downloadable URL.
  - `format: "base64"` returns base64 content.

## Testing guidance

Run targeted checks for touched areas:

- Worker changes: `bun run test:http` and, when exercising full Worker routing/bindings: `bun run test:integration`
- Shared contracts changes: run affected app tests, typically `test:http` plus integration checks as needed

When changing request/response behavior for `/api/v1/generate`, perform a smoke check:

`curl -X POST http://localhost:8787/api/v1/generate -H "Content-Type: application/json" --data-binary @rendercv.json --output resume.pdf`

## Local auth note

For local Worker + MCP development, configure:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Cursor Cloud specific instructions

- Prefer fast, scoped validation over full-suite runs.
- Do not run unrelated services/tests unless the change requires them.
- For docs-only changes, verify formatting/readability and skip runtime tests.
- If a task touches UI in other repos, provide manual-test artifacts; this repo is primarily API/MCP and usually validated via terminal tests.
