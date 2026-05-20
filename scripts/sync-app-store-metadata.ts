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
const metadataRoot = path.join(repoRoot, 'ios', 'fastlane', 'metadata')
const defaultDir = path.join(metadataRoot, 'default')
const primaryLocaleDir = path.join(metadataRoot, 'en-US')
const localeSpecificUrlPaths = {
    'privacy_url.txt': '/privacy',
    'support_url.txt': '/contact',
    'marketing_url.txt': '/',
} as const
const appLocaleByStoreLocale: Record<AppStoreLocale, string> = {
    'en-US': 'en',
    'ar-SA': 'ar',
    'de-DE': 'de',
    'es-ES': 'es',
    ru: 'ru',
    he: 'he',
    it: 'it',
    tr: 'tr',
}

type LocaleSpecificUrlFile = keyof typeof localeSpecificUrlPaths

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

function isLocaleSpecificUrlFile(fileName: string): fileName is LocaleSpecificUrlFile {
    return fileName in localeSpecificUrlPaths
}

function buildLocalizedUrl(
    fileName: LocaleSpecificUrlFile,
    locale: AppStoreLocale,
    sourceContent: string,
) {
    const trimmedSource = sourceContent.trim()
    const localizedUrl = new URL(trimmedSource)
    const localizedRoutePath = localeSpecificUrlPaths[fileName]
    const appLocale = appLocaleByStoreLocale[locale]

    localizedUrl.pathname = localizedRoutePath === '/'
        ? `/${appLocale}`
        : `/${appLocale}${localizedRoutePath}`
    localizedUrl.search = ''
    localizedUrl.hash = ''

    return sourceContent.endsWith('\n')
        ? `${localizedUrl.toString()}\n`
        : localizedUrl.toString()
}

function getLocalizedContent(
    locale: AppStoreLocale | 'default',
    fileName: string,
    sourceContent: string,
) {
    if (isLocalizableMetadataFile(fileName)) {
        if (locale === 'default') {
            return localizedMetadata['en-US'][fileName]
        }

        return localizedMetadata[locale][fileName]
    }

    if (!isLocaleSpecificUrlFile(fileName) || locale === 'default') {
        return null
    }

    return buildLocalizedUrl(fileName, locale, sourceContent)
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
            const sourceContent = await getSourceContent(fileName)
            const localizedContent = getLocalizedContent(locale, fileName, sourceContent)
            const desiredContent = localizedContent ?? sourceContent
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