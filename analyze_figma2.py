from PIL import Image

# Analyze x-positions of text at specific y-lines to understand layout
img = Image.open('figma_1_途径车.png')
w, h = img.size

key_y = [50, 175, 265, 350, 430, 750, 755, 760, 765, 770, 845, 
         1010, 1020, 1135, 1140, 1150, 1210, 1220,
         1335, 1420, 1425, 1550, 1555, 1680, 1700]

for y in key_y:
    dark_segments = []
    segment_start = None
    for x in range(0, w):
        r, g, b, a = img.getpixel((x, y))
        is_dark = r < 80 and g < 80 and b < 80
        if is_dark and segment_start is None:
            segment_start = x
        elif not is_dark and segment_start is not None:
            dark_segments.append((segment_start, x-1, x-segment_start))
            segment_start = None
    if segment_start is not None:
        dark_segments.append((segment_start, w-1, w-segment_start))
    
    if dark_segments:
        segs_str = '; '.join([f'x={s[0]:3d}-{s[1]:3d}(w={s[2]})' for s in dark_segments if s[2] > 3])
        if segs_str:
            print(f'  y={y:4d}: {segs_str}')

print()
print('=== Compare all three images at key y-positions ===')
for fname in ['figma_1_途径车.png','figma_2_始发车.png','figma_3_终到车.png']:
    img2 = Image.open(fname)
    print(f'\n--- {fname.split("_")[1]} ---')
    # Check for differences in the white section
    for y in range(699, 1265, 5):
        r, g, b, a = img2.getpixel((w//2, y))
        # Check for non-white pixels
        if not (r > 245 and g > 245 and b > 245):
            pass  # non-white pixel
    # Compare dark pixels in key ranges
    for yr in [(699, 1265, 'white_section'), (1269, 1679, 'blue_section')]:
        total_dark = 0
        max_dark_y = 0
        max_dark_count = 0
        for y in range(yr[0], yr[1], 3):
            dark_count = 0
            for x in range(50, w-50):
                r, g, b, a = img2.getpixel((x, y))
                if r < 80 and g < 80 and b < 80:
                    dark_count += 1
            total_dark += dark_count
            if dark_count > max_dark_count:
                max_dark_count = dark_count
                max_dark_y = y
        print(f'  {yr[2]}: total_dark={total_dark}, max_row=y={max_dark_y}({max_dark_count})')

print()
print('=== Button area analysis (y=1680-1760) ===')
for fname in ['figma_1_途径车.png','figma_2_始发车.png','figma_3_终到车.png']:
    img2 = Image.open(fname)
    print(f'\n--- {fname.split("_")[1]} ---')
    for y in [1680, 1690, 1700, 1710, 1720, 1730, 1740, 1750]:
        left_dark = 0
        right_dark = 0
        for x in range(50, w//2):
            r, g, b, a = img2.getpixel((x, y))
            if r < 80 and g < 80 and b < 80:
                left_dark += 1
        for x in range(w//2, w-50):
            r, g, b, a = img2.getpixel((x, y))
            if r < 80 and g < 80 and b < 80:
                right_dark += 1
        print(f'  y={y}: left_dark={left_dark}, right_dark={right_dark}')