import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useQ2P } from '@app/store/q2p.pinia'

describe('Quran to Pixel Store (q2p.pinia.ts)', () => {
  // Before each test, create a new Pinia instance to ensure tests are isolated.
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with the complete Quran book and a default index', () => {
    const q2p = useQ2P()

    // It should load all 114 suras from the JSON data.
    expect(q2p.Book).toHaveLength(114)
    // The initial index is 0.
    expect(q2p.Index).toBe(0)
    // The suraList getter should return a formatted list of all suras.
    expect(q2p.suraList).toHaveLength(114)
    expect(q2p.suraList[0]).toHaveProperty('name', 'Al-Fatihah')
  })

  it('`init` action sets the index to 1 by default', () => {
    const q2p = useQ2P()
    q2p.init()
    expect(q2p.Index).toBe(1)
    expect(q2p.suraIndex).toBe(1)
  })

  it('`init` action sets the index to the provided value', () => {
    const q2p = useQ2P()
    q2p.init(42)
    expect(q2p.Index).toBe(42)
  })

  it('`setIndex` action updates the current sura index', () => {
    const q2p = useQ2P()
    q2p.setIndex(18)
    expect(q2p.Index).toBe(18)
    expect(q2p.suraIndex).toBe(18)
  })

  it('`currentSura` getter returns the correct sura based on the index', () => {
    const q2p = useQ2P()

    // When index is 0 (initial), it should fall back to the first sura.
    expect(q2p.currentSura.id).toBe(1)
    expect(q2p.currentSura.name).toBe('Al-Fatihah')

    // Set index to a specific sura.
    q2p.setIndex(18)
    expect(q2p.currentSura.id).toBe(18)
    expect(q2p.currentSura.name).toBe('Al-Kahf')

    // Set index to the last sura.
    q2p.setIndex(114)
    expect(q2p.currentSura.id).toBe(114)
    expect(q2p.currentSura.name).toBe('An-Nas')
  })

  it('`setLegend` action updates the color for a specific letter', () => {
    const q2p = useQ2P()
    const letterToChange = 'ب'
    const newColor = '#ff0000'

    const originalLegendEntry = q2p.LLegend.find(l => l.letter === letterToChange)
    expect(originalLegendEntry?.color).not.toBe(newColor)

    // Perform the action
    q2p.setLegend({ letter: letterToChange, color: newColor, value: 2 })

    const updatedLegendEntry = q2p.LLegend.find(l => l.letter === letterToChange)
    expect(updatedLegendEntry?.color).toBe(newColor)
  })
})
