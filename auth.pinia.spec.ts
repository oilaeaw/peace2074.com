import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@app/store/auth.pinia'
import type { UserT } from '@shared/types'
import { CaslActionE, CaslSubjectE } from '@shared/types'

describe('Auth Store (auth.pinia.ts)', () => {
  // Before each test, create a new Pinia instance to ensure tests are isolated.
  // This is a standard practice for testing Pinia stores.
  beforeEach(() => {
    setActivePinia(createPinia())
    // Mock fetch for the logout action
    global.fetch = vi.fn()
  })

  it('initializes with a logged-out state', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBe(null)
    expect(auth.savedName).toBe(null)
    // Check for some default guest permissions
    expect(auth.permissions).toContainEqual({
      action: CaslActionE.READ,
      subject: CaslSubjectE.POST,
    })
  })

  it('sets user state on login', () => {
    const auth = useAuthStore()
    const mockUser: UserT = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
    }

    auth.setUser(mockUser)

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user).toEqual(mockUser)
    expect(auth.savedName).toBe('testuser')
  })

  it('updates permissions based on user role', () => {
    const auth = useAuthStore()

    // Test with an 'editor'
    const editorUser: UserT = { id: 'e1', username: 'editor', email: 'e@e.com', role: 'editor' }
    auth.setUser(editorUser)
    expect(auth.permissions).toContainEqual({
      action: CaslActionE.UPDATE,
      subject: CaslSubjectE.POST,
    })

    // Test with an 'admin'
    const adminUser: UserT = { id: 'a1', username: 'admin', email: 'a@a.com', role: 'admin' }
    auth.setUser(adminUser)
    expect(auth.permissions).toContainEqual({
      action: CaslActionE.MANAGE,
      subject: CaslSubjectE.ALL,
    })
  })

  it('resets state on logout', async () => {
    const auth = useAuthStore()
    const mockUser: UserT = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
    }

    // First, log the user in
    auth.setUser(mockUser)
    expect(auth.isAuthenticated).toBe(true)

    // Then, log out
    await auth.logout()

    // Verify the state is reset
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBe(null)
    expect(auth.savedName).toBe(null)

    // Verify permissions are reset to default
    expect(auth.permissions).not.toContainEqual({
      action: CaslActionE.MANAGE,
      subject: CaslSubjectE.ALL,
    })
  })
})
