import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";

import type { RenderCvMcpAgent } from "../../../rendercv.do";
import { widgetUI } from "../widgets/widgetUI";

export const registerShowWidgetTool = (agent: RenderCvMcpAgent) => {
  return registerAppTool(
    agent.server,
    "show_widget",
    {
      description: "Show widget",
      inputSchema: { query: z.string() },
      _meta: { ui: { resourceUri: widgetUI.resource.uri } },
    },
    async ({ query }) => {
      return { content: [{ type: "text", text: `Query: ${query}` }, widgetUI] };
    },
  );
};
