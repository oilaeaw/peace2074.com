/**
 * Red-Black Tree implementation for Quran verse storage
 * Provides O(log n) lookup, insertion, and traversal
 * 
 * Each verse has a unique ID: `{suraNumber}:{ayaNumber}` (e.g., "2:255")
 * The ID is sortable for range queries and traversal
 */

import { loadPublicQuranData } from './quran-data-loader'

// Node colors
const RED = true
const BLACK = false

export interface QuranVerse {
    suraNumber: number
    ayaNumber: number
    text: string
    id: string // Format: "suraNumber:ayaNumber"
}

interface RBNode {
    key: string // The unique ID
    verse: QuranVerse
    color: boolean
    left: RBNode | null
    right: RBNode | null
    parent: RBNode | null
}

/**
 * Generate a unique sortable ID for a verse
 * Pads numbers to ensure correct string sorting: "002:005"
 */
export function createVerseId(suraNumber: number, ayaNumber: number): string {
    const sura = String(suraNumber).padStart(3, '0')
    const aya = String(ayaNumber).padStart(3, '0')
    return `${sura}:${aya}`
}

/**
 * Parse a verse ID back to sura and aya numbers
 */
export function parseVerseId(id: string): { suraNumber: number; ayaNumber: number } {
    const [sura, aya] = id.split(':').map(Number)
    return { suraNumber: sura, ayaNumber: aya }
}

/**
 * Create a QuranVerse object with generated ID
 */
export function createVerse(suraNumber: number, ayaNumber: number, text: string): QuranVerse {
    return {
        suraNumber,
        ayaNumber,
        text,
        id: createVerseId(suraNumber, ayaNumber),
    }
}

/**
 * Red-Black Tree for Quran verses
 */
export class QuranVerseTree {
    private root: RBNode | null = null
    private size = 0

    /**
     * Create a new node
     */
    private createNode(verse: QuranVerse): RBNode {
        return {
            key: verse.id,
            verse,
            color: RED, // New nodes are always red
            left: null,
            right: null,
            parent: null,
        }
    }

    /**
     * Left rotate around node x
     */
    private rotateLeft(x: RBNode): void {
        const y = x.right!
        x.right = y.left
        if (y.left) y.left.parent = x
        y.parent = x.parent
        if (!x.parent) {
            this.root = y
        } else if (x === x.parent.left) {
            x.parent.left = y
        } else {
            x.parent.right = y
        }
        y.left = x
        x.parent = y
    }

    /**
     * Right rotate around node x
     */
    private rotateRight(x: RBNode): void {
        const y = x.left!
        x.left = y.right
        if (y.right) y.right.parent = x
        y.parent = x.parent
        if (!x.parent) {
            this.root = y
        } else if (x === x.parent.right) {
            x.parent.right = y
        } else {
            x.parent.left = y
        }
        y.right = x
        x.parent = y
    }

    /**
     * Fix red-black properties after insertion
     */
    private insertFixup(z: RBNode): void {
        while (z.parent && z.parent.color === RED) {
            if (z.parent === z.parent.parent?.left) {
                const y = z.parent.parent.right
                if (y && y.color === RED) {
                    // Case 1: Uncle is red
                    z.parent.color = BLACK
                    y.color = BLACK
                    z.parent.parent.color = RED
                    z = z.parent.parent
                } else {
                    if (z === z.parent.right) {
                        // Case 2: Uncle is black, z is right child
                        z = z.parent
                        this.rotateLeft(z)
                    }
                    // Case 3: Uncle is black, z is left child
                    z.parent!.color = BLACK
                    z.parent!.parent!.color = RED
                    this.rotateRight(z.parent!.parent!)
                }
            } else {
                const y = z.parent.parent?.left
                if (y && y.color === RED) {
                    z.parent.color = BLACK
                    y.color = BLACK
                    z.parent.parent!.color = RED
                    z = z.parent.parent!
                } else {
                    if (z === z.parent.left) {
                        z = z.parent
                        this.rotateRight(z)
                    }
                    z.parent!.color = BLACK
                    z.parent!.parent!.color = RED
                    this.rotateLeft(z.parent!.parent!)
                }
            }
        }
        this.root!.color = BLACK
    }

