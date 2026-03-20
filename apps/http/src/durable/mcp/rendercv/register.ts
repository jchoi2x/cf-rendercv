import type { RenderCvMcpAgent } from "../../rendercv.do";
import { registerRenderscvPrompt } from "./prompts/rendercv";
import { registerRendercvAppUiResource } from "./resources/rendercv-app-ui";
import { registerRenderscvSchemaAndPromptResource } from "./resources/schema-and-prompt";
import { registerRenderCvTool } from "./tools/rendercv";

export const registerRenderscv = (agent: RenderCvMcpAgent) => {
  registerRendercvAppUiResource(agent);
  registerRenderCvTool(agent);
  registerRenderscvSchemaAndPromptResource(agent);
  registerRenderscvPrompt(agent);
};
