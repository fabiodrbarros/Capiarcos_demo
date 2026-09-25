"""Optional delivery-asset regeneration: Python + Pillow; never modifies originals."""
from pathlib import Path
from PIL import Image
import json

root = Path(__file__).resolve().parents[1] / 'dist' / 'assets'
output = root / 'optimized'
output.mkdir(exist_ok=True)
records = []

def save(source, target, size=None, **options):
    image = Image.open(root / source)
    if size:
        image.thumbnail(size, Image.Resampling.LANCZOS)
    destination = output / target
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, **options)
    records.append(dict(original=source, delivery='optimized/' + target,
                        originalBytes=(root / source).stat().st_size,
                        deliveryBytes=destination.stat().st_size,
                        width=image.width, height=image.height))

for i in range(12):
    name = f'solution-drawings/{i:02}.png'
    save(name, name, (1024, 1024), optimize=True)
save('logo-original.png', 'logo-original.png', optimize=True)
for name in ['showroom-portugal', 'room-portugal-cabinet']:
    save(name + '.png', name + '.webp', quality=92, method=6)
save('materials/oak-color-2k.jpg', 'oak-color.webp', (512, 512), quality=90, method=6)
(output / 'manifest.json').write_text(json.dumps(records, indent=2) + '\n', encoding='utf-8')
print(f"Delivery assets: {sum(r['originalBytes'] for r in records):,} -> {sum(r['deliveryBytes'] for r in records):,} bytes")
