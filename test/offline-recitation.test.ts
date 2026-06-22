import { describe, expect, it } from 'vitest'
import { filterVerifiedOfflineSuras } from '../src/composables/useOfflineRecitation'

describe('filterVerifiedOfflineSuras', () => {
  it('returns empty set when metadata candidates have no cache blobs', async () => {
    const staleRemoved: number[] = []

    const result = await filterVerifiedOfflineSuras(
      'regular',
      [1, 2, 3],
      async () => false,
      async (suraId) => {
        staleRemoved.push(suraId)
      }
    )

    expect(result.size).toBe(0)
    expect(staleRemoved).toEqual([1, 2, 3])
  })

  it('returns only suras with verified verse 1 in cache', async () => {
    const cachedSuras = new Set([1, 3])
    const staleRemoved: number[] = []

    const result = await filterVerifiedOfflineSuras(
      'regular',
      [1, 2, 3],
      async (suraId) => cachedSuras.has(suraId),
      async (suraId) => {
        staleRemoved.push(suraId)
      }
    )

    expect([...result]).toEqual([1, 3])
    expect(staleRemoved).toEqual([2])
  })
})
