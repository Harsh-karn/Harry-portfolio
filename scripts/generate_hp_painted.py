import math
import random
import os
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageFont

random.seed(2026)

SCRATCH_DIR = "C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/scratch"
ARTIFACT_DIR = "C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e"
OUTPUT_DIR = "public/textures/corridor"

# 1. HOGWARTS PAINTED VERSION
def create_painted_hogwarts():
    sketch_im = Image.open(f"{OUTPUT_DIR}/hp_hogwarts_scene.webp").convert("RGBA")
    W, H = sketch_im.size
    
    # Create painted background layer
    painted = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(painted)
    
    # Sky gradient: deep royal navy / midnight indigo
    for y in range(480):
        t = y / 480.0
        r = int(14 + (28 - 14) * t)
        g = int(18 + (34 - 18) * t)
        b = int(45 + (70 - 45) * t)
        p_draw.line([(0, y), (W, y)], fill=(r, g, b, 255))
        
    # Lake gradient: deep dark lake water
    for y in range(480, H):
        t = (y - 480) / (H - 480.0)
        r = int(10 + (16 - 10) * t)
        g = int(14 + (22 - 14) * t)
        b = int(28 + (38 - 28) * t)
        p_draw.line([(0, y), (W, y)], fill=(r, g, b, 255))
        
    # Moon glow
    moon_glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    m_draw = ImageDraw.Draw(moon_glow)
    m_draw.ellipse([1035 - 70, 120 - 70, 1035 + 70, 120 + 70], fill=(255, 245, 180, 80))
    m_draw.ellipse([1035 - 35, 120 - 35, 1035 + 35, 120 + 35], fill=(255, 250, 210, 160))
    moon_glow = moon_glow.filter(ImageFilter.GaussianBlur(15))
    painted = Image.alpha_composite(painted, moon_glow)
    
    # Warm glowing windows in castle
    win_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    w_draw = ImageDraw.Draw(win_layer)
    
    # Great Hall Windows glow
    for bx in [665, 715, 765, 815, 865]:
        w_draw.rectangle([bx - 6, 305, bx + 6, 360], fill=(255, 210, 90, 220))
        # Window glow halo
        w_draw.ellipse([bx - 18, 325 - 25, bx + 18, 325 + 25], fill=(255, 180, 50, 100))
        
    # Astronomy & Headmaster Tower windows
    for wy in [230, 300, 370]:
        w_draw.rectangle([468, wy + 10, 492, wy + 35], fill=(255, 215, 100, 220))
    for wy in [275, 345]:
        w_draw.rectangle([560, wy + 5, 578, wy + 25], fill=(255, 215, 100, 220))
        
    win_layer = win_layer.filter(ImageFilter.GaussianBlur(5))
    painted = Image.alpha_composite(painted, win_layer)
    
    # Golden boat lanterns and water reflections
    boat_glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(boat_glow)
    
    boat_lanterns = [(320 + 36*1.25*0.85, 580 - 18*1.25), (570 + 36*1.1*0.85, 605 - 18*1.1), (820 + 36*0.85, 585 - 18), (970 + 36*0.75*0.85, 560 - 18*0.75)]
    for lx, ly in boat_lanterns:
        # Intense golden lantern core
        b_draw.ellipse([lx - 12, ly - 12, lx + 12, ly + 12], fill=(255, 220, 100, 240))
        b_draw.ellipse([lx - 30, ly - 30, lx + 30, ly + 30], fill=(255, 160, 40, 110))
        # Reflection on water
        for ry in range(int(ly) + 15, int(ly) + 65, 6):
            rw = max(4, 25 - (ry - ly) * 0.3)
            b_draw.line([(lx - rw, ry), (lx + rw, ry)], fill=(255, 190, 70, 140), width=3)
            
    # Castle window reflections on water
    for rx in [480, 570, 665, 715, 765, 815, 865]:
        for ry in range(545, 615, 7):
            b_draw.line([(rx - 12, ry), (rx + 12, ry)], fill=(255, 190, 70, 80), width=2)
            
    boat_glow = boat_glow.filter(ImageFilter.GaussianBlur(4))
    painted = Image.alpha_composite(painted, boat_glow)
    
    # Overlay the crisp sketch lineart on top of the painting
    # Multiply or composite sketch lines
    sketch_arr = np.array(sketch_im)
    painted_arr = np.array(painted)
    
    # Where sketch has dark lines, blend them
    alpha_mask = sketch_arr[:, :, 3] / 255.0
    for c in range(3):
        # Dark lines darken the painted layer
        painted_arr[:, :, c] = (painted_arr[:, :, c] * (1.0 - alpha_mask * 0.75) + sketch_arr[:, :, c] * (alpha_mask * 0.75)).astype(np.uint8)
    painted_arr[:, :, 3] = 255 # Solid painted canvas
    
    result = Image.fromarray(painted_arr, "RGBA")
    return result

