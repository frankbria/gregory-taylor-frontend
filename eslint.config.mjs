import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'node:module'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

// eslint-plugin-react detects the React version via context.getFilename(),
// which ESLint 10 removed; reading the installed version pins it without
// hard-coding a number that would go stale on the next React upgrade.
const reactVersion = createRequire(import.meta.url)('react/package.json').version

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'prettier'),
  { settings: { react: { version: reactVersion } } },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
  },
  {
    files: ['**/__tests__/**', '**/*.test.*', 'e2e/**'],
    rules: {
      'no-console': 'off',
      '@next/next/no-img-element': 'off',
      'react/display-name': 'off',
    },
  },
]

export default eslintConfig
