import math
import random
import os
import numpy as np

random.seed(42)

WIDTH = 2048
HEIGHT = 1024

DOOR_X1, DOOR_X2 = 895, 1153
DOOR_Y1, DOOR_Y2 = 693, 1024

WIN_X1, WIN_X2 = 1254, 1432
WIN_Y1, WIN_Y2 = 693, 872

def jitter(val, amount=1.2):
    return val + random.uniform(-amount, amount)

def sketch_line(x1, y1, x2, y2, strokes=2, wobble=1.2, stroke_width=2.5, color="#1a1a1a", opacity=0.9):
    paths = []
    for s in range(strokes):
        mx = (x1 + x2) / 2 + random.uniform(-wobble, wobble)
        my = (y1 + y2) / 2 + random.uniform(-wobble, wobble)
        sw = stroke_width + random.uniform(-0.3, 0.3)
        op = opacity * (0.8 if s > 0 else 1.0)
        p1x, p1y = jitter(x1, wobble*0.4), jitter(y1, wobble*0.4)
        p2x, p2y = jitter(x2, wobble*0.4), jitter(y2, wobble*0.4)
        d = f"M {p1x:.1f} {p1y:.1f} Q {mx:.1f} {my:.1f} {p2x:.1f} {p2y:.1f}"
        paths.append(f'<path d="{d}" stroke="{color}" stroke-width="{sw:.1f}" stroke-linecap="round" fill="none" opacity="{op:.2f}"/>')
    return "\n".join(paths)

def sketch_rect_block(x, y, w, h, fill="#ffffff", stroke_color="#1a1a1a", stroke_width=2.4, wobble=1.2):
    pts = [
        (x + random.uniform(2, 4), y),
        (x + w - random.uniform(2, 4), y),
        (x + w, y + random.uniform(2, 4)),
        (x + w, y + h - random.uniform(2, 4)),
        (x + w - random.uniform(2, 4), y + h),
        (x + random.uniform(2, 4), y + h),
        (x, y + h - random.uniform(2, 4)),
        (x, y + random.uniform(2, 4))
    ]
    j_pts = [(jitter(px, wobble*0.4), jitter(py, wobble*0.4)) for px, py in pts]
    d = f"M {j_pts[0][0]:.1f} {j_pts[0][1]:.1f} "
    for px, py in j_pts[1:]:
        d += f"L {px:.1f} {py:.1f} "
    d += "Z"
    
    res = [f'<path d="{d}" fill="{fill}" stroke="{stroke_color}" stroke-width="{stroke_width:.1f}" stroke-linejoin="round" stroke-linecap="round"/>']
    
    # Internal chisel/stone texture in ~40% of stones
    if random.random() < 0.45:
        num_marks = random.randint(1, 3)
        for _ in range(num_marks):
            mx = x + random.uniform(w * 0.15, w * 0.5)
            my = y + random.uniform(h * 0.2, h * 0.8)
            mlen = random.uniform(15, min(w * 0.5, 55))
            mang = random.uniform(-0.15, 0.15)
            ex = mx + mlen * math.cos(mang)
            ey = my + mlen * math.sin(mang)
            res.append(sketch_line(mx, my, ex, ey, strokes=1, wobble=0.8, stroke_width=1.2, color="#444444", opacity=0.35))
            
    # Ancient stone cracks in ~15% of stones
    if random.random() < 0.15 and w > 90:
        cx = x + random.uniform(w*0.3, w*0.7)
        cy = y + (0 if random.random() < 0.5 else h)
        c_len = random.uniform(14, h * 0.65)
        c_dir = 1 if cy == y else -1
        mid_cx = cx + random.uniform(-6, 6)
        end_cx = cx + random.uniform(-10, 10)
        res.append(sketch_line(cx, cy, mid_cx, cy + c_dir * c_len * 0.5, strokes=1, stroke_width=1.4, color="#222222", opacity=0.6))
        res.append(sketch_line(mid_cx, cy + c_dir * c_len * 0.5, end_cx, cy + c_dir * c_len, strokes=1, stroke_width=1.1, color="#222222", opacity=0.5))
        
    return "\n".join(res)

