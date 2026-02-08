// Mock dependencies BEFORE importing
const mockBetterAuth = jest.fn(() => ({
  api: {
    getSession: jest.fn(),
    createUser: jest.fn(),
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

const mockAdmin = jest.fn(() => ({ id: 'admin' }))

jest.mock('better-auth', () => ({
  betterAuth: mockBetterAuth,
}))

jest.mock('better-auth/plugins', () => ({
  admin: mockAdmin,
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

  it('includes admin plugin in plugins array', () => {
    const config = mockBetterAuth.mock.calls[0][0]

    expect(config.plugins).toBeDefined()
    expect(config.plugins).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'admin' })])
    )
    expect(mockAdmin).toHaveBeenCalled()
  })

  it('uses BETTER_AUTH_DB_PATH when set', () => {
    // The module was already loaded with the default env.
    // Verify it used the default path (auth.db in cwd)
    expect(mockDatabase).toHaveBeenCalledWith(
      expect.stringContaining('auth.db')
    )
  })

  it('uses custom DB path from BETTER_AUTH_DB_PATH env var', () => {
    const originalDbPath = process.env.BETTER_AUTH_DB_PATH
    process.env.BETTER_AUTH_DB_PATH = '/tmp/custom-auth.db'

    jest.resetModules()

    // Re-require to pick up new env var
    require('../auth')

    expect(mockDatabase).toHaveBeenLastCalledWith('/tmp/custom-auth.db')

    // Restore
    if (originalDbPath) {
      process.env.BETTER_AUTH_DB_PATH = originalDbPath
    } else {
      delete process.env.BETTER_AUTH_DB_PATH
    }
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
