# Cloud Agents Starter Skill (cf-rendercv)

Use this skill when you need to get productive quickly in this repo: install, authenticate, run the right service, and execute high-signal tests without guesswork.

## 1) Quick setup (run first)

From repo root:

1. Verify required tools:
   - `node -v` (Node 20+)
   - `pnpm -v` (pnpm 10+)
   - `docker --version`
2. Install dependencies:
   - `pnpm install`
3. Decide your target area before starting anything:
   - Worker + MCP + container orchestration: `apps/http`
   - Containerized RenderCV API: `apps/rendercv-app`
   - Shared schemas/contracts: `packages/contracts`

## 2) Auth and login workflow (Cloud-agent practical)

### Cloudflare auth (for `wrangler dev` and deploy workflows)

- Check login status:
  - `pnpm --filter @cf-rendercv/http exec wrangler whoami`
- If not authenticated:
  - `pnpm --filter @cf-rendercv/http exec wrangler login`

### OAuth for MCP flows

- MCP auth is routed through the OAuth provider in `apps/http`.
- For local MCP auth testing, set provider credentials in your local env (do not commit secrets).
- Root docs mention Google OAuth credentials; current worker wiring uses Auth0 provider paths by default. Validate against current code before changing auth assumptions.

### Local env files

- `apps/rendercv-app/.env.example` exists; copy as needed:
  - `cp apps/rendercv-app/.env.example apps/rendercv-app/.env`
- Keep any worker local secrets in non-committed local env files/config only.

## 3) Feature flags / mocks / test toggles

There is no dedicated feature-flag framework in this repo today. Use these practical toggles:

- MCP output mode behaves like a runtime toggle:
  - `format: "url"` -> uploads PDF via S3/R2 path
  - `format: "base64"` -> avoids S3 upload dependency for quick local validation
- For HTTP worker unit tests, use env stubs/mocks instead of real cloud infra:
  - `apps/http/src/__tests__/cloudflare-workers.stub.ts`
  - OAuth handler specs under `apps/http/src/durable/oauth/**/__tests__`
- For RenderCV API unit tests, external CLI/fs behavior is already mocked in route tests:
  - `apps/rendercv-app/src/routes/__tests__/generate.spec.ts`

## 4) Area playbooks (run + test)

## A. `apps/rendercv-app` (Node API in container image)

### Run

- Start only the API:
  - `pnpm run dev:api`
- Useful endpoints:
  - `GET http://localhost:8080/health`
  - `GET http://localhost:8080/swagger-ui`
  - `POST http://localhost:8080/api/v1/generate`

### High-signal tests

1. Unit tests:
   - `pnpm run test:api`
2. Manual API smoke test (binary PDF response):
   - `curl -X POST http://localhost:8080/api/v1/generate -H "Content-Type: application/json" --data-binary @rendercv.json --output /tmp/resume.pdf`
3. Confirm generated artifact:
   - `file /tmp/resume.pdf`

Notes:

- Unit tests mock RenderCV CLI execution; they do not require the actual CLI for most behavior checks.
- Manual PDF generation requires a valid RenderCV payload and working RenderCV runtime path.

## B. `apps/http` (Worker + MCP + container orchestration)

### Run

- Start worker dev server:
  - `pnpm run dev:http`

### High-signal tests

1. Unit tests:
   - `pnpm run test:http`
2. Worker-to-container proxy smoke test (HTTP):
   - `curl -X POST http://localhost:8787/api/v1/generate -H "Content-Type: application/json" --data-binary @rendercv.json --output /tmp/resume_worker.pdf`
3. MCP discovery/debug:
   - `npx @modelcontextprotocol/inspector@latest`
   - Verify tools/resources/prompts expose `rendercv` and `rendercv://schema-and-prompt`.

Notes:

- For local MCP tests that should avoid cloud object storage setup, prefer `format: "base64"`.
- If auth setup is incomplete, still run unit tests and HTTP proxy smoke tests that do not require a full OAuth round-trip.

## C. `packages/contracts` (shared schemas and types)

### Run/validate after schema changes

- There are no package-local test scripts currently; validate contracts via consumers:
  - `pnpm run test:api`
  - `pnpm run test:http`
  - `pnpm run build:api`
  - `pnpm run build:http`

### High-signal checks

- Confirm changed exports still resolve from:
  - `@cf-rendercv/contracts`
  - `@cf-rendercv/contracts/api`
  - `@cf-rendercv/contracts/entities`

## 5) Common Cloud-agent workflow patterns

- Prefer focused test commands over full monorepo runs during iteration.
- If `wrangler dev` is blocked by auth/cloud resource access, continue with unit tests first, then return to integration smoke tests.
- Keep one server per terminal session and avoid duplicate long-running dev commands.
- For API changes, test both:
  - contract/unit behavior (fast feedback)
  - end-to-end binary PDF response (real behavior)

## 6) How to update this skill (runbook capture)

When you discover a new reliable testing trick or setup fix:

1. Add it to the relevant area section above (Worker/API/Contracts), not a generic dump.
2. Include:
   - exact command(s)
   - required env/context
   - expected success signal
   - common failure mode + fastest workaround
3. Prefer replacing stale guidance over appending conflicting notes.
4. If auth/runtime behavior changes (Google/Auth0/provider wiring, S3/R2 flow), update both:
   - Auth and login workflow section
   - Feature flags/mocks/toggles section
