import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";

import type { AuthContext } from "../../../oauth/auth0";
import { RENDERCV_SCHEMA_URI } from "../constants";

export const registerRenderscvPrompt = (
  server: McpServer,
  _props?: AuthContext,
) => {
  return server.registerPrompt(
    "rendercv",
    {
      title: "Generate a CV with RenderCV",
      description:
        "Instructions and context for using the rendercv tool to generate a CV PDF from a RenderCV document.",
    },
    async () => {
      return {
        description:
          "Instructions for using the rendercv tool to generate a CV",
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `
                Use the rendercv tool to generate a CV. The tool accepts a single argument "content" that must be a valid RenderCV document.  Instructions:
                - Build the "content" object to match the RenderCV schema. Include sections such as personal info (name, email, etc.), experience, education, skills, and any other sections defined in the schema.
                - Pass the object as the "content" argument when calling the rendercv tool.
                - The tool returns a URL to the generated PDF.

                To see the full JSON schema for the content payload, read the resource at ${RENDERCV_SCHEMA_URI}.`,
            },
          },
        ],
      };
    },
  );
};
