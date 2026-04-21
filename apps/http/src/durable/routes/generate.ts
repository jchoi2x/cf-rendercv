import { createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  GenerateSuccessSchema,
  RenderCvDocument,
} from "@cf-rendercv/contracts";

export const generateRoute = createRoute({
  method: "post",
  path: "/api/v3/rendercv/render",
  tags: ["Generate"],
  summary: "Validate and generate CV from RenderCV YAML payload",
  description:
    "Accepts a RenderCV document as either JSON (validated directly) or YAML (parsed into JSON, then validated). Validates against the RenderCV schema and generates a PDF using the rendercv CLI.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RenderCvDocument,
        },
        "application/yaml": {
          schema: z.string().describe("RenderCV YAML document"),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/pdf": {
          schema: GenerateSuccessSchema,
        },
      },
      description: "Payload is valid RenderCV YAML",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Bad request - validation error",
    },
  },
});
