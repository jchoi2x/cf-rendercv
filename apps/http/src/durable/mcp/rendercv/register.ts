import type { RenderCvMcpAgent } from "../../types";
import { registerRenderscvPrompt } from "./prompts/rendercv";
import { registerRendercvAppUiResource } from "./resources/rendercv-app-ui";
import { registerRenderscvSchemaAndPromptResource } from "./resources/schema-and-prompt";
import { registerDeleteResumeByIdTool } from "./tools/delete-resume-by-id";
import { registerGetDocsTool } from "./tools/get-docs";
import { registerGetResumeByIdTool } from "./tools/get-resume-by-id";
import { registerRenameResumeByIdTool } from "./tools/rename-resume-by-id";
import { registerRenderCvTool } from "./tools/rendercv";

export const registerRenderscv = (agent: RenderCvMcpAgent) => {
  registerRendercvAppUiResource(agent);
  registerRenderCvTool(agent);
  registerGetDocsTool(agent);
  registerGetResumeByIdTool(agent);
  registerRenameResumeByIdTool(agent);
  registerDeleteResumeByIdTool(agent);
  registerRenderscvSchemaAndPromptResource(agent);
  registerRenderscvPrompt(agent);
};
