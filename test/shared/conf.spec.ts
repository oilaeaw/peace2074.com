import { describe, it, expect } from 'vitest'
import { conf } from '../../shared/utils/conf'

describe('shared/utils/conf - reactive basics', () => {
  it('subscribe receives initial snapshot and updates on set', () => {
    let calls = 0
    const key = `__test_key_${Date.now()}`

    const unsub = conf.subscribe((s) => {
      calls++
      if (calls === 1) {
        // initial call: snapshot exists
        expect(s).toBeDefined()
        // the test key shouldn't exist initially
        expect((s as any)[key]).toBeUndefined()
        // trigger an update
        conf.set(key, 123)
        return
      }

      if (calls === 2) {
        // after update we should see the new value
        expect((s as any)[key]).toBe(123)
        // cleanup
        conf.set(key, undefined)
        unsub()
      }
    })

    // subscription should have been called at least once synchronously
    expect(calls).toBeGreaterThanOrEqual(1)
  })

  it('nested set/get works with colon path', () => {
    const k = `nested:${Date.now()}`
    conf.set(k, 'hello')
  expect(conf.get(k)).toBe('hello')
    // cleanup
    conf.set(k, undefined)
  })
})
