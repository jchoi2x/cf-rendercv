import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { processModel } from "../process-model";
import type { RenderCvDocumentPayload } from "../types";

type FixtureDocument = {
  cv: Record<string, unknown>;
  design: Record<string, unknown>;
  locale: Record<string, unknown>;
  settings: Record<string, unknown>;
};

type ThemeFixture = {
  name: string;
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

  const rawInput = readFileSync(inputPath, "utf-8");
  const input = parseYaml(rawInput) as RenderCvDocumentPayload;
  const expected = JSON.parse(readFileSync(outputPath, "utf-8")) as FixtureDocument;

  return {
    name: fixtureDirName,
    input,
    expected,
  };
});

function normalizeSettings(settings: Record<string, unknown>): Record<string, unknown> {
  const { render_command: _renderCommand, ...rest } = settings;
  return rest;
}

function normalizeCv(cv: Record<string, unknown>): Record<string, unknown> {
  const { rendercv_sections: _rendercvSections, ...rest } = cv;
  return rest;
}

function expectExpectedToContainActualSubset(
  actual: Record<string, unknown>,
  expected: Record<string, unknown>,
): void {
  expect(expected).toMatchObject(actual);
}

describe("processModel fixtures - model parity", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17T00:00:00.000Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe("design key", () => {
    it.each(fixtures)("matches $name expected design output", ({ input, expected }) => {
      const actual = processModel(input, "typst");
      expect(actual.design).toEqual(expected.design);
      expectExpectedToContainActualSubset(
        actual.design as Record<string, unknown>,
        expected.design,
      );
    });
  });

  describe("settings key", () => {
    it.each(fixtures)("matches $name expected settings output", ({ input, expected }) => {
      const actual = processModel(input, "typst");
      const normalizedActual = normalizeSettings(
        actual.settings as Record<string, unknown>,
      );
      const normalizedExpected = normalizeSettings(expected.settings);

      expect(normalizedActual.current_date).toBe(normalizedExpected.current_date);
      expect(normalizedActual.bold_keywords).toEqual(normalizedExpected.bold_keywords);
      expect(normalizedActual.pdf_title).toBe(normalizedExpected.pdf_title);
      expect(normalizedActual._resolved_current_date).toMatch(
        /^\d{4}-\d{2}-\d{2}$/,
      );
    });
  });

  describe("locale key", () => {
    it.each(fixtures)("matches $name expected locale output", ({ input, expected }) => {
      const actual = processModel(input, "typst");
      expectExpectedToContainActualSubset(
        actual.locale as Record<string, unknown>,
        expected.locale,
      );
    });
  });

  describe("cv key", () => {
    it.each(fixtures)("matches $name expected cv output", ({ input, expected }) => {
      const actual = processModel(input, "typst");
      const normalizedActualCv = normalizeCv(actual.cv as Record<string, unknown>);
      const normalizedExpectedCv = normalizeCv(expected.cv);
      const actualCv = actual.cv as Record<string, unknown>;

      expect(Object.keys(normalizeCv(actualCv)).sort()).toEqual(
        Object.keys(normalizeCv(expected.cv)).sort(),
      );
      expect(Object.keys(normalizedActualCv).sort()).toEqual(
        Object.keys(normalizedExpectedCv).sort(),
      );

      expect(normalizedActualCv.name).toBe(normalizedExpectedCv.name);
      expect(normalizedActualCv.headline).toEqual(normalizedExpectedCv.headline);
      expect(normalizedActualCv.location).toBe(normalizedExpectedCv.location);
      expect(normalizedActualCv.email).toBe(normalizedExpectedCv.email);
      expect(normalizedActualCv.website).toBe(normalizedExpectedCv.website);
      expect(normalizedActualCv.social_networks).toEqual(
        normalizedExpectedCv.social_networks,
      );
      expect(actualCv._plain_name).toBe(expected.cv._plain_name);
      const expectedConnections = expected.cv._connections as unknown[];
      const actualConnections = actualCv._connections as unknown[];
      expect(Array.isArray(actualConnections)).toBe(true);
      expect(actualConnections.length).toBe(expectedConnections.length);
      expect(actualConnections.every((connection) => typeof connection === "string")).toBe(
        true,
      );
      expect(actualCv._top_note).toBeTypeOf("string");
      expect(
        typeof actualCv._footer === "string" || typeof actualCv._footer === "boolean",
      ).toBe(true);

      expect(normalizeCv(actualCv)).toEqual(normalizeCv(expected.cv));
    });
  });
});
