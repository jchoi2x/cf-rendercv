import {
  registerAppResource,
  registerAppTool,
} from "@modelcontextprotocol/ext-apps/server";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { RenderCvDocument } from "@cf-rendercv/contracts";

import { generateCV } from "../../../helpers/rendercv";
import type { AuthContext } from "../../../oauth/auth0";
import { renderPdf } from "../widgets/render-pdf";

// check if the authenticated user has a cookie set
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
      _meta: { ui: { resourceUri: "ui://rendercv/pdf" } },
    },
    async ({ content, format = "url" }) => {
      const id = _props?.claims?.sub
        ? _props.claims.sub.split("|").join("_")
        : "anonymous";

      const url = await generateCV({ content, format, prefix: id });
      if (format === "url") {
        const pdfResource = renderPdf(url);
        const rsrc = registerAppResource(
          server,
          "rendercv-pdf",
          pdfResource.resource.uri,
          {
            description: "RenderCV pdf",
            mimeType: "application/html",
          },
          async () => {
            return {
              contents: [pdfResource.resource],
            };
          },
        );

        return {
          content: [
            {
              type: "text",
              text: url,
            },
            pdfResource,
          ],
        };
      }

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
