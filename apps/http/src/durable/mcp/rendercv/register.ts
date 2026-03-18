import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerRenderCvTool } from "./tools/rendercv";
import { registerRenderscvSchemaAndPromptResource } from "./resources/schema-and-prompt";
import { registerRenderscvPrompt } from "./prompts/rendercv";

export const registerRenderscv = (server: McpServer) => {
  registerRenderCvTool(server);
  registerRenderscvSchemaAndPromptResource(server);
  registerRenderscvPrompt(server);
}