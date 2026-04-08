import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import importNewlines from "eslint-plugin-import-newlines";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      // Treat workspace + `@/` alias as `internal` before scoped-package → external.
      "import/internal-regex": "^@(cf-rendercv/|/)",
    },
    plugins: {
      import: importPlugin,
      "import-newlines": importNewlines,
    },
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          caughtErrors: "all",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],

      // General rules
      "no-console": ["warn", { allow: ["error", "warn", "info", "debug"] }],
      "no-debugger": "warn",

      // Import formatting rules
      "import-newlines/enforce": [
        "error",
        {
          items: 4,
          "max-len": 120,
          forceSingleLine: false,
        },
      ],

      // Local specifiers only (`./`, `../`, `@/…`). Scoped packages are
      // `@scope/...` (second char is not `/`), so they are not matched.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^(?:\\./|\\.\\./|@/).*\\.js$",
              message:
                "Omit the .js extension for local imports (relative paths and the @/ alias).",
            },
          ],
        },
      ],

      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "object",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          warnOnUnassignedImports: false,
        },
      ],
    },
  },
  prettierRecommended,
  {
    files: ["**/*.js", "**/*.mjs"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    ignores: [
      "**/build.js",
      "node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.wrangler/**",
      "**/worker-configuration.d.ts",
      "**/*.config.js",
      "**/*.config.ts",
      "**/tsconfig.tsbuildinfo",
      "apps/http/node-tests/**",
      "**/tests/**",
      "**/__tests__/**",
      "pnpm-lock.yaml",
    ],
  },
);
