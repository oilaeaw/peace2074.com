import fs from 'node:fs'
import path from 'node:path'

type LocaleNode = Record<string, unknown>
type FlattenedLocale = Record<string, true>

function isLocaleNode(value: unknown): value is LocaleNode {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function flatten(obj: LocaleNode, prefix = ''): FlattenedLocale {
    const result: FlattenedLocale = {}

    for (const [segment, value] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${segment}` : segment

        if (isLocaleNode(value)) {
            Object.assign(result, flatten(value, key))
            continue
        }

        result[key] = true
    }

    return result
}

function readLocaleFile(baseDir: string, fileName: string): LocaleNode {
    const filePath = path.join(baseDir, fileName)
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as LocaleNode
}

function missing(fromKeys: string[], toKeys: string[]): string[] {
    return fromKeys.filter((key) => !toKeys.includes(key))
}

const baseDir = path.resolve(process.cwd(), 'src', 'locale')
const en = readLocaleFile(baseDir, 'en.json')
const ar = readLocaleFile(baseDir, 'ar.json')
const de = readLocaleFile(baseDir, 'de.json')

const enKeys = Object.keys(flatten(en))
const arKeys = Object.keys(flatten(ar))
const deKeys = Object.keys(flatten(de))

const missingInAr = missing(enKeys, arKeys)
const missingInDe = missing(enKeys, deKeys)

console.log('Total keys in en:', enKeys.length)
console.log('Total keys in ar:', arKeys.length)
console.log('Total keys in de:', deKeys.length)

console.log('\nKeys missing in ar.json compared to en.json:', missingInAr.length)
missingInAr.slice(0, 200).forEach((key) => console.log('  -', key))

console.log('\nKeys missing in de.json compared to en.json:', missingInDe.length)
missingInDe.slice(0, 200).forEach((key) => console.log('  -', key))