import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def create_rod_held_image(tier_config, size=512):
    W = size * 2
    H = size * 2
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    
    hx1, hy1 = W * 0.12, H * 0.88
    tx1, ty1 = W * 0.88, H * 0.12
    
    dx = tx1 - hx1
    dy = ty1 - hy1
    rod_len = math.hypot(dx, dy)
    ux = dx / rod_len
    uy = dy / rod_len
    nx = -uy
    ny = ux
    
    # 1. Soft Shadow
    shadow_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow_img)
    sdraw.line([(hx1 + 14, hy1 + 22), (tx1 + 14, ty1 + 22)], fill=(10, 20, 30, 80), width=44)
    rx = hx1 + ux * (rod_len * 0.35) + 14
    ry = hy1 + uy * (rod_len * 0.35) + 22
    sdraw.ellipse([rx - 65, ry - 65, rx + 65, ry + 65], fill=(10, 20, 30, 90))
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(20))
    img.paste(shadow_img, (0, 0), shadow_img)
    
    # 2. Shaft
    shaft_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shdraw = ImageDraw.Draw(shaft_img)
    
    grip_end = 0.28
    grip_p2_x = hx1 + ux * (rod_len * grip_end)
    grip_p2_y = hy1 + uy * (rod_len * grip_end)
    
    grip_w = 52
    grip_color = tier_config["grip_color"]
    grip_hi = tier_config["grip_highlight"]
    
    shdraw.line([(hx1, hy1), (grip_p2_x, grip_p2_y)], fill=grip_color, width=grip_w)
    shdraw.line([(hx1 + nx * 9, hy1 + ny * 9), (grip_p2_x + nx * 9, grip_p2_y + ny * 9)], fill=grip_hi, width=14)
    shdraw.line([(hx1 - ux * 4, hy1 - uy * 4), (hx1 + ux * 6, hy1 + uy * 6)], fill=(240, 200, 80, 255), width=grip_w + 6)
    shdraw.line([(grip_p2_x - ux * 5, grip_p2_y - uy * 5), (grip_p2_x + ux * 5, grip_p2_y + uy * 5)], fill=(240, 200, 80, 255), width=grip_w + 6)
    
    shaft_steps = 100
    colors = tier_config["shaft_colors"]
    for i in range(shaft_steps):
        t1 = grip_end + (1.0 - grip_end) * (i / shaft_steps)
        t2 = grip_end + (1.0 - grip_end) * ((i + 1) / shaft_steps)
        
        sx1 = hx1 + ux * (rod_len * t1)
        sy1 = hy1 + uy * (rod_len * t1)
        sx2 = hx1 + ux * (rod_len * t2)
        sy2 = hy1 + uy * (rod_len * t2)
        
        cur_w = int(40 - 20 * (i / shaft_steps))
        
        c_idx = (i / shaft_steps) * (len(colors) - 1)
        c0 = colors[int(c_idx)]
        c1 = colors[min(len(colors) - 1, int(c_idx) + 1)]
        ratio = c_idx - int(c_idx)
        r = int(c0[0] * (1 - ratio) + c1[0] * ratio)
        g = int(c0[1] * (1 - ratio) + c1[1] * ratio)
        b = int(c0[2] * (1 - ratio) + c1[2] * ratio)
        
        shdraw.line([(sx1, sy1), (sx2, sy2)], fill=(r, g, b, 255), width=cur_w)
        hi_r = min(255, r + 90)
        hi_g = min(255, g + 90)
        hi_b = min(255, b + 90)
        shdraw.line([(sx1 + nx * (cur_w * 0.22), sy1 + ny * (cur_w * 0.22)), 
                     (sx2 + nx * (cur_w * 0.22), sy2 + ny * (cur_w * 0.22))], 
                    fill=(hi_r, hi_g, hi_b, 220), width=max(4, int(cur_w * 0.3)))
    
    for ring_t in [0.42, 0.58, 0.74, 0.90]:
        rgx = hx1 + ux * (rod_len * ring_t)
        rgy = hy1 + uy * (rod_len * ring_t)
        rw = int(38 - 18 * ring_t)
        shdraw.line([(rgx - nx * (rw/2 + 3), rgy - ny * (rw/2 + 3)), 
                     (rgx + nx * (rw/2 + 3), rgy + ny * (rw/2 + 3))], 
                    fill=(255, 220, 110, 255), width=8)
        shdraw.ellipse([rgx - nx*18 - 8, rgy - ny*18 - 8, rgx - nx*18 + 8, rgy - ny*18 + 8], 
                       outline=(255, 235, 140, 255), width=3)
        
    tip_glow = tier_config["tip_glow"]
    shdraw.circle((tx1, ty1), 20, fill=tip_glow)
    shdraw.circle((tx1 - 4, ty1 - 4), 8, fill=(255, 255, 255, 255))
    
    img.paste(shaft_img, (0, 0), shaft_img)
    
    # 3. Reel
    reel_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    rdraw = ImageDraw.Draw(reel_img)
    reel_center_x = hx1 + ux * (rod_len * 0.32) + nx * 14
    reel_center_y = hy1 + uy * (rod_len * 0.32) + ny * 14
    
    rdraw.line([(reel_center_x - nx * 18, reel_center_y - ny * 18), (reel_center_x, reel_center_y)], fill=(180, 190, 205, 255), width=18)
    
    reel_radius = 62
    reel_col = tier_config["reel_color"]
    reel_accent = tier_config["reel_accent"]
    
    rdraw.circle((reel_center_x, reel_center_y), reel_radius, fill=reel_col)
    rdraw.circle((reel_center_x, reel_center_y), reel_radius, outline=(255, 245, 210, 255), width=7)
    rdraw.circle((reel_center_x, reel_center_y), reel_radius - 14, fill=reel_accent)
    rdraw.circle((reel_center_x, reel_center_y), reel_radius - 24, fill=reel_col)
    rdraw.circle((reel_center_x, reel_center_y), 16, fill=(255, 255, 255, 255))
    rdraw.circle((reel_center_x, reel_center_y), 10, fill=(240, 180, 50, 255))
    
    crank_x = reel_center_x + 36
    crank_y = reel_center_y + 16
    rdraw.line([(reel_center_x, reel_center_y), (crank_x, crank_y)], fill=(200, 205, 220, 255), width=11)
    rdraw.circle((crank_x, crank_y), 14, fill=tier_config["grip_color"])
    rdraw.circle((crank_x - 3, crank_y - 3), 5, fill=(255, 255, 255, 255))
    
    img.paste(reel_img, (0, 0), reel_img)
    
    return img.resize((size, size), Image.Resampling.LANCZOS)

from generate_rod_tier_assets import TIERS, create_rod_image, out_dirs

for tier in TIERS:
    rod_id = tier["id"]
    filename_held = f"{rod_id}_held.png"
    print(f"Generating {rod_id}_held -> {filename_held}...")
    img_held = create_rod_held_image(tier, size=512)
    for d in out_dirs:
        target_path = os.path.join(d, filename_held)
        img_held.save(target_path, "PNG")
        print(f"  Saved held rod to {target_path}")

print("ALL HELD RODS CREATED!")
