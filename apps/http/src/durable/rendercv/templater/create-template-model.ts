import { buildSections } from "./build-sections";
import { processModel } from "./process-model";
import type {
  CreateTemplateModelResult,
  RenderCvDocumentPayload,
} from "./types";

export function createTemplateModel(
  payload: RenderCvDocumentPayload,
): CreateTemplateModelResult {
  const data = processModel(payload, "typst");

  const sections = buildSections(data as unknown as Record<string, unknown>);

  return {
    data,
    sections,
  };
}
