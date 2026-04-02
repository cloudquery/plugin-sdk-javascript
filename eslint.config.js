import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import nodePlugin from 'eslint-plugin-n';
import pluginPromise from 'eslint-plugin-promise';
import pluginAva from 'eslint-plugin-ava';
import unusedImports from 'eslint-plugin-unused-imports';
import importPlugin from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  eslintPluginUnicorn.configs.recommended,
  nodePlugin.configs['flat/recommended-module'],
  pluginPromise.configs['flat/recommended'],
  ...pluginAva.configs['recommended'],
  eslintConfigPrettier,

  {
    files: ['src/**/*.ts'],
    plugins: {
      'unused-imports': unusedImports,
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: './tsconfig.json',
        }),
      ],
    },
    rules: {
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'n/no-missing-import': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
      'import-x/no-named-as-default': 'off',
      'unused-imports/no-unused-imports': 'error',
      'no-console': 'error',
      'require-await': 'off',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/naming-convention': 'error',
      'import-x/no-cycle': 'error',
      'import-x/no-self-import': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'import-x/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  {
    files: ['src/grpc/**/*.ts'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  {
    files: ['**/*test.ts'],
    rules: {
      'unicorn/no-array-for-each': 'off',
      'ava/no-conditional-assertion': 'off',
    },
  },

  {
    files: ['src/errors/errors.ts'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
    },
  },
);
