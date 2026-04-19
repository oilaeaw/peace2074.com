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

const analyticsPodPattern = /^([ \t]*)pod 'CapacitorFirebaseAnalytics(?:\/AnalyticsWithoutAdIdSupport)?', :path => '([^']+@capacitor-firebase\/analytics)'$/m;

function readText(filePath: string) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing required file: ${path.relative(repoRoot, filePath)}`);
    }

    return fs.readFileSync(filePath, 'utf8');
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

    console.log('iOS Firebase Analytics and CocoaPods build fixes are configured.');
}

main();
