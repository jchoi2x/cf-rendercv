# @suno-mcp/contracts

Shared zod-openapi schemas for suno-mcp and suno-api applications, providing validation, OpenAPI metadata, and type inference.

## Structure

The package is organized into two main categories:

### Entities (`@suno-mcp/contracts/entities`)

Entity schemas represent data models/resources. Each entity has:
- A zod schema with OpenAPI metadata
- An inferred TypeScript type

**Available Entities:**
- `AudioInfo` / `AudioInfoSchema` - Audio track information
- `Persona` / `PersonaSchema` - Persona/artist information
- `Credits` / `CreditsSchema` - User credits and quota information
- `AlignedLyrics` / `AlignedLyricsSchema` - Word-level lyric timing data
- `Error` / `ErrorSchema` - Error response format

### API (`@suno-mcp/contracts/api`)

API schemas are organized by HTTP endpoint, with separate files for request/response/query parameters.

**Available API Endpoints:**
- `session/` - Session management
  - `SessionRequestSchema` / `SessionRequest`
  - `SessionResponseSchema` / `SessionResponse`
- `generate/` - Basic audio generation
  - `GenerateRequestSchema` / `GenerateRequest`
- `custom-generate/` - Custom audio generation with explicit control
  - `CustomGenerateRequestSchema` / `CustomGenerateRequest`
- `concat/` - Concatenate clips
  - `ConcatRequestSchema` / `ConcatRequest`
- `extend-audio/` - Extend audio length
  - `ExtendAudioRequestSchema` / `ExtendAudioRequest`
- `generate-stems/` - Generate stem tracks
  - `GenerateStemsRequestSchema` / `GenerateStemsRequest`
- `generate-lyrics/` - Generate lyrics
  - `GenerateLyricsRequestSchema` / `GenerateLyricsRequest`
  - `GenerateLyricsResponseSchema` / `GenerateLyricsResponse`
- `get/` - Get audio by IDs
  - `GetQuerySchema` / `GetQuery`
- `clip/` - Get clip information
  - `ClipQuerySchema` / `ClipQuery`
- `get-aligned-lyrics/` - Get lyric timing
  - `GetAlignedLyricsQuerySchema` / `GetAlignedLyricsQuery`
- `persona/` - Get persona information
  - `PersonaQuerySchema` / `PersonaQuery`
- `chat-completions/` - OpenAI-compatible chat completions
  - `ChatCompletionsRequestSchema` / `ChatCompletionsRequest`
  - `ChatCompletionsResponseSchema` / `ChatCompletionsResponse`

## Usage

### Import Everything

```typescript
import * as contracts from '@suno-mcp/contracts';

// Access any schema or type
const schema = contracts.AudioInfoSchema;
type AudioInfo = contracts.AudioInfo;
```

### Import from Entities

```typescript
import { AudioInfo, AudioInfoSchema } from '@suno-mcp/contracts/entities';
import { Credits, CreditsSchema } from '@suno-mcp/contracts/entities';
```

### Import from API

```typescript
import { 
  SessionRequestSchema, 
  SessionRequest,
  SessionResponseSchema,
  SessionResponse
} from '@suno-mcp/contracts/api';

import { 
  GenerateRequestSchema,
  GenerateRequest 
} from '@suno-mcp/contracts/api';
```

### Validation

```typescript
import { GenerateRequestSchema } from '@suno-mcp/contracts/api';

const input = {
  prompt: "A heavy metal song about war",
  make_instrumental: false,
  wait_audio: false
};

// Validate input
const result = GenerateRequestSchema.safeParse(input);

if (result.success) {
  console.log('Valid input:', result.data);
} else {
  console.error('Validation errors:', result.error);
}
```

### Type Inference

```typescript
import type { AudioInfo } from '@suno-mcp/contracts/entities';
import type { GenerateRequest } from '@suno-mcp/contracts/api';

// Use inferred types
const audioInfo: AudioInfo = {
  id: 'abc123',
  title: 'My Song',
  created_at: '2024-01-01T00:00:00Z',
  model_name: 'chirp-v3-5',
  status: 'complete'
};

const request: GenerateRequest = {
  prompt: 'A song about...',
  make_instrumental: false
};
```

### OpenAPI Integration

All schemas include OpenAPI metadata for automatic documentation:

```typescript
import { createRoute } from '@hono/zod-openapi';
import { 
  SessionRequestSchema, 
  SessionResponseSchema 
} from '@suno-mcp/contracts/api';
import { ErrorSchema } from '@suno-mcp/contracts/entities';

const route = createRoute({
  method: 'post',
  path: '/api/session',
  request: {
    body: {
      content: {
        'application/json': {
          schema: SessionRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SessionResponseSchema,
        },
      },
      description: 'Session created successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Bad request',
    },
  },
});
```

## Development

The package exports source TypeScript files directly (not built code) to:
- Enable hot reload during development
- Include schemas in final bundles without separate compilation
- Share types directly between applications

Changes to this package will trigger automatic restarts in both `suno-mcp` and `suno-api` during local development.

## Features

- **Validation**: Runtime validation of API payloads
- **OpenAPI Metadata**: Automatic API documentation generation
- **Type Inference**: Full TypeScript types via `z.infer`
- **Hot Reload**: Changes trigger dev server restarts
- **Bundle Integration**: Source files included in builds automatically
