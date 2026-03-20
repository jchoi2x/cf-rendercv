import type { RenderCvMcpAgent } from "../../rendercv.do";
import { registerWidgetUiResource } from "./resources/widget-ui";
import { registerShowWidgetTool } from "./tools/show-widget";

export const registerWidgetUi = (agent: RenderCvMcpAgent) => {
  registerShowWidgetTool(agent);
  registerWidgetUiResource(agent);
};
