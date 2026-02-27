import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'prettier'),
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
