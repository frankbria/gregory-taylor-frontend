// Mock dependencies BEFORE importing
const mockBetterAuth = jest.fn(() => ({
  api: {
    getSession: jest.fn(),
    signUpEmail: jest.fn(),
  },
  handler: jest.fn(),
}))

const mockDatabase = jest.fn(() => ({
  pragma: jest.fn(),
  exec: jest.fn(),
  prepare: jest.fn(() => ({
    run: jest.fn(),
    get: jest.fn(),
    all: jest.fn(),
  })),
  close: jest.fn(),
}))

jest.mock('better-auth', () => ({
  betterAuth: mockBetterAuth,
}))

jest.mock('better-sqlite3', () => mockDatabase)

// Import after mocks are set up - module loads once
const { auth } = require('../auth')

describe('auth configuration', () => {
  it('exports auth and is defined', () => {
    expect(auth).toBeDefined()
  })

  it('initializes database with better-sqlite3', () => {
    expect(mockDatabase).toHaveBeenCalledWith(
      expect.stringContaining('auth.db')
    )
  })

  it('calls betterAuth with emailAndPassword enabled and disableSignUp true', () => {
    expect(mockBetterAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        emailAndPassword: expect.objectContaining({
          enabled: true,
          disableSignUp: true,
        }),
      })
    )
  })

  it('configures session with expiresIn and updateAge', () => {
    const config = mockBetterAuth.mock.calls[0][0]

    expect(config.session).toBeDefined()
    expect(config.session.expiresIn).toBe(60 * 60 * 24 * 7) // 7 days
    expect(config.session.updateAge).toBe(60 * 60 * 24) // 24 hours
  })

  it('configures cookie cache in session', () => {
    const config = mockBetterAuth.mock.calls[0][0]

    expect(config.session.cookieCache).toBeDefined()
    expect(config.session.cookieCache.enabled).toBe(true)
    expect(config.session.cookieCache.maxAge).toBe(300)
  })

  it('configures rate limiting', () => {
    const config = mockBetterAuth.mock.calls[0][0]

    expect(config.rateLimit).toBeDefined()
    expect(config.rateLimit.enabled).toBe(true)
    expect(config.rateLimit.window).toBe(60)
    expect(config.rateLimit.max).toBe(100)
  })

  it('configures custom rate limit rules for sign-in endpoint', () => {
    const config = mockBetterAuth.mock.calls[0][0]

    expect(config.rateLimit.customRules).toBeDefined()
    expect(config.rateLimit.customRules['/api/auth/sign-in/email']).toEqual({
      window: 60,
      max: 5,
    })
  })

  it('configures rate limit storage as database', () => {
    const config = mockBetterAuth.mock.calls[0][0]

    expect(config.rateLimit.storage).toBe('database')
  })

  it('passes the database instance to betterAuth', () => {
    const config = mockBetterAuth.mock.calls[0][0]

    expect(config.database).toBeDefined()
  })

  it('sets minPasswordLength to 8', () => {
    const config = mockBetterAuth.mock.calls[0][0]

    expect(config.emailAndPassword.minPasswordLength).toBe(8)
  })

  it('passes the secret from environment variable', () => {
    const config = mockBetterAuth.mock.calls[0][0]

    expect(config.secret).toBe(process.env.BETTER_AUTH_SECRET)
  })

  it('throws if BETTER_AUTH_SECRET is not set', () => {
    const originalSecret = process.env.BETTER_AUTH_SECRET
    delete process.env.BETTER_AUTH_SECRET

    jest.resetModules()

    expect(() => {
      require('../auth')
    }).toThrow('BETTER_AUTH_SECRET environment variable is required')

    process.env.BETTER_AUTH_SECRET = originalSecret
  })
})
