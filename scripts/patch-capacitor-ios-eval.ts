import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type Replacement = {
    label: string
    search: string
    replacement: string
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const directBridgePath = path.join(
    repoRoot,
    'node_modules',
    '@capacitor',
    'ios',
    'Capacitor',
    'Capacitor',
    'CapacitorBridge.swift'
)
const pnpmStoreDir = path.join(repoRoot, 'node_modules', '.pnpm')

const helperSignature =
    'private func discardJavaScriptResult(_ js: String) -> String'
const ignorableErrorHelperSignature =
    'private func isIgnorableJavaScriptEvalError(_ error: Error) -> Bool'
const helperNeedle = '    // MARK: - CAPBridgeProtocol: JavaScript Handling'
const helperReplacement = `    private func discardJavaScriptResult(_ js: String) -> String {
        return """
        \\(js)
        ;0;
        """
    }

    private func isIgnorableJavaScriptEvalError(_ error: Error) -> Bool {
        let message = error.localizedDescription.lowercased()
        return message.contains("javascript execution returned a result of an unsupported type")
    }

    // MARK: - CAPBridgeProtocol: JavaScript Handling`

const replacements: Replacement[] = [
    {
        label: 'wrap toJs evaluateJavaScript',
        search: `            self.webView?.evaluateJavaScript("""
             window.Capacitor.fromNative({
             callbackId: '\\(result.callbackID)',
             pluginId: '\\(result.pluginID)',
             methodName: '\\(result.methodName)',
             save: \\(save),
             success: true,
             data: \\(resultJson)
             })
            """) { (_, error) in`,
        replacement: `            self.webView?.evaluateJavaScript(self.discardJavaScriptResult("""
             window.Capacitor.fromNative({
             callbackId: '\\(result.callbackID)',
             pluginId: '\\(result.pluginID)',
             methodName: '\\(result.methodName)',
             save: \\(save),
             success: true,
             data: \\(resultJson)
             })
            """)) { (_, error) in`,
    },
    {
        label: 'wrap toJsError evaluateJavaScript',
        search: `            self.webView?.evaluateJavaScript("window.Capacitor.fromNative({ callbackId: '\\(error.callbackID)', pluginId: '\\(error.pluginID)', methodName: '\\(error.methodName)', success: false, error: \\(error.jsonPayload())})") { (_, error) in`,
        replacement: `            self.webView?.evaluateJavaScript(self.discardJavaScriptResult("window.Capacitor.fromNative({ callbackId: '\\(error.callbackID)', pluginId: '\\(error.pluginID)', methodName: '\\(error.methodName)', success: false, error: \\(error.jsonPayload())})")) { (_, error) in`,
    },
    {
        label: 'wrap evalWithPlugin evaluateJavaScript',
        search:
            '            self.getWebView()?.evaluateJavaScript(wrappedJs, completionHandler: { (_, error) in',
        replacement:
            '            self.getWebView()?.evaluateJavaScript(self.discardJavaScriptResult(wrappedJs), completionHandler: { (_, error) in',
    },
    {
        label: 'wrap eval(js:) evaluateJavaScript',
        search:
            '            self.getWebView()?.evaluateJavaScript(js, completionHandler: { (_, error) in',
        replacement:
            '            self.getWebView()?.evaluateJavaScript(self.discardJavaScriptResult(js), completionHandler: { (_, error) in',
    },
    {
        label: 'suppress benign evalWithPlugin unsupported-type logs',
        search: `                if let error = error {
                    CAPLog.print("⚡️  JS Eval error", error.localizedDescription)
                }`,
        replacement: `                if let error = error, !self.isIgnorableJavaScriptEvalError(error) {
                    CAPLog.print("⚡️  JS Eval error", error.localizedDescription)
                }`,
    },
    {
        label: 'wrap logToJs evaluateJavaScript',
        search: `            self.getWebView()?.evaluateJavaScript("window.Capacitor.logJs('\\(message)', '\\(level)')") { (result, error) in`,
        replacement: `            self.getWebView()?.evaluateJavaScript(self.discardJavaScriptResult("window.Capacitor.logJs('\\(message)', '\\(level)')")) { (result, error) in`,
    },
]

function collectBridgePaths(): string[] {
    const filePaths = new Set<string>()

    if (fs.existsSync(directBridgePath)) {
        filePaths.add(fs.realpathSync(directBridgePath))
    }

    if (!fs.existsSync(pnpmStoreDir)) {
        return [...filePaths]
    }

    for (const entry of fs.readdirSync(pnpmStoreDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
            continue
        }

        const candidate = path.join(
            pnpmStoreDir,
            entry.name,
            'node_modules',
            '@capacitor',
            'ios',
            'Capacitor',
            'Capacitor',
            'CapacitorBridge.swift'
        )

        if (fs.existsSync(candidate)) {
            filePaths.add(fs.realpathSync(candidate))
        }
    }

    return [...filePaths]
}

function replaceAllOccurrences(
    input: string,
    search: string,
    replacement: string
) {
    let output = input
    let count = 0

    while (output.includes(search)) {
        output = output.replace(search, replacement)
        count += 1
    }

    return { output, count }
}

function patchBridge(filePath: string): boolean {
    const original = fs.readFileSync(filePath, 'utf8')
    let patched = original
    let changed = false

    if (
        !patched.includes(helperSignature) ||
        !patched.includes(ignorableErrorHelperSignature)
    ) {
        if (!patched.includes(helperNeedle)) {
            throw new Error(
                `Could not find JavaScript handling marker in ${path.relative(repoRoot, filePath)}`
            )
        }

        const helperBlockStart = patched.indexOf(
            '    private func discardJavaScriptResult(_ js: String) -> String {'
        )
        const helperBlockEnd = patched.indexOf(helperNeedle)

        if (
            helperBlockStart !== -1 &&
            helperBlockEnd !== -1 &&
            helperBlockStart < helperBlockEnd
        ) {
            patched =
                patched.slice(0, helperBlockStart) +
                helperReplacement +
                patched.slice(helperBlockEnd + helperNeedle.length)
        } else {
            patched = patched.replace(helperNeedle, helperReplacement)
        }

        changed = true
    }

    for (const replacement of replacements) {
        const replacementResult = replaceAllOccurrences(
            patched,
            replacement.search,
            replacement.replacement
        )

        if (replacementResult.count > 0) {
            patched = replacementResult.output
            changed = true
            continue
        }

        if (patched.includes(replacement.replacement)) {
            continue
        }

        if (!patched.includes(replacement.search)) {
            throw new Error(
                `Could not find ${replacement.label} in ${path.relative(repoRoot, filePath)}`
            )
        }
    }

    if (!changed) {
        return false
    }

    fs.writeFileSync(filePath, patched)
    return true
}

function main() {
    const bridgePaths = collectBridgePaths()

    if (bridgePaths.length === 0) {
        console.log('Capacitor iOS bridge not found; skipping JS eval patch.')
        return
    }

    let changedFiles = 0

    for (const bridgePath of bridgePaths) {
        if (patchBridge(bridgePath)) {
            changedFiles += 1
            console.log(
                `Patched ${path.relative(repoRoot, bridgePath)} to discard unsupported JS eval results and ignore benign unsupported-type logs.`
            )
        }
    }

    if (changedFiles === 0) {
        console.log(
            'Capacitor iOS bridge already patched for unsupported JS eval results.'
        )
    }
}

main()