svg_parts = []
svg_parts.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}">')

# Generate Ashlar Stone Courses
# Course heights: between 50 and 65px
course_ys = []
cur_y = 150
while cur_y < HEIGHT:
    course_ys.append(cur_y)
    cur_y += random.randint(52, 60)
course_ys.append(HEIGHT)

# Check overlap with cutout
def overlaps_cutout(x, y, w, h):
    # Door cutout
    if not (x + w < DOOR_X1 or x > DOOR_X2 or y + h < DOOR_Y1 or y > DOOR_Y2):
        return True
    # Window cutout
    if not (x + w < WIN_X1 or x > WIN_X2 or y + h < WIN_Y1 or y > WIN_Y2):
        return True
    return False

# Arch zone exclusion: Arch extends above door from Y=530 to 693, X=850 to 1200
def in_arch_zone(x, y, w, h):
    cx = (DOOR_X1 + DOOR_X2) / 2
    cy = DOOR_Y1
    r_outer = 190
    # If block overlaps semicircle centered at (cx, cy)
    bx_mid = x + w / 2
    by_mid = y + h / 2
    if 530 <= by_mid <= 693 and 840 <= bx_mid <= 1208:
        return True
    return False

# Generate regular stone courses
for c_idx in range(len(course_ys) - 1):
    y = course_ys[c_idx]
    h = course_ys[c_idx + 1] - y - 3 # 3px mortar gap
    
    # Stagger starting X
    cur_x = -random.randint(0, 40)
    while cur_x < WIDTH:
        w = random.randint(120, 220)
        
        # Don't draw if inside cutouts or arch zone
        if not overlaps_cutout(cur_x, y, w, h) and not in_arch_zone(cur_x, y, w, h):
            # Clip bounds to [0, WIDTH]
            draw_x = max(0, cur_x)
            draw_w = min(WIDTH - draw_x, cur_x + w - draw_x)
            if draw_w > 15:
                svg_parts.append(sketch_rect_block(draw_x, y, draw_w, h, fill="#ffffff", stroke_color="#1a1a1a", stroke_width=2.4))
                
        cur_x += w + 3 # 3px mortar gap

# ----------------------------------------------------
# GRAND GOTHIC ARCH ABOVE DOORWAY (Hogwarts Grand Portal)
# ----------------------------------------------------
door_cx = (DOOR_X1 + DOOR_X2) / 2 # 1024
door_w = DOOR_X2 - DOOR_X1 # 258
r_in = door_w / 2 # 129
r_out = r_in + 55 # 184
arch_cy = DOOR_Y1 # 693

# Radiating stone voussoirs across 180 degrees (PI to 0)
num_voussoirs = 11
angles = np.linspace(math.pi, 0, num_voussoirs + 1)

