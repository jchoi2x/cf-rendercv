import { env } from "cloudflare:workers";

import { callContainerService } from "../../utils/call-container";

// define a type for a function where the return type is a string unless the format is 'response'
type GenerateCvOpts = {
  content: unknown;
  format: "base64" | "url" | "response" | "url-and-base64";
  prefix?: string;
};

type IGenerateCv = <O extends GenerateCvOpts = GenerateCvOpts>(
  opts: O,
) => O["format"] extends "response"
  ? Promise<Response>
  : O["format"] extends "url-and-base64"
    ? Promise<{ pdfUrl: string; pdfBase64: string; url: string; path: string }>
    : Promise<{ url: string; path: string }>;

export const generateCV: IGenerateCv = (async (opts: GenerateCvOpts) => {
  const { content, format = "url" } = opts;

  const response = await callContainerService({
    path: "/api/v1/generate",
    body: content,
    method: "POST",
    name: "rendercv-app",
  });

  if (format === "response") {
    return response;
  }

  const pdfBuffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
  const { uploadPdfToS3 } = await import("../../utils/s3");
  const { url, path } = await uploadPdfToS3(env.S3_BUCKET, pdfBuffer, {
    prefix: opts.prefix,
  });
  return {
    url: url,
    pdfUrl: url,
    pdfBase64: base64,
    path,
  };
}) as IGenerateCv;
