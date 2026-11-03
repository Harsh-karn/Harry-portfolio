import math
import random
import os
import subprocess
from PIL import Image, ImageFont, ImageDraw

random.seed(1337)

SCRATCH_DIR = "C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/scratch"
ARTIFACT_DIR = "C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e"
OUTPUT_DIR = "public/textures/corridor/decorations"

os.makedirs(SCRATCH_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

def jitter(val, amount=1.2):
    return val + random.uniform(-amount, amount)

def sketch_line(x1, y1, x2, y2, strokes=2, wobble=1.5, stroke_width=3, color="#1e1e1e", opacity=0.9):
    paths = []
    for s in range(strokes):
        mx = (x1 + x2) / 2 + random.uniform(-wobble, wobble)
        my = (y1 + y2) / 2 + random.uniform(-wobble, wobble)
        sw = stroke_width + random.uniform(-0.4, 0.4)
        op = opacity * (0.85 if s > 0 else 1.0)
        p1x, p1y = jitter(x1, wobble*0.4), jitter(y1, wobble*0.4)
        p2x, p2y = jitter(x2, wobble*0.4), jitter(y2, wobble*0.4)
        d = f"M {p1x:.1f} {p1y:.1f} Q {mx:.1f} {my:.1f} {p2x:.1f} {p2y:.1f}"
        paths.append(f'<path d="{d}" stroke="{color}" stroke-width="{sw:.1f}" stroke-linecap="round" fill="none" opacity="{op:.2f}"/>')
    return "\n".join(paths)

def sketch_curve(points, strokes=2, wobble=1.2, stroke_width=3, color="#1e1e1e", opacity=0.9):
    paths = []
    for s in range(strokes):
        pts = [(jitter(x, wobble*0.4), jitter(y, wobble*0.4)) for x, y in points]
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
        paths.append(f'<path d="{d}" stroke="{color}" stroke-width="{sw:.1f}" stroke-linecap="round" fill="none" opacity="{op:.2f}"/>')
    return "\n".join(paths)

def sketch_circle(cx, cy, r, strokes=2, wobble=1.2, stroke_width=3, color="#1e1e1e", fill="none", opacity=0.9):
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

def sketch_star(cx, cy, r, color="#1e1e1e", stroke_width=2):
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

def sketch_sparkle(cx, cy, r, color="#1e1e1e"):
    lines = []
    lines.append(sketch_line(cx - r, cy, cx + r, cy, strokes=2, wobble=0.6, stroke_width=2.2, color=color))
    lines.append(sketch_line(cx, cy - r, cx, cy + r, strokes=2, wobble=0.6, stroke_width=2.2, color=color))
    r_d = r * 0.55
    lines.append(sketch_line(cx - r_d, cy - r_d, cx + r_d, cy + r_d, strokes=1, wobble=0.4, stroke_width=1.5, color=color))
    lines.append(sketch_line(cx - r_d, cy + r_d, cx + r_d, cy - r_d, strokes=1, wobble=0.4, stroke_width=1.5, color=color))
    return "\n".join(lines)

def sketch_box(x, y, w, h, color="#1e1e1e", stroke_width=3):
    elements = []
    # Outer box
    elements.append(sketch_line(x, y, x + w, y, strokes=2, wobble=1.5, stroke_width=stroke_width, color=color))
    elements.append(sketch_line(x + w, y, x + w, y + h, strokes=2, wobble=1.5, stroke_width=stroke_width, color=color))
    elements.append(sketch_line(x + w, y + h, x, y + h, strokes=2, wobble=1.5, stroke_width=stroke_width, color=color))
    elements.append(sketch_line(x, y + h, x, y, strokes=2, wobble=1.5, stroke_width=stroke_width, color=color))
    
    # Inner border line
    gap = 7
    elements.append(sketch_line(x + gap, y + gap, x + w - gap, y + gap, strokes=1, wobble=1.0, stroke_width=stroke_width*0.6, color=color, opacity=0.7))
    elements.append(sketch_line(x + w - gap, y + gap, x + w - gap, y + h - gap, strokes=1, wobble=1.0, stroke_width=stroke_width*0.6, color=color, opacity=0.7))
    elements.append(sketch_line(x + w - gap, y + h - gap, x + gap, y + h - gap, strokes=1, wobble=1.0, stroke_width=stroke_width*0.6, color=color, opacity=0.7))
    elements.append(sketch_line(x + gap, y + h - gap, x + gap, y + gap, strokes=1, wobble=1.0, stroke_width=stroke_width*0.6, color=color, opacity=0.7))
    
    # Corner ticks
    for cx, cy in [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]:
        elements.append(f'<circle cx="{jitter(cx, 1):.1f}" cy="{jitter(cy, 1):.1f}" r="3.5" fill="{color}" opacity="0.8"/>')
        
    return "\n".join(elements)

def sketch_wand(x1, y1, x2, y2, color="#1e1e1e"):
    dx = x2 - x1
    dy = y2 - y1
    dist = math.hypot(dx, dy)
    ux = dx / dist
    uy = dy / dist
    px = -uy
    py = ux
    
    r_base = 7.0
    r_tip = 2.0
    
    p1 = (x1 + px * r_base, y1 + py * r_base)
    p2 = (x2 + px * r_tip, y2 + py * r_tip)
    p3 = (x2 - px * r_tip, y2 - py * r_tip)
    p4 = (x1 - px * r_base, y1 - py * r_base)
    
    d = f"M {p1[0]:.1f} {p1[1]:.1f} L {p2[0]:.1f} {p2[1]:.1f} L {p3[0]:.1f} {p3[1]:.1f} L {p4[0]:.1f} {p4[1]:.1f} Z"
    
    rings = []
    for frac in [0.10, 0.20, 0.30, 0.42]:
        bx = x1 + ux * (dist * frac)
        by = y1 + uy * (dist * frac)
        rad = 6.8 - frac * 6.5
        rings.append(f'<circle cx="{jitter(bx, 0.5):.1f}" cy="{jitter(by, 0.5):.1f}" r="{rad:.1f}" stroke="{color}" stroke-width="2" fill="{color}" opacity="0.9"/>')
    
    return f'''
    <path d="{d}" stroke="{color}" stroke-width="2.5" fill="{color}" opacity="0.88" stroke-linejoin="round"/>
    {"".join(rings)}
    '''

def sketch_burst(cx, cy, rx, ry, points=22, color="#1e1e1e"):
    pts = []
    for i in range(points):
        ang = i * (2 * math.pi / points)
        if i % 2 == 0:
            rad_x = rx * random.uniform(1.08, 1.22)
            rad_y = ry * random.uniform(1.08, 1.22)
        else:
            rad_x = rx * random.uniform(0.70, 0.82)
            rad_y = ry * random.uniform(0.70, 0.82)
        px = cx + rad_x * math.cos(ang)
        py = cy + rad_y * math.sin(ang)
        pts.append((px, py))
    
    d1 = f"M {pts[0][0]:.1f} {pts[0][1]:.1f} " + " ".join([f"L {x:.1f} {y:.1f}" for x, y in pts[1:]]) + " Z"
    d2 = f"M {pts[0][0]+jitter(0, 1.2):.1f} {pts[0][1]+jitter(0, 1.2):.1f} " + " ".join([f"L {jitter(x, 1.2):.1f} {jitter(y, 1.2):.1f}" for x, y in pts[1:]]) + " Z"
    
    action_lines = []
    for i in range(0, points, 2):
        ang = i * (2 * math.pi / points)
        x_start = cx + rx * 1.22 * math.cos(ang)
        y_start = cy + ry * 1.22 * math.sin(ang)
        x_end = cx + rx * 1.38 * math.cos(ang)
        y_end = cy + ry * 1.38 * math.sin(ang)
        action_lines.append(sketch_line(x_start, y_start, x_end, y_end, strokes=1, wobble=1.0, stroke_width=2.5, color=color))
        
    return f'''
    <path d="{d1}" stroke="{color}" stroke-width="3.8" stroke-linejoin="round" fill="none" opacity="0.95"/>
    <path d="{d2}" stroke="{color}" stroke-width="2.0" stroke-linejoin="round" fill="none" opacity="0.8"/>
    {"".join(action_lines)}
    '''

def sketch_footprint_pair(cx, cy, angle, scale=1.0, color="#1e1e1e"):
    rad = math.radians(angle)
    cos_a, sin_a = math.cos(rad), math.sin(rad)
    
    def transform(x, y):
        tx = x * cos_a - y * sin_a
        ty = x * sin_a + y * cos_a
        return cx + tx * scale, cy + ty * scale
    
    lhx, lhy = transform(-7, 5)
    lsx, lsy = transform(-7, -4)
    rhx, rhy = transform(7, -1)
    rsx, rsy = transform(7, -10)
    
    elements = []
    elements.append(f'<ellipse cx="{lsx:.1f}" cy="{lsy:.1f}" rx="{2.8*scale:.1f}" ry="{5.8*scale:.1f}" transform="rotate({angle:.1f} {lsx:.1f} {lsy:.1f})" fill="{color}" opacity="0.85"/>')
    elements.append(f'<ellipse cx="{lhx:.1f}" cy="{lhy:.1f}" rx="{2.2*scale:.1f}" ry="{3.4*scale:.1f}" transform="rotate({angle:.1f} {lhx:.1f} {lhy:.1f})" fill="{color}" opacity="0.85"/>')
    elements.append(f'<ellipse cx="{rsx:.1f}" cy="{rsy:.1f}" rx="{2.8*scale:.1f}" ry="{5.8*scale:.1f}" transform="rotate({angle:.1f} {rsx:.1f} {rsy:.1f})" fill="{color}" opacity="0.85"/>')
    elements.append(f'<ellipse cx="{rhx:.1f}" cy="{rhy:.1f}" rx="{2.2*scale:.1f}" ry="{3.4*scale:.1f}" transform="rotate({angle:.1f} {rhx:.1f} {rhy:.1f})" fill="{color}" opacity="0.85"/>')
    return "\n".join(elements)

# --- 1. CAPACIOUS EXTREMIS (Above Door, 1249 x 624) ---
def generate_capacious_loop():
    svg_elements = []
    
    # Wand on right side
    svg_elements.append(sketch_wand(1120, 530, 970, 310, color="#1a1a1a"))
    # Wand tip starburst
    svg_elements.append(sketch_star(960, 295, 18, color="#141414"))
    svg_elements.append(sketch_sparkle(1010, 260, 24, color="#141414"))
    svg_elements.append(sketch_star(940, 250, 12, color="#222222"))
    svg_elements.append(sketch_star(1000, 350, 11, color="#222222"))
    svg_elements.append(sketch_sparkle(925, 330, 16, color="#222222"))
    
    # Stars and sparkles scattered
    svg_elements.append(sketch_star(160, 220, 11, color="#2a2a2a"))
    svg_elements.append(sketch_star(180, 430, 9, color="#2a2a2a"))
    svg_elements.append(sketch_sparkle(720, 190, 14, color="#333333"))
    svg_elements.append(sketch_sparkle(230, 340, 13, color="#333333"))
    svg_elements.append(sketch_sparkle(1070, 210, 16, color="#333333"))
    svg_elements.append(sketch_star(860, 135, 7, color="#3a3a3a"))
    svg_elements.append(sketch_star(875, 135, 7, color="#3a3a3a"))
    
    # Double flourish underline under where capaciousExtremis(); sits
    svg_elements.append(sketch_line(260, 385, 960, 385, strokes=2, wobble=1.2, stroke_width=3, color="#222222"))
    svg_elements.append(sketch_star(975, 385, 9, color="#222222"))
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1249" height="624" viewBox="0 0 1249 624">
      {"".join(svg_elements)}
    </svg>'''
    
    svg_path = f"{SCRATCH_DIR}/hp_capacious_loop.svg"
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg)
        
    # Render vector background
    png_path = f"{SCRATCH_DIR}/hp_capacious_loop_vec.png"
    subprocess.run(["node", "scripts/render_svg.js", svg_path, png_path], check=True)
    
    # Load and composite with PIL text
    im = Image.open(png_path).convert("RGBA")
    draw = ImageDraw.Draw(im)
    
    font_code = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 74)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 68)
    font_comm = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 30)
    
    # Hand-drawn multi-pass ink effect
    def draw_ink(x, y, text, font, color=(20, 20, 20, 240)):
        for dx, dy in [(0, 0), (1, 0), (-1, 0), (0, 1), (1, 1)]:
            draw.text((x + dx, y + dy), text, font=font, fill=color)
            
    draw_ink(200, 125, "// Undetectable Extension Charm (Infinity Room)", font_comm, (50, 50, 50, 220))
    draw_ink(200, 185, "while(true) {", font_code)
    draw_ink(260, 290, "capaciousExtremis();", font_sub)
    draw_ink(200, 395, "}", font_code)
    
    return im

# --- 2. POTIONS & CRAFT (Left Wall, 604 x 1208) ---
def generate_potion_craft():
    svg_elements = []
    
    # Box 1: SORTING (Y: 60 to 360)
    svg_elements.append(sketch_box(45, 60, 514, 300, color="#1e1e1e", stroke_width=3.2))
    
    # Sorting Hat
    brim_pts = [(150, 275), (200, 285), (280, 290), (370, 282), (430, 270)]
    svg_elements.append(sketch_curve(brim_pts, strokes=2, wobble=1.5, stroke_width=3.5, color="#1a1a1a"))
    brim_under = [(160, 282), (220, 292), (290, 296), (360, 290), (420, 278)]
    svg_elements.append(sketch_curve(brim_under, strokes=1, wobble=1.0, stroke_width=2.0, color="#2a2a2a"))
    
    hat_left = [(190, 275), (210, 220), (230, 170), (250, 130), (290, 100)]
    hat_right = [(290, 100), (320, 105), (325, 140), (330, 190), (370, 235), (390, 272)]
    svg_elements.append(sketch_curve(hat_left, strokes=2, wobble=1.5, stroke_width=3.2, color="#1a1a1a"))
    svg_elements.append(sketch_curve(hat_right, strokes=2, wobble=1.5, stroke_width=3.2, color="#1a1a1a"))
    tip_pts = [(290, 100), (315, 85), (330, 100), (315, 115)]
    svg_elements.append(sketch_curve(tip_pts, strokes=2, wobble=1.2, stroke_width=3, color="#1a1a1a"))
    
    mouth_pts = [(230, 240), (265, 252), (290, 246), (320, 255), (345, 242)]
    svg_elements.append(sketch_curve(mouth_pts, strokes=2, wobble=1.2, stroke_width=3.5, color="#1a1a1a"))
    mouth_lower = [(240, 246), (285, 258), (335, 248)]
    svg_elements.append(sketch_curve(mouth_lower, strokes=1, wobble=0.8, stroke_width=2.0, color="#2a2a2a"))
    
    eye_l = [(225, 205), (245, 195), (260, 208)]
    eye_r = [(310, 208), (325, 195), (345, 205)]
    svg_elements.append(sketch_curve(eye_l, strokes=2, wobble=1.0, stroke_width=2.8, color="#1a1a1a"))
    svg_elements.append(sketch_curve(eye_r, strokes=2, wobble=1.0, stroke_width=2.8, color="#1a1a1a"))
    
    # Patch
    patch = [(210, 160), (235, 155), (240, 180), (215, 185)]
    svg_elements.append(sketch_curve(patch + [patch[0]], strokes=1, wobble=0.8, stroke_width=1.8, color="#2a2a2a"))
    svg_elements.append(sketch_line(218, 165, 226, 175, strokes=1, wobble=0.5, stroke_width=1.8, color="#1a1a1a"))
    svg_elements.append(sketch_line(226, 165, 218, 175, strokes=1, wobble=0.5, stroke_width=1.8, color="#1a1a1a"))
    
    # Quill
    quill_stem = [(400, 275), (415, 220), (425, 160), (430, 120)]
    svg_elements.append(sketch_curve(quill_stem, strokes=2, wobble=1.2, stroke_width=2.5, color="#1a1a1a"))
    svg_elements.append(sketch_curve([(430, 120), (450, 150), (445, 200), (415, 225)], strokes=2, wobble=1.2, stroke_width=2.0, color="#2a2a2a"))
    svg_elements.append(sketch_curve([(430, 120), (420, 150), (415, 190), (405, 220)], strokes=1, wobble=1.0, stroke_width=1.8, color="#2a2a2a"))
    svg_elements.append(sketch_box(388, 260, 26, 22, color="#1a1a1a", stroke_width=2))
    
    # Flanking stars for SORTING
    svg_elements.append(sketch_star(160, 328, 8, color="#222222"))
    svg_elements.append(sketch_star(444, 328, 8, color="#222222"))
    
    # Connector 1
    arrow1_pts = [(302, 365), (318, 390), (286, 415), (314, 440), (302, 462)]
    svg_elements.append(sketch_curve(arrow1_pts, strokes=2, wobble=1.2, stroke_width=3.5, color="#1e1e1e"))
    svg_elements.append(sketch_line(290, 448, 302, 465, strokes=2, wobble=0.8, stroke_width=3.2, color="#1e1e1e"))
    svg_elements.append(sketch_line(314, 448, 302, 465, strokes=2, wobble=0.8, stroke_width=3.2, color="#1e1e1e"))
    svg_elements.append(sketch_sparkle(345, 415, 10, color="#333333"))
    svg_elements.append(sketch_sparkle(255, 420, 8, color="#333333"))
    
    # Box 2: POTIONS (Y: 470 to 770)
    svg_elements.append(sketch_box(45, 470, 514, 300, color="#1e1e1e", stroke_width=3.2))
    
    # Cauldron Rim
    rim_top = [(212, 560), (250, 550), (302, 548), (354, 550), (392, 560)]
    rim_bot = [(212, 560), (250, 570), (302, 572), (354, 570), (392, 560)]
    svg_elements.append(sketch_curve(rim_top, strokes=2, wobble=1.2, stroke_width=3.2, color="#1a1a1a"))
    svg_elements.append(sketch_curve(rim_bot, strokes=2, wobble=1.2, stroke_width=3.2, color="#1a1a1a"))
    
    cauldron_l = [(212, 560), (185, 600), (195, 650), (240, 680), (302, 685)]
    cauldron_r = [(392, 560), (419, 600), (409, 650), (364, 680), (302, 685)]
    svg_elements.append(sketch_curve(cauldron_l, strokes=2, wobble=1.5, stroke_width=3.8, color="#1a1a1a"))
    svg_elements.append(sketch_curve(cauldron_r, strokes=2, wobble=1.5, stroke_width=3.8, color="#1a1a1a"))
    
    foot_l = [(220, 675), (205, 705), (195, 715)]
    foot_m = [(302, 685), (302, 718)]
    foot_r = [(384, 675), (399, 705), (409, 715)]
    svg_elements.append(sketch_curve(foot_l, strokes=2, wobble=1.0, stroke_width=3.5, color="#1a1a1a"))
    svg_elements.append(sketch_curve(foot_m, strokes=2, wobble=1.0, stroke_width=3.5, color="#1a1a1a"))
    svg_elements.append(sketch_curve(foot_r, strokes=2, wobble=1.0, stroke_width=3.5, color="#1a1a1a"))
    
    for fx in [230, 260, 290, 320, 350, 375]:
        svg_elements.append(sketch_line(fx, 715, fx + random.uniform(8, 16), 715, strokes=1, wobble=0.6, stroke_width=2.5, color="#3a3a3a"))
        svg_elements.append(sketch_curve([(fx, 715), (fx+6, 705), (fx+12, 715)], strokes=1, wobble=0.6, stroke_width=1.8, color="#222222"))
    
    for bx, by, br in [(260, 545, 6), (285, 532, 9), (325, 540, 7), (350, 525, 5), (300, 515, 11), (275, 498, 8)]:
        svg_elements.append(sketch_circle(bx, by, br, strokes=1, wobble=0.6, stroke_width=2.0, color="#1a1a1a"))
    
    steam1 = [(250, 545), (230, 515), (255, 490), (240, 465)]
    steam2 = [(350, 545), (370, 515), (345, 490), (360, 465)]
    svg_elements.append(sketch_curve(steam1, strokes=1, wobble=1.0, stroke_width=2.0, color="#3a3a3a", opacity=0.75))
    svg_elements.append(sketch_curve(steam2, strokes=1, wobble=1.0, stroke_width=2.0, color="#3a3a3a", opacity=0.75))
    
    # Felix vial
    vial_neck = [(445, 620), (445, 640), (465, 640), (465, 620), (445, 620)]
    svg_elements.append(sketch_curve(vial_neck, strokes=1, wobble=0.5, stroke_width=2, color="#1a1a1a"))
    vial_body = [(445, 640), (430, 660), (430, 695), (480, 695), (480, 660), (465, 640)]
    svg_elements.append(sketch_curve(vial_body, strokes=2, wobble=0.8, stroke_width=2.2, color="#1a1a1a"))
    svg_elements.append(sketch_box(447, 612, 16, 9, color="#1a1a1a", stroke_width=1.8))
    
    svg_elements.append(sketch_star(160, 740, 8, color="#222222"))
    svg_elements.append(sketch_star(444, 740, 8, color="#222222"))
    
    # Connector 2
    arrow2_pts = [(302, 775), (280, 805), (325, 835), (302, 870)]
    svg_elements.append(sketch_curve(arrow2_pts, strokes=2, wobble=1.2, stroke_width=4.0, color="#1e1e1e"))
    svg_elements.append(sketch_line(288, 852, 302, 870, strokes=2, wobble=0.8, stroke_width=3.5, color="#1e1e1e"))
    svg_elements.append(sketch_line(316, 852, 302, 870, strokes=2, wobble=0.8, stroke_width=3.5, color="#1e1e1e"))
    
    # Burst 3: rx=175, ry=95 (leaving safe ~40px margin on each side)
    svg_elements.append(sketch_burst(302, 1000, 175, 95, points=22, color="#161616"))
    
    # Footprints
    svg_elements.append(sketch_footprint_pair(155, 925, 28, scale=1.0, color="#1a1a1a"))
    svg_elements.append(sketch_footprint_pair(210, 915, 12, scale=1.0, color="#1a1a1a"))
    svg_elements.append(sketch_footprint_pair(395, 1075, 32, scale=1.0, color="#1a1a1a"))
    svg_elements.append(sketch_footprint_pair(450, 1090, 20, scale=1.0, color="#1a1a1a"))
    
    svg_elements.append(sketch_star(95, 980, 13, color="#141414"))
    svg_elements.append(sketch_star(508, 1000, 13, color="#141414"))
    svg_elements.append(sketch_sparkle(302, 885, 15, color="#222222"))
    svg_elements.append(sketch_sparkle(302, 1120, 15, color="#222222"))
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="604" height="1208" viewBox="0 0 604 1208">
      {"".join(svg_elements)}
    </svg>'''
    
    svg_path = f"{SCRATCH_DIR}/hp_potion_craft.svg"
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg)
        
    png_path = f"{SCRATCH_DIR}/hp_potion_craft_vec.png"
    subprocess.run(["node", "scripts/render_svg.js", svg_path, png_path], check=True)
    
    im = Image.open(png_path).convert("RGBA")
    draw = ImageDraw.Draw(im)
    
    font_title = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 46)
    font_burst1 = ImageFont.truetype("C:/Windows/Fonts/comicbd.ttf", 52)
    font_burst2 = ImageFont.truetype("C:/Windows/Fonts/comicbd.ttf", 48)
    font_vial = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 12)
    
    def draw_ink(x, y, text, font, color=(20, 20, 20, 240), anchor=None):
        for dx, dy in [(0, 0), (1, 0), (-1, 0), (0, 1), (1, 1)]:
            draw.text((x + dx, y + dy), text, font=font, fill=color, anchor=anchor)
            
    # Text labels
    draw_ink(302, 340, "SORTING", font_title, anchor="mm")
    draw_ink(302, 748, "POTIONS", font_title, anchor="mm")
    draw_ink(455, 672, "FELIX", font_vial, anchor="mm")
    
    # Burst text
    draw_ink(302, 975, "MISCHIEF", font_burst1, anchor="mm")
    draw_ink(302, 1035, "MANAGED!", font_burst2, anchor="mm")
    
    return im

