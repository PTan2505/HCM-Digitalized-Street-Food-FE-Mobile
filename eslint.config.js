import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // RN Specific Ignores
    ignores: [
      'dist/**',
      'node_modules/**',
      'android/**',
      'ios/**',
      '.expo/**',
      'web-build/**',
      'babel.config.cjs',
      'metro.config.cjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      // CHANGE: Use Node globals + ES2021 for RN environment
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      import: importPlugin,
    },
    rules: {
      // --- SAFETY RULES (Matches Web) ---
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',

      'no-unreachable': 'error',
      'default-case': 'error',

      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',

      // Relaxed rules (Matches Web)
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import Restrictions (Matches Web)
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // {
            //   target: './src/features/auth',
            //   from: './src/features',
            //   except: ['./auth'],
            // },
            {
              target: './src/features',
              from: ['./src/apps/customer', './src/apps/manager'],
            },
            {
              target: [
                './src/components',
                './src/hooks',
                './src/utils',
                './src/config',
                './src/constants',
                './src/screens',
              ],
              from: [
                './src/features',
                './src/apps/customer',
                './src/apps/manager',
              ],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    // Orval-generated files — do not enforce return-type annotations on generated code
    files: [
      'src/features/*/api/generated.ts',
      'src/features/*/types/generated/*.ts',
      'src/features/*/*/api/generated.ts',
      'src/features/*/*/types/generated/*.ts',
    ],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  }
);
