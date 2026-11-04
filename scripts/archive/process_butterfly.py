import sys
from PIL import Image, ImageFilter
from collections import deque
import numpy as np

src_path = r'C:\Users\Admin\.gemini\antigravity\brain\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5\rainbow_butterfly_sprite_png_1793459739521.jpg'
dest_path = r'assets\sprites\effects\butterfly_rainbow.png'

im = Image.open(src_path).convert('RGBA')
width, height = im.size
pixels = np.array(im)

# Flood fill from borders to identify outer background
bg_mask = np.zeros((height, width), dtype=bool)
visited = np.zeros((height, width), dtype=bool)

# Color condition for white background: R>235, G>235, B>235
r = pixels[:, :, 0]
g = pixels[:, :, 1]
b = pixels[:, :, 2]
is_white = (r >= 235) & (g >= 235) & (b >= 235)

queue = deque()
for x in range(width):
    if is_white[0, x]: queue.append((0, x))
    if is_white[height - 1, x]: queue.append((height - 1, x))
for y in range(height):
    if is_white[y, 0]: queue.append((y, 0))
    if is_white[y, width - 1]: queue.append((y, width - 1))

for y, x in queue:
    visited[y, x] = True

while queue:
    y, x = queue.popleft()
    bg_mask[y, x] = True
    
    for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        ny, nx = y + dy, x + dx
        if 0 <= ny < height and 0 <= nx < width:
            if not visited[ny, nx] and is_white[ny, nx]:
                visited[ny, nx] = True
                queue.append((ny, nx))

# Create alpha channel: 0 where bg_mask is True, 255 otherwise
alpha = np.where(bg_mask, 0, 255).astype(np.uint8)

# Feather the edges slightly: convert alpha to image, apply subtle Gaussian blur, or distance
alpha_img = Image.fromarray(alpha, mode='L')
# Smooth mask slightly to prevent jagged edges
alpha_smooth = alpha_img.filter(ImageFilter.GaussianBlur(radius=0.75))

pixels[:, :, 3] = np.array(alpha_smooth)
result = Image.fromarray(pixels, mode='RGBA')

# Crop to content bbox
bbox = result.getbbox()
if bbox:
    # Add small margin
    margin = 10
    left = max(0, bbox[0] - margin)
    top = max(0, bbox[1] - margin)
    right = min(width, bbox[2] + margin)
    bottom = min(height, bbox[3] + margin)
    result = result.crop((left, top, right, bottom))

# Resize to high-DPI sprite (e.g. max dimension 256px)
w, h = result.size
scale = 256.0 / max(w, h)
new_w, new_h = int(w * scale), int(h * scale)
result = result.resize((new_w, new_h), Image.Resampling.LANCZOS)

import os
os.makedirs(os.path.dirname(dest_path), exist_ok=True)
result.save(dest_path, 'PNG')
print(f"Successfully saved transparent butterfly sprite to {dest_path} with size {result.size}")
