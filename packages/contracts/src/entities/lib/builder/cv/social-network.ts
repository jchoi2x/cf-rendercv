import { z } from "@hono/zod-openapi";

export const SocialNetworkName = z.enum([
  "LinkedIn",
  "GitHub",
  "GitLab",
  "IMDB",
  "Instagram",
  "ORCID",
  "Mastodon",
  "StackOverflow",
  "ResearchGate",
  "YouTube",
  "Google Scholar",
  "Telegram",
  "WhatsApp",
  "Leetcode",
  "X",
  "Bluesky",
  "Reddit",
] as const);

export const SocialNetwork = z
  .object({
    network: SocialNetworkName,
    username: z.string().describe("Username"),
  })
  .strict()
  .describe("SocialNetwork");
