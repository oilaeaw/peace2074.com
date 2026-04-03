import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function copy(src, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  console.log('  [ok]   ' + src + ' -> ' + dest);
}
console.log('Syncing mobile branding...');
copy(resolve(ROOT,'public/ios/1024.png'), resolve(ROOT,'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'));
console.log('Done.');
