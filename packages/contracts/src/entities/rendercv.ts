/* Auto-generated Zod schemas from RenderCV JSON Schema. */
import { z } from "@hono/zod-openapi";

import { Cv } from "./lib/builder/cv/cv.schema";
import { Settings } from "./lib/builder/settings";
import { BuiltInDesign } from "./lib/builtin-design";
import { Locale } from "./lib/locale";

export const RenderCvDocument = z
  .object({
    cv: Cv.optional(),
    design: BuiltInDesign.optional(),
    locale: Locale.optional(),
    settings: Settings.optional(),
  })
  .strict()
  .describe("Typst-based CV/resume generator for academics and engineers.")
  .openapi({
    example: {
      cv: {
        name: "Alex Carter",
        location: "Austin, TX",
        email: "alex.carter@example.com",
        phone: "+15125550123",
        website: "https://alexcarter.dev",
        social_networks: [
          {
            network: "GitHub",
            username: "alexcdev",
          },
          {
            network: "LinkedIn",
            username: "alex-carter-dev",
          },
        ],
        sections: {
          Summary: [
            "Senior Software Engineer with 8+ years building scalable web platforms and internal tools. Experienced in React, TypeScript, Node.js, and cloud-native systems. Strong track record of improving developer productivity, modernizing frontend architecture, and delivering reliable customer-facing applications in fast-paced product teams.",
          ],
          Experience: [
            {
              company: "Nimbus Labs",
              position: "Senior Software Engineer",
              location: "Remote",
              start_date: "2022-03",
              end_date: "2025-01",
              highlights: [
                "Built full-stack product features across React and Node.js applications, collaborating closely with design, product, and QA in an Agile environment.",
                "Introduced AI-assisted developer workflows using code generation and reusable prompt templates, reducing implementation time for common component patterns.",
                "Improved application performance by splitting large frontend bundles, lazy loading non-critical modules, and optimizing asset delivery.",
                "Reduced API latency by introducing precomputed lookup tables and background synchronization jobs for frequently requested data.",
              ],
            },
            {
              company: "BluePeak Software",
              position: "Principal Software Engineer",
              location: "Denver, CO",
              start_date: "2018-06",
              end_date: "2022-02",
              highlights: [
                "Led architecture for a multi-tenant SaaS platform, spanning frontend applications, backend APIs, and deployment workflows.",
                "Established frontend standards for accessibility, component reuse, and testing across multiple React applications.",
                "Mentored engineers on TypeScript, testing strategy, and system design, improving overall team delivery quality.",
                "Designed a GraphQL gateway to simplify frontend data access and reduce redundant service calls.",
              ],
            },
            {
              company: "Northwind Analytics",
              position: "Frontend Engineer",
              location: "Chicago, IL",
              start_date: "2016-01",
              end_date: "2018-05",
              highlights: [
                "Developed internal dashboards for analytics and reporting using React and Redux.",
                "Standardized Git workflows and frontend code review practices across the engineering team.",
                "Partnered with backend engineers to build ETL monitoring tools that reduced manual operational effort.",
              ],
            },
          ],
          Education: [
            {
              institution: "University of Illinois",
              area: "Computer Science",
              degree: "B.S.",
              start_date: "2011-08",
              end_date: "2015-05",
            },
          ],
          Certifications: [
            {
              name: "Cloud Developer Professional Certificate",
              date: "2024-11",
              highlights: [
                "Issued by Example Cloud Academy. Credential ID: ABCD1234EFGH",
              ],
            },
          ],
        },
      },
      design: {
        theme: "sb2nov",
      },
    },
  });

export type TRenderCvDocument = z.infer<typeof RenderCvDocument>;
