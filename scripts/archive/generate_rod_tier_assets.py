import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import os

def create_rod_image(tier_config, size=512):
    # Render at 2x for supersampling (1024x1024 down to 512x512)
    W = size * 2
    H = size * 2
    
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Coordinates for rod (from handle bottom-left to tip top-right)
    # Rod angle ~45 degrees
    hx1, hy1 = W * 0.14, H * 0.86
    tx1, ty1 = W * 0.82, H * 0.18
    
    dx = tx1 - hx1
    dy = ty1 - hy1
    rod_len = math.hypot(dx, dy)
    ux = dx / rod_len
    uy = dy / rod_len
    # Normal vector perpendicular to rod
    nx = -uy
    ny = ux
    
    # 1. Soft Ambient Drop Shadow under the rod & bobber
    shadow_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow_img)
    # Shadow for rod
    s_offset_x = 18
    s_offset_y = 28
    sdraw.line([(hx1 + s_offset_x, hy1 + s_offset_y), (tx1 + s_offset_x, ty1 + s_offset_y)], fill=(10, 20, 30, 90), width=int(38))
    # Shadow for reel
    rx = hx1 + ux * (rod_len * 0.35) + s_offset_x
    ry = hy1 + uy * (rod_len * 0.35) + s_offset_y
    sdraw.ellipse([rx - 65, ry - 65, rx + 65, ry + 65], fill=(10, 20, 30, 95))
    # Shadow for bobber
    bx = W * 0.74 + s_offset_x
    by = H * 0.68 + s_offset_y
    sdraw.ellipse([bx - 90, by - 55, bx + 90, by + 55], fill=(10, 20, 30, 100))
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(24))
    img.paste(shadow_img, (0, 0), shadow_img)
    
    # 2. Draw Fishing Line hanging from tip to bobber
    line_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ldraw = ImageDraw.Draw(line_img)
    
    bobber_center_x = W * 0.74
    bobber_center_y = H * 0.68
    
    # Curved line
    points = []
    ctrl_x = tx1 + 10
    ctrl_y = (ty1 + bobber_center_y) / 2 + 30
    for t in np.linspace(0, 1, 40):
        px = (1 - t)**2 * tx1 + 2 * (1 - t) * t * ctrl_x + t**2 * bobber_center_x
        py = (1 - t)**2 * ty1 + 2 * (1 - t) * t * ctrl_y + t**2 * (bobber_center_y - 60)
        points.append((px, py))
    ldraw.line(points, fill=(230, 245, 255, 200), width=6)
    ldraw.line(points, fill=(255, 255, 255, 240), width=3)
    img.paste(line_img, (0, 0), line_img)
    
    # 3. Draw Rod Shaft with 3D gradient/segments
    shaft_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shdraw = ImageDraw.Draw(shaft_img)
    
    # Grip portion (from 0 to 0.28 of rod_len)
    grip_end = 0.28
    grip_p2_x = hx1 + ux * (rod_len * grip_end)
    grip_p2_y = hy1 + uy * (rod_len * grip_end)
    
    grip_w = 46
    grip_color = tier_config["grip_color"]
    grip_hi = tier_config["grip_highlight"]
    
    # Draw grip base
    shdraw.line([(hx1, hy1), (grip_p2_x, grip_p2_y)], fill=grip_color, width=grip_w)
    # Grip highlight line
    shdraw.line([(hx1 + nx * 8, hy1 + ny * 8), (grip_p2_x + nx * 8, grip_p2_y + ny * 8)], fill=grip_hi, width=12)
    # Grip end ring
    shdraw.line([(hx1 - ux * 4, hy1 - uy * 4), (hx1 + ux * 6, hy1 + uy * 6)], fill=(240, 200, 80, 255), width=grip_w + 6)
    shdraw.line([(grip_p2_x - ux * 5, grip_p2_y - uy * 5), (grip_p2_x + ux * 5, grip_p2_y + uy * 5)], fill=(240, 200, 80, 255), width=grip_w + 6)
    
    # Main Rod Shaft (from grip_p2 to tip)
    shaft_steps = 100
    colors = tier_config["shaft_colors"]
    for i in range(shaft_steps):
        t1 = grip_end + (1.0 - grip_end) * (i / shaft_steps)
        t2 = grip_end + (1.0 - grip_end) * ((i + 1) / shaft_steps)
        
        sx1 = hx1 + ux * (rod_len * t1)
        sy1 = hy1 + uy * (rod_len * t1)
        sx2 = hx1 + ux * (rod_len * t2)
        sy2 = hy1 + uy * (rod_len * t2)
        
        # Tapering width from 34 down to 18
        cur_w = int(36 - 18 * (i / shaft_steps))
        
        # Pick color along shaft
        c_idx = (i / shaft_steps) * (len(colors) - 1)
        c0 = colors[int(c_idx)]
        c1 = colors[min(len(colors) - 1, int(c_idx) + 1)]
        ratio = c_idx - int(c_idx)
        r = int(c0[0] * (1 - ratio) + c1[0] * ratio)
        g = int(c0[1] * (1 - ratio) + c1[1] * ratio)
        b = int(c0[2] * (1 - ratio) + c1[2] * ratio)
        
        shdraw.line([(sx1, sy1), (sx2, sy2)], fill=(r, g, b, 255), width=cur_w)
        # Specular 3D highlight on top edge
        hi_r = min(255, r + 90)
        hi_g = min(255, g + 90)
        hi_b = min(255, b + 90)
        shdraw.line([(sx1 + nx * (cur_w * 0.22), sy1 + ny * (cur_w * 0.22)), 
                     (sx2 + nx * (cur_w * 0.22), sy2 + ny * (cur_w * 0.22))], 
                    fill=(hi_r, hi_g, hi_b, 220), width=max(3, int(cur_w * 0.3)))
    
    # Guide Rings along rod
    for ring_t in [0.42, 0.58, 0.74, 0.90]:
        rgx = hx1 + ux * (rod_len * ring_t)
        rgy = hy1 + uy * (rod_len * ring_t)
        rw = int(34 - 16 * ring_t)
        shdraw.line([(rgx - nx * (rw/2 + 2), rgy - ny * (rw/2 + 2)), 
                     (rgx + nx * (rw/2 + 2), rgy + ny * (rw/2 + 2))], 
                    fill=(255, 220, 110, 255), width=7)
        # Small eyelet ring
        shdraw.ellipse([rgx - nx*16 - 7, rgy - ny*16 - 7, rgx - nx*16 + 7, rgy - ny*16 + 7], 
                       outline=(255, 235, 140, 255), width=3)
        
    # Rod Tip glowing bulb
    tip_glow = tier_config["tip_glow"]
    shdraw.circle((tx1, ty1), 16, fill=tip_glow)
    shdraw.circle((tx1 - 3, ty1 - 3), 6, fill=(255, 255, 255, 255))
    
    img.paste(shaft_img, (0, 0), shaft_img)
    
    # 4. Reel (Cuộn Dây Cước 3D)
    reel_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    rdraw = ImageDraw.Draw(reel_img)
    reel_center_x = hx1 + ux * (rod_len * 0.32) + nx * 14
    reel_center_y = hy1 + uy * (rod_len * 0.32) + ny * 14
    
    # Reel mount
    rdraw.line([(reel_center_x - nx * 18, reel_center_y - ny * 18), (reel_center_x, reel_center_y)], fill=(180, 190, 205, 255), width=16)
    
    # Reel outer wheel
    reel_radius = 56
    reel_col = tier_config["reel_color"]
    reel_accent = tier_config["reel_accent"]
    
    rdraw.circle((reel_center_x, reel_center_y), reel_radius, fill=reel_col)
    rdraw.circle((reel_center_x, reel_center_y), reel_radius, outline=(255, 245, 210, 255), width=6)
    # Inner spool line
    rdraw.circle((reel_center_x, reel_center_y), reel_radius - 12, fill=reel_accent)
    rdraw.circle((reel_center_x, reel_center_y), reel_radius - 22, fill=reel_col)
    # Center cap
    rdraw.circle((reel_center_x, reel_center_y), 15, fill=(255, 255, 255, 255))
    rdraw.circle((reel_center_x, reel_center_y), 9, fill=(240, 180, 50, 255))
    # Handle crank
    crank_x = reel_center_x + 32
    crank_y = reel_center_y + 14
    rdraw.line([(reel_center_x, reel_center_y), (crank_x, crank_y)], fill=(200, 205, 220, 255), width=10)
    rdraw.circle((crank_x, crank_y), 12, fill=tier_config["grip_color"])
    rdraw.circle((crank_x - 2, crank_y - 2), 4, fill=(255, 255, 255, 255))
    
    # Themed decorative emblem on reel
    emblem = tier_config.get("emblem_type")
    if emblem == "lotus":
        # Pink lotus flower petal
        rdraw.polygon([(reel_center_x, reel_center_y - 28), (reel_center_x - 14, reel_center_y - 8), (reel_center_x, reel_center_y - 12), (reel_center_x + 14, reel_center_y - 8)], fill=(251, 113, 133, 255))
    elif emblem == "duck":
        # Cute duck beak/eye
        rdraw.ellipse([reel_center_x - 8, reel_center_y - 26, reel_center_x + 16, reel_center_y - 10], fill=(249, 115, 22, 255))
    elif emblem == "star":
        # Golden star
        rdraw.polygon([
            (reel_center_x, reel_center_y - 24),
            (reel_center_x + 6, reel_center_y - 12),
            (reel_center_x + 20, reel_center_y - 10),
            (reel_center_x + 10, reel_center_y),
            (reel_center_x + 14, reel_center_y + 14),
            (reel_center_x, reel_center_y + 6),
            (reel_center_x - 14, reel_center_y + 14),
            (reel_center_x - 10, reel_center_y),
            (reel_center_x - 20, reel_center_y - 10),
            (reel_center_x - 6, reel_center_y - 12)
        ], fill=(254, 240, 138, 255))
    elif emblem == "dragon":
        # Red dragon orb
        rdraw.circle((reel_center_x, reel_center_y - 16), 14, fill=(239, 68, 68, 255))
        rdraw.circle((reel_center_x - 3, reel_center_y - 19), 5, fill=(255, 255, 255, 240))
        
    img.paste(reel_img, (0, 0), reel_img)
    
    # 5. Themed 3D Bobber (Phao Câu Theo Cấp Độ)
    bobber_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(bobber_img)
    
    bobber_style = tier_config.get("bobber_style", "circle")
    br = 76 # Bobber radius
    
    if bobber_style == "lotus":
        # Round glossy sphere with lotus leaf cup underneath
        # Leaf cup
        bdraw.chord([bobber_center_x - br, bobber_center_y - 10, bobber_center_x + br, bobber_center_y + br + 10], 0, 180, fill=(34, 197, 94, 255))
        # Pink sphere top
        bdraw.ellipse([bobber_center_x - br + 6, bobber_center_y - br + 6, bobber_center_x + br - 6, bobber_center_y + br - 6], fill=(244, 63, 94, 255))
        # 3D gradient highlight
        bdraw.ellipse([bobber_center_x - br/2 - 6, bobber_center_y - br/2 - 8, bobber_center_x + br/2 - 16, bobber_center_y], fill=(254, 205, 211, 230))
        bdraw.ellipse([bobber_center_x - 24, bobber_center_y - 36, bobber_center_x - 4, bobber_center_y - 16], fill=(255, 255, 255, 255))
    elif bobber_style == "duck":
        # Yellow rubber duck bobber!
        # Duck body
        bdraw.ellipse([bobber_center_x - br, bobber_center_y - br*0.4, bobber_center_x + br*0.8, bobber_center_y + br*0.8], fill=(250, 204, 21, 255))
        # Duck head
        dh_x = bobber_center_x - br*0.3
        dh_y = bobber_center_y - br*0.45
        bdraw.circle((dh_x, dh_y), 44, fill=(253, 224, 71, 255))
        # Beak
        bdraw.polygon([(dh_x - 38, dh_y + 2), (dh_x - 62, dh_y + 10), (dh_x - 36, dh_y + 20)], fill=(249, 115, 22, 255))
        # Eye
        bdraw.circle((dh_x - 16, dh_y - 8), 7, fill=(30, 41, 59, 255))
        bdraw.circle((dh_x - 18, dh_y - 10), 3, fill=(255, 255, 255, 255))
        # Wing highlight
        bdraw.ellipse([bobber_center_x - 4, bobber_center_y, bobber_center_x + 52, bobber_center_y + 36], fill=(234, 179, 8, 255))
        bdraw.circle((dh_x + 6, dh_y - 16), 10, fill=(255, 255, 255, 200))
    elif bobber_style == "star":
        # Cyan sphere with 5-pointed golden star
        bdraw.circle((bobber_center_x, bobber_center_y), br, fill=(14, 165, 233, 255))
        bdraw.circle((bobber_center_x, bobber_center_y), br, outline=(125, 211, 252, 255), width=8)
        # Golden Star inside
        s_pts = []
        for a_i in range(10):
            ang = a_i * math.pi / 5 - math.pi / 2
            rad = 48 if a_i % 2 == 0 else 22
            s_pts.append((bobber_center_x + math.cos(ang) * rad, bobber_center_y + math.sin(ang) * rad))
        bdraw.polygon(s_pts, fill=(250, 204, 21, 255))
        bdraw.polygon(s_pts, outline=(254, 240, 138, 255), width=4)
        # Highlight
        bdraw.ellipse([bobber_center_x - 34, bobber_center_y - 54, bobber_center_x - 6, bobber_center_y - 26], fill=(255, 255, 255, 240))
    elif bobber_style == "rainbow":
        # Amethyst purple bobber with luminous star and rainbow ring
        bdraw.circle((bobber_center_x, bobber_center_y), br, fill=(168, 85, 247, 255))
        bdraw.circle((bobber_center_x, bobber_center_y), br, outline=(232, 121, 249, 255), width=8)
        # Golden star
        s_pts = []
        for a_i in range(10):
            ang = a_i * math.pi / 5 - math.pi / 2
            rad = 48 if a_i % 2 == 0 else 22
            s_pts.append((bobber_center_x + math.cos(ang) * rad, bobber_center_y + math.sin(ang) * rad))
        bdraw.polygon(s_pts, fill=(253, 224, 71, 255))
        # Highlight
        bdraw.ellipse([bobber_center_x - 34, bobber_center_y - 54, bobber_center_x - 6, bobber_center_y - 26], fill=(255, 255, 255, 255))
    elif bobber_style == "dragon":
        # Glowing Golden & Ruby Dragon Orb
        bdraw.circle((bobber_center_x, bobber_center_y), br, fill=(220, 38, 38, 255))
        bdraw.circle((bobber_center_x, bobber_center_y), br, outline=(251, 191, 36, 255), width=9)
        # Golden flaming crown
        bdraw.polygon([
            (bobber_center_x - 48, bobber_center_y - 10),
            (bobber_center_x - 30, bobber_center_y - 48),
            (bobber_center_x - 12, bobber_center_y - 18),
            (bobber_center_x, bobber_center_y - 58),
            (bobber_center_x + 12, bobber_center_y - 18),
            (bobber_center_x + 30, bobber_center_y - 48),
            (bobber_center_x + 48, bobber_center_y - 10),
            (bobber_center_x, bobber_center_y + 12)
        ], fill=(250, 204, 21, 255))
        # Flaming pearl highlight
        bdraw.ellipse([bobber_center_x - 36, bobber_center_y - 48, bobber_center_x - 8, bobber_center_y - 20], fill=(255, 255, 255, 255))
        
    img.paste(bobber_img, (0, 0), bobber_img)
    
    # 6. Sparkles & Level Star Emblems
    sparkle_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    spdraw = ImageDraw.Draw(sparkle_img)
    
    def draw_star_sparkle(cx, cy, r_out, r_in, col):
        pts = []
        for k in range(8):
            rad = r_out if k % 2 == 0 else r_in
            an = k * math.pi / 4
            pts.append((cx + math.cos(an) * rad, cy + math.sin(an) * rad))
        spdraw.polygon(pts, fill=col)
        
    for sp_x, sp_y, sp_s in tier_config.get("sparkles", []):
        draw_star_sparkle(W * sp_x, H * sp_y, sp_s * 2, sp_s * 0.7, (255, 255, 255, 240))
        
    img.paste(sparkle_img, (0, 0), sparkle_img)
    
    # Downsample from 1024x1024 to target size (512x512) with high quality anti-aliasing
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

