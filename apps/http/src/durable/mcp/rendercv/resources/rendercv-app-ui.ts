import {
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import type { AuthContext } from "../../../oauth/auth0";
import { RENDERCV_APP_UI_URI } from "../constants";
import { RENDERCV_APP_HTML } from "./rendercv-app-html";

/**
 * Static MCP App shell for the `rendercv` tool (inline preview + open in new tab).
 */
export const registerRendercvAppUiResource = (
  server: McpServer,
  _props?: AuthContext,
) =>
  registerAppResource(
    server,
    "rendercv-app",
    RENDERCV_APP_UI_URI,
    {
      description: "Interactive UI for the RenderCV PDF tool",
      _meta: {
        ui: {
          csp: {
            resourceDomains: ["https://esm.sh", "https://*.esm.sh"],
            connectDomains: ["https://esm.sh", "https://*.esm.sh"],
          },
        },
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: RESOURCE_MIME_TYPE,
          text: RENDERCV_APP_HTML,
          _meta: {
            ui: {
              csp: {
                resourceDomains: ["https://esm.sh", "https://*.esm.sh"],
                connectDomains: ["https://esm.sh", "https://*.esm.sh"],
              },
            },
          },
        },
      ],
    }),
  );
