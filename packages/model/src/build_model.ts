import {
  RenderCvDocument,
  type TRenderCvDocument,
} from "@cf-rendercv/contracts";

export const buildModel = (payload: TRenderCvDocument) => {
  const result = RenderCvDocument.safeParse(payload);
  return result;
};
