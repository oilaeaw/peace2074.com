import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const iosAppDir = path.join(repoRoot, 'ios', 'App');
const legacyBuildDir = path.join(iosAppDir, 'build');
const artifactsRoot = path.join(iosAppDir, 'fastlane', 'artifacts');

function toRelative(filePath: string) {
    return path.relative(repoRoot, filePath) || '.';
}

function ensureDirectory(dirPath: string) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function moveLegacyBuildArtifacts() {
    if (!fs.existsSync(legacyBuildDir)) {
        return;
    }

    const entries = fs.readdirSync(legacyBuildDir);

    if (entries.length === 0) {
        fs.rmSync(legacyBuildDir, { recursive: true, force: true });
        console.log(`Removed empty legacy ${toRelative(legacyBuildDir)} directory.`);
        return;
    }

    const timestamp = new Date().toISOString().replace(/[.:]/g, '-');
    const archiveDir = path.join(artifactsRoot, 'legacy-build-dir', timestamp);
    ensureDirectory(archiveDir);

    for (const entry of entries) {
        fs.renameSync(path.join(legacyBuildDir, entry), path.join(archiveDir, entry));
    }

    fs.rmSync(legacyBuildDir, { recursive: true, force: true });
    console.log(
        `Moved legacy ${toRelative(legacyBuildDir)} contents to ${toRelative(archiveDir)}.`
    );
}

moveLegacyBuildArtifacts();
