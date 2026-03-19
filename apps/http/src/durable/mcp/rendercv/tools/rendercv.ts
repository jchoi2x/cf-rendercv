import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RenderCvDocument } from "@cf-rendercv/contracts";
import { generateCV } from "../../../helpers/rendercv.js";

// check if the authenticated user has a cookie set
export const registerRenderCvTool = (server: McpServer) => {
  return registerAppTool(
    server,
    "rendercv",
    {
      title: "rendercv generate",
      description: "Generate a CV from a RenderCV YAML payload",
      inputSchema: {
        content: RenderCvDocument,
        format: z.enum(["base64", "url"]).default("url"),
      },
      _meta: {},
    },
    async ({ content, format = "url" }) => {
      const url = await generateCV({ content, format });

      return {
        content: [
          {
            type: "text",
            text: url,
          },
        ],
      };
    },
  );
};
