import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key'
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key'
process.env.NEXT_PUBLIC_API_BASE = 'http://localhost:3000'
process.env.BETTER_AUTH_SECRET = 'test-secret-key-for-jest-testing-only'
process.env.BETTER_AUTH_URL = 'http://localhost:3000'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock
