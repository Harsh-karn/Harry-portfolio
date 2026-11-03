import math
import random
import os
import subprocess
import numpy as np
from PIL import Image, ImageFont, ImageDraw, ImageFilter

random.seed(42)

SCRATCH_DIR = "C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/scratch"
ARTIFACT_DIR = "C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e"
OUTPUT_DIR = "public/textures/corridor"

# Dimensions: 2048 x 994 (Ratio ~ 2.06:1, exactly matching inner opening 2.08 x 1.01 in 3D units)
WIDTH = 2048
HEIGHT = 994

def jitter(val, amount=1.2):
    return val + random.uniform(-amount, amount)

def sketch_line(x1, y1, x2, y2, strokes=2, wobble=1.2, stroke_width=2.5, color="#161616", opacity=0.9):
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

def sketch_curve(points, strokes=2, wobble=1.2, stroke_width=2.5, color="#161616", opacity=0.9, fill="none"):
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

def sketch_circle(cx, cy, r, strokes=2, wobble=1.0, stroke_width=2.5, color="#161616", fill="none", opacity=0.9):
    paths = []
    steps = 28
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

def sketch_star(cx, cy, r, color="#161616", stroke_width=2):
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

def sketch_sparkle(cx, cy, r, color="#161616"):
    lines = []
    lines.append(sketch_line(cx - r, cy, cx + r, cy, strokes=2, wobble=0.6, stroke_width=2.0, color=color))
    lines.append(sketch_line(cx, cy - r, cx, cy + r, strokes=2, wobble=0.6, stroke_width=2.0, color=color))
    r_d = r * 0.55
    lines.append(sketch_line(cx - r_d, cy - r_d, cx + r_d, cy + r_d, strokes=1, wobble=0.4, stroke_width=1.5, color=color))
    lines.append(sketch_line(cx - r_d, cy + r_d, cx + r_d, cy - r_d, strokes=1, wobble=0.4, stroke_width=1.5, color=color))
    return "\n".join(lines)

def sketch_box(x, y, w, h, color="#161616", stroke_width=2.5):
    elements = []
    elements.append(sketch_line(x, y, x + w, y, strokes=2, wobble=1.2, stroke_width=stroke_width, color=color))
    elements.append(sketch_line(x + w, y, x + w, y + h, strokes=2, wobble=1.2, stroke_width=stroke_width, color=color))
    elements.append(sketch_line(x + w, y + h, x, y + h, strokes=2, wobble=1.2, stroke_width=stroke_width, color=color))
    elements.append(sketch_line(x, y + h, x, y, strokes=2, wobble=1.2, stroke_width=stroke_width, color=color))
    return "\n".join(elements)

def sketch_shield(cx, cy, w, h, color="#161616", stroke_width=2.5):
    # Medieval pointed heraldic shield outline
    half_w = w / 2
    pts = [
        (cx - half_w, cy - h*0.4),
        (cx + half_w, cy - h*0.4),
        (cx + half_w, cy + h*0.1),
        (cx, cy + h*0.5),
        (cx - half_w, cy + h*0.1),
        (cx - half_w, cy - h*0.4)
    ]
    return sketch_curve(pts, strokes=2, wobble=1.0, stroke_width=stroke_width, color=color)

print("Base setup ready.")

def build_hogwarts_panorama_svg():
    elements = []
    
    # 1. Vintage Frame Border (Fitting the canvas)
    elements.append(sketch_line(40, 35, WIDTH - 40, 35, strokes=2, wobble=1.0, stroke_width=2.5, color="#1a1a1a"))
    elements.append(sketch_line(WIDTH - 40, 35, WIDTH - 40, HEIGHT - 35, strokes=2, wobble=1.0, stroke_width=2.5, color="#1a1a1a"))
    elements.append(sketch_line(WIDTH - 40, HEIGHT - 35, 40, HEIGHT - 35, strokes=2, wobble=1.0, stroke_width=2.5, color="#1a1a1a"))
    elements.append(sketch_line(40, HEIGHT - 35, 40, 35, strokes=2, wobble=1.0, stroke_width=2.5, color="#1a1a1a"))
    
    # Inner border line
    elements.append(sketch_line(48, 43, WIDTH - 48, 43, strokes=1, wobble=0.6, stroke_width=1.2, color="#2e2e2e", opacity=0.7))
    elements.append(sketch_line(WIDTH - 48, 43, WIDTH - 48, HEIGHT - 43, strokes=1, wobble=0.6, stroke_width=1.2, color="#2e2e2e", opacity=0.7))
    elements.append(sketch_line(WIDTH - 48, HEIGHT - 43, 48, HEIGHT - 43, strokes=1, wobble=0.6, stroke_width=1.2, color="#2e2e2e", opacity=0.7))
    elements.append(sketch_line(48, HEIGHT - 43, 48, 43, strokes=1, wobble=0.6, stroke_width=1.2, color="#2e2e2e", opacity=0.7))
    
    # Corner star ornaments
    for cx, cy in [(44, 39), (WIDTH - 44, 39), (WIDTH - 44, HEIGHT - 39), (44, HEIGHT - 39)]:
        elements.append(sketch_star(cx, cy, 7, color="#1a1a1a"))
        
    # 2. Four House Shields (Upper row)
    # Gryffindor (220, 115)
    elements.append(sketch_shield(220, 115, 65, 80, color="#1a1a1a", stroke_width=2.2))
    elements.append(sketch_circle(220, 105, 14, strokes=1, wobble=0.5, stroke_width=1.8, color="#1a1a1a")) # Lion head profile
    elements.append(sketch_line(205, 120, 235, 120, strokes=1, wobble=0.3, stroke_width=1.5, color="#1a1a1a"))
    
    # Ravenclaw (400, 115)
    elements.append(sketch_shield(400, 115, 65, 80, color="#1a1a1a", stroke_width=2.2))
    elements.append(sketch_curve([(385, 110), (400, 95), (415, 110)], strokes=1, wobble=0.5, stroke_width=1.8, color="#1a1a1a")) # Eagle wings
    elements.append(sketch_line(390, 122, 410, 122, strokes=1, wobble=0.3, stroke_width=1.5, color="#1a1a1a"))
    
    # Hogwarts Central Crest (1024, 115)
    elements.append(sketch_shield(1024, 115, 100, 115, color="#141414", stroke_width=3.2))
    # Inner quadrants
    elements.append(sketch_line(1024, 70, 1024, 160, strokes=1, wobble=0.4, stroke_width=1.8, color="#141414"))
    elements.append(sketch_line(978, 115, 1070, 115, strokes=1, wobble=0.4, stroke_width=1.8, color="#141414"))
    # Gothic 'H' in center
    elements.append(sketch_box(1012, 103, 24, 24, color="#141414", stroke_width=2.0))
    elements.append(sketch_line(1018, 107, 1018, 123, strokes=1, wobble=0.2, stroke_width=2.2, color="#141414"))
    elements.append(sketch_line(1030, 107, 1030, 123, strokes=1, wobble=0.2, stroke_width=2.2, color="#141414"))
    elements.append(sketch_line(1018, 115, 1030, 115, strokes=1, wobble=0.2, stroke_width=2.2, color="#141414"))
    
    # Slytherin (1648, 115)
    elements.append(sketch_shield(1648, 115, 65, 80, color="#1a1a1a", stroke_width=2.2))
    elements.append(sketch_curve([(1638, 120), (1648, 100), (1658, 110), (1650, 125)], strokes=1, wobble=0.5, stroke_width=2.0, color="#1a1a1a")) # Serpent
    
    # Hufflepuff (1828, 115)
    elements.append(sketch_shield(1828, 115, 65, 80, color="#1a1a1a", stroke_width=2.2))
    elements.append(sketch_line(1815, 110, 1840, 110, strokes=1, wobble=0.4, stroke_width=2.2, color="#1a1a1a")) # Badger stripes
    elements.append(sketch_line(1815, 118, 1840, 118, strokes=1, wobble=0.4, stroke_width=2.2, color="#1a1a1a"))
    
    # 3. Night Sky, Crescent Moon & Constellations
    # Crescent moon at (1450, 120)
    moon_outer = [(1440, 85), (1475, 110), (1480, 145), (1455, 175), (1430, 180)]
    moon_inner = [(1430, 180), (1455, 155), (1455, 110), (1440, 85)]
    elements.append(sketch_curve(moon_outer + moon_inner, strokes=2, wobble=0.8, stroke_width=2.4, color="#161616"))
    elements.append(sketch_circle(1455, 130, 42, strokes=1, wobble=0.8, stroke_width=1.0, color="#3a3a3a", opacity=0.4))
    
    # Stars across sky
    for sx, sy, sr in [
        (120, 80, 9), (310, 65, 7), (510, 85, 11), (640, 60, 8), (760, 90, 12),
        (880, 65, 8), (1170, 75, 10), (1280, 55, 8), (1380, 90, 12), (1540, 70, 9),
        (1740, 60, 11), (1920, 80, 8), (180, 180, 7), (490, 170, 9), (1580, 175, 8)
    ]:
        elements.append(sketch_star(sx, sy, sr, color="#222222"))
        if sr > 9:
            elements.append(sketch_sparkle(sx, sy, sr * 1.5, color="#3a3a3a"))
            
    # 4. Hogwarts Castle Architectural Panorama
    # VIADUCT / STONE BRIDGE (X: 180 to 480, Y: 460 to 580)
    elements.append(sketch_line(180, 480, 480, 480, strokes=2, wobble=1.2, stroke_width=3.5, color="#141414"))
    elements.append(sketch_line(180, 494, 480, 494, strokes=1, wobble=0.8, stroke_width=2.2, color="#262626"))
    for ax in [220, 275, 330, 385, 440]:
        arch = [(ax - 22, 570), (ax - 22, 520), (ax, 505), (ax + 22, 520), (ax + 22, 570)]
        elements.append(sketch_curve(arch, strokes=2, wobble=0.8, stroke_width=2.8, color="#161616"))
        elements.append(sketch_line(ax - 22, 494, ax - 22, 575, strokes=1, wobble=0.5, stroke_width=2.0, color="#2a2a2a"))
        elements.append(sketch_line(ax + 22, 494, ax + 22, 575, strokes=1, wobble=0.5, stroke_width=2.0, color="#2a2a2a"))
        
    # TOWER 1: Western Rampart Turret (X: 470 to 530, Y: 320 to 580)
    elements.append(sketch_line(475, 360, 475, 580, strokes=2, wobble=1.0, stroke_width=3.0, color="#141414"))
    elements.append(sketch_line(535, 360, 535, 580, strokes=2, wobble=1.0, stroke_width=3.0, color="#141414"))
    roof1 = [(470, 360), (505, 275), (540, 360)]
    elements.append(sketch_curve(roof1, strokes=2, wobble=1.0, stroke_width=3.2, color="#141414"))
    elements.append(sketch_line(505, 275, 505, 245, strokes=1, wobble=0.4, stroke_width=2.0, color="#141414"))
    elements.append(sketch_star(505, 245, 5, color="#141414"))
    for wy in [400, 460, 520]:
        elements.append(sketch_box(497, wy, 16, 28, color="#1a1a1a", stroke_width=2.0))
        
    # TOWER 2: The Grand Astronomy Tower (X: 580 to 690, Y: 220 to 580)
    elements.append(sketch_line(585, 300, 585, 580, strokes=2, wobble=1.2, stroke_width=3.8, color="#141414"))
    elements.append(sketch_line(690, 300, 690, 580, strokes=2, wobble=1.2, stroke_width=3.8, color="#141414"))
    # Corbelled Machicolations balcony
    elements.append(sketch_line(575, 300, 700, 300, strokes=2, wobble=0.8, stroke_width=3.5, color="#141414"))
    elements.append(sketch_line(580, 278, 695, 278, strokes=2, wobble=0.8, stroke_width=2.8, color="#141414"))
    # Grand conical spire roof
    roof_astro = [(580, 278), (638, 170), (695, 278)]
    elements.append(sketch_curve(roof_astro, strokes=2, wobble=1.2, stroke_width=3.8, color="#141414"))
    elements.append(sketch_line(638, 170, 638, 130, strokes=2, wobble=0.4, stroke_width=2.8, color="#141414")) # Needle spire
    elements.append(sketch_star(638, 130, 8, color="#141414"))
    # Gothic arched windows
    for wy in [335, 425, 510]:
        arch = [(622, wy + 45), (622, wy + 15), (638, wy), (654, wy + 15), (654, wy + 45)]
        elements.append(sketch_curve(arch, strokes=2, wobble=0.6, stroke_width=2.2, color="#141414"))
        elements.append(sketch_line(638, wy, 638, wy + 45, strokes=1, wobble=0.3, stroke_width=1.4, color="#262626"))
        elements.append(sketch_line(622, wy + 22, 654, wy + 22, strokes=1, wobble=0.3, stroke_width=1.4, color="#262626"))
        
    # CLOCK TOWER / QUADRANGLE (X: 710 to 860, Y: 320 to 580)
    elements.append(sketch_line(715, 340, 715, 580, strokes=2, wobble=1.0, stroke_width=3.2, color="#141414"))
    elements.append(sketch_line(865, 340, 865, 580, strokes=2, wobble=1.0, stroke_width=3.2, color="#141414"))
    roof_clock = [(708, 340), (790, 245), (872, 340)]
    elements.append(sketch_curve(roof_clock, strokes=2, wobble=1.0, stroke_width=3.5, color="#141414"))
    # Clock face circle
    elements.append(sketch_circle(790, 390, 26, strokes=2, wobble=0.8, stroke_width=2.5, color="#141414"))
    elements.append(sketch_line(790, 390, 790, 372, strokes=1, wobble=0.2, stroke_width=2.2, color="#141414"))
    elements.append(sketch_line(790, 390, 804, 390, strokes=1, wobble=0.2, stroke_width=2.2, color="#141414"))
    # Turret pinnacles
    elements.append(sketch_line(790, 245, 790, 215, strokes=1, wobble=0.4, stroke_width=2.2, color="#141414"))
    elements.append(sketch_star(790, 215, 6, color="#141414"))
    
    # THE GREAT HALL (X: 890 to 1340, Y: 290 to 590)
    # Massive pitched roof: Left eave (890, 360), Ridge (1115, 240), Right eave (1340, 360)
    roof_hall = [(880, 365), (1115, 235), (1350, 365)]
    elements.append(sketch_curve(roof_hall, strokes=2, wobble=1.2, stroke_width=4.2, color="#141414"))
    elements.append(sketch_line(885, 380, 1345, 380, strokes=1, wobble=1.0, stroke_width=2.5, color="#262626"))
    
    # Great Hall Walls
    elements.append(sketch_line(895, 380, 895, 590, strokes=2, wobble=1.2, stroke_width=3.5, color="#141414"))
    elements.append(sketch_line(1335, 380, 1335, 590, strokes=2, wobble=1.2, stroke_width=3.5, color="#141414"))
    
    # Gothic Tracery Windows & Stone Buttresses of Great Hall
    for bx in [940, 1005, 1070, 1135, 1200, 1265]:
        # Buttress pier
        elements.append(sketch_line(bx - 14, 380, bx - 14, 590, strokes=1, wobble=0.6, stroke_width=2.2, color="#1c1c1c"))
        elements.append(sketch_line(bx + 14, 380, bx + 14, 590, strokes=1, wobble=0.6, stroke_width=2.2, color="#1c1c1c"))
        elements.append(sketch_line(bx - 16, 475, bx + 16, 475, strokes=1, wobble=0.4, stroke_width=2.2, color="#141414"))
        
        # Tall Gothic Window
        wy = 405
        win_arch = [(bx - 8, wy + 75), (bx - 8, wy + 20), (bx, wy), (bx + 8, wy + 20), (bx + 8, wy + 75)]
        elements.append(sketch_curve(win_arch, strokes=2, wobble=0.6, stroke_width=2.2, color="#141414"))
        elements.append(sketch_line(bx, wy, bx, wy + 75, strokes=1, wobble=0.3, stroke_width=1.4, color="#2a2a2a"))
        for gy in [wy + 25, wy + 50]:
            elements.append(sketch_line(bx - 8, gy, bx + 8, gy, strokes=1, wobble=0.3, stroke_width=1.2, color="#2a2a2a"))
            
    # Pinnacles along Great Hall roof ridge
    for px in [930, 1010, 1090, 1170, 1250]:
        py_base = 250 + abs(1115 - px) * 0.52
        elements.append(sketch_line(px, py_base, px, py_base - 28, strokes=1, wobble=0.4, stroke_width=2.5, color="#141414"))
        elements.append(sketch_star(px, py_base - 28, 5, color="#141414"))
        
    # TOWER 3: Headmaster's Tower & Eastern Turret (X: 1360 to 1480, Y: 290 to 590)
    elements.append(sketch_line(1370, 330, 1370, 590, strokes=2, wobble=1.0, stroke_width=3.2, color="#141414"))
    elements.append(sketch_line(1460, 330, 1460, 590, strokes=2, wobble=1.0, stroke_width=3.2, color="#141414"))
    roof_east = [(1360, 330), (1415, 215), (1470, 330)]
    elements.append(sketch_curve(roof_east, strokes=2, wobble=1.0, stroke_width=3.5, color="#141414"))
    elements.append(sketch_line(1415, 215, 1415, 175, strokes=1, wobble=0.4, stroke_width=2.2, color="#141414"))
    elements.append(sketch_star(1415, 175, 6, color="#141414"))
    for wy in [375, 455]:
        elements.append(sketch_box(1402, wy, 24, 38, color="#1a1a1a", stroke_width=2.0))
        
    # EASTERN CORNER BATTLEMENTS (X: 1480 to 1750, Y: 380 to 600)
    elements.append(sketch_line(1480, 410, 1750, 410, strokes=2, wobble=1.0, stroke_width=3.2, color="#141414"))
    elements.append(sketch_line(1740, 410, 1740, 600, strokes=2, wobble=1.0, stroke_width=3.2, color="#141414"))
    # Castle crenellations / battlements
    for cx in range(1490, 1740, 28):
        elements.append(sketch_box(cx, 395, 16, 16, color="#141414", stroke_width=2.0))
        
    # 5. Rugged Mountain Cliffs & Boathouse
    cliff_ridge = [
        (80, 595), (250, 590), (450, 585), (650, 580), (880, 590),
        (1100, 595), (1350, 590), (1600, 600), (1850, 610), (1968, 615)
    ]
    elements.append(sketch_curve(cliff_ridge, strokes=2, wobble=1.5, stroke_width=4.5, color="#141414"))
    
    # Cliff rock vertical striations and shading
    for cx in range(100, 1950, 24):
        cy_top = 585 + random.uniform(-6, 8)
        cy_bot = 685 + random.uniform(-10, 15)
        elements.append(sketch_line(cx, cy_top, cx + random.uniform(-15, 15), cy_bot, strokes=1, wobble=1.5, stroke_width=2.0, color="#222222", opacity=0.8))
        if cx % 48 == 0:
            for hy in range(int(cy_top) + 18, int(cy_bot), 15):
                elements.append(sketch_line(cx - 12, hy, cx + 12, hy - 10, strokes=1, wobble=0.8, stroke_width=1.5, color="#333333", opacity=0.6))
                
    # Pine trees along cliff ridge
    for tx in [120, 160, 470, 550, 700, 870, 1350, 1470, 1740, 1780, 1840, 1900]:
        ty = 585 + random.uniform(-5, 5)
        th = random.uniform(30, 48)
        elements.append(sketch_line(tx, ty, tx, ty - th, strokes=1, wobble=0.4, stroke_width=2.2, color="#141414"))
        for tier in range(3):
            tier_y = ty - th * (0.35 + tier * 0.3)
            tw = (3 - tier) * 7.5
            elements.append(sketch_curve([(tx - tw, tier_y + 8), (tx, tier_y - 3), (tx + tw, tier_y + 8)], strokes=1, wobble=0.6, stroke_width=2.4, color="#141414"))
            
    # Boathouse entrance at cliff base (X: 1100 to 1180, Y: 635 to 695)
    bh_arch = [(1105, 695), (1105, 650), (1140, 630), (1175, 650), (1175, 695)]
    elements.append(sketch_curve(bh_arch, strokes=2, wobble=0.8, stroke_width=3.2, color="#141414"))
    elements.append(sketch_line(1100, 695, 1180, 695, strokes=1, wobble=0.5, stroke_width=2.5, color="#141414"))
    elements.append(sketch_star(1095, 650, 8, color="#141414")) # Torches
    elements.append(sketch_star(1185, 650, 8, color="#141414"))
    
    # 6. The Black Lake & Student Boats (Y: 695 to 885)
    # Lake waterline
    elements.append(sketch_line(60, 695, WIDTH - 60, 695, strokes=2, wobble=1.5, stroke_width=3.2, color="#141414"))
    
    # Lake ripples
    for wy in range(710, 870, 14):
        for wx in range(80, WIDTH - 120, 160):
            w_len = random.uniform(80, 140)
            elements.append(sketch_line(wx, wy, wx + w_len, wy + random.uniform(-1.5, 1.5), strokes=1, wobble=0.8, stroke_width=1.8, color="#262626", opacity=0.75))
            
    # Window reflections on water
    for rx in [638, 790, 940, 1005, 1070, 1135, 1200, 1265, 1415]:
        for ry in range(710, 790, 9):
            elements.append(sketch_line(rx - random.uniform(8, 20), ry, rx + random.uniform(8, 20), ry, strokes=1, wobble=0.6, stroke_width=2.0, color="#1e1e1e", opacity=0.8))
            
    # Student Boats
    def draw_boat(bx, by, scale=1.0, has_hagrid=False):
        b_elems = []
        bw = 48 * scale
        bh = 13 * scale
        hull = [(bx - bw, by), (bx - bw*0.6, by + bh), (bx + bw*0.6, by + bh), (bx + bw, by)]
        b_elems.append(sketch_curve(hull, strokes=2, wobble=0.8, stroke_width=2.8, color="#141414"))
        b_elems.append(sketch_line(bx - bw, by, bx + bw, by, strokes=1, wobble=0.5, stroke_width=2.0, color="#141414"))
        
        if has_hagrid:
            hagrid_head = (bx - 12*scale, by - 26*scale)
            b_elems.append(sketch_circle(hagrid_head[0], hagrid_head[1], 8*scale, strokes=1, wobble=0.5, stroke_width=2.2, color="#141414", fill="#141414"))
            coat = [(bx - 26*scale, by), (bx - 20*scale, by - 19*scale), (bx - 2*scale, by - 19*scale), (bx + 4*scale, by)]
            b_elems.append(sketch_curve(coat, strokes=1, wobble=0.5, stroke_width=2.2, color="#141414", fill="#141414"))
            b_elems.append(sketch_circle(bx + 18*scale, by - 14*scale, 5*scale, strokes=1, wobble=0.4, stroke_width=2.0, color="#141414", fill="#141414"))
        else:
            for px in [-15*scale, 0, 15*scale]:
                b_elems.append(sketch_circle(bx + px, by - 13*scale, 5*scale, strokes=1, wobble=0.4, stroke_width=2.0, color="#141414", fill="#141414"))
                b_elems.append(sketch_curve([(bx + px - 6*scale, by), (bx + px, by - 10*scale), (bx + px + 6*scale, by)], strokes=1, wobble=0.4, stroke_width=2.0, color="#141414", fill="#141414"))
                
        # Lantern on bow pole
        pole_x = bx + bw * 0.85
        b_elems.append(sketch_line(pole_x, by, pole_x, by - 24*scale, strokes=1, wobble=0.4, stroke_width=2.0, color="#141414"))
        lantern_y = by - 22*scale
        b_elems.append(sketch_circle(pole_x, lantern_y, 5*scale, strokes=1, wobble=0.3, stroke_width=2.0, color="#141414"))
        b_elems.append(sketch_star(pole_x, lantern_y, 9*scale, color="#141414"))
        b_elems.append(sketch_sparkle(pole_x, lantern_y, 14*scale, color="#222222"))
        
        b_elems.append(sketch_line(bx - bw*1.2, by + bh + 4, bx + bw*1.2, by + bh + 4, strokes=1, wobble=0.6, stroke_width=2.0, color="#2a2a2a"))
        return "\n".join(b_elems)
        
    elements.append(draw_boat(420, 750, scale=1.35, has_hagrid=True))
    elements.append(draw_boat(780, 785, scale=1.2, has_hagrid=False))
    elements.append(draw_boat(1240, 765, scale=1.1, has_hagrid=False))
    elements.append(draw_boat(1620, 735, scale=0.85, has_hagrid=False))
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}">
      {"".join(elements)}
    </svg>'''
    return svg

def generate_perfect_hogwarts():
    svg = build_hogwarts_panorama_svg()
    svg_path = f"{SCRATCH_DIR}/hp_hogwarts_panorama.svg"
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg)
        
    png_path = f"{SCRATCH_DIR}/hp_hogwarts_panorama_vec.png"
    subprocess.run(["node", "scripts/render_svg.js", svg_path, png_path], check=True)
    
    im = Image.open(png_path).convert("RGBA")
    draw = ImageDraw.Draw(im)
    
    font_main_banner = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 38)
    font_house = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 16)
    font_motto = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 18)
    font_quote = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 24)
    
    def draw_ink(x, y, text, font, color=(20, 20, 20, 240), anchor=None):
        for dx, dy in [(0, 0), (1, 0), (-1, 0), (0, 1), (1, 1)]:
            draw.text((x + dx, y + dy), text, font=font, fill=color, anchor=anchor)
            
    # Top Main Banner
    draw_ink(1024, 45, "HOGWARTS SCHOOL OF WITCHCRAFT & WIZARDRY", font_main_banner, anchor="mm")
    
    # House Labels
    draw_ink(220, 172, "GRYFFINDOR", font_house, (40, 40, 40, 230), anchor="mm")
    draw_ink(400, 172, "RAVENCLAW", font_house, (40, 40, 40, 230), anchor="mm")
    draw_ink(1648, 172, "SLYTHERIN", font_house, (40, 40, 40, 230), anchor="mm")
    draw_ink(1828, 172, "HUFFLEPUFF", font_house, (40, 40, 40, 230), anchor="mm")
    
    # School Motto below crest
    draw_ink(1024, 185, "“Draco Dormiens Nunquam Titillandus”", font_motto, (50, 50, 50, 220), anchor="mm")
    
    # Bottom Inspiring Quote
    draw_ink(1024, 935, "“Whether you come back by page or by the big screen, Hogwarts will always be there to welcome you home.”", font_quote, (30, 30, 30, 240), anchor="mm")
    
    return im

def generate_perfect_hogwarts_painted(sketch_im):
    W, H = sketch_im.size
    
    # Aged warm parchment background spanning the entire canvas edge-to-edge
    painted = Image.new("RGBA", (W, H), (242, 238, 226, 255))
    p_draw = ImageDraw.Draw(painted)
    
    # Warm golden glows for Great Hall and tower windows
    win_glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    w_draw = ImageDraw.Draw(win_glow)
    
    # Great Hall windows
    for bx in [940, 1005, 1070, 1135, 1200, 1265]:
        w_draw.rectangle([bx - 8, 410, bx + 8, 480], fill=(255, 215, 90, 230))
        w_draw.ellipse([bx - 22, 440 - 30, bx + 22, 440 + 30], fill=(255, 180, 50, 110))
        
    # Astronomy Tower windows
    for wy in [335, 425, 510]:
        w_draw.rectangle([622, wy + 10, 654, wy + 45], fill=(255, 220, 100, 230))
    # Clock tower face
    w_draw.ellipse([790 - 24, 390 - 24, 790 + 24, 390 + 24], fill=(255, 235, 150, 200))
    
    # Lanterns on boats
    for lx, ly in [(420 + 48*1.35*0.85, 750 - 22*1.35), (780 + 48*1.2*0.85, 785 - 22*1.2), (1240 + 48*1.1*0.85, 765 - 22*1.1), (1620 + 48*0.85*0.85, 735 - 22*0.85)]:
        w_draw.ellipse([lx - 16, ly - 16, lx + 16, ly + 16], fill=(255, 225, 110, 240))
        w_draw.ellipse([lx - 35, ly - 35, lx + 35, ly + 35], fill=(255, 170, 50, 120))
        for ry in range(int(ly) + 20, int(ly) + 80, 7):
            rw = max(5, 30 - (ry - ly)*0.3)
            w_draw.line([(lx - rw, ry), (lx + rw, ry)], fill=(255, 200, 80, 150), width=3)
            
    # Moon glow
    w_draw.ellipse([1455 - 60, 130 - 60, 1455 + 60, 130 + 60], fill=(255, 245, 190, 120))
    
    win_glow = win_glow.filter(ImageFilter.GaussianBlur(6))
    painted = Image.alpha_composite(painted, win_glow)
    
    # Enamel House crest colors
    crest_color = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    c_draw = ImageDraw.Draw(crest_color)
    # Gryffindor: Crimson
    c_draw.polygon([(220 - 28, 115 - 30), (220 + 28, 115 - 30), (220 + 28, 115 + 8), (220, 115 + 38), (220 - 28, 115 + 8)], fill=(155, 25, 35, 140))
    # Ravenclaw: Sapphire blue
    c_draw.polygon([(400 - 28, 115 - 30), (400 + 28, 115 - 30), (400 + 28, 115 + 8), (400, 115 + 38), (400 - 28, 115 + 8)], fill=(25, 55, 145, 140))
    # Slytherin: Emerald green
    c_draw.polygon([(1648 - 28, 115 - 30), (1648 + 28, 115 - 30), (1648 + 28, 115 + 8), (1648, 115 + 38), (1648 - 28, 115 + 8)], fill=(25, 125, 55, 140))
    # Hufflepuff: Amber gold
    c_draw.polygon([(1828 - 28, 115 - 30), (1828 + 28, 115 - 30), (1828 + 28, 115 + 8), (1828, 115 + 38), (1828 - 28, 115 + 8)], fill=(225, 165, 35, 140))
    
    crest_color = crest_color.filter(ImageFilter.GaussianBlur(2))
    painted = Image.alpha_composite(painted, crest_color)
    
    # Composite sketch lineart
    sketch_arr = np.array(sketch_im)
    painted_arr = np.array(painted)
    
    alpha_mask = sketch_arr[:, :, 3] / 255.0
    for c in range(3):
        painted_arr[:, :, c] = (painted_arr[:, :, c] * (1.0 - alpha_mask) + sketch_arr[:, :, c] * alpha_mask).astype(np.uint8)
        
    return Image.fromarray(painted_arr, "RGBA")

def main():
    print("Generating perfectly fitting Hogwarts Castle panorama...")
    sketch_im = generate_perfect_hogwarts()
    sketch_im.save(f"{ARTIFACT_DIR}/final_hogwarts_panorama.png")
    sketch_im.save(f"{OUTPUT_DIR}/hp_hogwarts_scene.webp", "WEBP", lossless=True)
    # Also save to legacy path
    sketch_im.save(f"{OUTPUT_DIR}/rysuneknaobraz1.webp", "WEBP", lossless=True)
    print("hp_hogwarts_scene.webp (2048x994) generated successfully.")
    
    painted_im = generate_perfect_hogwarts_painted(sketch_im)
    painted_im.save(f"{ARTIFACT_DIR}/final_hogwarts_panorama_painted.png")
    painted_im.save(f"{OUTPUT_DIR}/hp_hogwarts_scene_painted.webp", "WEBP", quality=95)
    print("hp_hogwarts_scene_painted.webp generated successfully.")
    
    # Previews
    bg_sk = Image.new("RGB", sketch_im.size, (244, 244, 242))
    bg_sk.paste(sketch_im, (0, 0), sketch_im)
    bg_sk.save(f"{ARTIFACT_DIR}/preview_hp_hogwarts_panorama.jpg", quality=92)
    
    painted_im.convert("RGB").save(f"{ARTIFACT_DIR}/preview_hp_hogwarts_panorama_painted.jpg", quality=92)
    print("All Hogwarts panorama assets ready!")

if __name__ == "__main__":
    main()
