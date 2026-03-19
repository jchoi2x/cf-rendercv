import { Container } from "@cloudflare/containers";
import { env } from "../utils/workers-env";

export class DockerRendercvApp extends Container<Env> {
  // Port the container listens on (default: 8080)
  defaultPort = 8080;
  // Time before container sleeps due to inactivity (default: 30s)
  sleepAfter = "2m";

  // Environment variables passed to the container
  envVars = {
    S3_ACCESS_KEY_ID: env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: env.S3_SECRET_ACCESS_KEY,
    S3_URL: env.S3_URL,
    S3_BUCKET: env.S3_BUCKET,
    S3_PUBLIC_URL: env.S3_PUBLIC_URL,
  };

  // Optional lifecycle hooks
  override onStart() {
    console.info("Container successfully started");
  }

  override onStop() {
    console.info("Container successfully shut down");
  }

  override onError(error: unknown) {
    console.error("Container error:", error);
  }
}
