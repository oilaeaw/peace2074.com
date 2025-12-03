import fs from 'node:fs'
import path from 'node:path'

function flatten(obj, prefix = '') {
  const res = {}
  for (const k of Object.keys(obj)) {
    const val = obj[k]
    const key = prefix ? `${prefix}.${k}` : k
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(res, flatten(val, key))
    }
    else {
      res[key] = true
    }
  }
  return res
}

const baseDir = path.resolve(process.cwd(), 'app', 'locale')
const en = JSON.parse(fs.readFileSync(path.join(baseDir, 'en.json'), 'utf8'))
const ar = JSON.parse(fs.readFileSync(path.join(baseDir, 'ar.json'), 'utf8'))
const de = JSON.parse(fs.readFileSync(path.join(baseDir, 'de.json'), 'utf8'))

const enKeys = Object.keys(flatten(en))
const arKeys = Object.keys(flatten(ar))
const deKeys = Object.keys(flatten(de))

function missing(fromKeys, toKeys) {
  return fromKeys.filter(k => !toKeys.includes(k))
}

console.log('Total keys in en:', enKeys.length)
console.log('Total keys in ar:', arKeys.length)
console.log('Total keys in de:', deKeys.length)

const missingInAr = missing(enKeys, arKeys)
const missingInDe = missing(enKeys, deKeys)

console.log('\nKeys missing in ar.json compared to en.json:', missingInAr.length)
missingInAr.slice(0, 200).forEach(k => console.log('  -', k))

console.log('\nKeys missing in de.json compared to en.json:', missingInDe.length)
missingInDe.slice(0, 200).forEach(k => console.log('  -', k))
