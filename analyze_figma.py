from PIL import Image

img = Image.open('figma_1_途径车.png')
w, h = img.size

print('=== Dark pixel detection (text/UI regions) ===')
for y in range(0, h, 5):
    dark_count = 0
    for x in range(50, w-50):
        r, g, b, a = img.getpixel((x, y))
        if r < 80 and g < 80 and b < 80:
            dark_count += 1
    if dark_count > 10:
        print(f'  y={y:4d}: {dark_count} dark pixels')

print()
print('=== Blue/colored pixel detection ===')
prev_blue = False
for y in range(0, h, 5):
    has_blue = False
    for x in range(50, w-50):
        r, g, b, a = img.getpixel((x, y))
        # Detect blue-ish text (like hyperlinks or blue labels)
        if b > 150 and r < 100 and g < 100:
            has_blue = True
        # Detect amber/yellow (like badges)
        if r > 200 and g > 150 and b < 100:
            pass
    if has_blue != prev_blue:
        print(f'  y={y:4d}: blue_text={has_blue}')
        prev_blue = has_blue

print()
print('=== White section detail (y=699-1265) for all 3 images ===')
for fname in ['figma_1_途径车.png','figma_2_始发车.png','figma_3_终到车.png']:
    img2 = Image.open(fname)
    print(f'\n--- {fname} ---')
    prev_color = None
    for y in range(680, 1350, 5):
        r, g, b, a = img2.getpixel((w//2, y))
        if a > 0:
            rq, gq, bq = r//32, g//32, b//32
            ck = f'{rq},{gq},{bq}'
            if ck != prev_color:
                print(f'  y={y:4d}: rgb({r},{g},{b})')
                prev_color = ck