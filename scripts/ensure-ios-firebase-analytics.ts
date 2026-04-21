import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const iosAppDir = path.join(repoRoot, 'ios', 'App');
const podfilePath = path.join(iosAppDir, 'Podfile');
const podfileLockPath = path.join(iosAppDir, 'Podfile.lock');
const appProjectPath = path.join(iosAppDir, 'App.xcodeproj', 'project.pbxproj');
const podsProjectPath = path.join(iosAppDir, 'Pods', 'Pods.xcodeproj', 'project.pbxproj');
const capacitorVerifierXcconfigPaths = [
    path.join(iosAppDir, 'Pods', 'Target Support Files', 'CapacitorApp', 'CapacitorApp.debug.xcconfig'),
    path.join(iosAppDir, 'Pods', 'Target Support Files', 'CapacitorApp', 'CapacitorApp.release.xcconfig'),
    path.join(iosAppDir, 'Pods', 'Target Support Files', 'CapacitorBrowser', 'CapacitorBrowser.debug.xcconfig'),
    path.join(iosAppDir, 'Pods', 'Target Support Files', 'CapacitorBrowser', 'CapacitorBrowser.release.xcconfig'),
];

const analyticsPodPattern = /^([ \t]*)pod 'CapacitorFirebaseAnalytics(?:\/AnalyticsWithoutAdIdSupport)?', :path => '([^']+@capacitor-firebase\/analytics)'$/m;

