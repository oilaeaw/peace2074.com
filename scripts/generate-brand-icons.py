#!/usr/bin/env python3
from __future__ import annotations

import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MASTER_SVG = ROOT / 'assets' / 'icon-only.svg'
MASTER_PNG = ROOT / 'assets' / 'icon-only.png'


def render_master_png() -> None:
    subprocess.run(
        ['rsvg-convert', '-w', '1024', '-h', '1024', str(MASTER_SVG), '-o', str(MASTER_PNG)],
        check=True,
    )


def save_resized(image: Image.Image, path: Path, size: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.resize((size, size), Image.Resampling.LANCZOS).save(path)


def main() -> None:
    render_master_png()
    master = Image.open(MASTER_PNG).convert('RGBA')

    outputs = {
        ROOT / 'public/assets/icon-1024.png': 1024,
        ROOT / 'public/512x512.png': 512,
        ROOT / 'public/192X192.png': 192,
        ROOT / 'public/900x900.png': 900,
        ROOT / 'public/android-chrome-512x512.png': 512,
        ROOT / 'public/android-chrome-192x192.png': 192,
        ROOT / 'public/apple-touch-icon.png': 180,
        ROOT / 'public/maskable-icon.png': 192,
        ROOT / 'public/favico.png': 48,
        ROOT / 'public/favicon-32x32.png': 32,
        ROOT / 'public/favicon-16x16.png': 16,
    }

    for output_path, size in outputs.items():
        save_resized(master, output_path, size)

    master.save(ROOT / 'public/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

    ios_dir = ROOT / 'public/ios'
    for icon_path in ios_dir.glob('*.png'):
        try:
            size = int(icon_path.stem)
        except ValueError:
            continue
        save_resized(master, icon_path, size)

    android_sizes = {
        'android-launchericon-48-48.png': 48,
        'android-launchericon-72-72.png': 72,
        'android-launchericon-96-96.png': 96,
        'android-launchericon-144-144.png': 144,
        'android-launchericon-192-192.png': 192,
        'android-launchericon-512-512.png': 512,
    }
    android_dir = ROOT / 'public/android'
    for file_name, size in android_sizes.items():
        save_resized(master, android_dir / file_name, size)

    print('Generated icon assets from', MASTER_SVG)


if __name__ == '__main__':
    main()
