import { registerAppResource } from "@modelcontextprotocol/ext-apps/server";

import type { RenderCvMcpAgent } from "../../../rendercv.do";
import { widgetUI } from "../widgets/widgetUI";

export const registerWidgetUiResource = (agent: RenderCvMcpAgent) => {
  return registerAppResource(
    agent.server,
    "widget_ui",
    widgetUI.resource.uri,
    {
      description: "Widget UI",
    },
    async () => ({
      contents: [widgetUI.resource],
    }),
  );
};
