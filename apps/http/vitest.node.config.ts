import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));

/** MiniJinja/Typst templates use `import x from "*.j2.typ"`; Vite must treat them as raw strings, not JS. */
function rawTypstTemplatesPlugin() {
  return {
    name: 'raw-typst-j2-templates',
    enforce: 'pre' as const,
    load(id: string) {
      if (id.endsWith('.j2.typ')) {
        const source = fs.readFileSync(id, 'utf8');
        return `export default ${JSON.stringify(source)}`;
      }
    },
  };
}

/** Heavy templater/renderer specs: real filesystem fixtures + WASM (MiniJinja). Run in Node, not workerd. */
export default defineConfig({
  assetsInclude: ['**/*.wasm'],
  plugins: [rawTypstTemplatesPlugin()],
  resolve: {
    alias: {
      'cloudflare:workers': path.join(
        root,
        '.vitest/unit/stubs/cloudflare-workers.ts',
      ),
    },
  },
  ssr: {
    noExternal: ['@jchoi2x/minijinja'],
  },
  test: {
    name: 'http-node',
    globals: true,
    setupFiles: ['./.vitest/unit/setup-files/test-setup.ts'],
    environment: 'node',
    include: [
      'node-tests/**/*.spec.ts',
      'src/durable/rendercv/renderer/__tests__/renderer.spec.ts',
      'src/durable/rendercv/templater/__tests__/create-template-model.spec.ts',
      'src/durable/rendercv/templater/__tests__/process-model.spec.ts',
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
