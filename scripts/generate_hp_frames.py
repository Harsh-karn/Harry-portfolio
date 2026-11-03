import math
import random
import os
import subprocess
from PIL import Image, ImageFont, ImageDraw

random.seed(2026)

SCRATCH_DIR = "C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/scratch"
ARTIFACT_DIR = "C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e"
OUTPUT_DIR = "public/textures/corridor"

os.makedirs(SCRATCH_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

def jitter(val, amount=1.2):
    return val + random.uniform(-amount, amount)

def sketch_line(x1, y1, x2, y2, strokes=2, wobble=1.2, stroke_width=2.5, color="#1a1a1a", opacity=0.9):
    paths = []
    for s in range(strokes):
        mx = (x1 + x2) / 2 + random.uniform(-wobble, wobble)
        my = (y1 + y2) / 2 + random.uniform(-wobble, wobble)
        sw = stroke_width + random.uniform(-0.3, 0.3)
        op = opacity * (0.85 if s > 0 else 1.0)
        p1x, p1y = jitter(x1, wobble*0.3), jitter(y1, wobble*0.3)
        p2x, p2y = jitter(x2, wobble*0.3), jitter(y2, wobble*0.3)
        d = f"M {p1x:.1f} {p1y:.1f} Q {mx:.1f} {my:.1f} {p2x:.1f} {p2y:.1f}"
        paths.append(f'<path d="{d}" stroke="{color}" stroke-width="{sw:.1f}" stroke-linecap="round" fill="none" opacity="{op:.2f}"/>')
    return "\n".join(paths)

def sketch_curve(points, strokes=2, wobble=1.2, stroke_width=2.5, color="#1a1a1a", opacity=0.9, fill="none"):
    paths = []
    for s in range(strokes):
        pts = [(jitter(x, wobble*0.3), jitter(y, wobble*0.3)) for x, y in points]
        d = f"M {pts[0][0]:.1f} {pts[0][1]:.1f}"
        for i in range(1, len(pts)-1, 2):
            if i + 1 < len(pts):
                cx, cy = pts[i]
                ex, ey = pts[i+1]
                d += f" Q {cx:.1f} {cy:.1f} {ex:.1f} {ey:.1f}"
            else:
                d += f" L {pts[i][0]:.1f} {pts[i][1]:.1f}"
        if len(pts) % 2 == 0 and len(pts) > 2:
            d += f" L {pts[-1][0]:.1f} {pts[-1][1]:.1f}"
        sw = stroke_width + random.uniform(-0.3, 0.3)
        op = opacity * (0.85 if s > 0 else 1.0)
        f = fill if s == 0 else "none"
        paths.append(f'<path d="{d}" stroke="{color}" stroke-width="{sw:.1f}" stroke-linecap="round" fill="{f}" opacity="{op:.2f}"/>')
    return "\n".join(paths)

def sketch_circle(cx, cy, r, strokes=2, wobble=1.0, stroke_width=2.5, color="#1a1a1a", fill="none", opacity=0.9):
    paths = []
    steps = 24
    for s in range(strokes):
        pts = []
        phase = random.uniform(0, math.pi)
        for i in range(steps + 1):
            ang = phase + i * (2 * math.pi / steps)
            rad = r + random.uniform(-wobble, wobble)
            x = cx + rad * math.cos(ang)
            y = cy + rad * math.sin(ang)
            pts.append((x, y))
        d = f"M {pts[0][0]:.1f} {pts[0][1]:.1f} " + " ".join([f"L {x:.1f} {y:.1f}" for x, y in pts[1:]]) + " Z"
        sw = stroke_width + random.uniform(-0.3, 0.3)
        op = opacity * (0.85 if s > 0 else 1.0)
        f = fill if s == 0 else "none"
        paths.append(f'<path d="{d}" stroke="{color}" stroke-width="{sw:.1f}" stroke-linejoin="round" fill="{f}" opacity="{op:.2f}"/>')
    return "\n".join(paths)

def sketch_star(cx, cy, r, color="#1a1a1a", stroke_width=2):
    r_in = r * 0.22
    pts = []
    for i in range(8):
        ang = i * (math.pi / 4)
        rad = r if (i % 2 == 0) else r_in
        rx = cx + math.cos(ang) * jitter(rad, 0.8)
        ry = cy + math.sin(ang) * jitter(rad, 0.8)
        pts.append(f"{rx:.1f},{ry:.1f}")
    d = "M " + " L ".join(pts) + " Z"
    return f'<path d="{d}" fill="{color}" stroke="{color}" stroke-width="{stroke_width}" stroke-linejoin="round" opacity="0.9"/>'

def sketch_sparkle(cx, cy, r, color="#1a1a1a"):
    lines = []
    lines.append(sketch_line(cx - r, cy, cx + r, cy, strokes=2, wobble=0.6, stroke_width=2.0, color=color))
    lines.append(sketch_line(cx, cy - r, cx, cy + r, strokes=2, wobble=0.6, stroke_width=2.0, color=color))
    r_d = r * 0.55
    lines.append(sketch_line(cx - r_d, cy - r_d, cx + r_d, cy + r_d, strokes=1, wobble=0.4, stroke_width=1.5, color=color))
    lines.append(sketch_line(cx - r_d, cy + r_d, cx + r_d, cy - r_d, strokes=1, wobble=0.4, stroke_width=1.5, color=color))
    return "\n".join(lines)

def sketch_box(x, y, w, h, color="#1a1a1a", stroke_width=2.5):
    elements = []
    elements.append(sketch_line(x, y, x + w, y, strokes=2, wobble=1.2, stroke_width=stroke_width, color=color))
    elements.append(sketch_line(x + w, y, x + w, y + h, strokes=2, wobble=1.2, stroke_width=stroke_width, color=color))
    elements.append(sketch_line(x + w, y + h, x, y + h, strokes=2, wobble=1.2, stroke_width=stroke_width, color=color))
    elements.append(sketch_line(x, y + h, x, y, strokes=2, wobble=1.2, stroke_width=stroke_width, color=color))
    gap = 5
    elements.append(sketch_line(x + gap, y + gap, x + w - gap, y + gap, strokes=1, wobble=0.8, stroke_width=stroke_width*0.6, color=color, opacity=0.7))
    elements.append(sketch_line(x + w - gap, y + gap, x + w - gap, y + h - gap, strokes=1, wobble=0.8, stroke_width=stroke_width*0.6, color=color, opacity=0.7))
    elements.append(sketch_line(x + w - gap, y + h - gap, x + gap, y + h - gap, strokes=1, wobble=0.8, stroke_width=stroke_width*0.6, color=color, opacity=0.7))
    elements.append(sketch_line(x + gap, y + h - gap, x + gap, y + gap, strokes=1, wobble=0.8, stroke_width=stroke_width*0.6, color=color, opacity=0.7))
    return "\n".join(elements)

print("Setup completed.")

# --- HOGWARTS CASTLE SCENE GENERATOR ---
def build_hogwarts_svg():
    elements = []
    
    # 1. Sky & Celestial (Crescent Moon and Stars)
    # Crescent moon at (1020, 110)
    moon_outer = [(1020, 70), (1055, 95), (1060, 130), (1040, 160), (1010, 170)]
    moon_inner = [(1010, 170), (1032, 145), (1032, 100), (1020, 70)]
    elements.append(sketch_curve(moon_outer + moon_inner, strokes=2, wobble=0.8, stroke_width=2.5, color="#141414"))
    # Moon aura rings
    elements.append(sketch_circle(1035, 120, 48, strokes=1, wobble=1.0, stroke_width=1.2, color="#3a3a3a", opacity=0.5))
    elements.append(sketch_circle(1035, 120, 68, strokes=1, wobble=1.2, stroke_width=1.0, color="#444444", opacity=0.35))
    
    # Night stars across the sky
    star_coords = [
        (120, 80, 10), (220, 50, 7), (340, 75, 12), (430, 40, 8), (560, 65, 9),
        (680, 45, 11), (790, 80, 8), (890, 50, 13), (950, 95, 7), (1110, 70, 11),
        (160, 150, 8), (280, 130, 9), (720, 130, 7), (850, 140, 9), (1130, 150, 8)
    ]
    for sx, sy, sr in star_coords:
        elements.append(sketch_star(sx, sy, sr, color="#222222"))
        if sr > 9:
            elements.append(sketch_sparkle(sx, sy, sr * 1.5, color="#3a3a3a"))
            
    # 2. Hogwarts Castle Architecture
    # Main cliff line: starts at (100, 480) -> (300, 470) -> (500, 460) -> (750, 470) -> (1100, 490)
    
    # VIADUCT / BRIDGE (Left, X: 160 to 360, Y: 360 to 450)
    # Bridge top line
    elements.append(sketch_line(160, 370, 360, 370, strokes=2, wobble=1.0, stroke_width=3.2, color="#141414"))
    elements.append(sketch_line(160, 382, 360, 382, strokes=1, wobble=0.8, stroke_width=2.0, color="#2a2a2a"))
    # Bridge stone arches
    for ax in [195, 245, 295, 345]:
        arch_pts = [(ax - 18, 435), (ax - 18, 400), (ax, 388), (ax + 18, 400), (ax + 18, 435)]
        elements.append(sketch_curve(arch_pts, strokes=2, wobble=0.8, stroke_width=2.5, color="#1a1a1a"))
        # Pier vertical line
        elements.append(sketch_line(ax - 18, 382, ax - 18, 440, strokes=1, wobble=0.6, stroke_width=2.0, color="#2a2a2a"))
        elements.append(sketch_line(ax + 18, 382, ax + 18, 440, strokes=1, wobble=0.6, stroke_width=2.0, color="#2a2a2a"))
        
    # TOWER 1: Western Tower / Turret (X: 350 to 395, Y: 240 to 420)
    elements.append(sketch_line(350, 260, 350, 440, strokes=2, wobble=1.0, stroke_width=2.8, color="#141414"))
    elements.append(sketch_line(395, 260, 395, 440, strokes=2, wobble=1.0, stroke_width=2.8, color="#141414"))
    # Conical roof: Apex at (372, 195)
    roof1 = [(345, 260), (372, 195), (400, 260)]
    elements.append(sketch_curve(roof1, strokes=2, wobble=1.0, stroke_width=3.0, color="#141414"))
    elements.append(sketch_line(372, 195, 372, 175, strokes=1, wobble=0.5, stroke_width=2.0, color="#141414")) # Spire needle
    # Window slits
    for wy in [290, 340, 390]:
        elements.append(sketch_box(367, wy, 12, 22, color="#1a1a1a", stroke_width=1.8))
        
    # TOWER 2: The Astronomy Tower (Tallest Grand Spire, X: 440 to 520, Y: 150 to 440)
    elements.append(sketch_line(440, 200, 440, 440, strokes=2, wobble=1.2, stroke_width=3.5, color="#141414"))
    elements.append(sketch_line(520, 200, 520, 440, strokes=2, wobble=1.2, stroke_width=3.5, color="#141414"))
    # Corbelled balcony at top (machicolations)
    elements.append(sketch_line(430, 200, 530, 200, strokes=2, wobble=0.8, stroke_width=3.2, color="#141414"))
    elements.append(sketch_line(435, 185, 525, 185, strokes=2, wobble=0.8, stroke_width=2.5, color="#141414"))
    # Spire conical roof: Apex at (480, 105)
    roof_astro = [(435, 185), (480, 105), (525, 185)]
    elements.append(sketch_curve(roof_astro, strokes=2, wobble=1.2, stroke_width=3.5, color="#141414"))
    elements.append(sketch_line(480, 105, 480, 75, strokes=2, wobble=0.5, stroke_width=2.5, color="#141414")) # Weather vane needle
    elements.append(sketch_star(480, 75, 6, color="#141414"))
    # Tall arched windows of Astronomy Tower
    for wy in [230, 300, 370]:
        win_arch = [(468, wy+35), (468, wy+12), (480, wy), (492, wy+12), (492, wy+35)]
        elements.append(sketch_curve(win_arch, strokes=2, wobble=0.8, stroke_width=2.0, color="#1a1a1a"))
        elements.append(sketch_line(480, wy, 480, wy+35, strokes=1, wobble=0.4, stroke_width=1.2, color="#2a2a2a"))
        elements.append(sketch_line(468, wy+18, 492, wy+18, strokes=1, wobble=0.4, stroke_width=1.2, color="#2a2a2a"))
        
    # CENTRAL TURRET / HEADMASTER'S TOWER (X: 540 to 600, Y: 220 to 440)
    elements.append(sketch_line(540, 240, 540, 440, strokes=2, wobble=1.0, stroke_width=2.8, color="#141414"))
    elements.append(sketch_line(600, 240, 600, 440, strokes=2, wobble=1.0, stroke_width=2.8, color="#141414"))
    roof_head = [(535, 240), (570, 165), (605, 240)]
    elements.append(sketch_curve(roof_head, strokes=2, wobble=1.0, stroke_width=3.0, color="#141414"))
    elements.append(sketch_line(570, 165, 570, 140, strokes=1, wobble=0.5, stroke_width=2.0, color="#141414"))
    for wy in [275, 345]:
        elements.append(sketch_box(560, wy, 18, 30, color="#1a1a1a", stroke_width=1.8))
        
    # THE GREAT HALL (X: 620 to 920, Y: 220 to 450)
    # Steep gabled roof: Left eave (620, 270), Ridge (770, 190), Right eave (920, 270)
    hall_roof = [(610, 275), (770, 185), (930, 275)]
    elements.append(sketch_curve(hall_roof, strokes=2, wobble=1.2, stroke_width=4.0, color="#141414"))
    elements.append(sketch_line(615, 285, 925, 285, strokes=1, wobble=1.0, stroke_width=2.2, color="#2a2a2a")) # Eaves line
    
    # Walls of Great Hall
    elements.append(sketch_line(625, 285, 625, 450, strokes=2, wobble=1.2, stroke_width=3.2, color="#141414"))
    elements.append(sketch_line(915, 285, 915, 450, strokes=2, wobble=1.2, stroke_width=3.2, color="#141414"))
    
    # Great Hall Buttresses and tall Gothic Tracery Windows
    for bx in [665, 715, 765, 815, 865]:
        # Buttress column
        elements.append(sketch_line(bx - 12, 285, bx - 12, 450, strokes=1, wobble=0.6, stroke_width=2.0, color="#222222"))
        elements.append(sketch_line(bx + 12, 285, bx + 12, 450, strokes=1, wobble=0.6, stroke_width=2.0, color="#222222"))
        # Slanted buttress step
        elements.append(sketch_line(bx - 15, 360, bx + 15, 360, strokes=1, wobble=0.4, stroke_width=2.0, color="#141414"))
        
        # Tall gothic arched window
        wy = 300
        win_arch = [(bx - 7, wy + 60), (bx - 7, wy + 15), (bx, wy), (bx + 7, wy + 15), (bx + 7, wy + 60)]
        elements.append(sketch_curve(win_arch, strokes=2, wobble=0.6, stroke_width=2.0, color="#141414"))
        # Window mullions
        elements.append(sketch_line(bx, wy, bx, wy + 60, strokes=1, wobble=0.3, stroke_width=1.2, color="#2a2a2a"))
        for gy in [wy + 20, wy + 40]:
            elements.append(sketch_line(bx - 7, gy, bx + 7, gy, strokes=1, wobble=0.3, stroke_width=1.0, color="#2a2a2a"))
            
    # Pinnacles on Great Hall roof ridge
    for px in [650, 710, 770, 830, 890]:
        elements.append(sketch_line(px, 205 + abs(770-px)*0.55, px, 185 + abs(770-px)*0.55, strokes=1, wobble=0.4, stroke_width=2.2, color="#141414"))
        elements.append(sketch_star(px, 185 + abs(770-px)*0.55, 4, color="#141414"))
        
    # TOWER 3: Eastern Spires & Bell Tower (X: 930 to 1020, Y: 220 to 450)
    elements.append(sketch_line(940, 250, 940, 460, strokes=2, wobble=1.0, stroke_width=2.8, color="#141414"))
    elements.append(sketch_line(1005, 250, 1005, 460, strokes=2, wobble=1.0, stroke_width=2.8, color="#141414"))
    roof_east = [(935, 250), (972, 175), (1010, 250)]
    elements.append(sketch_curve(roof_east, strokes=2, wobble=1.0, stroke_width=3.0, color="#141414"))
    elements.append(sketch_line(972, 175, 972, 150, strokes=1, wobble=0.5, stroke_width=2.0, color="#141414"))
    elements.append(sketch_box(960, 290, 24, 38, color="#1a1a1a", stroke_width=1.8))
    
    # 3. The Rugged Cliff Face & Boathouse (Y: 440 to 550)
    # Rocky cliff ridge line
    cliff_ridge = [(100, 460), (220, 455), (360, 445), (480, 440), (620, 450), (780, 450), (920, 455), (1040, 465), (1120, 480)]
    elements.append(sketch_curve(cliff_ridge, strokes=2, wobble=1.5, stroke_width=4.0, color="#141414"))
    
    # Vertical crag striations & rock texture
    for cx in range(120, 1100, 25):
        cy_top = 445 + random.uniform(-5, 10)
        cy_bot = 525 + random.uniform(-10, 15)
        elements.append(sketch_line(cx, cy_top, cx + random.uniform(-12, 12), cy_bot, strokes=1, wobble=1.5, stroke_width=2.0, color="#262626", opacity=0.8))
        # Cross-hatching for rock shadows
        if cx % 50 == 0:
            for hy in range(int(cy_top) + 15, int(cy_bot), 14):
                elements.append(sketch_line(cx - 10, hy, cx + 10, hy - 8, strokes=1, wobble=0.8, stroke_width=1.5, color="#333333", opacity=0.6))
                
    # Evergreen / Pine trees along cliff ridge
    for tx in [130, 150, 390, 410, 525, 605, 925, 945, 1030, 1060, 1080]:
        ty = 440 + random.uniform(-6, 4)
        th = random.uniform(22, 38)
        # Tree trunk
        elements.append(sketch_line(tx, ty, tx, ty - th, strokes=1, wobble=0.4, stroke_width=2.0, color="#141414"))
        # Triangular pine tiers
        for tier in range(3):
            tier_y = ty - th * (0.35 + tier * 0.3)
            tw = (3 - tier) * 6
            elements.append(sketch_curve([(tx - tw, tier_y + 6), (tx, tier_y - 2), (tx + tw, tier_y + 6)], strokes=1, wobble=0.6, stroke_width=2.2, color="#141414"))
            
    # Boathouse entrance at cliff base (X: 740 to 800, Y: 490 to 535)
    boathouse_arch = [(745, 535), (745, 505), (770, 490), (795, 505), (795, 535)]
    elements.append(sketch_curve(boathouse_arch, strokes=2, wobble=0.8, stroke_width=2.8, color="#141414"))
    elements.append(sketch_line(740, 535, 800, 535, strokes=1, wobble=0.5, stroke_width=2.2, color="#141414")) # Waterline at boathouse
    # Torch at boathouse gate
    elements.append(sketch_star(740, 505, 6, color="#141414"))
    elements.append(sketch_star(800, 505, 6, color="#141414"))
    
    # 4. The Black Lake & Student Boats (Y: 530 to 680)
    # Lake shoreline
    elements.append(sketch_line(80, 535, 1120, 535, strokes=2, wobble=1.5, stroke_width=3.0, color="#141414"))
    
    # Horizontal gentle ripple wave lines
    for wy in range(545, 660, 12):
        for wx in range(100, 1080, 140):
            w_len = random.uniform(60, 110)
            elements.append(sketch_line(wx, wy, wx + w_len, wy + random.uniform(-1, 1), strokes=1, wobble=0.8, stroke_width=1.5, color="#2e2e2e", opacity=0.7))
            
    # Reflections of lit castle windows on water surface
    for rx in [480, 570, 665, 715, 765, 815, 865, 970]:
        for ry in range(545, 610, 8):
            elements.append(sketch_line(rx - random.uniform(6, 16), ry, rx + random.uniform(6, 16), ry, strokes=1, wobble=0.6, stroke_width=1.8, color="#222222", opacity=0.75))
            
    # Student Boats on the Lake
    # Boat helper
    def draw_boat(bx, by, scale=1.0, has_hagrid=False):
        b_elems = []
        bw = 36 * scale
        bh = 10 * scale
        # Hull curve: pointed prow and stern
        hull = [(bx - bw, by), (bx - bw*0.6, by + bh), (bx + bw*0.6, by + bh), (bx + bw, by)]
        b_elems.append(sketch_curve(hull, strokes=2, wobble=0.8, stroke_width=2.5, color="#141414"))
        b_elems.append(sketch_line(bx - bw, by, bx + bw, by, strokes=1, wobble=0.5, stroke_width=1.8, color="#141414"))
        
        # Passengers silhouettes
        if has_hagrid:
            # Massive Hagrid silhouette
            hagrid_head = (bx - 10*scale, by - 22*scale)
            b_elems.append(sketch_circle(hagrid_head[0], hagrid_head[1], 7*scale, strokes=1, wobble=0.5, stroke_width=2.0, color="#141414", fill="#141414"))
            # Hagrid broad coat shoulders
            coat = [(bx - 22*scale, by), (bx - 18*scale, by - 16*scale), (bx - 2*scale, by - 16*scale), (bx + 2*scale, by)]
            b_elems.append(sketch_curve(coat, strokes=1, wobble=0.5, stroke_width=2.0, color="#141414", fill="#141414"))
            # Student next to Hagrid
            b_elems.append(sketch_circle(bx + 14*scale, by - 12*scale, 4*scale, strokes=1, wobble=0.4, stroke_width=1.8, color="#141414", fill="#141414"))
        else:
            # 2-3 student silhouettes
            for px in [-12*scale, 0, 12*scale]:
                b_elems.append(sketch_circle(bx + px, by - 11*scale, 4*scale, strokes=1, wobble=0.4, stroke_width=1.8, color="#141414", fill="#141414"))
                b_elems.append(sketch_curve([(bx + px - 5*scale, by), (bx + px, by - 8*scale), (bx + px + 5*scale, by)], strokes=1, wobble=0.4, stroke_width=1.8, color="#141414", fill="#141414"))
                
        # Lantern on bow pole
        pole_x = bx + bw * 0.85
        b_elems.append(sketch_line(pole_x, by, pole_x, by - 20*scale, strokes=1, wobble=0.4, stroke_width=1.8, color="#141414"))
        lantern_y = by - 18*scale
        b_elems.append(sketch_box(pole_x - 3*scale, lantern_y - 4*scale, 6*scale, 8*scale, color="#141414", stroke_width=1.5))
        # Radiant lantern glow
        b_elems.append(sketch_star(pole_x, lantern_y, 7*scale, color="#141414"))
        b_elems.append(sketch_sparkle(pole_x, lantern_y, 11*scale, color="#222222"))
        
        # Water wake / ripples beneath boat
        b_elems.append(sketch_line(bx - bw*1.2, by + bh + 3, bx + bw*1.2, by + bh + 3, strokes=1, wobble=0.6, stroke_width=1.6, color="#2a2a2a"))
        return "\n".join(b_elems)
        
    # Lead boat (Hagrid) at (320, 580)
    elements.append(draw_boat(320, 580, scale=1.25, has_hagrid=True))
    # Boat 2 (Harry, Ron) at (570, 605)
    elements.append(draw_boat(570, 605, scale=1.1, has_hagrid=False))
    # Boat 3 (Hermione, Neville) at (820, 585)
    elements.append(draw_boat(820, 585, scale=1.0, has_hagrid=False))
    # Boat 4 (in distance) at (970, 560)
    elements.append(draw_boat(970, 560, scale=0.75, has_hagrid=False))
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="706" viewBox="0 0 1200 706">
      {"".join(elements)}
    </svg>'''
    return svg

def generate_hogwarts_scene():
    svg = build_hogwarts_svg()
    svg_path = f"{SCRATCH_DIR}/hp_hogwarts_scene.svg"
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg)
        
    png_path = f"{SCRATCH_DIR}/hp_hogwarts_scene_vec.png"
    subprocess.run(["node", "scripts/render_svg.js", svg_path, png_path], check=True)
    
    im = Image.open(png_path).convert("RGBA")
    draw = ImageDraw.Draw(im)
    
    font_title = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 36)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 20)
    
    def draw_ink(x, y, text, font, color=(20, 20, 20, 240), anchor=None):
        for dx, dy in [(0, 0), (1, 0), (-1, 0), (0, 1), (1, 1)]:
            draw.text((x + dx, y + dy), text, font=font, fill=color, anchor=anchor)
            
    # Bottom banner caption
    draw_ink(600, 665, "HOGWARTS CASTLE", font_title, anchor="mm")
    draw_ink(600, 692, "School of Witchcraft & Wizardry", font_sub, (50, 50, 50, 220), anchor="mm")
    
    return im

print("Hogwarts scene builder ready.")

# --- EXPECTO PATRONUM SPELL GENERATOR ---
def build_patronus_svg():
    elements = []
    
    # Left Column: Decorative Boxes
    # Box 1: Quote Box (X: 60, Y: 185, W: 500, H: 165)
    elements.append(sketch_box(60, 185, 500, 165, color="#1e1e1e", stroke_width=2.5))
    # Decorative quotation marks
    elements.append(sketch_circle(85, 215, 6, strokes=1, wobble=0.4, stroke_width=2, color="#141414", fill="#141414"))
    elements.append(sketch_circle(98, 215, 6, strokes=1, wobble=0.4, stroke_width=2, color="#141414", fill="#141414"))
    
    # Box 2: Spell Mechanics Box (X: 60, Y: 375, W: 500, H: 275)
    elements.append(sketch_box(60, 375, 500, 275, color="#1e1e1e", stroke_width=2.5))
    
    # Wand movement diagram: Counter-clockwise circle into straight thrust
    # Starting point (170, 500)
    spiral_pts = []
    steps = 30
    for i in range(steps):
        t = i / steps * 2.5 * math.pi
        r = 8 + i * 1.0
        sx = 150 + r * math.cos(-t)
        sy = 490 + r * math.sin(-t)
        spiral_pts.append((sx, sy))
    # Straight thrust line from (180, 490) to (270, 490)
    thrust_pts = [(180, 490), (275, 490)]
    elements.append(sketch_curve(spiral_pts, strokes=2, wobble=0.8, stroke_width=2.5, color="#141414"))
    elements.append(sketch_line(180, 490, 275, 490, strokes=2, wobble=0.5, stroke_width=3.2, color="#141414"))
    # Arrowhead at (275, 490)
    elements.append(sketch_line(260, 480, 275, 490, strokes=2, wobble=0.4, stroke_width=2.8, color="#141414"))
    elements.append(sketch_line(260, 500, 275, 490, strokes=2, wobble=0.4, stroke_width=2.8, color="#141414"))
    elements.append(sketch_star(285, 490, 7, color="#141414"))
    
    # Right Column: The Stag Patronus (Center X: 860, Y: 350)
    # Magic Wand casting at bottom left of stag: from (560, 640) to (680, 560)
    elements.append(sketch_line(560, 640, 680, 560, strokes=2, wobble=0.8, stroke_width=4.5, color="#141414"))
    elements.append(sketch_circle(570, 630, 6, strokes=1, wobble=0.4, stroke_width=2, color="#141414", fill="#141414"))
    elements.append(sketch_star(690, 550, 14, color="#141414"))
    elements.append(sketch_sparkle(690, 550, 22, color="#222222"))
    
    # Torrent of Patronus energy swirling from wand towards the stag
    for frac in [0.2, 0.4, 0.6, 0.8, 1.0]:
        stream = [(690, 550), (720 + frac*20, 520 - frac*30), (760 + frac*40, 460 - frac*60), (810 + frac*30, 410 - frac*70)]
        elements.append(sketch_curve(stream, strokes=1, wobble=1.2, stroke_width=2.2 - frac*0.8, color="#2a2a2a", opacity=0.75))
        
    # STAG PATRONUS ANATOMY
    # Head & Muzzle
    head_pts = [
        (760, 280), (730, 270), (715, 275), (715, 290), (740, 305), (770, 310)
    ]
    elements.append(sketch_curve(head_pts, strokes=2, wobble=0.8, stroke_width=3.0, color="#141414"))
    # Eye
    elements.append(sketch_circle(745, 282, 3.5, strokes=1, wobble=0.2, stroke_width=2.0, color="#141414", fill="#141414"))
    # Nostril / mouth line
    elements.append(sketch_line(715, 285, 725, 288, strokes=1, wobble=0.3, stroke_width=1.8, color="#141414"))
    # Alert Ear
    ear = [(760, 270), (770, 230), (785, 245), (775, 275)]
    elements.append(sketch_curve(ear, strokes=2, wobble=0.6, stroke_width=2.5, color="#141414"))
    
    # ANTLERS - Magnificent branching crown
    # Left main beam
    beam_l = [(765, 260), (750, 200), (765, 140), (810, 80), (850, 50)]
    elements.append(sketch_curve(beam_l, strokes=2, wobble=1.0, stroke_width=3.5, color="#141414"))
    # Left brow tine
    elements.append(sketch_curve([(758, 235), (720, 215), (705, 220)], strokes=2, wobble=0.8, stroke_width=2.5, color="#141414"))
    # Left bez tine
    elements.append(sketch_curve([(754, 185), (715, 160), (700, 168)], strokes=2, wobble=0.8, stroke_width=2.5, color="#141414"))
    # Left trez tine
    elements.append(sketch_curve([(768, 140), (740, 110), (735, 118)], strokes=2, wobble=0.8, stroke_width=2.5, color="#141414"))
    # Left crown forks
    elements.append(sketch_curve([(810, 80), (795, 45)], strokes=2, wobble=0.6, stroke_width=2.5, color="#141414"))
    elements.append(sketch_curve([(830, 65), (835, 35)], strokes=2, wobble=0.6, stroke_width=2.2, color="#141414"))
    
    # Right main beam (further back)
    beam_r = [(775, 260), (800, 200), (840, 140), (890, 85), (930, 60)]
    elements.append(sketch_curve(beam_r, strokes=2, wobble=1.0, stroke_width=3.0, color="#222222"))
    elements.append(sketch_curve([(795, 225), (830, 210)], strokes=1, wobble=0.8, stroke_width=2.2, color="#222222"))
    elements.append(sketch_curve([(815, 180), (860, 160)], strokes=1, wobble=0.8, stroke_width=2.2, color="#222222"))
    elements.append(sketch_curve([(845, 135), (890, 115)], strokes=1, wobble=0.8, stroke_width=2.2, color="#222222"))
    elements.append(sketch_curve([(890, 85), (910, 45)], strokes=1, wobble=0.6, stroke_width=2.0, color="#222222"))
    
    # Sparkles on antler tips
    for tx, ty in [(705, 220), (700, 168), (735, 118), (795, 45), (835, 35), (850, 50), (930, 60), (910, 45)]:
        elements.append(sketch_star(tx, ty, 6, color="#141414"))
        
    # Neck & Chest
    neck_upper = [(775, 275), (805, 305), (840, 330), (880, 350)]
    elements.append(sketch_curve(neck_upper, strokes=2, wobble=1.0, stroke_width=3.2, color="#141414"))
    neck_lower = [(770, 310), (795, 345), (820, 395), (845, 435)]
    elements.append(sketch_curve(neck_lower, strokes=2, wobble=1.0, stroke_width=3.2, color="#141414"))
    
    # Chest & Belly
    belly = [(845, 435), (890, 445), (940, 435), (980, 420)]
    elements.append(sketch_curve(belly, strokes=2, wobble=1.0, stroke_width=3.0, color="#141414"))
    
    # Back & Flank
    back = [(880, 350), (930, 355), (980, 370), (1020, 400)]
    elements.append(sketch_curve(back, strokes=2, wobble=1.0, stroke_width=3.2, color="#141414"))
    
    # Forelegs (Leaping forward in mid-air)
    # Left front leg: tucked leaping
    f_leg_l = [(830, 420), (810, 465), (795, 505), (820, 530), (825, 545)]
    elements.append(sketch_curve(f_leg_l, strokes=2, wobble=0.8, stroke_width=2.8, color="#141414"))
    elements.append(sketch_line(820, 545, 828, 552, strokes=1, wobble=0.3, stroke_width=3.5, color="#141414")) # Hoof
    
    # Right front leg: extending forward
    f_leg_r = [(850, 425), (845, 470), (860, 515), (885, 545), (895, 560)]
    elements.append(sketch_curve(f_leg_r, strokes=2, wobble=0.8, stroke_width=2.8, color="#141414"))
    elements.append(sketch_line(890, 560, 900, 568, strokes=1, wobble=0.3, stroke_width=3.5, color="#141414")) # Hoof
    
    # Hindlegs (Trailing powerfully back in mid-leap)
    # Left hindleg
    h_leg_l = [(990, 400), (1030, 435), (1050, 480), (1035, 530), (1040, 570)]
    elements.append(sketch_curve(h_leg_l, strokes=2, wobble=1.0, stroke_width=3.0, color="#141414"))
    elements.append(sketch_line(1035, 570, 1045, 578, strokes=1, wobble=0.3, stroke_width=3.5, color="#141414")) # Hoof
    
    # Right hindleg
    h_leg_r = [(1010, 410), (1055, 450), (1075, 495), (1060, 545), (1070, 585)]
    elements.append(sketch_curve(h_leg_r, strokes=2, wobble=1.0, stroke_width=2.6, color="#222222"))
    elements.append(sketch_line(1065, 585, 1075, 592, strokes=1, wobble=0.3, stroke_width=3.5, color="#222222")) # Hoof
    
    # Short tail
    tail = [(1020, 400), (1035, 405), (1030, 420), (1015, 415)]
    elements.append(sketch_curve(tail, strokes=2, wobble=0.5, stroke_width=2.2, color="#141414"))
    
    # Muscular cross-hatching
    for my in range(370, 430, 12):
        elements.append(sketch_line(840, my, 860, my - 6, strokes=1, wobble=0.5, stroke_width=1.5, color="#2e2e2e", opacity=0.6))
    for my in range(410, 460, 12):
        elements.append(sketch_line(980, my, 1000, my - 6, strokes=1, wobble=0.5, stroke_width=1.5, color="#2e2e2e", opacity=0.6))
        
    # Ethereal Mist & Patronus Waves Radiating from Stag
    aura_curves = [
        [(780, 310), (730, 330), (680, 370), (660, 420)],
        [(840, 430), (810, 460), (760, 480), (720, 510)],
        [(930, 350), (950, 300), (1000, 260), (1060, 240)],
        [(980, 420), (1020, 390), (1080, 380), (1120, 400)],
        [(1020, 450), (1070, 460), (1110, 500), (1130, 550)]
    ]
    for ac in aura_curves:
        elements.append(sketch_curve(ac, strokes=2, wobble=1.5, stroke_width=2.5, color="#1a1a1a", opacity=0.8))
        elements.append(sketch_curve([(x+jitter(0, 3), y+jitter(0, 3)) for x, y in ac], strokes=1, wobble=1.0, stroke_width=1.4, color="#3a3a3a", opacity=0.5))
        
    # Floating Stars around Patronus
    stag_stars = [
        (660, 330, 10), (690, 420, 8), (730, 470, 12), (770, 540, 9),
        (880, 240, 14), (940, 180, 11), (990, 130, 13), (1060, 190, 10),
        (1090, 290, 12), (1120, 380, 14), (1140, 470, 9), (1090, 570, 11),
        (850, 580, 8), (950, 580, 10), (620, 510, 12)
    ]
    for sx, sy, sr in stag_stars:
        elements.append(sketch_star(sx, sy, sr, color="#141414"))
        if sr >= 11:
            elements.append(sketch_sparkle(sx, sy, sr * 1.5, color="#2a2a2a"))
            
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="706" viewBox="0 0 1200 706">
      {"".join(elements)}
    </svg>'''
    return svg

def generate_patronus_spell():
    svg = build_patronus_svg()
    svg_path = f"{SCRATCH_DIR}/hp_patronus_spell.svg"
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg)
        
    png_path = f"{SCRATCH_DIR}/hp_patronus_spell_vec.png"
    subprocess.run(["node", "scripts/render_svg.js", svg_path, png_path], check=True)
    
    im = Image.open(png_path).convert("RGBA")
    draw = ImageDraw.Draw(im)
    
    font_incant = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 52)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 22)
    font_quote = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 24)
    font_author = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 20)
    font_mech_head = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 20)
    font_mech_body = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 18)
    
    def draw_ink(x, y, text, font, color=(20, 20, 20, 240), anchor=None):
        for dx, dy in [(0, 0), (1, 0), (-1, 0), (0, 1), (1, 1)]:
            draw.text((x + dx, y + dy), text, font=font, fill=color, anchor=anchor)
            
    # Header: Incantation
    draw_ink(70, 75, "Expecto Patronum", font_incant)
    draw_ink(72, 140, "[ex-PEK-toh  pa-TROH-num]   •   The Patronus Charm", font_sub, (55, 55, 55, 230))
    
    # Quote Box Content
    draw_ink(115, 208, "“Happiness can be found even in the", font_quote)
    draw_ink(115, 240, "darkest of times, if one only remembers", font_quote)
    draw_ink(115, 272, "to turn on the light.”", font_quote)
    draw_ink(520, 315, "— Albus Dumbledore", font_author, (50, 50, 50, 230), anchor="rm")
    
    # Spell Mechanics Box Content
    draw_ink(80, 392, "CHARM COMPENDIUM   •   CLASS IV", font_mech_head, (45, 45, 45, 240))
    # Underline compendium header
    draw.line([(80, 420), (540, 420)], fill=(30, 30, 30, 180), width=2)
    
    # Wand label
    draw_ink(295, 485, "Wand: Swirl & Thrust", font_mech_body)
    
    # Details
    draw_ink(80, 535, "Effect: Summons a Pure Light Guardian", font_mech_body)
    draw_ink(80, 565, "Required: A Powerful Happy Memory", font_mech_body)
    draw_ink(80, 595, "Corporeal Form: Silver Stag (Prongs)", font_mech_body)
    draw_ink(80, 625, "Shield: Repels Dementors & Lethifolds", font_mech_body)
    
    return im

