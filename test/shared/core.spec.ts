import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import core from '../../shared/utils/core'

describe('shared/utils/core', () => {
  beforeEach(async () => {
    await core.remove('foo')
    await core.remove('settings')
  })

  afterEach(async () => {
    await core.remove('foo')
    await core.remove('settings')
  })

  it('sets and gets values', async () => {
    await core.set('foo', { a: 1 })
    const val = await core.get('foo')
    expect(val).toEqual({ a: 1 })
  })

  it('supports nested set/get using colon separator', async () => {
    await core.setNested('settings:theme', 'dark')
    const v = await core.getNested('settings:theme')
    expect(v).toBe('dark')

    const root = await core.get('settings')
    expect(root).toHaveProperty('theme', 'dark')
  })
})
