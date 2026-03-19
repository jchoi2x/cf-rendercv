import { callContainerService } from "../../utils/call-container.js";
import { uploadPdfToS3 } from "../../utils/s3.js";
import { env } from "cloudflare:workers";

// define a type for a function where the return type is a string unless the format is 'response'
type GenerateCvOpts = {
  content: unknown;
  format: "base64" | "url" | "response";
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

  const url = await uploadPdfToS3(env.S3_BUCKET, pdfBuffer);

  return url;
}) as IGenerateCv;
