// Mock dependencies BEFORE importing
const mockCreateAuthClient = jest.fn(() => ({
  useSession: jest.fn(),
  signIn: { email: jest.fn() },
  signOut: jest.fn(),
}))

jest.mock('better-auth/react', () => ({
  createAuthClient: mockCreateAuthClient,
}))

// Import after mocks are set up - module loads once
const { authClient } = require('../auth-client')

describe('auth-client', () => {
  it('exports authClient and is defined', () => {
    expect(authClient).toBeDefined()
  })

  it('calls createAuthClient', () => {
    expect(mockCreateAuthClient).toHaveBeenCalled()
  })

  it('configures baseURL from environment variable', () => {
    expect(mockCreateAuthClient).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expect.any(String),
      })
    )
  })
})
