import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";

import type { RenderCvMcpAgent } from "../../../rendercv.do";

export const registerDeleteResumeByIdTool = (agent: RenderCvMcpAgent) => {
  const { server } = agent;

  return registerAppTool(
    server,
    "delete-resume-by-id",
    {
      title: "delete-resume-by-id",
      description: "Delete a resume record (and its PDF) by id",
      inputSchema: {
        id: z.number().int().min(1),
      },
      _meta: {},
    },
    async ({ id }) => {
      const deleted = await agent.deleteResumeById(id);
      if (!deleted) {
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
            text: `Deleted resume id=${id}`,
          },
        ],
        structuredContent: {
          format: "json" as const,
          deleted: true,
          id,
        },
      };
    },
  );
};