function readText(filePath: string) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing required file: ${path.relative(repoRoot, filePath)}`);
    }

    return fs.readFileSync(filePath, 'utf8');
}

function normalizeProjectBuildFixes(projectText: string) {
    return projectText
        .replace(/ENABLE_MODULE_VERIFIER = YES;/g, 'ENABLE_MODULE_VERIFIER = NO;')
        .replace(
            /CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = YES;/g,
            'CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = NO;'
        )
        // Keep the standards key explicitly blank. Removing it entirely lets
        // Xcode fall back to its default verifier standards (`gnu11 gnu++14`)
        // for framework pods, which still triggers modules-verifier for
        // CapacitorApp / CapacitorBrowser.
        .replace(/^\s*MODULE_VERIFIER_SUPPORTED_LANGUAGE_STANDARDS = "[^"]*";\n/gm, 'MODULE_VERIFIER_SUPPORTED_LANGUAGE_STANDARDS = "";\n')
        .split('\n')
        .map((line) =>
            line.includes('FBLPromisePrivate.h in Headers')
                ? line.replace('ATTRIBUTES = (Private, );', 'ATTRIBUTES = (Project, );')
                : line
        )
        .join('\n');
}

function normalizeCapacitorVerifierXcconfig(text: string) {
    const sanitized = text
        .replace(/^ENABLE_MODULE_VERIFIER\s*=.*\n/gm, '')
        .replace(/^MODULE_VERIFIER_SUPPORTED_LANGUAGE_STANDARDS\s*=.*\n/gm, '')
        .replace(/^TEST_FRAMEWORK_SEARCH_PATHS\s*=.*\n/gm, '');

    const normalized = sanitized.endsWith('\n') ? sanitized : `${sanitized}\n`;
    return `${normalized}ENABLE_MODULE_VERIFIER = NO\nMODULE_VERIFIER_SUPPORTED_LANGUAGE_STANDARDS =\nTEST_FRAMEWORK_SEARCH_PATHS = $(inherited) $(CONFIGURATION_BUILD_DIR) "\${PODS_CONFIGURATION_BUILD_DIR}/Capacitor" "\${PODS_CONFIGURATION_BUILD_DIR}/CapacitorCordova"\n`;
}

function ensureProjectBuildFixes(projectPath: string, projectLabel: string) {
    const currentProject = readText(projectPath);
    const normalizedProject = normalizeProjectBuildFixes(currentProject);

    if (normalizedProject === currentProject) {
        return false;
    }

    fs.writeFileSync(projectPath, normalizedProject);
    console.log(`Patched ${projectLabel} to disable lingering module verifier/header warning overrides.`);
    return true;
}

function ensureCapacitorVerifierXcconfigFixes() {
    let patchedCount = 0;

    for (const filePath of capacitorVerifierXcconfigPaths) {
        if (!fs.existsSync(filePath)) {
            continue;
        }

        const currentText = readText(filePath);
        const normalizedText = normalizeCapacitorVerifierXcconfig(currentText);

        if (normalizedText === currentText) {
            continue;
        }

        fs.writeFileSync(filePath, normalizedText);
        patchedCount += 1;
    }

    if (patchedCount > 0) {
        console.log(`Patched Capacitor plugin xcconfigs for module-verifier compatibility (${patchedCount} files).`);
    }

    return patchedCount > 0;
}

function capacitorVerifierXcconfigsPatched() {
    for (const filePath of capacitorVerifierXcconfigPaths) {
        if (!fs.existsSync(filePath)) {
            continue;
        }

        const text = readText(filePath);
        if (!text.includes('ENABLE_MODULE_VERIFIER = NO')) {
            return false;
        }

        if (!text.includes('MODULE_VERIFIER_SUPPORTED_LANGUAGE_STANDARDS =')) {
            return false;
        }

        if (!text.includes('TEST_FRAMEWORK_SEARCH_PATHS = $(inherited) $(CONFIGURATION_BUILD_DIR) "${PODS_CONFIGURATION_BUILD_DIR}/Capacitor" "${PODS_CONFIGURATION_BUILD_DIR}/CapacitorCordova"')) {
            return false;
        }
    }

    return true;
}

function ensureWritable(filePath: string) {
    fs.chmodSync(filePath, 0o644);
}

function listFilesRecursive(dirPath: string): string[] {
    if (!fs.existsSync(dirPath)) {
        return [];
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            files.push(...listFilesRecursive(entryPath));
            continue;
        }

        files.push(entryPath);
    }

    return files;
}

function normalizeGoogleUtilitiesFrameworkHeader(text: string) {
    return text.replace(
        /^#import "(GUL[^"]+\.h)"$/gm,
        '#import <GoogleUtilities/$1>'
    );
}

function normalizePromisesFrameworkHeader(text: string) {
    return text.replace(
        /^#import "(FBL[^"]+\.h)"$/gm,
        '#import <FBLPromises/$1>'
    );
}

function normalizeFirebaseCoreFrameworkHeader(text: string) {
    return text
        .replace(/^#import "(FIR[^"]+\.h)"$/gm, '#import <FirebaseCore/$1>')
        .replace(/^#import "(FirebaseCore\.h)"$/gm, '#import <FirebaseCore/$1>');
}

function normalizeFirebaseInstallationsFrameworkHeader(text: string) {
    return text
        .replace(/^#import "(FIR[^"]+\.h)"$/gm, '#import <FirebaseInstallations/$1>')
        .replace(/^#import "(FirebaseInstallations\.h)"$/gm, '#import <FirebaseInstallations/$1>');
}

function ensureGoogleUtilitiesFrameworkHeaderFixes() {
    const googleUtilitiesRoot = path.join(iosAppDir, 'Pods', 'GoogleUtilities', 'GoogleUtilities');
    const googleUtilitiesUmbrellaPath = path.join(
        iosAppDir,
        'Pods',
        'Target Support Files',
        'GoogleUtilities',
        'GoogleUtilities-umbrella.h'
    );

    let patchedHeaderCount = 0;

    for (const filePath of listFilesRecursive(googleUtilitiesRoot)) {
        if (!filePath.endsWith('.h')) {
            continue;
        }

        const publicHeaderSegment = `${path.sep}Public${path.sep}GoogleUtilities${path.sep}`;
        if (!filePath.includes(publicHeaderSegment)) {
            continue;
        }

        const currentText = readText(filePath);
        const normalizedText = normalizeGoogleUtilitiesFrameworkHeader(currentText);
        if (normalizedText === currentText) {
            continue;
        }

        ensureWritable(filePath);
        fs.writeFileSync(filePath, normalizedText);
        patchedHeaderCount += 1;
    }

    let patchedUmbrella = false;
    if (fs.existsSync(googleUtilitiesUmbrellaPath)) {
        const currentUmbrella = readText(googleUtilitiesUmbrellaPath);
        const normalizedUmbrella = normalizeGoogleUtilitiesFrameworkHeader(currentUmbrella);
        if (normalizedUmbrella !== currentUmbrella) {
            ensureWritable(googleUtilitiesUmbrellaPath);
            fs.writeFileSync(googleUtilitiesUmbrellaPath, normalizedUmbrella);
            patchedUmbrella = true;
        }
    }

    if (patchedHeaderCount > 0 || patchedUmbrella) {
        console.log(
            `Patched GoogleUtilities framework header imports (${patchedHeaderCount} public headers${patchedUmbrella ? ' + umbrella header' : ''}).`
        );
    }

    return patchedHeaderCount > 0 || patchedUmbrella;
}

function googleUtilitiesFrameworkHeadersPatched() {
    const googleUtilitiesRoot = path.join(iosAppDir, 'Pods', 'GoogleUtilities', 'GoogleUtilities');
    const googleUtilitiesUmbrellaPath = path.join(
        iosAppDir,
        'Pods',
        'Target Support Files',
        'GoogleUtilities',
        'GoogleUtilities-umbrella.h'
    );

    for (const filePath of listFilesRecursive(googleUtilitiesRoot)) {
        if (!filePath.endsWith('.h')) {
            continue;
        }

        const publicHeaderSegment = `${path.sep}Public${path.sep}GoogleUtilities${path.sep}`;
        if (!filePath.includes(publicHeaderSegment)) {
            continue;
        }

        if (/#import "GUL[^"]+\.h"/m.test(readText(filePath))) {
            return false;
        }
    }

    if (fs.existsSync(googleUtilitiesUmbrellaPath)) {
        return !/#import "GUL[^"]+\.h"/m.test(readText(googleUtilitiesUmbrellaPath));
    }

    return true;
}

function ensurePromisesFrameworkHeaderFixes() {
    const promisesHeadersRoot = path.join(
        iosAppDir,
        'Pods',
        'PromisesObjC',
        'Sources',
        'FBLPromises',
        'include'
    );
    const promisesUmbrellaPath = path.join(
        iosAppDir,
        'Pods',
        'Target Support Files',
        'PromisesObjC',
        'PromisesObjC-umbrella.h'
    );

    let patchedHeaderCount = 0;
    for (const filePath of listFilesRecursive(promisesHeadersRoot)) {
        if (!filePath.endsWith('.h')) {
            continue;
        }

        const currentText = readText(filePath);
        const normalizedText = normalizePromisesFrameworkHeader(currentText);
        if (normalizedText === currentText) {
            continue;
        }

        ensureWritable(filePath);
        fs.writeFileSync(filePath, normalizedText);
        patchedHeaderCount += 1;
    }

    let patchedUmbrella = false;
    if (fs.existsSync(promisesUmbrellaPath)) {
        const currentUmbrella = readText(promisesUmbrellaPath);
        const normalizedUmbrella = normalizePromisesFrameworkHeader(currentUmbrella);
        if (normalizedUmbrella !== currentUmbrella) {
            ensureWritable(promisesUmbrellaPath);
            fs.writeFileSync(promisesUmbrellaPath, normalizedUmbrella);
            patchedUmbrella = true;
        }
    }

    if (patchedHeaderCount > 0 || patchedUmbrella) {
        console.log(
            `Patched PromisesObjC framework header imports (${patchedHeaderCount} headers${patchedUmbrella ? ' + umbrella header' : ''}).`
        );
    }

    return patchedHeaderCount > 0 || patchedUmbrella;
}

function ensureFirebaseCoreFrameworkHeaderFixes() {
    const firebaseCoreRoot = path.join(
        iosAppDir,
        'Pods',
        'FirebaseCore',
        'FirebaseCore',
        'Sources',
        'Public',
        'FirebaseCore'
    );
    const firebaseCoreUmbrellaPath = path.join(
        iosAppDir,
        'Pods',
        'Target Support Files',
        'FirebaseCore',
        'FirebaseCore-umbrella.h'
    );

    let patchedHeaderCount = 0;
    for (const filePath of listFilesRecursive(firebaseCoreRoot)) {
        if (!filePath.endsWith('.h')) {
            continue;
        }

        const currentText = readText(filePath);
        const normalizedText = normalizeFirebaseCoreFrameworkHeader(currentText);
        if (normalizedText === currentText) {
            continue;
        }

        ensureWritable(filePath);
        fs.writeFileSync(filePath, normalizedText);
        patchedHeaderCount += 1;
    }

    let patchedUmbrella = false;
    if (fs.existsSync(firebaseCoreUmbrellaPath)) {
        const currentUmbrella = readText(firebaseCoreUmbrellaPath);
        const normalizedUmbrella = normalizeFirebaseCoreFrameworkHeader(currentUmbrella);
        if (normalizedUmbrella !== currentUmbrella) {
            ensureWritable(firebaseCoreUmbrellaPath);
            fs.writeFileSync(firebaseCoreUmbrellaPath, normalizedUmbrella);
            patchedUmbrella = true;
        }
    }

    if (patchedHeaderCount > 0 || patchedUmbrella) {
        console.log(
            `Patched FirebaseCore framework header imports (${patchedHeaderCount} headers${patchedUmbrella ? ' + umbrella header' : ''}).`
        );
    }

    return patchedHeaderCount > 0 || patchedUmbrella;
}

function ensureFirebaseInstallationsFrameworkHeaderFixes() {
    const firebaseInstallationsRoot = path.join(
        iosAppDir,
        'Pods',
        'FirebaseInstallations',
        'FirebaseInstallations',
        'Source',
        'Library',
        'Public',
        'FirebaseInstallations'
    );
    const firebaseInstallationsUmbrellaPath = path.join(
        iosAppDir,
        'Pods',
        'Target Support Files',
        'FirebaseInstallations',
        'FirebaseInstallations-umbrella.h'
    );

    let patchedHeaderCount = 0;
    for (const filePath of listFilesRecursive(firebaseInstallationsRoot)) {
        if (!filePath.endsWith('.h')) {
            continue;
        }

        const currentText = readText(filePath);
        const normalizedText = normalizeFirebaseInstallationsFrameworkHeader(currentText);
        if (normalizedText === currentText) {
            continue;
        }

        ensureWritable(filePath);
        fs.writeFileSync(filePath, normalizedText);
        patchedHeaderCount += 1;
    }

    let patchedUmbrella = false;
    if (fs.existsSync(firebaseInstallationsUmbrellaPath)) {
        const currentUmbrella = readText(firebaseInstallationsUmbrellaPath);
        const normalizedUmbrella = normalizeFirebaseInstallationsFrameworkHeader(currentUmbrella);
        if (normalizedUmbrella !== currentUmbrella) {
            ensureWritable(firebaseInstallationsUmbrellaPath);
            fs.writeFileSync(firebaseInstallationsUmbrellaPath, normalizedUmbrella);
            patchedUmbrella = true;
        }
    }

    if (patchedHeaderCount > 0 || patchedUmbrella) {
        console.log(
            `Patched FirebaseInstallations framework header imports (${patchedHeaderCount} headers${patchedUmbrella ? ' + umbrella header' : ''}).`
        );
    }

    return patchedHeaderCount > 0 || patchedUmbrella;
}

function firebaseInstallationsFrameworkHeadersPatched() {
    const firebaseInstallationsRoot = path.join(
        iosAppDir,
        'Pods',
        'FirebaseInstallations',
        'FirebaseInstallations',
        'Source',
        'Library',
        'Public',
        'FirebaseInstallations'
    );
    const firebaseInstallationsUmbrellaPath = path.join(
        iosAppDir,
        'Pods',
        'Target Support Files',
        'FirebaseInstallations',
        'FirebaseInstallations-umbrella.h'
    );

    for (const filePath of listFilesRecursive(firebaseInstallationsRoot)) {
        if (!filePath.endsWith('.h')) {
            continue;
        }

        if (/#import "(?:FIR|FirebaseInstallations)[^"]+\.h"/m.test(readText(filePath))) {
            return false;
        }
    }

    if (fs.existsSync(firebaseInstallationsUmbrellaPath)) {
        return !/#import "(?:FIR|FirebaseInstallations)[^"]+\.h"/m.test(readText(firebaseInstallationsUmbrellaPath));
    }

    return true;
}

function firebaseCoreFrameworkHeadersPatched() {
    const firebaseCoreRoot = path.join(
        iosAppDir,
        'Pods',
        'FirebaseCore',
        'FirebaseCore',
        'Sources',
        'Public',
        'FirebaseCore'
    );
    const firebaseCoreUmbrellaPath = path.join(
        iosAppDir,
        'Pods',
        'Target Support Files',
        'FirebaseCore',
        'FirebaseCore-umbrella.h'
    );

    for (const filePath of listFilesRecursive(firebaseCoreRoot)) {
        if (!filePath.endsWith('.h')) {
            continue;
        }

        if (/#import "(?:FIR|FirebaseCore)[^"]+\.h"/m.test(readText(filePath))) {
            return false;
        }
    }

    if (fs.existsSync(firebaseCoreUmbrellaPath)) {
        return !/#import "(?:FIR|FirebaseCore)[^"]+\.h"/m.test(readText(firebaseCoreUmbrellaPath));
    }

    return true;
}

function promisesFrameworkHeadersPatched() {
    const promisesHeadersRoot = path.join(
        iosAppDir,
        'Pods',
        'PromisesObjC',
        'Sources',
        'FBLPromises',
        'include'
    );
    const promisesUmbrellaPath = path.join(
        iosAppDir,
        'Pods',
        'Target Support Files',
        'PromisesObjC',
        'PromisesObjC-umbrella.h'
    );

    for (const filePath of listFilesRecursive(promisesHeadersRoot)) {
        if (!filePath.endsWith('.h')) {
            continue;
        }

        if (/#import "FBL[^"]+\.h"/m.test(readText(filePath))) {
            return false;
        }
    }

    if (fs.existsSync(promisesUmbrellaPath)) {
        return !/#import "FBL[^"]+\.h"/m.test(readText(promisesUmbrellaPath));
    }

    return true;
}

function lockfileHasNativeAnalytics(lockfileText: string) {
    return (
        lockfileText.includes('CapacitorFirebaseAnalytics/AnalyticsWithoutAdIdSupport') ||
        lockfileText.includes('FirebaseAnalytics/WithoutAdIdSupport')
    );
}

function appProjectHasNativePodBuildFixes(projectText: string) {
    return (
        projectText.includes('ENABLE_MODULE_VERIFIER = NO;') &&
        projectText.includes('CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = NO;')
    );
}

function podsProjectHasNativePodBuildFixes(projectText: string) {
    return (
        projectText.includes('ENABLE_MODULE_VERIFIER = NO;') &&
        projectText.includes('CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = NO;') &&
        !projectText.includes('ENABLE_MODULE_VERIFIER = YES;') &&
        !projectText.includes('CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = YES;')
    );
}

function ensurePodfileUsesNativeAnalytics() {
    const podfile = readText(podfilePath);
    const patchedPodfile = podfile.replace(
        analyticsPodPattern,
        (_, indent: string, podPath: string) =>
            `${indent}pod 'CapacitorFirebaseAnalytics/AnalyticsWithoutAdIdSupport', :path => '${podPath}'`
    );

    if (patchedPodfile === podfile) {
        if (!analyticsPodPattern.test(podfile)) {
            throw new Error('Could not find Capacitor Firebase Analytics pod declaration in ios/App/Podfile');
        }

        return false;
    }

    fs.writeFileSync(podfilePath, patchedPodfile);
    console.log('Patched ios/App/Podfile to use AnalyticsWithoutAdIdSupport.');
    return true;
}

function runPodInstall() {
    const result = spawnSync('pod', ['install'], {
        cwd: iosAppDir,
        stdio: 'inherit',
    });

    if (result.status !== 0) {
        throw new Error(`pod install failed with exit code ${result.status ?? 'unknown'}`);
    }
}

function main() {
    const podfileWasPatched = ensurePodfileUsesNativeAnalytics();
    const existingLockfile = fs.existsSync(podfileLockPath)
        ? fs.readFileSync(podfileLockPath, 'utf8')
        : '';
    const existingProject = fs.existsSync(appProjectPath)
        ? fs.readFileSync(appProjectPath, 'utf8')
        : '';
    const existingPodsProject = fs.existsSync(podsProjectPath)
        ? fs.readFileSync(podsProjectPath, 'utf8')
        : '';
    const needsNativePodBuildFixes =
        !appProjectHasNativePodBuildFixes(existingProject) ||
        !podsProjectHasNativePodBuildFixes(existingPodsProject);

    if (podfileWasPatched || !lockfileHasNativeAnalytics(existingLockfile) || needsNativePodBuildFixes) {
        console.log('Running pod install to refresh native iOS CocoaPods configuration...');
        runPodInstall();
    }

    ensureProjectBuildFixes(appProjectPath, 'ios/App/App.xcodeproj');
    ensureProjectBuildFixes(podsProjectPath, 'ios/App/Pods/Pods.xcodeproj');
    ensureCapacitorVerifierXcconfigFixes();
    ensureGoogleUtilitiesFrameworkHeaderFixes();
    ensurePromisesFrameworkHeaderFixes();
    ensureFirebaseCoreFrameworkHeaderFixes();
    ensureFirebaseInstallationsFrameworkHeaderFixes();

    const updatedLockfile = readText(podfileLockPath);
    const updatedProject = readText(appProjectPath);
    const updatedPodsProject = readText(podsProjectPath);

    if (!lockfileHasNativeAnalytics(updatedLockfile)) {
        throw new Error(
            'Podfile.lock still does not include AnalyticsWithoutAdIdSupport after pod install.'
        );
    }

    if (!appProjectHasNativePodBuildFixes(updatedProject)) {
        throw new Error(
            'App.xcodeproj is still missing CocoaPods-applied quoted-include/module-verifier fixes after pod install.'
        );
    }

    if (!podsProjectHasNativePodBuildFixes(updatedPodsProject)) {
        throw new Error(
            'Pods.xcodeproj still contains quoted-include/module-verifier settings that can re-enable VerifyModule after pod install.'
        );
    }

    if (!capacitorVerifierXcconfigsPatched()) {
        throw new Error(
            'CapacitorApp/CapacitorBrowser xcconfigs are still missing module-verifier compatibility overrides after native fix-up.'
        );
    }

    if (!googleUtilitiesFrameworkHeadersPatched()) {
        throw new Error(
            'GoogleUtilities public framework headers still contain double-quoted imports after native fix-up.'
        );
    }

    if (!promisesFrameworkHeadersPatched()) {
        throw new Error(
            'PromisesObjC framework headers still contain double-quoted imports after native fix-up.'
        );
    }

    if (!firebaseCoreFrameworkHeadersPatched()) {
        throw new Error(
            'FirebaseCore framework headers still contain double-quoted imports after native fix-up.'
        );
    }

    if (!firebaseInstallationsFrameworkHeadersPatched()) {
        throw new Error(
            'FirebaseInstallations framework headers still contain double-quoted imports after native fix-up.'
        );
    }

    console.log('iOS Firebase Analytics and CocoaPods build fixes are configured.');
}

main();
