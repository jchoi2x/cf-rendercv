import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { RenderCvDocument } from "@cf-rendercv/contracts";

import { generateCV } from "../../../helpers/rendercv";
import type { AuthContext } from "../../../oauth/auth0";
import { RENDERCV_APP_UI_URI } from "../constants";

export const registerRenderCvTool = (
  server: McpServer,
  _props?: AuthContext,
) => {
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
      _meta: { ui: { resourceUri: RENDERCV_APP_UI_URI } },
    },
    async ({ content, format = "url" }) => {
      const id = _props?.claims?.sub
        ? _props.claims.sub.split("|").join("_")
        : "anonymous";

      if (format === "url") {
        const pdfUrl = await generateCV({ content, format, prefix: id });
        return {
          content: [
            {
              type: "text",
              text: pdfUrl,
            },
          ],
          structuredContent: {
            format: "url" as const,
            pdfUrl,
          },
        };
      }

      const pdfBase64 = await generateCV({
        content,
        format: "base64",
        prefix: id,
      });
      return {
        content: [
          {
            type: "text",
            text: pdfBase64,
          },
        ],
        structuredContent: {
          format: "base64" as const,
          pdfBase64,
        },
      };
    },
  );
};
