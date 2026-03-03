import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import importNewlines from 'eslint-plugin-import-newlines';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	prettierConfig,
	{
		languageOptions: {
			parserOptions: {
				ecmaVersion: 2021,
				sourceType: 'module',
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		plugins: {
			'import-newlines': importNewlines,
		},
		rules: {
			// TypeScript specific rules
			"@typescript-eslint/no-unsafe-call": 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					caughtErrors: 'all',
				},
			],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/require-await': 'off',
			'@typescript-eslint/no-floating-promises': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/restrict-template-expressions': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
					fixStyle: 'separate-type-imports',
				},
			],

			// General rules
			'no-console': ['warn', { allow: ['error', 'warn', 'info'] }],
			'no-debugger': 'warn',

			// Import formatting rules
			'import-newlines/enforce': [
				'error',
				{
					items: 4,
					'max-len': 120,
					forceSingleLine: false,
				},
			],
		},
	},
	{
		files: ['**/*.js', '**/*.mjs'],
		...tseslint.configs.disableTypeChecked,
	},
	{
		ignores: [
			'node_modules/**',
			'**/dist/**',
			'**/build/**',
			'**/.wrangler/**',
			'**/worker-configuration.d.ts',
			'**/*.config.js',
			'**/*.config.ts',
			'**/tsconfig.tsbuildinfo',
			'**/tests/**',
			'**/__tests__/**',
			'pnpm-lock.yaml',
		],
	}
);