# Tier Configurations
TIERS = [
    {
        "id": "rod_lotus",
        "level": 1,
        "name": "Cần Lá Sen",
        "grip_color": (120, 53, 15, 255),
        "grip_highlight": (180, 83, 9, 230),
        "shaft_colors": [(34, 197, 94), (74, 222, 128), (134, 239, 172)],
        "tip_glow": (244, 114, 182, 255),
        "reel_color": (234, 179, 8, 255),
        "reel_accent": (244, 63, 94, 255),
        "emblem_type": "lotus",
        "bobber_style": "lotus",
        "sparkles": [(0.78, 0.22, 10), (0.86, 0.65, 8)]
    },
    {
        "id": "rod_duck",
        "level": 2,
        "name": "Cần Vịt Con",
        "grip_color": (234, 88, 12, 255),
        "grip_highlight": (251, 146, 60, 230),
        "shaft_colors": [(245, 158, 11), (251, 191, 36), (254, 240, 138)],
        "tip_glow": (249, 115, 22, 255),
        "reel_color": (250, 204, 21, 255),
        "reel_accent": (249, 115, 22, 255),
        "emblem_type": "duck",
        "bobber_style": "duck",
        "sparkles": [(0.79, 0.20, 12), (0.84, 0.60, 10), (0.35, 0.38, 8)]
    },
    {
        "id": "rod_ocean_star",
        "level": 3,
        "name": "Cần Sao Biển",
        "grip_color": (3, 105, 161, 255),
        "grip_highlight": (14, 165, 233, 230),
        "shaft_colors": [(8, 145, 178), (6, 182, 212), (103, 232, 249)],
        "tip_glow": (250, 204, 21, 255),
        "reel_color": (14, 165, 233, 255),
        "reel_accent": (254, 240, 138, 255),
        "emblem_type": "star",
        "bobber_style": "star",
        "sparkles": [(0.80, 0.18, 14), (0.85, 0.62, 12), (0.62, 0.28, 10), (0.28, 0.45, 9)]
    },
    {
        "id": "rod_rainbow",
        "level": 4,
        "name": "Cần Cầu Vồng",
        "grip_color": (219, 39, 119, 255),
        "grip_highlight": (244, 114, 182, 230),
        "shaft_colors": [
            (239, 68, 68),   # Đỏ
            (249, 115, 22),  # Cam
            (234, 179, 8),   # Vàng
            (34, 197, 94),   # Lục
            (6, 182, 212),   # Lam
            (59, 130, 246),  # Chàm
            (168, 85, 247)   # Tím
        ],
        "tip_glow": (232, 121, 249, 255),
        "reel_color": (234, 179, 8, 255),
        "reel_accent": (168, 85, 247, 255),
        "emblem_type": "star",
        "bobber_style": "rainbow",
        "sparkles": [(0.81, 0.17, 16), (0.87, 0.63, 14), (0.58, 0.26, 12), (0.35, 0.40, 11)]
    },
    {
        "id": "rod_dragon",
        "level": 5,
        "name": "Cần Rồng Thần",
        "grip_color": (185, 28, 28, 255),
        "grip_highlight": (239, 68, 68, 230),
        "shaft_colors": [
            (180, 83, 9),    # Hổ phách
            (217, 119, 6),   # Đồng thau
            (245, 158, 11),  # Hoàng kim
            (251, 191, 36),  # Vàng rực
            (254, 240, 138)  # Kim cương sáng
        ],
        "tip_glow": (239, 68, 68, 255),
        "reel_color": (245, 158, 11, 255),
        "reel_accent": (220, 38, 38, 255),
        "emblem_type": "dragon",
        "bobber_style": "dragon",
        "sparkles": [(0.82, 0.16, 18), (0.88, 0.64, 16), (0.60, 0.24, 14), (0.38, 0.42, 13), (0.24, 0.58, 12)]
    }
]

out_dirs = [
    r"c:\Users\Admin\Desktop\GAME_HỌC\public\assets\fishing",
    r"c:\Users\Admin\Desktop\GAME_HỌC\assets\fishing"
]

for d in out_dirs:
    os.makedirs(d, exist_ok=True)

import sys
sys.stdout.reconfigure(encoding='utf-8')

for tier in TIERS:
    rod_id = tier["id"]
    filename = f"{rod_id}.png"
    print(f"Generating {rod_id} (Level {tier['level']}) -> {filename}...")
    img = create_rod_image(tier, size=512)
    for d in out_dirs:
        target_path = os.path.join(d, filename)
        img.save(target_path, "PNG")
        print(f"  Saved to {target_path}")

print("DONE GENERATING ALL 5 ROD ASSETS!")
