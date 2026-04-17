import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const iosAppDir = path.join(repoRoot, 'ios', 'App');
const podfilePath = path.join(iosAppDir, 'Podfile');
const podfileLockPath = path.join(iosAppDir, 'Podfile.lock');

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

    if (podfileWasPatched || !lockfileHasNativeAnalytics(existingLockfile)) {
        console.log('Running pod install to refresh native iOS analytics dependencies...');
        runPodInstall();
    }

    const updatedLockfile = readText(podfileLockPath);

    if (!lockfileHasNativeAnalytics(updatedLockfile)) {
        throw new Error(
            'Podfile.lock still does not include AnalyticsWithoutAdIdSupport after pod install.'
        );
    }

    console.log('iOS Firebase Analytics is configured with AnalyticsWithoutAdIdSupport.');
}

main();