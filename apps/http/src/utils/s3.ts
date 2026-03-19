import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "./workers-env";

export const s3 = new S3Client({
  region: "auto", // Required by AWS SDK, not used by R2
  // Provide your R2 endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
  endpoint: env.S3_URL,
  credentials: {
    // Provide your R2 Access Key ID and Secret Access Key
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

export async function uploadPdfToS3(
  bucket: string,
  buffer: ArrayBuffer,
  options?: { prefix?: string; contentType?: string; name?: string },
): Promise<string> {
  const {
    prefix = "rendercv",
    contentType = "application/pdf",
    name,
  } = options ?? {};
  const uuid = name ?? crypto.randomUUID();
  const fPath = `${prefix}/${uuid}.pdf`;

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: fPath,
    ContentType: contentType,
    Body: new Uint8Array(buffer),
  });

  await s3.send(cmd);

  return `${env.S3_PUBLIC_URL}/${fPath}`;
}
