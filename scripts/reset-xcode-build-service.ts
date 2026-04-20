import { spawnSync } from 'node:child_process';

const buildServiceProcesses = [
    'SWBBuildService',
    'XCBBuildService',
    'xcodebuild',
] as const;

const shouldQuitXcode = process.argv.includes('--quit-xcode');

function formatCount(count: number, label: string) {
    return `${count} ${label}${count === 1 ? '' : 's'}`;
}

function getRunningProcessIds(processName: string) {
    const result = spawnSync('pgrep', ['-x', processName], {
        encoding: 'utf8',
    });

    if (result.status !== 0) {
        return [] as string[];
    }

    return result.stdout
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

function maybeQuitXcode() {
    const xcodePids = getRunningProcessIds('Xcode');

    if (xcodePids.length === 0) {
        return false;
    }

    if (!shouldQuitXcode) {
        console.log(
            'ℹ️  Xcode.app is still running. If the PIF error persists, quit and reopen Xcode or rerun with --quit-xcode.'
        );
        return false;
    }

    console.log(`Closing Xcode.app (${formatCount(xcodePids.length, 'process')}) before resetting build services...`);
    const quitResult = spawnSync('osascript', ['-e', 'tell application "Xcode" to quit'], {
        encoding: 'utf8',
    });

    if (quitResult.status !== 0) {
        const reason = (quitResult.stderr || quitResult.stdout || 'unknown error').trim();

        console.warn(
            `⚠️  Xcode.app did not quit cleanly via AppleScript (${reason}). Falling back to killall Xcode...`
        );

        const forceQuitResult = spawnSync('killall', ['Xcode'], {
            encoding: 'utf8',
        });

        if (forceQuitResult.status !== 0) {
            const forceQuitReason = (forceQuitResult.stderr || forceQuitResult.stdout || 'unknown error').trim();
            throw new Error(
                `Failed to quit Xcode.app cleanly: ${reason}. Fallback force quit also failed: ${forceQuitReason}`
            );
        }

        console.log(`• Xcode.app: force-quit ${formatCount(xcodePids.length, 'process')}.`);
    }

    return true;
}

function killNamedProcess(processName: (typeof buildServiceProcesses)[number]) {
    const pids = getRunningProcessIds(processName);

    if (pids.length === 0) {
        console.log(`• ${processName}: no running processes found.`);
        return 0;
    }

    const killResult = spawnSync('killall', [processName], {
        encoding: 'utf8',
    });

    if (killResult.status !== 0) {
        const reason = (killResult.stderr || killResult.stdout || 'unknown error').trim();
        throw new Error(`Failed to stop ${processName}: ${reason}`);
    }

    console.log(`• ${processName}: stopped ${formatCount(pids.length, 'process')}.`);
    return pids.length;
}

async function waitForShutdown(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    console.log('Resetting Xcode build services to clear stuck PIF transfer sessions...');

    const xcodeWasQuit = maybeQuitXcode();

    let stoppedProcessCount = 0;
    for (const processName of buildServiceProcesses) {
        stoppedProcessCount += killNamedProcess(processName);
    }

    await waitForShutdown(1500);

    const stillRunning = buildServiceProcesses.flatMap((processName) =>
        getRunningProcessIds(processName).map((pid) => `${processName}(${pid})`)
    );

    if (stillRunning.length > 0) {
        throw new Error(
            `Some Xcode build-service processes are still running: ${stillRunning.join(', ')}`
        );
    }

    if (stoppedProcessCount > 0) {
        console.log(`✅ Reset complete. Stopped ${formatCount(stoppedProcessCount, 'process')}.`);
    } else {
        console.log('✅ Reset complete. No stuck build-service processes were running.');
    }

    if (xcodeWasQuit) {
        console.log('Reopen ios/App/App.xcworkspace and build again.');
        return;
    }

    console.log('Try the build again. If Xcode is open and the error reappears, quit/reopen Xcode once or rerun with --quit-xcode.');
}

main().catch((error) => {
    console.error(`\n✖ ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
});