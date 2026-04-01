import wasmModule from "@jchoi2x/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm";
import { createTypstCompiler } from "@jchoi2x/typst.ts";
import {
  CompileFormatEnum,
  type TypstCompiler,
} from "@jchoi2x/typst.ts/compiler";
import { MemoryAccessModel } from "@jchoi2x/typst.ts/fs/memory";
import {
  WorkerPackageRegistry,
  packageKey,
  type PreviewPackageSpec,
} from "@jchoi2x/typst.ts/fs/package.worker";
import {
  withAccessModel,
  withPackageRegistry,
} from "@jchoi2x/typst.ts/options.init";
import { env } from "cloudflare:workers";

import {
  DEJAVU_MONO_REGULAR,
  LIBERTINUS_BOLD,
  LIBERTINUS_REGULAR,
  NEW_CM_REGULAR,
  RENDERCV_FONTS_API_BASE,
} from "./constants";
import { fetchFontBytes } from "./lib/fetch-font-bytes";
import {
  getFontFamilyMapping,
  normalizeFamilyName,
} from "./lib/normalize-font-family-name";
import { parseMissingFontFamilies } from "./lib/parse-missing-font-families";
import { parseMissingPreviewPackages } from "./lib/parse-missing-preview-packages";
import { prioritizeFontFile } from "./lib/prioritize-font-file";

type CompilerRuntime = {
  compiler: TypstCompiler;
  packageRegistry: WorkerPackageRegistry;
};

/**
 * Owns Typst compiler lifecycle, font/package resolution, and PDF compilation retries.
 * Intended for use inside a Durable Object (or other long-lived isolate) so state persists.
 */
export class TypstCompilerManager {
  private compilerPromise: Promise<CompilerRuntime> | null = null;
  private readonly extraPreloadPackages = new Map<string, PreviewPackageSpec>();
  private readonly dynamicFontUrls = new Set<string>();
  private readonly fontFamilyUrlMap = new Map<string, string[]>();
  private readonly renderCvFamilyUrlCache = new Map<string, string[]>();
  private renderCvDirMapPromise: Promise<Map<string, string>> | null = null;
  private readonly fontBytesPromise: Promise<[Uint8Array, Uint8Array]> =
    Promise.all([
      fetchFontBytes(LIBERTINUS_REGULAR),
      fetchFontBytes(LIBERTINUS_BOLD),
    ]);
  private readonly env: Env = env;

  constructor() {
    this.loadDefaultFontFamilyMap();
    this.loadFontMapFromEnv();
  }

  private setFontFamilyMapping(name: string, urls: string[]): void {
    const { normalized, filtered } = getFontFamilyMapping(name, urls);
    if (filtered && !filtered.length) {
      this.fontFamilyUrlMap.set(normalized, filtered);
    }
  }

  private mapFamilyToRenderCvDir(family: string): string {
    const normalized = normalizeFamilyName(family);
    if (normalized.startsWith("font awesome 7")) {
      return "Font Awesome 7";
    }
    return family;
  }

  private async getRenderCvDirMap(): Promise<Map<string, string>> {
    if (!this.renderCvDirMapPromise) {
      this.renderCvDirMapPromise = (async () => {
        const result = new Map<string, string>();
        const res = await fetch(RENDERCV_FONTS_API_BASE, {
          headers: {
            accept: "application/vnd.github+json",
            "user-agent": "typst-cf-worker",
          },
        });
        if (!res.ok) {
          return result;
        }
        const entries =
          await res.json<Array<{ type?: string; name?: string }>>();
        for (const entry of entries) {
          if (entry.type !== "dir" || !entry.name) {
            continue;
          }
          result.set(normalizeFamilyName(entry.name), entry.name);
        }
        return result;
      })();
    }
    return this.renderCvDirMapPromise;
  }

