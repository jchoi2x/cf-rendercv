#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
// Build script - bundles only source code, keeps all dependencies external
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

import { build } from 'esbuild';

// Step 1: Compile TypeScript with tsc (handles decorators properly)
// This creates a temp directory with compiled JS
const tempDir = 'dist-temp';
console.log('Compiling TypeScript with decorators...');
try {
  execSync('tsc --project tsconfig.build.json', { stdio: 'inherit' });
} catch (error) {
  // tsc may have errors but still emit files - continue if files were created
  console.warn('TypeScript compilation had errors, but continuing...');
}

// Step 2: Resolve path aliases in compiled output
console.log('Resolving path aliases...');
try {
  execSync(`npx tsc-alias -p tsconfig.build.json`, { stdio: 'inherit' });
} catch (error) {
  console.warn('tsc-alias failed, trying to continue...');
}

// Step 3: Bundle the compiled JavaScript with esbuild
console.log('Bundling with esbuild...');
await build({
  entryPoints: [resolve(tempDir, 'index.js')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'dist/index.js',
  // Don't use packages: 'external' - we want to bundle @suno-mcp/contracts
  // Explicitly list what to keep external (all npm packages except workspace packages)
  banner: {
    js: `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
    `.trim()
  },

  external: [
    'buffer',
    '@hono/node-server',
    '@hono/swagger-ui',
    '@hono/zod-openapi',
    '@hono/zod-validator',
    'hono',
    'hono/cors',
    'hono/dev',
    'hono/logger',
    'hono/factory',
    '@2captcha/captcha-solver',
    'axios',
    'cookie',
    'fs',
    'ghost-cursor-playwright',
    'node:crypto',
    'node:path',
    'pino',
    'pino-pretty',
    'playwright',
    'rebrowser-playwright-core',
    'user-agents',
    'yn',
    'zod'
  ]
});

// Step 4: Clean up temp directory
console.log('Cleaning up...');
rmSync(tempDir, { recursive: true, force: true });
console.log('Build complete!');
