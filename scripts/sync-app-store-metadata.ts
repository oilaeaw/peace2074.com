import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const metadataRoot = path.join(repoRoot, 'ios', 'App', 'fastlane', 'metadata')
const defaultDir = path.join(metadataRoot, 'default')
const primaryLocaleDir = path.join(metadataRoot, 'en-US')

const locales = ['en-US', 'ar-SA', 'de-DE', 'es-ES', 'ru', 'he', 'it', 'tr'] as const

async function listTxtFiles(dirPath: string) {
    const entries = await readdir(dirPath, { withFileTypes: true })
    return entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.txt'))
        .map((entry) => entry.name)
        .sort()
}

async function ensureDirectory(dirPath: string) {
    await mkdir(dirPath, { recursive: true })
}

async function exists(filePath: string) {
    try {
        await stat(filePath)
        return true
    } catch {
        return false
    }
}

async function getSourceContent(fileName: string) {
    const defaultPath = path.join(defaultDir, fileName)
    if (await exists(defaultPath)) {
        return readFile(defaultPath, 'utf8')
    }

    const primaryLocalePath = path.join(primaryLocaleDir, fileName)
    if (await exists(primaryLocalePath)) {
        return readFile(primaryLocalePath, 'utf8')
    }

    throw new Error(`No source metadata found for ${fileName}`)
}

async function main() {
    const defaultFiles = await listTxtFiles(defaultDir)
    const primaryLocaleFiles = await listTxtFiles(primaryLocaleDir)
    const fileNames = Array.from(new Set([...defaultFiles, ...primaryLocaleFiles])).sort()

    if (fileNames.length === 0) {
        throw new Error('No metadata files found in default/ or en-US/')
    }

    let createdCount = 0

    for (const locale of locales) {
        const localeDir = path.join(metadataRoot, locale)
        await ensureDirectory(localeDir)

        for (const fileName of fileNames) {
            const targetPath = path.join(localeDir, fileName)
            if (await exists(targetPath)) {
                continue
            }

            const content = await getSourceContent(fileName)
            await writeFile(targetPath, content)
            createdCount += 1
            console.log(`created ${path.relative(repoRoot, targetPath)}`)
        }
    }

    if (createdCount === 0) {
        console.log('App Store metadata already synced for all locales')
        return
    }

    console.log(`Synced App Store metadata files: ${createdCount}`)
}

await main()