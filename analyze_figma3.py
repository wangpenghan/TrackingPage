from PIL import Image

# Detailed analysis of the table area (y=400-700) and the main content area
img = Image.open('figma_1_途径车.png')
w, h = img.size

# Scan for vertical column boundaries by looking for repeating vertical lines/separation
print('=== Vertical column analysis (finding vertical gray lines) ===')
gray_cols = set()
for y in [410, 420, 440, 460, 500]:
    for x in range(0, w):
        r, g, b, a = img.getpixel((x, y))
        # Detect gray vertical separators (not white, not dark text)
        if 160 < r < 210 and 160 < g < 210 and 160 < b < 210:
            gray_cols.add(x)
if gray_cols:
    cols_sorted = sorted(gray_cols)
    # Group consecutive x values
    groups = []
    start = cols_sorted[0]
    prev = cols_sorted[0]
    for x in cols_sorted[1:]:
        if x - prev > 3:
            groups.append((start, prev))
            start = x
        prev = x
    groups.append((start, prev))
    for g in groups:
        if g[1] - g[0] > 0:
            print(f'  Gray line at x={g[0]}-{g[1]}')

# Horizontal line detection (separators)
print('\n=== Horizontal line detection ===')
for y in range(0, h):
    gray_count = 0
    for x in range(0, w):
        r, g, b, a = img.getpixel((x, y))
        if 170 < r < 220 and 170 < g < 220 and 170 < b < 220:
            gray_count += 1
    if gray_count > 800:  # Most of the width is a gray line
        print(f'  y={y}: gray_horizontal_line ({gray_count}px)')

# Detailed text analysis in table header area
print('\n=== Table header area (y=425-460) detailed text positions ===')
for y in range(425, 460):
    text_segments = []
    seg_start = None
    for x in range(0, w):
        r, g, b, a = img.getpixel((x, y))
        is_dark = r < 80 and g < 80 and b < 80
        if is_dark and seg_start is None:
            seg_start = x
        elif not is_dark and seg_start is not None:
            text_segments.append((seg_start, x-1))
            seg_start = None
    if seg_start is not None:
        text_segments.append((seg_start, w-1))
    
    meaningful = [(s, e) for s, e in text_segments if e - s > 5]
    if meaningful:
        segs = ' | '.join([f'x={s:3d}-{e:3d}(w={e-s+1})' for s, e in meaningful])
        print(f'  y={y}: {segs}')

# Detailed table data rows (y=750-1250)
print('\n=== Table data rows - first column positions ===')
for y in range(699, 1265):
    dark_count_small = 0
    for x in range(50, 200):
        r, g, b, a = img.getpixel((x, y))
        if r < 80 and g < 80 and b < 80:
            dark_count_small += 1
    if dark_count_small > 5:
        # Find exact x range
        segs = []
        seg_start = None
        for x in range(50, 200):
            r, g, b, a = img.getpixel((x, y))
            is_dark = r < 80 and g < 80 and b < 80
            if is_dark and seg_start is None:
                seg_start = x
            elif not is_dark and seg_start is not None:
                segs.append((seg_start, x-1, x-seg_start))
                seg_start = None
        if seg_start is not None:
            segs.append((seg_start, 200, 200-seg_start))
        meaningful = [(s, e, w) for s, e, w in segs if w > 5]
        if meaningful:
            seg_str = ' | '.join([f'x={s:3d}-{e:3d}(w={w})' for s, e, w in meaningful])
            print(f'  y={y:4d}: L col: {seg_str}')