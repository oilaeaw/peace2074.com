from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent.parent
preview_dir = root / '.copilot-previews'
left = Image.open(root / 'assets' / 'icon-only.png').convert('RGBA')
right = Image.open(preview_dir / 'icon-refresh-preview-luna.png').convert('RGBA')

canvas = Image.new('RGBA', (2200, 1250), '#F5F7F6')
draw = ImageDraw.Draw(canvas)

try:
    font_title = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 54)
    font_label = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 38)
except Exception:
    font_title = ImageFont.load_default()
    font_label = ImageFont.load_default()

panel_w, panel_h = 920, 920
margin_x, margin_top, label_y = 110, 180, 90
items = [
    (margin_x, 'Current icon', left),
    (margin_x + panel_w + 140, 'Luna-inspired refresh', right),
]

for x, label, img in items:
    draw.rounded_rectangle(
        (x - 18, margin_top - 18, x + panel_w + 18, margin_top + panel_h + 18),
        radius=42,
        fill='white',
        outline='#D9E3DF',
        width=4,
    )
    fitted = img.resize((panel_w, panel_h), Image.Resampling.LANCZOS)
    canvas.alpha_composite(fitted, (x, margin_top))
    bbox = draw.textbbox((0, 0), label, font=font_label)
    draw.text(
        (x + (panel_w - (bbox[2] - bbox[0])) // 2, label_y),
        label,
        fill='#0A5B43',
        font=font_label,
    )

title = 'Icon comparison'
title_bbox = draw.textbbox((0, 0), title, font=font_title)
draw.text(
    ((2200 - (title_bbox[2] - title_bbox[0])) // 2, 24),
    title,
    fill='#0A5B43',
    font=font_title,
)

out = preview_dir / 'icon-comparison.png'
canvas.save(out)
print(out)
