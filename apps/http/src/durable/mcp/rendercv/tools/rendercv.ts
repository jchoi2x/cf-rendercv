import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import { env } from "cloudflare:workers";
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

      const { pdfUrl, pdfBase64, path } = await generateCV({
        content,
        format: "url-and-base64",
        prefix: id,
      });

      agent.addDocument({
        path,
        bucket: env.S3_BUCKET,
        createdAt: new Date().toISOString(),
        data: JSON.stringify(content),
      });

      // Some MCP hosts/sandboxes don't reliably render `blob:` / inline base64 inside iframes.
      // Including a normal URL lets the UI preview reliably.
      return {
        content: [
          {
            type: "text",
            text: format === "url" ? pdfUrl : pdfBase64,
          },
        ],
        structuredContent: {
          format: format === "url" ? "url" : ("base64" as const),
          pdfBase64,
          pdfUrl,
        },
      };
    },
  );
};
