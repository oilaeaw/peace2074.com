import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBookmarksStore } from '@app/store/bookmarks.pinia'
import { useAuthStore } from '@app/store/auth.pinia'
import type { UserT } from '@shared/types'

// Mock the API services used by the bookmarks store
const mockGetBookmarks = vi.fn()
const mockCreateBookmark = vi.fn()
const mockDeleteBookmark = vi.fn()
vi.mock('@app/store/services/index', () => ({
  getBookmarks: mockGetBookmarks,
  createBookmarkService: mockCreateBookmark,
  deleteBookmarkService: mockDeleteBookmark,
  updateBookmarkService: vi.fn(),
}))

// Mock the core utility for local storage
const mockCore = {
  get: vi.fn(),
  set: vi.fn(),
}
vi.mock('@shared/utils/core', () => ({
  default: mockCore,
}))

describe('Bookmarks Store (bookmarks.pinia.ts)', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test to ensure isolation
    setActivePinia(createPinia())
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  describe('Guest User', () => {
    it('initializes by loading bookmarks from local storage', async () => {
      const guestBookmarks = ['1:1', '2:5']
      mockCore.get.mockResolvedValue(JSON.stringify(guestBookmarks))

      const bookmarksStore = useBookmarksStore()
      await bookmarksStore.init()

      expect(mockCore.get).toHaveBeenCalledWith(expect.stringContaining('guest_bookmarks_v1_'))
      expect(bookmarksStore.bookmarks).toEqual(guestBookmarks)
    })

    it('creates a bookmark and saves it to local storage', async () => {
      const bookmarksStore = useBookmarksStore()
      bookmarksStore.bookmarks = ['1:1'] // Initial state

      await bookmarksStore.createBookmark('2:5')

      expect(bookmarksStore.bookmarks).toContain('2:5')
      // Check that it attempts to save the updated list
      expect(mockCore.set).toHaveBeenCalledWith(
        expect.stringContaining('guest_bookmarks_v1_'),
        ['1:1', '2:5'],
      )
    })

    it('deletes a bookmark and saves the change to local storage', async () => {
      const bookmarksStore = useBookmarksStore()
      bookmarksStore.bookmarks = ['1:1', '2:5'] // Initial state

      await bookmarksStore.deleteBookmark('1:1')

      expect(bookmarksStore.bookmarks).not.toContain('1:1')
      expect(bookmarksStore.bookmarks).toContain('2:5')
      // Check that it attempts to save the updated list
      expect(mockCore.set).toHaveBeenCalledWith(
        expect.stringContaining('guest_bookmarks_v1_'),
        ['2:5'],
      )
    })
  })

  describe('Authenticated User', () => {
    const mockUser: UserT = { id: 'user-123', username: 'testuser', email: 'test@example.com', role: 'user' }

    beforeEach(() => {
      // Set the user as authenticated for these tests
      const authStore = useAuthStore()
      authStore.setUser(mockUser)
    })

    it('initializes by fetching bookmarks from the API', async () => {
      const serverBookmarks = [{ _id: 'bm-1', bookmark: '10:1' }]
      mockGetBookmarks.mockResolvedValue(serverBookmarks)

      const bookmarksStore = useBookmarksStore()
      await bookmarksStore.init()

      expect(mockGetBookmarks).toHaveBeenCalled()
      expect(bookmarksStore.bookmarks).toEqual(serverBookmarks)
    })

    it('creates a bookmark via the API and refreshes the list', async () => {
      const newBookmark = { _id: 'bm-2', bookmark: '20:2' }
      mockCreateBookmark.mockResolvedValue(newBookmark)
      // Mock the fetch call that happens after creation
      mockGetBookmarks.mockResolvedValue([newBookmark])

      const bookmarksStore = useBookmarksStore()
      await bookmarksStore.createBookmark('20:2')

      expect(mockCreateBookmark).toHaveBeenCalledWith({ bookmark: '20:2' })
      // It should call fetchBookmarks after a successful creation
      expect(mockGetBookmarks).toHaveBeenCalled()
      expect(bookmarksStore.bookmarks).toContainEqual(newBookmark)
    })

    it('falls back to local add if API fails on create', async () => {
      mockCreateBookmark.mockRejectedValue(new Error('Server Down'))

      const bookmarksStore = useBookmarksStore()
      await bookmarksStore.createBookmark('30:3')

      // The bookmark should be added locally as a string
      expect(bookmarksStore.bookmarks).toContain('30:3')
      // fetchBookmarks should not be called on failure
      expect(mockGetBookmarks).not.toHaveBeenCalled()
    })

    it('deletes a bookmark via the API using its _id', async () => {
      const initialBookmarks = [
        { _id: 'bm-1', bookmark: '10:1' },
        { _id: 'bm-2', bookmark: '20:2' },
      ]
      mockDeleteBookmark.mockResolvedValue({ ok: true })

      const bookmarksStore = useBookmarksStore()
      bookmarksStore.bookmarks = initialBookmarks

      await bookmarksStore.deleteBookmark('bm-1')

      // It should call the service with the correct MongoDB _id
      expect(mockDeleteBookmark).toHaveBeenCalledWith('bm-1')
      // The local state should be updated immediately
      expect(bookmarksStore.bookmarks).toEqual([{ _id: 'bm-2', bookmark: '20:2' }])
    })

    it('does not delete if the bookmark _id is not found', async () => {
      const bookmarksStore = useBookmarksStore()
      bookmarksStore.bookmarks = [{ _id: 'bm-1', bookmark: '10:1' }]

      await bookmarksStore.deleteBookmark('non-existent-id')

      // The delete service should not be called
      expect(mockDeleteBookmark).not.toHaveBeenCalled()
      // The local state should remain unchanged
      expect(bookmarksStore.bookmarks).toHaveLength(1)
    })
  })
})