def main():
    print("Generating Harry Potter Frame Artwork...")
    
    # 1. Hogwarts Scene
    im_hog = generate_hogwarts_scene()
    im_hog.save(f"{ARTIFACT_DIR}/final_hogwarts_scene.png")
    im_hog.save(f"{OUTPUT_DIR}/hp_hogwarts_scene.webp", "WEBP", lossless=True)
    print("hp_hogwarts_scene.webp generated.")
    
    # 2. Expecto Patronum Spell
    im_pat = generate_patronus_spell()
    im_pat.save(f"{ARTIFACT_DIR}/final_patronus_spell.png")
    im_pat.save(f"{OUTPUT_DIR}/hp_patronus_spell.webp", "WEBP", lossless=True)
    print("hp_patronus_spell.webp generated.")
    
    # Previews on canvas background
    bg_hog = Image.new("RGB", im_hog.size, (244, 244, 242))
    bg_hog.paste(im_hog, (0, 0), im_hog)
    bg_hog.save(f"{ARTIFACT_DIR}/preview_hp_hogwarts_scene.jpg", quality=92)
    
    bg_pat = Image.new("RGB", im_pat.size, (244, 244, 242))
    bg_pat.paste(im_pat, (0, 0), im_pat)
    bg_pat.save(f"{ARTIFACT_DIR}/preview_hp_patronus_spell.jpg", quality=92)
    
    print("All frame artworks created successfully!")

if __name__ == "__main__":
    main()
