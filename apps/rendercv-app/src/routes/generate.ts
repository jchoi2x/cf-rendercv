import { createRoute } from '@hono/zod-openapi';

import type { HandlerFromRoute } from '@/routes/types';
import { ErrorResponseSchema, GenerateSuccessSchema, RenderCvDocument } from '@cf-rendercv/contracts';
import yaml from 'js-yaml';
import { writeFileSync } from 'node:fs';
import { createReadStream } from 'node:fs';
import { execSync } from 'node:child_process';
import { rimrafSync } from 'rimraf';


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

      // stream output of pdf to the response
      const pdf = createReadStream(outputPdfPath);

      c.header('Content-Type', 'application/pdf');
      return c.body(pdf as unknown as ReadableStream);
    } catch(err) {
      const stdout = (err as any).stdout?.toString();
      console.error('stdout:::', (err as any).stdout?.toString());
      console.error('stderr:::', (err as any).stderr?.toString());

      const statusCode = (stdout.includes('errors in the input file!') ? 400 : 500);
      return c.json({ error: (err as any).message, info: stdout }, statusCode);

    }
};

export const generateRoute = {
  route,
  handler,
};
