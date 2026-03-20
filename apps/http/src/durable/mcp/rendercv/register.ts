import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";

import { registerRenderscvPrompt } from "./prompts/rendercv";
import { registerRendercvAppUiResource } from "./resources/rendercv-app-ui";
import { registerRenderscvSchemaAndPromptResource } from "./resources/schema-and-prompt";
import { registerRenderCvTool } from "./tools/rendercv";
import type { AuthContext } from "../../oauth/auth0";

export const registerRenderscv = (server: McpServer, _props?: AuthContext) => {
  registerRendercvAppUiResource(server, _props);
  registerRenderCvTool(server, _props);
  registerRenderscvSchemaAndPromptResource(server, _props);
  registerRenderscvPrompt(server, _props);
};
