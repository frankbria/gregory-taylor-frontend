#!/usr/bin/env node

/**
 * Create the admin user for the site.
 *
 * Usage:
 *   node scripts/create-admin.js <email> <password>
 *   node scripts/create-admin.js admin@example.com MySecurePassword123
 *
 * Requires BETTER_AUTH_SECRET in .env.local
 */

import { auth } from '../lib/auth.js'

const [email, password] = process.argv.slice(2)

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.js <email> <password>')
  process.exit(1)
}

if (password.length < 8) {
  console.error('Password must be at least 8 characters')
  process.exit(1)
}

async function createAdmin() {
  try {
    const ctx = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: 'Admin',
      },
    })

    if (ctx.user) {
      console.log(`Admin user created successfully: ${ctx.user.email}`)
    } else {
      console.error('Failed to create admin user')
      process.exit(1)
    }
  } catch (error) {
    if (error.message?.includes('already exists') || error.status === 409) {
      console.error(`User with email ${email} already exists`)
    } else {
      console.error('Error creating admin:', error.message || error)
    }
    process.exit(1)
  }
}

createAdmin()
