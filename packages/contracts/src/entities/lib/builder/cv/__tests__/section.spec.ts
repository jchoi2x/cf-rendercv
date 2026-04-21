import { describe, it, expect } from "vitest";
import { Section } from "../section";

const fixtures = [
  { type: 'string', data: ['string'] },
  { 
    type: 'one-line-entry', 
    data: [
      {
        label: 'string',
        details: 'string',
      }
    ] 
  },
  { 
    type: 'normal-entry', 
    data: [
      {
        name: "string",
        date: "04-2026",
        start_date: "04-2026",
        end_date: "04-2026",
        location: "string",
        summary: "string",
        highlights: ["string"],
      }
    ] 
  },
  {
    type: 'experience-entry',
    data: [
      {
        company: "string",
        position: "string",
        date: "04-2026",
        start_date: "04-2026",
        end_date: "04-2026",
        location: "string",
        summary: "string",
        highlights: ["string"],
      }
    ]
  },
  {
    type: 'education-entry',
    data: [
      {
        institution: "string",
        area: "string",
      }
    ]
  },
  {
    type: 'publication-entry',
    data: [
      {
        title: "string",
        authors: ["string"],
        summary: "string",
        doi: "string",
        url: "https://example.com",
        journal: "string",
        date: "04-2026",
      }
    ]
  },
  {
    type: 'bullet-entry',
    data: [
      {
        bullet: "string",
      }
    ]
  },
  {
    type: 'numbered-entry',
    data: [
      {
        number: "string",
      }
    ]
  },
  {
    type: 'reversed-numbered-entry',
    data: [
      {
        reversed_number: "hi",
      },
      {
        reversed_number: "my",
      }
    ]
  },
]

describe.each(fixtures)("$type", ({ data }) => {

  it("validates a minimal valid payload", () => {
    const result = Section.safeParse(data);
    expect(result.success).toBe(true);
  });
});