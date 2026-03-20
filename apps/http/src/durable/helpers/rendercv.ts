import { env } from "cloudflare:workers";

import { callContainerService } from "../../utils/call-container";

// define a type for a function where the return type is a string unless the format is 'response'
type GenerateCvOpts = {
  content: unknown;
  format: "base64" | "url" | "response";
  prefix?: string;
};

type IGenerateCv = <O extends GenerateCvOpts = GenerateCvOpts>(
  opts: O,
) => O["format"] extends "response" ? Promise<Response> : Promise<string>;

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
  if (format == "base64") {
    const pdfBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
    return base64;
  }

  const pdfBuffer = await response.arrayBuffer();

  const { uploadPdfToS3 } = await import("../../utils/s3");
  const url = await uploadPdfToS3(env.S3_BUCKET, pdfBuffer, {
    prefix: opts.prefix,
  });

  return url;
}) as IGenerateCv;