  private async fetchRenderCvFontUrls(family: string): Promise<string[]> {
    const normalized = normalizeFamilyName(family);
    if (this.renderCvFamilyUrlCache.has(normalized)) {
      return this.renderCvFamilyUrlCache.get(normalized) ?? [];
    }

    const dirMap = await this.getRenderCvDirMap();
    const requestedDir = this.mapFamilyToRenderCvDir(family);
    const resolvedDir =
      dirMap.get(normalizeFamilyName(requestedDir)) ?? requestedDir;
    const endpoint = `${RENDERCV_FONTS_API_BASE}/${encodeURIComponent(resolvedDir)}`;
    try {
      const res = await fetch(endpoint, {
        headers: {
          accept: "application/vnd.github+json",
          "user-agent": "typst-cf-worker",
        },
      });
      if (!res.ok) {
        this.renderCvFamilyUrlCache.set(normalized, []);
        return [];
      }

      const files = await res.json<
        Array<{
          type?: string;
          name: string;
          download_url?: string | null;
        }>
      >();

      let candidates = files
        .filter((f) => f.type === "file" && !!f.name && !!f.download_url)
        .filter((f) => /\.(ttf|otf)$/i.test(f.name))
        .sort(
          (a, b) => prioritizeFontFile(a.name) - prioritizeFontFile(b.name),
        );

      // Select matching variants for Font Awesome families.
      if (normalized.includes("font awesome 7")) {
        if (normalized.includes("brands")) {
          candidates = candidates.filter((f) =>
            f.name.toLowerCase().includes("brands"),
          );
        } else if (normalized.includes("free")) {
          candidates = candidates.filter((f) =>
            f.name.toLowerCase().includes("free"),
          );
        }
      }

      const urls = candidates.map((f) => f.download_url!);

      // Keep payload bounded while still covering common styles.
      const selected = urls.slice(0, 6);
      this.renderCvFamilyUrlCache.set(normalized, selected);
      return selected;
    } catch (error) {
      console.warn(
        `[TypstCompilerManager] rendercv font lookup failed for "${family}":`,
        error,
      );
      this.renderCvFamilyUrlCache.set(normalized, []);
      return [];
    }
  }

  private loadDefaultFontFamilyMap(): void {
    // RenderCV advertises many families; map them to stable Worker-safe fallbacks.
    const sansFallback = [LIBERTINUS_REGULAR];
    const monoFallback = [DEJAVU_MONO_REGULAR];

    for (const name of [
      "Aptos",
      "Arial",
      "Arial Rounded MT",
      "Arial Unicode MS",
      "Comic Sans MS",
      "Didot",
      "EB Garamond",
      "Fontin",
      "Garamond",
      "Gentium Book Plus",
      "Georgia",
      "Gill Sans",
      "Helvetica",
      "Impact",
      "Inter",
      "Lato",
      "Libertinus Serif",
      "Lucida Sans Unicode",
      "Mukta",
      "Noto Sans",
      "Open Sans",
      "Open Sauce Sans",
      "Poppins",
      "Raleway",
      "Roboto",
      "Source Sans 3",
      "Tahoma",
      "Times New Roman",
      "Trebuchet MS",
      "Ubuntu",
      "Verdana",
      "XCharter",
    ]) {
      this.setFontFamilyMapping(name, sansFallback);
    }
    this.setFontFamilyMapping("New Computer Modern", [NEW_CM_REGULAR]);
    this.setFontFamilyMapping("Courier New", monoFallback);
    this.setFontFamilyMapping("DejaVu Sans Mono", monoFallback);
    // Font Awesome families need explicit icon font URLs from your own host.
    this.setFontFamilyMapping("font awesome 7 free", sansFallback);
    this.setFontFamilyMapping("font awesome 7 brands", sansFallback);
  }

