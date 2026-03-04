import { createRoute } from '@hono/zod-openapi';

import type { HandlerFromRoute } from '@/routes/types';
import { ErrorResponseSchema, GenerateSuccessSchema, RenderCvDocument } from '@cf-rendercv/contracts';
import yaml from 'js-yaml';
import {
readFileSync,
writeFileSync
} from 'node:fs';
import { execSync } from 'node:child_process';
import { rimrafSync } from 'rimraf';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";



const s3 = new S3Client({
  region: "auto", // Required by AWS SDK, not used by R2
  // Provide your R2 endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
  endpoint: process.env.S3_URL as string,
  credentials: {
    // Provide your R2 Access Key ID and Secret Access Key
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  },
});


const route = createRoute({
  method: 'post',
  path: '/api/v1/generate',
  tags: ['Generate'],
  summary: 'Validate and generate CV from RenderCV YAML payload',
  description:
    'Accepts a RenderCV YAML document (JSON equivalent). Validates against the RenderCV schema and returns success or validation errors. Use this to validate CV data before rendering.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RenderCvDocument,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/pdf': {
          schema: GenerateSuccessSchema,
        },
      },
      description: 'Payload is valid RenderCV YAML',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Bad request - validation error',
    },
  },
});

const outputDir = `/tmp/rendercv_output`;

const handler: HandlerFromRoute<typeof route> = async (c) => {
    const _body = c.req.valid('json') as RenderCvDocument;
    // convert to yaml text use js-yaml
    const yamlText = yaml.dump(_body);
    // rimraf delete the output directory
    rimrafSync(outputDir);

    const uuid = crypto.randomUUID();
    const resumeYamlPath = `/tmp/${uuid}.yaml`;
    const outputPdfPath = `/tmp/${uuid}.pdf`;
    const outputTypstPath = `/tmp/${uuid}.typ`;
    // write the yaml text to a file
    writeFileSync(resumeYamlPath, yamlText);

    try {
      // execute rendercv and stream the output to stdout
      const result = execSync(`rendercv render -nomd -nohtml -nopng -typ ${outputTypstPath} -pdf ${outputPdfPath} ${resumeYamlPath}`, { encoding: 'utf-8' });

      if (result) {
        const output = result.toString();
        console.debug('output:::\n', output)
      }

      const base64 = readFileSync(outputPdfPath, 'base64');

      // upload the pdf to s3
      const cmd = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET as string,
        Key: `rendercv/${uuid}.pdf`,
        ContentType: 'application/pdf',
        Body: base64
      });

      await s3.send(cmd);

      const url = `${process.env.S3_PUBLIC_URL}/rendercv/${uuid}.pdf`;

      return c.json({ 
        success: true,
        message: 'CV generated successfully',
        filename: `${uuid}.pdf`,
        url 
      });

    } catch(err) {
      const stdout = (err as any).stdout?.toString();
      console.error('stdout:::', (err as any).stdout?.toString());
      console.error('stderr:::', (err as any).stderr?.toString());

      const statusCode = (stdout && stdout.includes('errors in the input file!') ? 400 : 500);
      return c.json({ error: (err as any).message, info: stdout }, statusCode);

    }
};

export const generateRoute = {
  route,
  handler,
};
