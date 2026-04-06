#!/usr/bin/env node

// Test local authentication without MongoDB
import fetch from 'node-fetch'

const NITRO_BASE = 'http://localhost:3000'

async function testLogin() {
  console.log('🔐 Testing local authentication...\n')

  try {
    const response = await fetch(`${NITRO_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'waelio',
        password: 'gLHVHtMcSY8Sum+H',
      }),
    })

    console.log('Status:', response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Login failed:', errorData)
      return
    }

    const data = await response.json()
    console.log('✅ Login successful!')
    console.log('User:', data.user)
    console.log('\nCookies:', response.headers.get('set-cookie'))
  } catch (err) {
    console.error('❌ Request failed:', err.message)
    console.error('\nThis usually means:')
    console.error('  1. Nitro API server is not running (pnpm dev)')
    console.error('  2. MongoDB is timing out and blocking the request')
    console.error('  3. Network connectivity issue')
  }
}

testLogin()