# 2. PATRONUS PAINTED VERSION
def create_painted_patronus():
    sketch_im = Image.open(f"{OUTPUT_DIR}/hp_patronus_spell.webp").convert("RGBA")
    W, H = sketch_im.size
    
    # Create parchment background with celestial Patronus cyan glow
    painted = Image.new("RGBA", (W, H), (242, 238, 228, 255)) # Warm magical parchment
    p_draw = ImageDraw.Draw(painted)
    
    # Patronus radiant ethereal glow layer
    patronus_glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pg_draw = ImageDraw.Draw(patronus_glow)
    
    # Massive cyan-silver ethereal aura around the stag (Center: 880, 360)
    pg_draw.ellipse([880 - 240, 360 - 240, 880 + 240, 360 + 240], fill=(130, 225, 255, 90))
    pg_draw.ellipse([880 - 150, 360 - 150, 880 + 150, 360 + 150], fill=(185, 245, 255, 140))
    pg_draw.ellipse([880 - 80, 360 - 80, 880 + 80, 360 + 80], fill=(230, 252, 255, 200)) # Brilliant white-silver core
    
    # Antler tips celestial bursts
    for tx, ty in [(705, 220), (700, 168), (735, 118), (795, 45), (835, 35), (850, 50), (930, 60), (910, 45)]:
        pg_draw.ellipse([tx - 18, ty - 18, tx + 18, ty + 18], fill=(200, 245, 255, 180))
        
    # Wand tip burst (690, 550)
    pg_draw.ellipse([690 - 35, 550 - 35, 690 + 35, 550 + 35], fill=(140, 230, 255, 180))
    pg_draw.ellipse([690 - 15, 550 - 15, 690 + 15, 550 + 15], fill=(255, 255, 255, 240))
    
    patronus_glow = patronus_glow.filter(ImageFilter.GaussianBlur(18))
    painted = Image.alpha_composite(painted, patronus_glow)
    
    # Gold accents on quote box and compendium header
    accent_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    a_draw = ImageDraw.Draw(accent_layer)
    # Gold border highlight on quote box
    a_draw.rectangle([60, 185, 560, 350], outline=(200, 160, 60, 180), width=2)
    a_draw.rectangle([60, 375, 560, 650], outline=(180, 145, 55, 160), width=2)
    painted = Image.alpha_composite(painted, accent_layer)
    
    # Composite sketch lines
    sketch_arr = np.array(sketch_im)
    painted_arr = np.array(painted)
    
    alpha_mask = sketch_arr[:, :, 3] / 255.0
    for c in range(3):
        # Around the stag, let the lines take on brilliant glowing cyan-silver!
        painted_arr[:, :, c] = (painted_arr[:, :, c] * (1.0 - alpha_mask) + sketch_arr[:, :, c] * alpha_mask).astype(np.uint8)
        
    result = Image.fromarray(painted_arr, "RGBA")
    return result

def main():
    print("Creating painted companion textures...")
    hog_painted = create_painted_hogwarts()
    hog_painted.save(f"{ARTIFACT_DIR}/final_hogwarts_painted.png")
    hog_painted.save(f"{OUTPUT_DIR}/hp_hogwarts_scene_painted.webp", "WEBP", quality=95)
    print("hp_hogwarts_scene_painted.webp saved.")
    
    pat_painted = create_painted_patronus()
    pat_painted.save(f"{ARTIFACT_DIR}/final_patronus_painted.png")
    pat_painted.save(f"{OUTPUT_DIR}/hp_patronus_spell_painted.webp", "WEBP", quality=95)
    print("hp_patronus_spell_painted.webp saved.")
    
    # Save preview comparisons
    hog_painted.convert("RGB").save(f"{ARTIFACT_DIR}/preview_hp_hogwarts_scene_painted.jpg", quality=92)
    pat_painted.convert("RGB").save(f"{ARTIFACT_DIR}/preview_hp_patronus_spell_painted.jpg", quality=92)
    print("All painted companions generated!")

if __name__ == "__main__":
    main()
