import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
    appStoreLocales,
    localizableMetadataFiles,
    localizedMetadata,
    type AppStoreLocale,
    type LocalizableMetadataFile,
} from './app-store-metadata.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const metadataRoot = path.join(repoRoot, 'ios', 'App', 'fastlane', 'metadata')
const defaultDir = path.join(metadataRoot, 'default')
const primaryLocaleDir = path.join(metadataRoot, 'en-US')

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

async function readIfExists(filePath: string) {
    if (!(await exists(filePath))) {
        return null
    }

    return readFile(filePath, 'utf8')
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

function isLocalizableMetadataFile(fileName: string): fileName is LocalizableMetadataFile {
    return localizableMetadataFiles.includes(fileName as LocalizableMetadataFile)
}

function getLocalizedContent(
    locale: AppStoreLocale | 'default',
    fileName: string,
) {
    if (!isLocalizableMetadataFile(fileName)) {
        return null
    }

    if (locale === 'default') {
        return localizedMetadata['en-US'][fileName]
    }

    return localizedMetadata[locale][fileName]
}

async function main() {
    const defaultFiles = await listTxtFiles(defaultDir)
    const primaryLocaleFiles = await listTxtFiles(primaryLocaleDir)
    const fileNames = Array.from(
        new Set([...defaultFiles, ...primaryLocaleFiles, ...localizableMetadataFiles]),
    ).sort()

    if (fileNames.length === 0) {
        throw new Error('No metadata files found in default/ or en-US/')
    }

    let writtenCount = 0
    const targetDirectories: Array<AppStoreLocale | 'default'> = ['default', ...appStoreLocales]

    for (const locale of targetDirectories) {
        const localeDir = path.join(metadataRoot, locale)
        await ensureDirectory(localeDir)

        for (const fileName of fileNames) {
            const targetPath = path.join(localeDir, fileName)
            const localizedContent = getLocalizedContent(locale, fileName)
            const desiredContent = localizedContent ?? await getSourceContent(fileName)
            const currentContent = await readIfExists(targetPath)

            if (currentContent === desiredContent) {
                continue
            }

            await writeFile(targetPath, desiredContent)
            writtenCount += 1

            const action = currentContent === null ? 'created' : 'updated'
            console.log(`${action} ${path.relative(repoRoot, targetPath)}`)
        }
    }

    if (writtenCount === 0) {
        console.log('App Store metadata already synced for all locales')
        return
    }

    console.log(`Synced App Store metadata files: ${writtenCount}`)
}

await main()