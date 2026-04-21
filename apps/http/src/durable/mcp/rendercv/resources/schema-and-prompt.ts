import { registerAppResource } from "@modelcontextprotocol/ext-apps/server";

import type { RenderCvMcpAgent } from "../../../types";
import { RENDERCV_SCHEMA_URI } from "../constants";

export const registerRenderscvSchemaAndPromptResource = (
  agent: RenderCvMcpAgent,
) => {
  return registerAppResource(
    agent.server,
    "rendercv-schema-and-prompt",
    RENDERCV_SCHEMA_URI,
    {
      description: "RenderCV schema and prompt",
      mimeType: "application/json",
    },
    async (uri: URL) => {
      const res = await fetch(
        "https://raw.githubusercontent.com/rendercv/rendercv/refs/heads/main/schema.json",
      );
      const schema = await res.json();
      const text = JSON.stringify(schema, null, 2);
      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: "application/json",
            text,
          },
        ],
      };
    },
  );
};
