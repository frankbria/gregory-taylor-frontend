import { betterAuth } from 'better-auth'
import { admin } from 'better-auth/plugins'
import Database from 'better-sqlite3'
import path from 'path'

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET environment variable is required')
}

const dbPath =
  process.env.BETTER_AUTH_DB_PATH || path.join(process.cwd(), 'auth.db')
const db = new Database(dbPath)

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: db,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // refresh session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 300, // 5 minutes
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      '/api/auth/sign-in/email': {
        window: 60,
        max: 5,
      },
    },
    storage: 'database',
  },
  plugins: [admin()],
})
