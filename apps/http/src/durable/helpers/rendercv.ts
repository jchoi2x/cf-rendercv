import { env } from "cloudflare:workers";

import { uploadPdfToS3 } from "../../utils/s3";

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
  const { content } = opts;

  const stubId = env.MCP_OBJECT.idFromName(opts.prefix ?? "anonymous");
  const stub = env.MCP_OBJECT.get(stubId);

  const result = await stub.renderCvTypstPdf(JSON.stringify(content));

  if (!result.ok) {
    return {
      content: [
        {
          type: "text",
          text: result.error,
        },
      ],
    };
  }

  const pdfBuffer = result.pdf;
  const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
  const { url, path } = await uploadPdfToS3(env.S3_BUCKET, pdfBuffer.buffer, {
    prefix: opts.prefix,
  });

  return {
    url: url,
    pdfUrl: url,
    pdfBase64: base64,
    path,
  };
}) as IGenerateCv;
