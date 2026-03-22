import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";

import type { RenderCvMcpAgent } from "../../../rendercv.do";

export const registerGetResumeByIdTool = (agent: RenderCvMcpAgent) => {
  const { server } = agent;

  return registerAppTool(
    server,
    "get-resume-by-id",
    {
      title: "get-resume-by-id",
      description: "Fetch a previously generated resume record by id",
      inputSchema: {
        id: z.number().int().min(1),
      },
      _meta: {},
    },
    async ({ id }) => {
      const resume = agent.getResumeById(id);
      if (!resume) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Resume not found for id=${id}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: resume.pdfUrl,
          },
        ],
        structuredContent: {
          format: "json" as const,
          resume,
        },
      };
    },
  );
};
