import { McpAgent } from "agents/mcp";
import { getContainer } from "@cloudflare/containers";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import { RenderCvDocument } from "@cf-rendercv/contracts";
import {
PutObjectCommand,
S3Client
} from "@aws-sdk/client-s3";

export class RendercvDo extends McpAgent<Env, Record<string, string>, {}> {
  app = new Hono<{ Bindings: Env }>();

  server = new McpServer({
    name: "RenderCV API",
    version: "1.0.0",
  });

  
  s3: S3Client;
  
  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.app.post('/api/v1/generate', async (c) => {
      return this.generateCV(await c.req.json())
    });

    this.app.use('*', (c) => super.fetch(c.req.raw));
    this.s3 = new S3Client({
      region: "auto", // Required by AWS SDK, not used by R2
      // Provide your R2 endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
      endpoint: env.S3_URL,
      credentials: {
        // Provide your R2 Access Key ID and Secret Access Key
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  override async init() {

    // check if the authenticated user has a cookie set
    this.server.registerTool('rendercv', {
      title: "rendercv generate",
      description: "Generate a CV from a RenderCV YAML payload",
      inputSchema: {
        content: RenderCvDocument,
      },
    }, async ({ content }) => {

      
      const response = await this.generateCV(content);
      // get the base64 encoded pdf from the response body
      const pdfBuffer = await response.arrayBuffer();

      const uuid = crypto.randomUUID();

      // upload the pdf to s3
      const fPath = `rendercv/${uuid}.pdf`;
      const cmd = new PutObjectCommand({
        Bucket: this.env.S3_BUCKET,
        Key: fPath,
        ContentType: 'application/pdf',
        Body: new Uint8Array(pdfBuffer),
      });
      await this.s3.send(cmd);

      const url = `${this.env.S3_PUBLIC_URL}/${fPath}`;

      return {
        content: [
          {
            type: "text",
            text: url,
          }
        ],
      };
    });

      // get the base64 encoded pdf from the response body
      // const pdf = await response.text();
      // const base64Pdf = Buffer.from(pdf).toString('base64');
      // const uuid = crypto.randomUUID();

  }

  async fetch(request: Request) {
    return this.app.fetch(request);
  }

  private async generateCV(body: unknown): Promise<Response> {
    return this.callContainerService("/api/v1/generate", body, "POST", "rendercv-app");
  }

  private async callContainerService(
    path: string,
    body: unknown,
    method: string = "POST",
    name: string = "rendercv-http"
  ): Promise<Response> {
    const container = getContainer(this.env.DOCKER_RENDERCV_APP, name);

    const headers = new Headers({
      "Content-Type": "application/json",
    });


    const options: RequestInit = {
      method,
      headers,
    };

    if (method !== "GET" && method !== "HEAD" && body) {
      options.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    try {
      const request = new Request(`http://container${path}`, options);
      const response = await container.fetch(request);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to call container service: ${error.message}`);
    }
  }
}