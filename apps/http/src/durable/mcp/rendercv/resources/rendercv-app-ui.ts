import {
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";

import type { RenderCvMcpAgent } from "../../../rendercv.do";
import { RENDERCV_APP_UI_URI } from "../constants";
import { RENDERCV_APP_HTML } from "./rendercv-app-html";

/**
 * Static MCP App shell for the `rendercv` tool (inline preview + open in new tab).
 */
export const registerRendercvAppUiResource = (agent: RenderCvMcpAgent) =>
  registerAppResource(
    agent.server,
    "rendercv-app",
    RENDERCV_APP_UI_URI,
    {
      description: "Interactive UI for the RenderCV PDF tool",
      _meta: {
        ui: {
          csp: {
            resourceDomains: ["https://esm.sh", "https://*.esm.sh"],
            connectDomains: ["https://esm.sh", "https://*.esm.sh"],
            // Allow the UI iframe to load inline previews created from the tool result.
            frameDomains: ["blob:", "data:"],
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
                frameDomains: ["blob:", "data:"],
              },
            },
          },
        },
      ],
    }),
  );
