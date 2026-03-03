import { Container } from "@cloudflare/containers";


export class DockerRendercvApp extends Container<Env> {
  // Port the container listens on (default: 8080)
  defaultPort = 8080;
  // Time before container sleeps due to inactivity (default: 30s)
  sleepAfter = "2m";

  // Environment variables passed to the container
  envVars = {
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
