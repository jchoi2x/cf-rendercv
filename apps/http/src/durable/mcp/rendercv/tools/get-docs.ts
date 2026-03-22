import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";

import type { RenderCvMcpAgent } from "../../../rendercv.do";

export const registerGetDocsTool = (agent: RenderCvMcpAgent) => {
  const { server } = agent;
  return registerAppTool(
    server,
    "get-resumes",
    {
      title: "get-resumes",
      description: "Gets list of previously generated resumes from the user",
      inputSchema: {},
      _meta: {},
    },
    async () => {
      // const id = props?.claims?.sub
      //   ? props.claims.sub.split("|").join("_")
      //   : "anonymous";

      const documents = await agent.getDocuments();

      // Some MCP hosts/sandboxes don't reliably render `blob:` / inline base64 inside iframes.
      // Including a normal URL lets the UI preview reliably.
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(documents),
          },
        ],
        structuredContent: {
          format: "json",
          documents,
        },
      };
    },
  );
};
