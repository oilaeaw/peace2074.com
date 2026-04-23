import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type Args = {
    skipInstall: boolean
    skipBuild: boolean
    derivedDataPath: string
    deviceId?: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const iosAppDir = path.join(repoRoot, 'ios', 'App')

function runOrThrow(command: string, args: string[], cwd: string) {
    const result = spawnSync(command, args, {
        cwd,
        stdio: 'inherit',
        env: process.env,
    })

    if (result.status !== 0) {
        throw new Error(`Command failed (${command} ${args.join(' ')}) with exit code ${result.status ?? 'unknown'}`)
    }
}

function parseArgs(argv: string[]): Args {
    const parsed: Args = {
        skipInstall: false,
        skipBuild: false,
        derivedDataPath: '/tmp/peace2074-ios-verify',
    }

    for (const arg of argv) {
        if (arg === '--skip-install') parsed.skipInstall = true
        else if (arg === '--skip-build') parsed.skipBuild = true
        else if (arg.startsWith('--derived-data=')) parsed.derivedDataPath = arg.slice('--derived-data='.length)
        else if (arg.startsWith('--device-id=')) parsed.deviceId = arg.slice('--device-id='.length)
    }

    if (!parsed.deviceId && process.env.IOS_DEVICE_ID) {
        parsed.deviceId = process.env.IOS_DEVICE_ID
    }

    return parsed
}

function assertVerifierSettingsAreSafe() {
    const podsProject = path.join(iosAppDir, 'Pods', 'Pods.xcodeproj', 'project.pbxproj')
    if (!existsSync(podsProject)) {
        throw new Error('Pods project not found. Run pod install first to generate ios/App/Pods.')
    }

    const text = readFileSync(podsProject, 'utf8')

    const verifierYesMatches = text.match(/ENABLE_MODULE_VERIFIER(?:\[sdk=[^\]]+\])?\s*=\s*YES;/g) ?? []
    const standardsMatches = text.match(/MODULE_VERIFIER_SUPPORTED_LANGUAGE_STANDARDS\s*=\s*"[^\"]+";/g) ?? []

    if (verifierYesMatches.length > 0 || standardsMatches.length > 0) {
        throw new Error(
            [
                'Unsafe verifier settings detected in Pods.xcodeproj.',
                `ENABLE_MODULE_VERIFIER=YES count: ${verifierYesMatches.length}`,
                `Non-empty MODULE_VERIFIER_SUPPORTED_LANGUAGE_STANDARDS count: ${standardsMatches.length}`,
                'This would re-enable VerifyModule and can cause CapacitorApp module import failures.',
            ].join(' '),
        )
    }
}

function main() {
    if (!existsSync(iosAppDir)) {
        throw new Error(`iOS app directory not found: ${iosAppDir}`)
    }

    const args = parseArgs(process.argv.slice(2))

    console.log('🔍 iOS native verification started')
    console.log(`   - skipInstall: ${args.skipInstall}`)
    console.log(`   - skipBuild: ${args.skipBuild}`)
    console.log(`   - derivedDataPath: ${args.derivedDataPath}`)
    if (args.deviceId) console.log(`   - deviceId: ${args.deviceId}`)

    if (!args.skipInstall) {
        console.log('📦 Running pod install...')
        runOrThrow('pod', ['install'], iosAppDir)
    }

    console.log('🧪 Checking verifier settings in generated Pods project...')
    assertVerifierSettingsAreSafe()

    if (!args.skipBuild) {
        const buildArgs = ['-workspace', 'App.xcworkspace', '-scheme', 'App', '-configuration', 'Debug']

        if (args.deviceId) {
            buildArgs.push('-destination', `id=${args.deviceId}`)
        } else {
            buildArgs.push('-sdk', 'iphoneos')
        }

        buildArgs.push('-derivedDataPath', args.derivedDataPath, 'CODE_SIGNING_ALLOWED=NO', 'build')

        console.log('🏗️ Running xcodebuild...')
        runOrThrow('xcodebuild', buildArgs, iosAppDir)
    }

    console.log('✅ iOS native verification passed')
}

try {
    main()
} catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`❌ iOS native verification failed: ${message}`)
    process.exit(1)
}
