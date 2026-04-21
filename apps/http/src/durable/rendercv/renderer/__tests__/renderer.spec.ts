import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { afterAll, beforeAll, vi, describe, expect, it } from "vitest";
import { Renderer } from "../renderer";
import type { RenderCvDocumentPayload } from "../../templater/types";
const thisDir = dirname(fileURLToPath(import.meta.url));
const fixturesRoot = resolve(thisDir, "../../__fixtures__");
const fixtureDirs = readdirSync(fixturesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

const fixtures = fixtureDirs.map((fixtureDirName) => {
  const fixtureDir = resolve(fixturesRoot, fixtureDirName);
  const inputPath = resolve(fixtureDir, `${fixtureDirName}.input.json`);
  const outputPath = resolve(fixtureDir, `${fixtureDirName}.typ`);

  const rawInput = readFileSync(inputPath, "utf-8");
  const input = parseYaml(rawInput) as RenderCvDocumentPayload;
  const expected = readFileSync(outputPath, "utf-8");

  return {
    name: fixtureDirName,
    input,
    expected,
  };
});

describe("processModel fixtures - model parity", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-19T00:00:00.000Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe.each(fixtures)("$name matches expected typ output", ({ input, expected }) => {

    it("should build a Typst source from a RenderCvDocumentPayload", async () => {
      const renderer = new Renderer();
      const source = await renderer.buildTypstSource(input);
      expect(source).toBe(expected);
    });
  });
});