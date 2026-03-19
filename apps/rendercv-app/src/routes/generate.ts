import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createReadStream } from 'node:fs';

import type { RouteHandler } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import yaml from 'js-yaml';
import { rimrafSync } from 'rimraf';

import type { Env } from '@/types';
import {
  ErrorResponseSchema,
  GenerateSuccessSchema,
  RenderCvDocument
} from '@cf-rendercv/contracts';

const route = createRoute({
  method: 'post',
  path: '/api/v1/generate',
  tags: ['Generate'],
  summary: 'Validate and generate CV from RenderCV YAML payload',
  description:
    'Accepts a RenderCV document as either JSON (validated directly) or YAML (parsed into JSON, then validated). Validates against the RenderCV schema and generates a PDF using the rendercv CLI.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RenderCvDocument
        },
        'application/yaml': {
          schema: z.string().describe('RenderCV YAML document')
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/pdf': {
          schema: GenerateSuccessSchema
        }
      },
      description: 'Payload is valid RenderCV YAML'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      },
      description: 'Bad request - validation error'
    }
  }
});

const outputDir = `/tmp/rendercv_output`;

const handler: RouteHandler<typeof route, { Bindings: Env }> = async (c) => {
  const contentType = (c.req.header('content-type') ?? '').toLowerCase();

  const isJson = contentType.includes('application/json');
  const isYaml =
    contentType.includes('application/yaml') ||
    contentType.includes('application/x-yaml') ||
    contentType.includes('text/yaml') ||
    contentType.includes('+yaml');

  if (!isJson && !isYaml) {
    return c.json(
      {
        success: false,
        error: `Unsupported content-type: ${contentType || '(missing)'}`
      },
      415
    );
  }

  // Parse to a JSON object first, then validate against the RenderCV Zod schema.
  // This keeps both JSON and YAML paths consistent.
  let parsedDocument: unknown;
  if (isJson) {
    parsedDocument = c.req.valid('json');
  } else {
    const yamlTextInput = await c.req.text();
    parsedDocument = yaml.load(yamlTextInput);
  }

  const validation = RenderCvDocument.safeParse(parsedDocument);
  if (!validation.success) {
    return c.json(
      {
        success: false,
        error: 'Validation error',
        details: validation.error.flatten()
      },
      400
    );
  }

  const rendercvJson = validation.data;

  // Convert validated JSON to YAML for the rendercv CLI.
  const yamlText = yaml.dump(rendercvJson);

  // rimraf delete the output directory
  rimrafSync(outputDir);

  const uuid = crypto.randomUUID();
  const requestDir = `${outputDir}/${uuid}`;
  mkdirSync(requestDir, { recursive: true });

  const resumeYamlPath = `${requestDir}/resume.yaml`;
  const outputPdfPath = `${requestDir}/resume.pdf`;
  const outputTypstPath = `${requestDir}/resume.typ`;

  // write the yaml text to a file
  writeFileSync(resumeYamlPath, yamlText);

  try {
    // execute rendercv and stream the output to stdout
    const result = execSync(
      `rendercv render -nomd -nohtml -nopng -typ ${outputTypstPath} -pdf ${outputPdfPath} ${resumeYamlPath}`,
      { encoding: 'utf-8' }
    );

    if (result) {
      const output = result.toString();
      console.debug('output:::\n', output);
    }

    // stream output of pdf to the response
    const pdf = createReadStream(outputPdfPath);

    c.header('Content-Type', 'application/pdf');
    return c.body(pdf as unknown as ReadableStream);
  } catch (err) {
    const stdout = (err as any).stdout?.toString() ?? '';
    console.error('stdout:::', stdout);
    console.error('stderr:::', (err as any).stderr?.toString());

    const statusCode = stdout.includes('errors in the input file!') ? 400 : 500;
    return c.json(
      {
        success: false,
        error: (err as any).message ?? 'RenderCV render failed',
        details: stdout
      },
      statusCode
    );
  }
};

export const generateRoute = {
  route,
  handler
};
