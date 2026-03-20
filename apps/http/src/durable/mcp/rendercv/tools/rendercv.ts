import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";

import { RenderCvDocument } from "@cf-rendercv/contracts";

import { generateCV } from "../../../helpers/rendercv";
import type { RenderCvMcpAgent } from "../../../rendercv.do";
import { RENDERCV_APP_UI_URI } from "../constants";

export const registerRenderCvTool = (agent: RenderCvMcpAgent) => {
  const { server, props } = agent;
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
      const id = props?.claims?.sub
        ? props.claims.sub.split("|").join("_")
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

      // Some MCP hosts/sandboxes don't reliably render `blob:` / inline base64 inside iframes.
      // Including a normal URL lets the UI preview reliably.
      const pdfUrl = await generateCV({
        content,
        format: "url",
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
          pdfUrl,
        },
      };
    },
  );
};
