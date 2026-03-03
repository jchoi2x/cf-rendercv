import { createRoute } from '@hono/zod-openapi';

import type { HandlerFromRoute } from '@/routes/types';
import type { RenderCVYaml} from '@cf-rendercv/contracts';
import { ErrorResponseSchema, GenerateSuccessSchema, RenderCVYamlSchema } from '@cf-rendercv/contracts';
import yaml from 'js-yaml';
import { writeFileSync } from 'node:fs';
import { createReadStream } from 'node:fs';
import { execSync } from 'node:child_process';
import { rimrafSync } from 'rimraf';
import path from 'node:path';


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
          schema: RenderCVYamlSchema,
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

const outputDir = `rendercv_output`;

const handler: HandlerFromRoute<typeof route> = async (c) => {
    const _body = c.req.valid('json') as RenderCVYaml;
    // convert to yaml text use js-yaml
    const yamlText = yaml.dump(_body);
    // rimraf delete the output directory
    rimrafSync(outputDir);

    // write the yaml text to a file
    writeFileSync('resume.yaml', yamlText);

    // execute rendercv and stream the output to stdout
    const result = execSync('rendercv render --pdf-path ./output.pdf ./resume.yaml', { encoding: 'utf-8' });

    if (result) {
      const output = result.toString();
      console.debug('', output)
    }

    // stream output of pdf to the response
    const pdfPath = path.resolve(`./output.pdf`);
    const pdf = createReadStream(pdfPath);

    c.header('Content-Type', 'application/pdf');
    return c.body(pdf as unknown as ReadableStream);
};

export const generateRoute = {
  route,
  handler,
};