# --- 3. BUTTERBEER & DEATHLY HALLOWS (Right Wall, 1761 x 880) ---
def generate_butterbeer_hallows():
    svg_elements = []
    
    # --- COMPOSITION 1: BUTTERBEER (Left, Center X: 380, Y: 430) ---
    tankard_l = [(300, 340), (295, 450), (300, 560)]
    tankard_r = [(460, 340), (465, 450), (460, 560)]
    svg_elements.append(sketch_curve(tankard_l, strokes=2, wobble=1.2, stroke_width=3.5, color="#1a1a1a"))
    svg_elements.append(sketch_curve(tankard_r, strokes=2, wobble=1.2, stroke_width=3.5, color="#1a1a1a"))
    
    base_curve = [(285, 560), (380, 575), (475, 560)]
    svg_elements.append(sketch_curve(base_curve, strokes=2, wobble=1.2, stroke_width=4.0, color="#1a1a1a"))
    base_under = [(288, 575), (380, 588), (472, 575)]
    svg_elements.append(sketch_curve(base_under, strokes=2, wobble=1.0, stroke_width=3.0, color="#2a2a2a"))
    
    for rx in [340, 380, 420]:
        svg_elements.append(sketch_line(rx, 345, rx, 555, strokes=1, wobble=1.0, stroke_width=2.0, color="#2e2e2e", opacity=0.75))
    
    handle_out = [(295, 375), (220, 395), (215, 485), (295, 515)]
    handle_in = [(295, 395), (245, 410), (240, 470), (295, 495)]
    svg_elements.append(sketch_curve(handle_out, strokes=2, wobble=1.2, stroke_width=3.8, color="#1a1a1a"))
    svg_elements.append(sketch_curve(handle_in, strokes=2, wobble=1.0, stroke_width=2.8, color="#1a1a1a"))
    
    foam_pts = [
        (285, 345), (280, 315), (305, 290), (340, 275), (380, 270), 
        (420, 275), (455, 290), (480, 315), (475, 345), 
        (450, 355), (425, 340), (390, 355), (355, 340), (320, 355), (285, 345)
    ]
    svg_elements.append(sketch_curve(foam_pts, strokes=2, wobble=1.5, stroke_width=3.5, color="#1a1a1a"))
    
    drip1 = [(315, 350), (320, 390), (328, 410), (335, 390), (338, 348)]
    svg_elements.append(sketch_curve(drip1, strokes=2, wobble=0.8, stroke_width=2.5, color="#1a1a1a"))
    drip2 = [(440, 350), (445, 380), (452, 395), (458, 380), (460, 350)]
    svg_elements.append(sketch_curve(drip2, strokes=2, wobble=0.8, stroke_width=2.2, color="#1a1a1a"))
    
    svg_elements.append(sketch_curve([(340, 270), (325, 230), (350, 190), (335, 155)], strokes=1, wobble=1.2, stroke_width=2.2, color="#3a3a3a", opacity=0.8))
    svg_elements.append(sketch_curve([(400, 270), (415, 230), (390, 190), (405, 155)], strokes=1, wobble=1.2, stroke_width=2.2, color="#3a3a3a", opacity=0.8))
    
    svg_elements.append(sketch_box(318, 420, 124, 45, color="#1a1a1a", stroke_width=2.2))
    svg_elements.append(sketch_star(280, 628, 9, color="#222222"))
    svg_elements.append(sketch_star(480, 628, 9, color="#222222"))
    
    # --- COMPOSITION 2: THE DEATHLY HALLOWS (Center X: 880, Y: 430) ---
    tx_apex, ty_apex = 880, 190
    tx_left, ty_left = 700, 535
    tx_right, ty_right = 1060, 535
    
    svg_elements.append(sketch_line(tx_apex, ty_apex, tx_left, ty_left, strokes=2, wobble=1.5, stroke_width=4.0, color="#141414"))
    svg_elements.append(sketch_line(tx_left, ty_left, tx_right, ty_right, strokes=2, wobble=1.5, stroke_width=4.0, color="#141414"))
    svg_elements.append(sketch_line(tx_right, ty_right, tx_apex, ty_apex, strokes=2, wobble=1.5, stroke_width=4.0, color="#141414"))
    
    svg_elements.append(sketch_line(tx_apex, ty_apex + 10, tx_left + 12, ty_left - 6, strokes=1, wobble=1.0, stroke_width=1.8, color="#2a2a2a", opacity=0.7))
    svg_elements.append(sketch_line(tx_left + 12, ty_left - 6, tx_right - 12, ty_right - 6, strokes=1, wobble=1.0, stroke_width=1.8, color="#2a2a2a", opacity=0.7))
    svg_elements.append(sketch_line(tx_right - 12, ty_right - 6, tx_apex, ty_apex + 10, strokes=1, wobble=1.0, stroke_width=1.8, color="#2a2a2a", opacity=0.7))
    
    for i in range(1, 5):
        svg_elements.append(sketch_line(tx_apex - i*7, ty_apex + i*14, tx_apex + i*7, ty_apex + i*14, strokes=1, wobble=0.5, stroke_width=1.5, color="#2e2e2e", opacity=0.6))
        svg_elements.append(sketch_line(tx_left + i*12, ty_left - i*6, tx_left + i*6, ty_left, strokes=1, wobble=0.5, stroke_width=1.5, color="#2e2e2e", opacity=0.6))
        svg_elements.append(sketch_line(tx_right - i*12, ty_right - i*6, tx_right - i*6, ty_right, strokes=1, wobble=0.5, stroke_width=1.5, color="#2e2e2e", opacity=0.6))
    
    # Inscribed circle
    svg_elements.append(sketch_circle(880, 420, 115, strokes=2, wobble=1.2, stroke_width=3.8, color="#141414"))
    svg_elements.append(sketch_circle(880, 420, 111, strokes=1, wobble=0.8, stroke_width=1.8, color="#2a2a2a", opacity=0.7))
    
    # Vertical Elder wand line
    svg_elements.append(sketch_line(880, 190, 880, 535, strokes=2, wobble=1.0, stroke_width=4.2, color="#141414"))
    for by in [260, 330, 420, 470]:
        svg_elements.append(sketch_circle(880, by, 7.5, strokes=1, wobble=0.5, stroke_width=2.0, color="#141414", fill="#141414"))
    
    for ang_deg in [-135, -115, -90, -65, -45, 0, 180]:
        rad = math.radians(ang_deg)
        x_s = 880 + 175 * math.cos(rad)
        y_s = 400 + 175 * math.sin(rad)
        x_e = 880 + 225 * math.cos(rad)
        y_e = 400 + 225 * math.sin(rad)
        svg_elements.append(sketch_line(x_s, y_s, x_e, y_e, strokes=1, wobble=1.0, stroke_width=2.0, color="#3a3a3a", opacity=0.75))
    
    svg_elements.append(sketch_star(690, 595, 10, color="#222222"))
    svg_elements.append(sketch_star(1070, 595, 10, color="#222222"))
    
    # --- COMPOSITION 3: HARRY'S GLASSES, SCAR & PLATFORM 9 ¾ (Right, Center X: 1380, Y: 430) ---
    # Glasses
    svg_elements.append(sketch_circle(1310, 340, 48, strokes=2, wobble=1.2, stroke_width=3.8, color="#141414"))
    svg_elements.append(sketch_circle(1450, 340, 48, strokes=2, wobble=1.2, stroke_width=3.8, color="#141414"))
    svg_elements.append(sketch_curve([(1358, 340), (1380, 326), (1402, 340)], strokes=2, wobble=0.8, stroke_width=3.5, color="#141414"))
    svg_elements.append(sketch_curve([(1262, 340), (1230, 335), (1205, 342)], strokes=2, wobble=1.0, stroke_width=3.0, color="#1a1a1a"))
    svg_elements.append(sketch_curve([(1498, 340), (1530, 335), (1555, 342)], strokes=2, wobble=1.0, stroke_width=3.0, color="#1a1a1a"))
    
    # Scar
    scar_pts = [
        (1400, 200), (1425, 235), (1412, 238), (1432, 280),
        (1420, 275), (1408, 242), (1418, 238), (1400, 200)
    ]
    svg_elements.append(sketch_curve(scar_pts, strokes=2, wobble=0.8, stroke_width=3.2, color="#141414"))
    svg_elements.append(sketch_sparkle(1425, 240, 16, color="#222222"))
    
    # Wand
    svg_elements.append(sketch_wand(1220, 440, 1530, 175, color="#1a1a1a"))
    svg_elements.append(sketch_star(1540, 165, 18, color="#141414"))
    svg_elements.append(sketch_sparkle(1570, 140, 22, color="#222222"))
    svg_elements.append(sketch_star(1510, 135, 10, color="#222222"))
    
    # Platform 9 3/4 Badge
    svg_elements.append(sketch_circle(1380, 520, 72, strokes=2, wobble=1.2, stroke_width=3.8, color="#141414"))
    svg_elements.append(sketch_circle(1380, 520, 65, strokes=1, wobble=0.8, stroke_width=2.0, color="#2a2a2a", opacity=0.8))
    
    svg_elements.append(sketch_star(1270, 520, 11, color="#222222"))
    svg_elements.append(sketch_star(1490, 520, 11, color="#222222"))
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1761" height="880" viewBox="0 0 1761 880">
      {"".join(svg_elements)}
    </svg>'''
    
    svg_path = f"{SCRATCH_DIR}/hp_butterbeer_hallows.svg"
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg)
        
    png_path = f"{SCRATCH_DIR}/hp_butterbeer_hallows_vec.png"
    subprocess.run(["node", "scripts/render_svg.js", svg_path, png_path], check=True)
    
    im = Image.open(png_path).convert("RGBA")
    draw = ImageDraw.Draw(im)
    
    font_beer = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 20)
    font_fuel = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 46)
    font_hallows = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 36)
    font_plat = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 18)
    font_934 = ImageFont.truetype("C:/Windows/Fonts/Inkfree.ttf", 52)
    
    def draw_ink(x, y, text, font, color=(20, 20, 20, 240), anchor=None):
        for dx, dy in [(0, 0), (1, 0), (-1, 0), (0, 1), (1, 1)]:
            draw.text((x + dx, y + dy), text, font=font, fill=color, anchor=anchor)
            
    # Text labels
    draw_ink(380, 442, "BUTTERBEER", font_beer, anchor="mm")
    draw_ink(380, 626, "FUEL", font_fuel, anchor="mm")
    draw_ink(880, 595, "DEATHLY HALLOWS", font_hallows, anchor="mm")
    draw_ink(1380, 492, "PLATFORM", font_plat, anchor="mm")
    draw_ink(1380, 545, "9 ¾", font_934, anchor="mm")
    
    return im

def main():
    print("Generating Harry Potter Door Decorations...")
    
    # 1. Capacious Extremis Loop
    im_cap = generate_capacious_loop()
    im_cap.save(f"{ARTIFACT_DIR}/final_capacious_loop.png")
    im_cap.save(f"{OUTPUT_DIR}/hp_capacious_loop.webp", "WEBP", lossless=True)
    print("hp_capacious_loop.webp generated.")
    
    # 2. Potion Craft
    im_pot = generate_potion_craft()
    im_pot.save(f"{ARTIFACT_DIR}/final_potion_craft.png")
    im_pot.save(f"{OUTPUT_DIR}/hp_potion_craft.webp", "WEBP", lossless=True)
    print("hp_potion_craft.webp generated.")
    
    # 3. Butterbeer & Deathly Hallows
    im_but = generate_butterbeer_hallows()
    im_but.save(f"{ARTIFACT_DIR}/final_butterbeer_hallows.png")
    im_but.save(f"{OUTPUT_DIR}/hp_butterbeer_hallows.webp", "WEBP", lossless=True)
    print("hp_butterbeer_hallows.webp generated.")
    
    # Create combined preview on wall texture
    bg_cap = Image.new("RGB", im_cap.size, (244, 244, 242))
    bg_cap.paste(im_cap, (0, 0), im_cap)
    bg_cap.save(f"{ARTIFACT_DIR}/preview_hp_capacious_loop.jpg", quality=92)
    
    bg_pot = Image.new("RGB", im_pot.size, (244, 244, 242))
    bg_pot.paste(im_pot, (0, 0), im_pot)
    bg_pot.save(f"{ARTIFACT_DIR}/preview_hp_potion_craft.jpg", quality=92)
    
    bg_but = Image.new("RGB", im_but.size, (244, 244, 242))
    bg_but.paste(im_but, (0, 0), im_but)
    bg_but.save(f"{ARTIFACT_DIR}/preview_hp_butterbeer_hallows.jpg", quality=92)
    
    print("All previews and production textures created successfully!")

if __name__ == "__main__":
    main()
