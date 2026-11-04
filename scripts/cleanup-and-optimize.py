import os
import glob
import shutil
import json
import re
from PIL import Image

WORKSPACE = r"C:\Users\Admin\Desktop\GAME_HỌC"
os.chdir(WORKSPACE)

print("=== 1. XOÁ CÁC FILE & THƯ MỤC TẠM / RÁC ===")

root_patterns = [
    "front_frame_*.png",
    "portrait_feet_*.png",
    "side_frame_*.png",
    "target_face.png",
    "temp_*.png",
    "verify_*.png",
    "white_triangle_patch.png",
    "hero_upgrade_idle_feet.png",
    "desert_monster_preview.html",
    "test_kitchen_complete.js"
]

deleted_files_count = 0
deleted_bytes = 0

for pat in root_patterns:
    for f in glob.glob(pat):
        try:
            size = os.path.getsize(f)
            os.remove(f)
            deleted_files_count += 1
            deleted_bytes += size
            print(f"  [Xoá file root] {f} ({size // 1024} KB)")
        except Exception as e:
            print(f"  [Lỗi xoá {f}]: {e}")

temp_dirs = [
    "temp_frames",
    "temp_sam_frames",
    "Test_maps",
    "scratch",
    "test-results",
    os.path.join("scripts", "__pycache__")
]

for d in temp_dirs:
    if os.path.exists(d):
        try:
            shutil.rmtree(d)
            print(f"  [Xoá thư mục rác] {d}")
        except Exception as e:
            print(f"  [Lỗi xoá thư mục {d}]: {e}")

print(f"-> Đã dọn dẹp {deleted_files_count} file rác ở root (~{deleted_bytes // 1024} KB).")

print("\n=== 2. KIỂM KÊ VÀ XOÁ ASSETS MỒ CÔI (ORPHAN ASSETS KHÔNG SỬ DỤNG) ===")

# Đọc tất cả code trong src/, public/, index.html, scripts/build-portable.mjs
all_code = ""
for root, dirs, files in os.walk("src"):
    for f in files:
        if f.endswith(('.js', '.css', '.html', '.json')):
            try:
                with open(os.path.join(root, f), 'r', encoding='utf-8', errors='ignore') as fp:
                    all_code += fp.read() + "\n"
            except:
                pass

for top_f in ["index.html", "dev.html", os.path.join("scripts", "build-portable.mjs")]:
    if os.path.exists(top_f):
        try:
            with open(top_f, 'r', encoding='utf-8', errors='ignore') as fp:
                all_code += fp.read() + "\n"
        except:
            pass

# Đọc portable-assets.json nếu có
portable_assets = set()
portable_manifest = os.path.join("scripts", "portable-assets.json")
if os.path.exists(portable_manifest):
    try:
        with open(portable_manifest, 'r', encoding='utf-8') as fp:
            data = json.load(fp)
            if isinstance(data, dict):
                portable_assets.update(data.keys())
                portable_assets.update(data.values())
            elif isinstance(data, list):
                portable_assets.update(data)
    except:
        pass

orphan_deleted_count = 0
orphan_deleted_bytes = 0

for root, dirs, files in os.walk("assets"):
    for f in files:
        full_path = os.path.join(root, f)
        norm_path = full_path.replace("\\", "/")
        rel_path = norm_path
        if not rel_path.startswith("/"):
            rel_path_with_slash = "/" + rel_path
        else:
            rel_path_with_slash = rel_path
        
        base_name = os.path.basename(f)

        # Kiểm tra xem file có được tham chiếu không
        is_used = False
        if f in all_code or base_name in all_code or rel_path in all_code or rel_path_with_slash in all_code:
            is_used = True
        elif norm_path in portable_assets or rel_path in portable_assets or base_name in portable_assets:
            is_used = True
        
        # Một số pattern cần bảo tồn
        if "accessories" in norm_path or "backpack" in norm_path or "fishing" in norm_path or "dishes" in norm_path or "ingredients" in norm_path or "pet_dog" in norm_path or "sau" in norm_path or "kuromi" in norm_path:
            # Chỉ xoá nếu là file backup .old hoặc .bak
            if f.endswith(('.old', '.bak', '.tmp')):
                is_used = False
            else:
                is_used = True
        
        if not is_used:
            try:
                size = os.path.getsize(full_path)
                os.remove(full_path)
                orphan_deleted_count += 1
                orphan_deleted_bytes += size
                # print(f"  [Xoá asset mồ côi] {norm_path} ({size // 1024} KB)")
            except Exception as e:
                pass

print(f"-> Đã dọn {orphan_deleted_count} assets mồ côi (~{orphan_deleted_bytes // (1024 * 1024)} MB).")

print("\n=== 3. TỐI ƯU HÓA HÌNH ẢNH BACKGROUNDS & ICONS (GIẢM KÍCH THƯỚC BUNDLE) ===")

# Danh sách backgrounds trong assets/maps/backgrounds/
bg_files = glob.glob(r"assets\maps\backgrounds\*.png") + glob.glob(r"assets\maps\backgrounds\*.jpg")
bg_saved_bytes = 0

for bg in bg_files:
    try:
        old_size = os.path.getsize(bg)
        im = Image.open(bg)
        orig_w, orig_h = im.size
        # Palette quantize 256 màu với method=2 (Fast Octree)
        if im.mode == 'RGBA':
            im_q = im.convert('RGBA').quantize(colors=256, method=2)
        else:
            im_q = im.convert('RGB').quantize(colors=256)
        im_q.save(bg, format='PNG', optimize=True)
        new_size = os.path.getsize(bg)
        saved = old_size - new_size
        if saved > 0:
            bg_saved_bytes += saved
            pct = (saved / old_size) * 100
            print(f"  [Tối ưu BG] {os.path.basename(bg)}: {old_size//1024}KB -> {new_size//1024}KB (Giảm {pct:.1f}%)")
    except Exception as e:
        print(f"  [Lỗi tối ưu BG {bg}]: {e}")

print(f"-> Tổng dung lượng background tiết kiệm: {bg_saved_bytes // (1024 * 1024)} MB.")

# Resize các món ăn trong assets/cooking/dishes/ nếu kích thước > 256px
dish_files = glob.glob(r"assets\cooking\dishes\*.png")
dish_saved_bytes = 0

for df in dish_files:
    try:
        old_size = os.path.getsize(df)
        im = Image.open(df)
        w, h = im.size
        if w > 256 or h > 256:
            im.thumbnail((256, 256), Image.Resampling.LANCZOS)
            if im.mode == 'RGBA':
                im = im.quantize(colors=256, method=2)
            im.save(df, format='PNG', optimize=True)
            new_size = os.path.getsize(df)
            saved = old_size - new_size
            if saved > 0:
                dish_saved_bytes += saved
                pct = (saved / old_size) * 100
                print(f"  [Tối ưu Dish] {os.path.basename(df)}: {old_size//1024}KB -> {new_size//1024}KB ({pct:.1f}%)")
    except Exception as e:
        pass

print(f"-> Tổng dung lượng dish icon tiết kiệm: {dish_saved_bytes // 1024} KB.")

print("\n=== HOÀN TẤT DỌN DẸP & TỐI ƯU HÓA ASSETS! ===")
