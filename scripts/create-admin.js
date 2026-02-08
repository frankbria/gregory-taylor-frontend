#!/usr/bin/env node

/**
 * Create the admin user for the site.
 *
 * Usage:
 *   ADMIN_PASSWORD=<password> node scripts/create-admin.js <email>
 *   node scripts/create-admin.js <email> <password>
 *
 * Requires BETTER_AUTH_SECRET in .env.local
 */

import { auth } from '../lib/auth.js'

const email = process.argv[2]
const password = process.env.ADMIN_PASSWORD || process.argv[3]

if (!email) {
  console.error('Usage: ADMIN_PASSWORD=<password> node scripts/create-admin.js <email>')
  console.error('   or: node scripts/create-admin.js <email> <password>')
  process.exit(1)
}

if (!password) {
  console.error('Password required via ADMIN_PASSWORD env var or CLI argument')
  process.exit(1)
}

if (password.length < 8) {
  console.error('Password must be at least 8 characters')
  process.exit(1)
}

async function createAdmin() {
  try {
    const newUser = await auth.api.createUser({
      body: {
        email,
        password,
        name: 'Admin',
        role: 'admin',
      },
    })

    if (newUser) {
      console.log(`Admin user created successfully: ${email}`)
    } else {
      console.error('Failed to create admin user')
      process.exit(1)
    }
  } catch (error) {
    if (error.message?.includes('already exists') || error.status === 409) {
      console.log(`User with email ${email} already exists`)
      process.exit(0)
    } else {
      console.error('Error creating admin:', error.message || error)
      process.exit(1)
    }
  }
}

createAdmin()