  private loadFontMapFromEnv(): void {
    const raw = (this.env as unknown as Record<string, unknown>)[
      "FONT_FAMILY_URLS_JSON"
    ];
    if (typeof raw !== "string" || raw.trim().length === 0) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Record<string, string | string[]>;
      for (const [family, value] of Object.entries(parsed)) {
        if (typeof value === "string") {
          this.setFontFamilyMapping(family, [value]);
          continue;
        }
        if (Array.isArray(value)) {
          this.setFontFamilyMapping(
            family,
            value.filter((entry): entry is string => typeof entry === "string"),
          );
        }
      }
    } catch (error) {
      console.warn(
        "[TypstCompilerManager] invalid FONT_FAMILY_URLS_JSON:",
        error,
      );
    }
  }

  private async resolveDynamicFontUrls(families: string[]): Promise<string[]> {
    const discovered = new Set<string>();
    for (const family of families) {
      const mapped = this.fontFamilyUrlMap.get(normalizeFamilyName(family));
      if (mapped) {
        for (const url of mapped) {
          discovered.add(url);
        }
      }

      // Also query RenderCV's canonical font repository for family-specific files.
      const renderCvUrls = await this.fetchRenderCvFontUrls(family);
      for (const url of renderCvUrls) {
        discovered.add(url);
      }
    }
    return [...discovered.values()];
  }

  private async getCompilerRuntime(
    sample_type: string,
  ): Promise<CompilerRuntime> {
    if (!this.compilerPromise) {
      this.compilerPromise = (async () => {
        const [regular, bold] = await this.fontBytesPromise;
        const dynamicFontBytes: Uint8Array[] = [];
        for (const url of this.dynamicFontUrls.values()) {
          try {
            dynamicFontBytes.push(await fetchFontBytes(url));
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);
            console.warn(
              `[TypstCompilerManager] skipping dynamic font URL (${url}): ${message}`,
            );
          }
        }

        const workerSafeFontLoader = Object.assign(
          async (
            _: unknown,
            {
              builder,
            }: { builder: { add_raw_font(data: Uint8Array): Promise<void> } },
          ) => {
            await builder.add_raw_font(regular);
            await builder.add_raw_font(bold);
            for (const bytes of dynamicFontBytes) {
              await builder.add_raw_font(bytes);
            }
          },
          {
            _kind: "fontLoader",
            _preloadRemoteFontOptions: { assets: false },
          },
        );

        const compiler = createTypstCompiler();
        const accessModel = new MemoryAccessModel();
        const packageRegistry = new WorkerPackageRegistry(accessModel);
        await packageRegistry.preloadFromSource(sample_type);
        const extraSpecs = [...this.extraPreloadPackages.values()];
        if (extraSpecs.length > 0) {
          console.log(
            `[WorkerPackageRegistry] preloading ${extraSpecs.length} discovered dependency package(s): ${extraSpecs.map(packageKey).join(", ")}`,
          );
          await packageRegistry.preload(extraSpecs);
        }
        await compiler.init({
          getModule: () => wasmModule,
          // Avoid loadFonts(): it uses dynamic codegen (new Function), blocked in Workers.
          beforeBuild: [
            workerSafeFontLoader as any,
            withAccessModel(accessModel),
            withPackageRegistry(packageRegistry as any),
          ],
        });
        compiler.addSource("/main.typ", sample_type);
        return { compiler, packageRegistry };
      })();
    }
    return this.compilerPromise;
  }

  async compilePdfResponse(
    maxRetries: number,
    typ_src: string,
  ): Promise<Response> {
    let runtime = await this.getCompilerRuntime(typ_src);

    let out = await runtime.compiler.compile({
      mainFilePath: "/main.typ",
      format: CompileFormatEnum.pdf,
      diagnostics: "full",
    });

    for (let i = 0; i < maxRetries && !out.result; i++) {
      const missingPackages = parseMissingPreviewPackages(
        out.diagnostics as unknown[] | undefined,
      );
      const missingFamilies = parseMissingFontFamilies(
        out.diagnostics as unknown[] | undefined,
      );

      let changed = false;
      if (missingPackages.length > 0) {
        console.log(
          `[WorkerPackageRegistry] compile retry ${i + 1}: discovered missing package(s): ${missingPackages.map(packageKey).join(", ")}`,
        );
        for (const spec of missingPackages) {
          this.extraPreloadPackages.set(packageKey(spec), spec);
        }
        changed = true;
      }

      if (missingFamilies.length > 0) {
        const discoveredUrls =
          await this.resolveDynamicFontUrls(missingFamilies);
        const newUrls = discoveredUrls.filter(
          (url) => !this.dynamicFontUrls.has(url),
        );
        if (newUrls.length > 0) {
          console.log(
            `[TypstCompilerManager] compile retry ${i + 1}: discovered missing font(s): ${missingFamilies.join(", ")}; loading ${newUrls.length} mapped font file(s)`,
          );
          for (const url of newUrls) {
            this.dynamicFontUrls.add(url);
          }
          changed = true;
        } else {
          console.warn(
            `[TypstCompilerManager] missing font family/families detected but no mapped URLs found: ${missingFamilies.join(", ")}`,
          );
        }
      }

      if (!changed) {
        break;
      }

      // Recreate compiler so package resolution retries with expanded registry preload.
      this.compilerPromise = null;
      runtime = await this.getCompilerRuntime(typ_src);
      out = await runtime.compiler.compile({
        mainFilePath: "/main.typ",
        format: CompileFormatEnum.pdf,
        diagnostics: "full",
      });
    }

    if (!out.result) {
      return Response.json(
        {
          ok: false,
          error: "Compilation produced no PDF",
          diagnostics: out.diagnostics ?? [],
        },
        { status: 500 },
      );
    }

    return new Response(out.result as BodyInit, {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": 'inline; filename="sample.pdf"',
        "cache-control": "no-store",
      },
    });
  }
}
