import { defineEventHandler } from 'h3'
import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

interface Deploy {
    version: string
    date: string
    message: string
    icon?: string
    color?: string
    features?: string[]
    fixes?: string[]
    chores?: string[]
}

export default defineEventHandler(async () => {
    try {
        // Try multiple paths: bundled alongside the route file, then project root fallbacks
        const candidates = [
            join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', '..', 'CHANGELOG.md'), // project root from server/routes/
            join(dirname(fileURLToPath(import.meta.url)), 'CHANGELOG.md'),   // bundled next to this file
            join(process.cwd(), 'CHANGELOG.md'),                             // cwd = nitro-api in some envs
            join(process.cwd(), '..', '..', 'CHANGELOG.md'),                 // cwd = nitro-api, up 2
        ]

        let content = ''
        for (const p of candidates) {
            try {
                content = await readFile(p, 'utf-8')
                break
            } catch { /* try next */ }
        }

        if (!content) {
            console.error('CHANGELOG.md not found in any candidate path:', candidates)
            return { ok: false, deploys: [] }
        }

        const deploys: Deploy[] = []
        const versionRegex = /## (\d+\.\d+\.\d+) \((\d{4}-\d{2}-\d{2})\)/g
        const sections = content.split(/(?=## \d+\.\d+\.\d+)/)

        for (const section of sections) {
            if (!section.trim()) continue

            const versionMatch = section.match(/## (\d+\.\d+\.\d+) \((\d{4}-\d{2}-\d{2})\)/)
            if (!versionMatch) continue

            const version = versionMatch[1]
            const dateStr = versionMatch[2]
            const date = new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })

            // Extract features
            const featuresMatch = section.match(/### Features\n\n([\s\S]*?)(?=\n### |\n## |$)/)
            const features = featuresMatch
                ? featuresMatch[1]
                    .split('\n')
                    .filter(line => line.trim().startsWith('-'))
                    .map(line => line.replace(/^-\s*/, '').trim())
                : []

            // Extract fixes
            const fixesMatch = section.match(/### Bug Fixes\n\n([\s\S]*?)(?=\n### |\n## |$)/)
            const fixes = fixesMatch
                ? fixesMatch[1]
                    .split('\n')
                    .filter(line => line.trim().startsWith('-'))
                    .map(line => line.replace(/^-\s*/, '').trim())
                : []

            // Extract chores  
            const choresMatch = section.match(/### Chores\n\n([\s\S]*?)(?=\n### |\n## |$)/)
            const chores = choresMatch
                ? choresMatch[1]
                    .split('\n')
                    .filter(line => line.trim().startsWith('-'))
                    .map(line => line.replace(/^-\s*/, '').trim())
                : []

            // Determine icon and color based on features
            let icon = 'rocket_launch'
            let color = 'secondary'
            let message = 'Release update'

            if (features.length > 0) {
                const firstFeature = features[0].toLowerCase()
                if (firstFeature.includes('auto-continue') || firstFeature.includes('quran')) {
                    icon = 'auto_awesome'
                    color = 'positive'
                    message = features[0].split('-')[0].trim()
                } else if (firstFeature.includes('sign up') || firstFeature.includes('registration')) {
                    icon = 'person_add'
                    color = 'secondary'
                    message = 'Improved user registration'
                } else if (firstFeature.includes('ramadan') || firstFeature.includes('campaign')) {
                    icon = 'campaign'
                    color = 'amber'
                    message = 'Ramadan campaign features'
                } else if (firstFeature.includes('locale') || firstFeature.includes('turkish') || firstFeature.includes('translation')) {
                    icon = 'translate'
                    color = 'info'
                    message = 'Turkish locale and Quran improvements'
                }
            }

            deploys.push({
                version,
                date,
                message,
                icon,
                color,
                features: features.length > 0 ? features : undefined,
                fixes: fixes.length > 0 ? fixes : undefined,
                chores: chores.length > 0 ? chores : undefined,
            })
        }

        return {
            ok: true,
            deploys
        }
    } catch (error: any) {
        console.error('Failed to read changelog:', error)
        return {
            ok: false,
            error: error?.message || 'Failed to read changelog',
            deploys: []
        }
    }
})
