import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";

import type { RenderCvMcpAgent } from "../../../rendercv.do";

export const registerRenameResumeByIdTool = (agent: RenderCvMcpAgent) => {
  const { server } = agent;

  return registerAppTool(
    server,
    "rename-resume-by-id",
    {
      title: "rename-resume-by-id",
      description:
        "Rename the underlying PDF object (and metadata) for a resume by id",
      inputSchema: {
        id: z.number().int().min(1),
        newName: z.string().min(1),
      },
      _meta: {},
    },
    async ({ id, newName }) => {
      const resume = await agent.renameResumeById(id, newName);
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