for i in range(num_voussoirs):
    a1 = angles[i]
    a2 = angles[i+1]
    is_keystone = (i == num_voussoirs // 2)
    
    # Extra projection for keystone
    ro = r_out + (14 if is_keystone else 0)
    
    # Inner and outer vertices
    p1 = (door_cx + r_in * math.cos(a1), arch_cy - r_in * math.sin(a1))
    p2 = (door_cx + ro * math.cos(a1), arch_cy - ro * math.sin(a1))
    p3 = (door_cx + ro * math.cos(a2), arch_cy - ro * math.sin(a2))
    p4 = (door_cx + r_in * math.cos(a2), arch_cy - r_in * math.sin(a2))
    
    d = f"M {p1[0]:.1f} {p1[1]:.1f} L {p2[0]:.1f} {p2[1]:.1f} L {p3[0]:.1f} {p3[1]:.1f} L {p4[0]:.1f} {p4[1]:.1f} Z"
    stroke_w = 3.2 if is_keystone else 2.6
    svg_parts.append(f'<path d="{d}" fill="#ffffff" stroke="#1a1a1a" stroke-width="{stroke_w:.1f}" stroke-linejoin="round"/>')
    
    # Keystone carving (a small carved shield or medieval diamond at apex)
    if is_keystone:
        mid_x = door_cx
        mid_y = arch_cy - (r_in + ro) / 2
        svg_parts.append(sketch_line(mid_x - 8, mid_y, mid_x, mid_y - 12, strokes=1, stroke_width=2.0))
        svg_parts.append(sketch_line(mid_x, mid_y - 12, mid_x + 8, mid_y, strokes=1, stroke_width=2.0))
        svg_parts.append(sketch_line(mid_x + 8, mid_y, mid_x, mid_y + 12, strokes=1, stroke_width=2.0))
        svg_parts.append(sketch_line(mid_x, mid_y + 12, mid_x - 8, mid_y, strokes=1, stroke_width=2.0))

# Gothic hood moulding curve above the arch
hood_r = r_out + 18
hood_pts = [(door_cx + hood_r * math.cos(a), arch_cy - hood_r * math.sin(a)) for a in np.linspace(math.pi, 0, 36)]
hood_d = f"M {hood_pts[0][0]:.1f} {hood_pts[0][1]:.1f} "
for pt in hood_pts[1:]:
    hood_d += f"L {pt[0]:.1f} {pt[1]:.1f} "
svg_parts.append(f'<path d="{hood_d}" fill="none" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round"/>')

# Vertical Stone Jambs framing left and right of door
for side_x, sign in [(DOOR_X1 - 42, -1), (DOOR_X2, 1)]:
    jamb_y = DOOR_Y1
    while jamb_y < DOOR_Y2:
        jh = random.randint(65, 85)
        if jamb_y + jh > DOOR_Y2:
            jh = DOOR_Y2 - jamb_y
        svg_parts.append(sketch_rect_block(side_x if sign == 1 else side_x, jamb_y, 42, jh, fill="#ffffff", stroke_color="#1a1a1a", stroke_width=2.8))
        jamb_y += jh + 3

# ----------------------------------------------------
# GOTHIC STONE WINDOW SURROUND (Heavy lintel, sill, quoins)
# ----------------------------------------------------
# Heavy lintel above window
svg_parts.append(sketch_rect_block(WIN_X1 - 25, WIN_Y1 - 42, (WIN_X2 - WIN_X1) + 50, 40, fill="#ffffff", stroke_color="#1a1a1a", stroke_width=3.2))
# Heavy sill below window
svg_parts.append(sketch_rect_block(WIN_X1 - 32, WIN_Y2 + 2, (WIN_X2 - WIN_X1) + 64, 40, fill="#ffffff", stroke_color="#1a1a1a", stroke_width=3.2))

# Side quoins for window
for side_x, sign in [(WIN_X1 - 30, -1), (WIN_X2 + 2, 1)]:
    qy = WIN_Y1
    while qy < WIN_Y2:
        qh = random.randint(45, 60)
        qw = 28 if random.random() < 0.5 else 36
        if qy + qh > WIN_Y2:
            qh = WIN_Y2 - qy
        qx = side_x if sign == 1 else side_x + (30 - qw)
        svg_parts.append(sketch_rect_block(qx, qy, qw, qh, fill="#ffffff", stroke_color="#1a1a1a", stroke_width=2.4))
        qy += qh + 3

# ----------------------------------------------------
# CASTLE CORBEL TABLE & BATTLEMENTS (Hogwarts Ramparts at top)
# ----------------------------------------------------
# Cornice stringcourse line at Y=145
svg_parts.append(sketch_line(0, 145, WIDTH, 145, strokes=2, wobble=0.8, stroke_width=4.0))
svg_parts.append(sketch_line(0, 155, WIDTH, 155, strokes=2, wobble=0.8, stroke_width=3.0))

# Carved stone corbel brackets every ~75px along cornice
for corbel_x in range(35, WIDTH, 75):
    cx = corbel_x
    cy = 155
    corbel_d = f"M {cx-14},{cy} L {cx+14},{cy} L {cx+10},{cy+22} Q {cx},{cy+28} {cx-10},{cy+22} Z"
    svg_parts.append(f'<path d="{corbel_d}" fill="#ffffff" stroke="#1a1a1a" stroke-width="2.2" stroke-linejoin="round"/>')
    svg_parts.append(sketch_line(cx, cy+4, cx, cy+20, strokes=1, stroke_width=1.5, color="#555555"))

# Battlements: Merlons (raised) and Crenels (open gaps)
# Merlon width ~90px, crenel width ~55px
battlement_x = 0
while battlement_x < WIDTH:
    mw = random.randint(85, 110)
    cw = random.randint(45, 60)
    
    # Draw Merlon (castle tooth)
    merlon_h = random.randint(70, 85)
    my = 145 - merlon_h # rises to ~Y=65
    svg_parts.append(sketch_rect_block(battlement_x, my, mw, merlon_h, fill="#ffffff", stroke_color="#1a1a1a", stroke_width=2.8))
    
    # Cap stone on merlon
    cap_d = f"M {battlement_x - 3},{my} L {battlement_x + mw + 3},{my} L {battlement_x + mw},{my - 8} L {battlement_x},{my - 8} Z"
    svg_parts.append(f'<path d="{cap_d}" fill="#ffffff" stroke="#1a1a1a" stroke-width="2.4"/>')
    
    # Small arrow slit in some merlons (~30%)
    if random.random() < 0.35 and mw > 90:
        as_x = battlement_x + mw / 2
        as_y = my + 25
        svg_parts.append(sketch_line(as_x, as_y, as_x, as_y + 35, strokes=2, stroke_width=3.2, color="#1a1a1a"))
        svg_parts.append(sketch_line(as_x - 8, as_y + 12, as_x + 8, as_y + 12, strokes=2, stroke_width=3.2, color="#1a1a1a"))
        
    battlement_x += mw + cw

# ----------------------------------------------------
# DELICATE IVY & VINES (Climbing castle walls)
# ----------------------------------------------------
def draw_ivy_vine(start_x, start_y, length, dir_x=0.2):
    cur_x, cur_y = start_x, start_y
    for step in range(length):
        nxt_x = cur_x + random.uniform(-10, 10) + dir_x * 8
        nxt_y = cur_y - random.uniform(15, 25)
        svg_parts.append(sketch_line(cur_x, cur_y, nxt_x, nxt_y, strokes=1, stroke_width=2.0, color="#2e3828", opacity=0.85))
        
        # Leaves
        num_leaves = random.randint(1, 3)
        for _ in range(num_leaves):
            lx = nxt_x + random.uniform(-12, 12)
            ly = nxt_y + random.uniform(-10, 10)
            leaf_ang = random.uniform(0, math.pi * 2)
            leaf_sz = random.uniform(5, 9)
            ld = f"M {lx},{ly} Q {lx+leaf_sz*math.cos(leaf_ang+0.5)},{ly+leaf_sz*math.sin(leaf_ang+0.5)} {lx+leaf_sz*1.6*math.cos(leaf_ang)},{ly+leaf_sz*1.6*math.sin(leaf_ang)} Q {lx+leaf_sz*math.cos(leaf_ang-0.5)},{ly+leaf_sz*math.sin(leaf_ang-0.5)} {lx},{ly}"
            svg_parts.append(f'<path d="{ld}" fill="#e8ebe4" stroke="#2e3828" stroke-width="1.4" opacity="0.9"/>')
            
        cur_x, cur_y = nxt_x, nxt_y

# Climbing ivy on far left (behind tree) and far right
draw_ivy_vine(220, 950, 18, dir_x=0.3)
draw_ivy_vine(340, 1000, 14, dir_x=-0.2)
draw_ivy_vine(1850, 960, 20, dir_x=-0.3)
draw_ivy_vine(1950, 1000, 15, dir_x=0.1)

svg_parts.append('</svg>')

svg_filepath = "C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/hogwarts_castle_wall.svg"
with open(svg_filepath, "w", encoding="utf-8") as f:
    f.write("\n".join(svg_parts))

print("Successfully written Hogwarts Castle Wall SVG!")