    /**
     * Insert a verse into the tree
     * Returns true if inserted, false if already exists
     */
    insert(verse: QuranVerse): boolean {
        const node = this.createNode(verse)
        let y: RBNode | null = null
        let x = this.root

        // Find insertion point
        while (x) {
            y = x
            if (node.key < x.key) {
                x = x.left
            } else if (node.key > x.key) {
                x = x.right
            } else {
                // Key already exists, update verse
                x.verse = verse
                return false
            }
        }

        node.parent = y
        if (!y) {
            this.root = node
        } else if (node.key < y.key) {
            y.left = node
        } else {
            y.right = node
        }

        this.size++
        this.insertFixup(node)
        return true
    }

    /**
     * Find a verse by ID
     * O(log n) time complexity
     */
    find(id: string): QuranVerse | null {
        let node = this.root
        while (node) {
            if (id < node.key) {
                node = node.left
            } else if (id > node.key) {
                node = node.right
            } else {
                return node.verse
            }
        }
        return null
    }

    /**
     * Find a verse by sura and aya number
     */
    findVerse(suraNumber: number, ayaNumber: number): QuranVerse | null {
        return this.find(createVerseId(suraNumber, ayaNumber))
    }

    /**
     * Get all verses for a specific sura
     */
    getSura(suraNumber: number): QuranVerse[] {
        const prefix = String(suraNumber).padStart(3, '0') + ':'
        const results: QuranVerse[] = []
        this.inorderTraversal(this.root, (verse) => {
            if (verse.id.startsWith(prefix)) {
                results.push(verse)
            }
        })
        return results
    }

    /**
     * Get verses in a range (inclusive)
     */
    getRange(startId: string, endId: string): QuranVerse[] {
        const results: QuranVerse[] = []
        this.inorderTraversal(this.root, (verse) => {
            if (verse.id >= startId && verse.id <= endId) {
                results.push(verse)
            }
        })
        return results
    }

    /**
     * In-order traversal (ascending order by ID)
     */
    private inorderTraversal(node: RBNode | null, callback: (verse: QuranVerse) => void): void {
        if (!node) return
        this.inorderTraversal(node.left, callback)
        callback(node.verse)
        this.inorderTraversal(node.right, callback)
    }

    /**
     * Get all verses in order
     */
    getAllVerses(): QuranVerse[] {
        const results: QuranVerse[] = []
        this.inorderTraversal(this.root, (verse) => results.push(verse))
        return results
    }

    /**
     * Get the total number of verses
     */
    getSize(): number {
        return this.size
    }

    /**
     * Check if tree is empty
     */
    isEmpty(): boolean {
        return this.root === null
    }

    /**
     * Get the minimum (first) verse
     */
    getMin(): QuranVerse | null {
        if (!this.root) return null
        let node = this.root
        while (node.left) node = node.left
        return node.verse
    }

    /**
     * Get the maximum (last) verse
     */
    getMax(): QuranVerse | null {
        if (!this.root) return null
        let node = this.root
        while (node.right) node = node.right
        return node.verse
    }

    /**
     * Clear all verses from the tree
     */
    clear(): void {
        this.root = null
        this.size = 0
    }

    /**
     * Load verses from Quran JSON data
     * Expects format: { "1": [{ chapter, verse, text }, ...], "2": [...], ... }
     */
    loadFromQuranData(data: Record<string, Array<{ chapter: number; verse: number; text: string }>>): void {
        for (const suraId of Object.keys(data).sort((a, b) => Number(a) - Number(b))) {
            const verses = data[suraId]
            for (const v of verses) {
                this.insert(createVerse(v.chapter, v.verse, v.text))
            }
        }
    }
}

// Singleton instance for app-wide use
let treeInstance: QuranVerseTree | null = null

/**
 * Get the singleton QuranVerseTree instance
 */
export function getQuranVerseTree(): QuranVerseTree {
    if (!treeInstance) {
        treeInstance = new QuranVerseTree()
    }
    return treeInstance
}

/**
 * Initialize the tree with Quran data (call once at app startup)
 */
export async function initQuranVerseTree(): Promise<QuranVerseTree> {
    const tree = getQuranVerseTree()
    if (tree.isEmpty()) {
        const quranData = await loadPublicQuranData()
        tree.loadFromQuranData(quranData as any)
    }
    return tree
}
