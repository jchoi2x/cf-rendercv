import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { createTemplateModel } from "../create-template-model";
import { inferEntryType } from "../infer-entry-type";
import { ThemeNames, type RenderCvDocumentPayload } from "../types";

type FixtureDocument = {
  cv: Record<string, unknown>;
  design: Record<string, unknown>;
  locale: Record<string, unknown>;
  settings: Record<string, unknown>;
};

type ThemeFixture = {
  dirName: string;
  theme: string;
  input: RenderCvDocumentPayload;
  expected: FixtureDocument;
};


const thisDir = dirname(fileURLToPath(import.meta.url));
const fixturesRoot = resolve(thisDir, "../../__fixtures__");
const fixtureDirs = readdirSync(fixturesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

const fixtures: ThemeFixture[] = fixtureDirs.map((fixtureDirName) => {
  const fixtureDir = resolve(fixturesRoot, fixtureDirName);
  const inputPath = resolve(fixtureDir, `${fixtureDirName}.input.json`);
  const outputPath = resolve(fixtureDir, `${fixtureDirName}.output.json`);

  const input = parseYaml(readFileSync(inputPath, "utf-8")) as RenderCvDocumentPayload;
  const expected = JSON.parse(readFileSync(outputPath, "utf-8")) as FixtureDocument;

  return {
    dirName: fixtureDirName,
    theme: String(expected.design.theme ?? ""),
    input,
    expected,
  };
});
const fixtureByTheme = new Map(
  fixtures.map((fixture) => [fixture.theme, fixture] as const),
);

function toSnakeCaseSectionTitle(value: string): string {
  return value.trim().replace(/\s+/g, "_").toLowerCase();
}

function normalizeCvForFixture(cv: Record<string, unknown>): Record<string, unknown> {
  const { rendercv_sections: _rendercvSections, ...rest } = cv;
  return rest;
}

function expectExpectedToContainActualSubset(
  actual: Record<string, unknown>,
  expected: Record<string, unknown>,
): void {
  expect(expected).toMatchObject(actual);
}

describe("createTemplateModel fixtures", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17T00:00:00.000Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe.each(ThemeNames)("theme %s", (themeName) => {
    const fixture = fixtureByTheme.get(themeName);

    if (!fixture) {
      it("skips when fixture is unavailable", () => {
        expect(
          fixtureByTheme.has(themeName),
          `Missing fixture for theme '${themeName}'`,
        ).toBe(false);
      });
      return;
    }

    it(`builds data and sections from ${fixture.dirName} fixture`, () => {
      const { input, expected } = fixture;
      const actual = createTemplateModel(input);

      expectExpectedToContainActualSubset(
        actual.data.design as Record<string, unknown>,
        expected.design,
      );
      expectExpectedToContainActualSubset(
        actual.data.locale as Record<string, unknown>,
        expected.locale,
      );

      const expectedSettings = expected.settings;
      expect(actual.data.settings.current_date).toBe(expectedSettings.current_date);
      expect(actual.data.settings.bold_keywords).toEqual(expectedSettings.bold_keywords);
      expect(actual.data.settings.pdf_title).toBe(expectedSettings.pdf_title);
      expect(actual.data.settings._resolved_current_date).toMatch(
        /^\d{4}-\d{2}-\d{2}$/,
      );

      expect(actual.data.cv.name).toBe(expected.cv.name);
      expect(actual.data.cv.location).toBe(expected.cv.location);
      expect(actual.data.cv.email).toBe(expected.cv.email);
      expect(actual.data.cv.website).toBe(expected.cv.website);
      expect(actual.data.cv._plain_name).toBe(expected.cv._plain_name);
      expect(normalizeCvForFixture(actual.data.cv as Record<string, unknown>)).toEqual(
        expected.cv,
      );

      const expectedSectionEntries = expected.cv.sections as Record<string, unknown[]>;
      const expectedSectionTitles = Object.keys(expectedSectionEntries);
      expect(actual.sections).toHaveLength(expectedSectionTitles.length);

      for (const [index, originalTitle] of expectedSectionTitles.entries()) {
        const section = actual.sections[index]!;
        const expectedEntries = expectedSectionEntries[originalTitle] ?? [];
        expect(section.snake_case_title).toBe(toSnakeCaseSectionTitle(originalTitle));
        expect(section.entry_type).toBe(inferEntryType(expectedEntries));
        expect(section.entries).toHaveLength(expectedEntries.length);

        const firstEntry = section.entries[0];
        if (firstEntry && typeof firstEntry === "object") {
          const firstEntryRecord = firstEntry as Record<string, unknown>;
          expect(firstEntryRecord).toHaveProperty("main_column");
          expect(firstEntryRecord).toHaveProperty("main_column_lines");
          expect(firstEntryRecord).toHaveProperty("date_and_location_column");
          expect(firstEntryRecord).toHaveProperty("date_and_location_column_lines");
        }
      }
    });
  });
});
