import math
import random
import os
import numpy as np

random.seed(42)

WIDTH = 2048
HEIGHT = 1024

# Exact Cutouts (Must be 100% transparent)
DOOR_X1, DOOR_X2 = 895, 1153
DOOR_Y1, DOOR_Y2 = 693, 1024

WIN_X1, WIN_X2 = 1254, 1432
WIN_Y1, WIN_Y2 = 693, 872

DOOR_CX = (DOOR_X1 + DOOR_X2) / 2 # 1024
WIN_CX = (WIN_X1 + WIN_X2) / 2 # 1343

# Architectural bounds
# Door Jambs
JAMB_L_X1, JAMB_L_X2 = 852, DOOR_X1
JAMB_R_X1, JAMB_R_X2 = DOOR_X2, 1196

# Door Lintel
LINTEL_Y1, LINTEL_Y2 = 655, DOOR_Y1
LINTEL_X1, LINTEL_X2 = 848, 1200

# Arch parameters
ARCH_CY = LINTEL_Y1 # 655
ARCH_R_IN = 136
ARCH_R_OUT = 180
HOOD_R = 192

# Window framing
WIN_LINTEL_Y1, WIN_LINTEL_Y2 = 655, WIN_Y1
WIN_LINTEL_X1, WIN_LINTEL_X2 = 1238, 1448

WIN_SILL_Y1, WIN_SILL_Y2 = WIN_Y2, WIN_Y2 + 36
WIN_SILL_X1, WIN_SILL_X2 = 1234, 1452

WIN_JAMB_L_X1, WIN_JAMB_L_X2 = 1222, WIN_X1
WIN_JAMB_R_X1, WIN_JAMB_R_X2 = WIN_X2, 1464

PARAPET_Y = 135

def jitter(val, amt=1.0):
    return val + random.uniform(-amt, amt)

def sketch_line(x1, y1, x2, y2, strokes=2, wobble=1.0, stroke_width=2.2, color="#1c1b18", opacity=0.9):
    paths = []
    for s in range(strokes):
        mx = (x1 + x2) / 2 + random.uniform(-wobble, wobble)
        my = (y1 + y2) / 2 + random.uniform(-wobble, wobble)
        sw = stroke_width + random.uniform(-0.25, 0.25)
        op = opacity * (0.8 if s > 0 else 1.0)
        p1x, p1y = jitter(x1, wobble*0.3), jitter(y1, wobble*0.3)
        p2x, p2y = jitter(x2, wobble*0.3), jitter(y2, wobble*0.3)
        d = f"M {p1x:.1f} {p1y:.1f} Q {mx:.1f} {my:.1f} {p2x:.1f} {p2y:.1f}"
        paths.append(f'<path d="{d}" stroke="{color}" stroke-width="{sw:.1f}" stroke-linecap="round" fill="none" opacity="{op:.2f}"/>')
    return "\n".join(paths)

def sketch_polygon(pts, fill="#ffffff", stroke_color="#1c1b18", stroke_width=2.2, wobble=0.8):
    if len(pts) < 3:
        return ""
    j_pts = [(jitter(px, wobble*0.3), jitter(py, wobble*0.3)) for px, py in pts]
    d = f"M {j_pts[0][0]:.1f} {j_pts[0][1]:.1f} "
    for px, py in j_pts[1:]:
        d += f"L {px:.1f} {py:.1f} "
    d += "Z"
    
    res = [f'<path d="{d}" fill="{fill}" stroke="{stroke_color}" stroke-width="{stroke_width:.1f}" stroke-linejoin="round" stroke-linecap="round"/>']
    
    # Internal chisel/stone hatch marks in ~40% of stones
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    w = max_x - min_x
    h = max_y - min_y
    
    if random.random() < 0.38 and w > 35:
        num_marks = random.randint(1, 3)
        for _ in range(num_marks):
            mx = min_x + random.uniform(w * 0.2, w * 0.6)
            my = min_y + random.uniform(h * 0.2, h * 0.8)
            mlen = random.uniform(12, min(w * 0.45, 45))
            mang = random.uniform(-0.12, 0.12)
            ex = mx + mlen * math.cos(mang)
            ey = my + mlen * math.sin(mang)
            res.append(sketch_line(mx, my, ex, ey, strokes=1, wobble=0.6, stroke_width=1.1, color="#48443e", opacity=0.32))
            
    # Ancient stone cracks in ~12% of stones
    if random.random() < 0.12 and w > 60:
        cx = min_x + random.uniform(w*0.3, w*0.7)
        cy = min_y if random.random() < 0.5 else max_y
        c_dir = 1 if cy == min_y else -1
        c_len = random.uniform(10, h * 0.6)
        mid_cx = cx + random.uniform(-5, 5)
        end_cx = cx + random.uniform(-8, 8)
        res.append(sketch_line(cx, cy, mid_cx, cy + c_dir * c_len * 0.5, strokes=1, stroke_width=1.3, color="#252320", opacity=0.55))
        res.append(sketch_line(mid_cx, cy + c_dir * c_len * 0.5, end_cx, cy + c_dir * c_len, strokes=1, stroke_width=1.0, color="#252320", opacity=0.45))
        
    return "\n".join(res)

def sketch_rect_block(x, y, w, h, fill="#ffffff", stroke_color="#1c1b18", stroke_width=2.2, wobble=0.8):
    if w <= 3 or h <= 3:
        return ""
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
    return sketch_polygon(pts, fill=fill, stroke_color=stroke_color, stroke_width=stroke_width, wobble=wobble)

svg_parts = []
svg_parts.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}">')

# Generate Course Ys from PARAPET_Y down to HEIGHT
course_ys = []
cur_y = PARAPET_Y
while cur_y < HEIGHT:
    course_ys.append(cur_y)
    # Average height 36px (Hogwarts ashlar stone scale)
    cur_y += random.randint(34, 38)
course_ys.append(HEIGHT)

# Helper function to get valid intervals in a course [y1, y2]
# Excludes door, window, jambs, lintels, and arch outer boundary
def get_open_intervals(y1, y2):
    ymid = (y1 + y2) / 2
    # Start with full width [0, WIDTH]
    intervals = [(0.0, float(WIDTH))]
    
    def subtract(interval_list, sub_x1, sub_x2):
        new_list = []
        for ix1, ix2 in interval_list:
            if sub_x2 <= ix1 or sub_x1 >= ix2:
                new_list.append((ix1, ix2))
            else:
                if ix1 < sub_x1:
                    new_list.append((ix1, sub_x1))
                if sub_x2 < ix2:
                    new_list.append((sub_x2, ix2))
        return new_list

    # 1. Door opening + jambs
    if y2 > DOOR_Y1:
        # Below lintel
        intervals = subtract(intervals, JAMB_L_X1, JAMB_R_X2)
        
    # 2. Door lintel
    if y1 < LINTEL_Y2 and y2 > LINTEL_Y1:
        intervals = subtract(intervals, LINTEL_X1, LINTEL_X2)
        
    # 3. Window opening + jambs + sill + lintel
    if y2 > WIN_SILL_Y1 and y1 < WIN_SILL_Y2:
        intervals = subtract(intervals, WIN_SILL_X1, WIN_SILL_X2)
    elif y2 > WIN_LINTEL_Y1 and y1 < WIN_LINTEL_Y2:
        intervals = subtract(intervals, WIN_LINTEL_X1, WIN_LINTEL_X2)
    elif y2 > WIN_Y1 and y1 < WIN_Y2:
        intervals = subtract(intervals, WIN_JAMB_L_X1, WIN_JAMB_R_X2)
        
    # 4. Arch curve exclusion
    # For any Y between (ARCH_CY - HOOD_R) and ARCH_CY
    if y1 < ARCH_CY and y2 > (ARCH_CY - HOOD_R):
        # Calculate arch outer radius at ymid
        dy = ARCH_CY - ymid
        if 0 <= dy <= HOOD_R:
            dx = math.sqrt(max(0, HOOD_R**2 - dy**2))
            arch_left = DOOR_CX - dx - 4
            arch_right = DOOR_CX + dx + 4
            intervals = subtract(intervals, arch_left, arch_right)

    return intervals

# Render stone blocks in courses
mortar_gap = 2.5
for c_idx in range(len(course_ys) - 1):
    y = course_ys[c_idx]
    h = (course_ys[c_idx + 1] - y) - mortar_gap
    
    valid_intervals = get_open_intervals(y, y + h)
    
    for (start_x, end_x) in valid_intervals:
        span_w = end_x - start_x
        if span_w < 12:
            continue
            
        # Target stone width 80 to 140px
        # Find integer number of blocks
        num_blocks = max(1, round(span_w / random.uniform(95, 125)))
        block_w_base = span_w / num_blocks
        
        cur_bx = start_x
        for b_idx in range(num_blocks):
            if b_idx == num_blocks - 1:
                bw = end_x - cur_bx - mortar_gap
            else:
                bw = block_w_base + random.uniform(-10, 10)
                bw = min(bw, end_x - cur_bx - 15)
                
            if bw > 8:
                svg_parts.append(sketch_rect_block(cur_bx, y, bw, h, fill="#ffffff", stroke_color="#1c1b18", stroke_width=2.0))
            cur_bx += bw + mortar_gap

# -------------------------------------------------------------------
# GRAND HOGWARTS ENTRANCE PORTAL
# -------------------------------------------------------------------

# 1. Door Quoin Jambs (Left & Right)
jamb_course_h = 42
for side, j_x1, j_x2 in [("left", JAMB_L_X1, JAMB_L_X2), ("right", JAMB_R_X1, JAMB_R_X2)]:
    jy = DOOR_Y1
    step = 0
    while jy < DOOR_Y2:
        jh = min(jamb_course_h + random.uniform(-4, 4), DOOR_Y2 - jy - mortar_gap)
        jw = j_x2 - j_x1
        # Alternate quoin indent
        if step % 2 == 1:
            if side == "left":
                qx = j_x1 + 8
                qw = jw - 8
            else:
                qx = j_x1
                qw = jw - 8
        else:
            qx = j_x1
            qw = jw
            
        svg_parts.append(sketch_rect_block(qx, jy, qw, jh, fill="#ffffff", stroke_color="#1c1b18", stroke_width=2.5))
        jy += jh + mortar_gap
        step += 1

# 2. Heavy Carved Stone Lintel
lintel_w = LINTEL_X2 - LINTEL_X1
lintel_h = LINTEL_Y2 - LINTEL_Y1
svg_parts.append(sketch_rect_block(LINTEL_X1, LINTEL_Y1, lintel_w, lintel_h, fill="#ffffff", stroke_color="#1c1b18", stroke_width=3.2))
# Lintel horizontal chamfer line
svg_parts.append(sketch_line(LINTEL_X1 + 10, LINTEL_Y1 + 10, LINTEL_X2 - 10, LINTEL_Y1 + 10, strokes=1, stroke_width=1.5, color="#555555"))

# 3. Gothic Semicircular Relieving Arch & Tympanum
# Tympanum Backing Plate
tymp_pts = [(DOOR_CX + ARCH_R_IN * math.cos(a), ARCH_CY - ARCH_R_IN * math.sin(a)) for a in np.linspace(math.pi, 0, 36)]
tymp_d = f"M {LINTEL_X1 + 12},{LINTEL_Y1} "
for pt in tymp_pts:
    tymp_d += f"L {pt[0]:.1f} {pt[1]:.1f} "
tymp_d += f"L {LINTEL_X2 - 12},{LINTEL_Y1} Z"
svg_parts.append(f'<path d="{tymp_d}" fill="#ffffff" stroke="#1c1b18" stroke-width="2.6" stroke-linejoin="round"/>')

# Inner Gothic Arch Blind Arcading inside Tympanum
inner_r = ARCH_R_IN - 28
arc_pts = [(DOOR_CX + inner_r * math.cos(a), ARCH_CY - inner_r * math.sin(a)) for a in np.linspace(math.pi, 0, 30)]
arc_d = f"M {arc_pts[0][0]:.1f} {arc_pts[0][1]:.1f} "
for pt in arc_pts[1:]:
    arc_d += f"L {pt[0]:.1f} {pt[1]:.1f} "
svg_parts.append(f'<path d="{arc_d}" fill="none" stroke="#1c1b18" stroke-width="2.2" stroke-linecap="round"/>')

# Carved Trefoil / Fleur-de-lis Crest in Tympanum Center
tf_cx, tf_cy = DOOR_CX, ARCH_CY - 58
svg_parts.append(f'<circle cx="{tf_cx}" cy="{tf_cy - 14}" r="11" fill="#ffffff" stroke="#1c1b18" stroke-width="2.0"/>')
svg_parts.append(f'<circle cx="{tf_cx - 12}" cy="{tf_cy}" r="11" fill="#ffffff" stroke="#1c1b18" stroke-width="2.0"/>')
svg_parts.append(f'<circle cx="{tf_cx + 12}" cy="{tf_cy}" r="11" fill="#ffffff" stroke="#1c1b18" stroke-width="2.0"/>')
svg_parts.append(f'<circle cx="{tf_cx}" cy="{tf_cy - 2}" r="5" fill="#ffffff" stroke="#1c1b18" stroke-width="1.8"/>')
svg_parts.append(sketch_line(tf_cx, tf_cy + 12, tf_cx, tf_cy + 35, strokes=2, stroke_width=2.0))

# 4. Radiating Ashlar Voussoirs (Arch Stones)
num_voussoirs = 13
angles = np.linspace(math.pi, 0, num_voussoirs + 1)

for i in range(num_voussoirs):
    a1 = angles[i]
    a2 = angles[i+1]
    is_keystone = (i == num_voussoirs // 2)
    ro = ARCH_R_OUT + (14 if is_keystone else 0)
    
    p1 = (DOOR_CX + ARCH_R_IN * math.cos(a1), ARCH_CY - ARCH_R_IN * math.sin(a1))
    p2 = (DOOR_CX + ro * math.cos(a1), ARCH_CY - ro * math.sin(a1))
    p3 = (DOOR_CX + ro * math.cos(a2), ARCH_CY - ro * math.sin(a2))
    p4 = (DOOR_CX + ARCH_R_IN * math.cos(a2), ARCH_CY - ARCH_R_IN * math.sin(a2))
    
    v_pts = [p1, p2, p3, p4]
    stroke_w = 3.0 if is_keystone else 2.4
    svg_parts.append(sketch_polygon(v_pts, fill="#ffffff", stroke_color="#1c1b18", stroke_width=stroke_w))
    
    if is_keystone:
        mid_x = DOOR_CX
        mid_y = ARCH_CY - (ARCH_R_IN + ro) / 2
        # Carved crest diamond on keystone
        svg_parts.append(sketch_line(mid_x - 7, mid_y, mid_x, mid_y - 11, strokes=1, stroke_width=2.0))
        svg_parts.append(sketch_line(mid_x, mid_y - 11, mid_x + 7, mid_y, strokes=1, stroke_width=2.0))
        svg_parts.append(sketch_line(mid_x + 7, mid_y, mid_x, mid_y + 11, strokes=1, stroke_width=2.0))
        svg_parts.append(sketch_line(mid_x, mid_y + 11, mid_x - 7, mid_y, strokes=1, stroke_width=2.0))

# Gothic Hood Moulding Curve
hood_pts = [(DOOR_CX + HOOD_R * math.cos(a), ARCH_CY - HOOD_R * math.sin(a)) for a in np.linspace(math.pi, 0, 40)]
hood_d = f"M {hood_pts[0][0]:.1f} {hood_pts[0][1]:.1f} "
for pt in hood_pts[1:]:
    hood_d += f"L {pt[0]:.1f} {pt[1]:.1f} "
svg_parts.append(f'<path d="{hood_d}" fill="none" stroke="#1c1b18" stroke-width="3.5" stroke-linecap="round"/>')

# Carved Hood Stops at Arch Base
for side_x in [DOOR_CX - HOOD_R, DOOR_CX + HOOD_R]:
    svg_parts.append(f'<circle cx="{side_x}" cy="{ARCH_CY}" r="7" fill="#ffffff" stroke="#1c1b18" stroke-width="2.2"/>')

# -------------------------------------------------------------------
# GOTHIC STONE WINDOW SURROUND
# -------------------------------------------------------------------
# Window Lintel
win_lintel_w = WIN_LINTEL_X2 - WIN_LINTEL_X1
win_lintel_h = WIN_LINTEL_Y2 - WIN_LINTEL_Y1
svg_parts.append(sketch_rect_block(WIN_LINTEL_X1, WIN_LINTEL_Y1, win_lintel_w, win_lintel_h, fill="#ffffff", stroke_color="#1c1b18", stroke_width=3.0))

# Window Sill (Deep projecting stone)
win_sill_w = WIN_SILL_X2 - WIN_SILL_X1
win_sill_h = WIN_SILL_Y2 - WIN_SILL_Y1
svg_parts.append(sketch_rect_block(WIN_SILL_X1, WIN_SILL_Y1, win_sill_w, win_sill_h, fill="#ffffff", stroke_color="#1c1b18", stroke_width=3.0))
# Sill drip groove
svg_parts.append(sketch_line(WIN_SILL_X1 + 5, WIN_SILL_Y1 + 10, WIN_SILL_X2 - 5, WIN_SILL_Y1 + 10, strokes=1, stroke_width=1.6, color="#444444"))

# Window Jamb Quoins (Left & Right)
for side, wj_x1, wj_x2 in [("left", WIN_JAMB_L_X1, WIN_JAMB_L_X2), ("right", WIN_JAMB_R_X1, WIN_JAMB_R_X2)]:
    wy = WIN_Y1
    step = 0
    w_jamb_h = 35
    while wy < WIN_Y2:
        wh = min(w_jamb_h + random.uniform(-3, 3), WIN_Y2 - wy - mortar_gap)
        ww = wj_x2 - wj_x1
        if step % 2 == 1:
            if side == "left":
                qx = wj_x1 + 6
                qw = ww - 6
            else:
                qx = wj_x1
                qw = ww - 6
        else:
            qx = wj_x1
            qw = ww
        svg_parts.append(sketch_rect_block(qx, wy, qw, wh, fill="#ffffff", stroke_color="#1c1b18", stroke_width=2.4))
        wy += wh + mortar_gap
        step += 1

# Stone Corbel Bracket Under Candle Position (X ≈ 1343, Y ≈ 620)
candle_x = WIN_CX
candle_y = WIN_LINTEL_Y1 - 2
svg_parts.append(f'<path d="M {candle_x - 14},{candle_y} L {candle_x + 14},{candle_y} L {candle_x + 9},{candle_y + 20} Q {candle_x},{candle_y + 25} {candle_x - 9},{candle_y + 20} Z" fill="#ffffff" stroke="#1c1b18" stroke-width="2.4" stroke-linejoin="round"/>')

# -------------------------------------------------------------------
# CASTLE PARAPET CORNICE & BATTLEMENTS (Hogwarts Ramparts)
# -------------------------------------------------------------------
# Cornice Moulding Lines
svg_parts.append(sketch_line(0, PARAPET_Y - 4, WIDTH, PARAPET_Y - 4, strokes=2, wobble=0.6, stroke_width=3.5))
svg_parts.append(sketch_line(0, PARAPET_Y + 4, WIDTH, PARAPET_Y + 4, strokes=2, wobble=0.6, stroke_width=2.5))

# Carved Stone Corbel Brackets along parapet
for cb_x in range(30, WIDTH, 58):
    cy = PARAPET_Y + 4
    cb_d = f"M {cb_x - 11},{cy} L {cb_x + 11},{cy} L {cb_x + 8},{cy + 18} Q {cb_x},{cy + 22} {cb_x - 8},{cy + 18} Z"
    svg_parts.append(f'<path d="{cb_d}" fill="#ffffff" stroke="#1c1b18" stroke-width="2.0" stroke-linejoin="round"/>')
    svg_parts.append(sketch_line(cb_x, cy + 3, cb_x, cy + 15, strokes=1, stroke_width=1.3, color="#555555"))

# Battlements (Merlons and Crenels)
battlement_x = 0
while battlement_x < WIDTH:
    mw = random.randint(85, 105) # Merlon width
    cw = random.randint(45, 55)  # Crenel (gap) width
    
    mh = random.randint(68, 78)  # Merlon height
    my = PARAPET_Y - 4 - mh
    
    # Merlon body
    svg_parts.append(sketch_rect_block(battlement_x, my, mw, mh, fill="#ffffff", stroke_color="#1c1b18", stroke_width=2.6))
    
    # Merlon coping stone cap (sloped weathered top)
    cap_d = f"M {battlement_x - 4},{my} L {battlement_x + mw + 4},{my} L {battlement_x + mw},{my - 9} L {battlement_x},{my - 9} Z"
    svg_parts.append(f'<path d="{cap_d}" fill="#ffffff" stroke="#1c1b18" stroke-width="2.2" stroke-linejoin="round"/>')
    
    # Medieval Arrow Slit (Cruciform cross loop) in ~45% of merlons
    if random.random() < 0.45 and mw > 88:
        as_x = battlement_x + mw / 2
        as_y = my + 20
        # Vertical slit
        svg_parts.append(sketch_line(as_x, as_y, as_x, as_y + 30, strokes=2, stroke_width=3.2, color="#1c1b18"))
        # Horizontal cross slit
        svg_parts.append(sketch_line(as_x - 7, as_y + 10, as_x + 7, as_y + 10, strokes=2, stroke_width=3.2, color="#1c1b18"))
        # Round terminal holes
        svg_parts.append(f'<circle cx="{as_x}" cy="{as_y}" r="2.5" fill="#1c1b18"/>')
        svg_parts.append(f'<circle cx="{as_x}" cy="{as_y + 30}" r="2.5" fill="#1c1b18"/>')
        svg_parts.append(f'<circle cx="{as_x - 7}" cy="{as_y + 10}" r="2" fill="#1c1b18"/>')
        svg_parts.append(f'<circle cx="{as_x + 7}" cy="{as_y + 10}" r="2" fill="#1c1b18"/>')
        
    battlement_x += mw + cw

# -------------------------------------------------------------------
# DELICATE CASTLE IVY VINES (Climbing castle walls)
# -------------------------------------------------------------------
def draw_ivy(start_x, start_y, steps, sway=0.2):
    cx, cy = start_x, start_y
    for s in range(steps):
        nx = cx + random.uniform(-9, 9) + sway * 7
        ny = cy - random.uniform(16, 24)
        svg_parts.append(sketch_line(cx, cy, nx, ny, strokes=1, stroke_width=1.8, color="#2c3627", opacity=0.85))
        
        # 1-3 leaves per node
        num_leaves = random.randint(1, 3)
        for _ in range(num_leaves):
            lx = nx + random.uniform(-11, 11)
            ly = ny + random.uniform(-9, 9)
            ang = random.uniform(0, math.pi * 2)
            sz = random.uniform(4.5, 8.5)
            # Trefoil/heart ivy leaf shape
            ld = f"M {lx},{ly} Q {lx+sz*math.cos(ang+0.6)},{ly+sz*math.sin(ang+0.6)} {lx+sz*1.5*math.cos(ang)},{ly+sz*1.5*math.sin(ang)} Q {lx+sz*math.cos(ang-0.6)},{ly+sz*math.sin(ang-0.6)} {lx},{ly}"
            svg_parts.append(f'<path d="{ld}" fill="#e5eae1" stroke="#2c3627" stroke-width="1.3" opacity="0.88"/>')
            
        cx, cy = nx, ny

# Climbing vines on far left and right edges
draw_ivy(180, 980, 19, sway=0.25)
draw_ivy(280, 1010, 15, sway=-0.2)
draw_ivy(1840, 970, 20, sway=-0.25)
draw_ivy(1940, 1010, 16, sway=0.15)

# Small ivy branch above door arch
draw_ivy(780, 560, 8, sway=0.3)
draw_ivy(1220, 580, 7, sway=-0.25)

svg_parts.append('</svg>')

out_path = "C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/hogwarts_castle_wall_v3.svg"
with open(out_path, "w", encoding="utf-8") as f:
    f.write("\n".join(svg_parts))

print("Successfully generated Hogwarts Castle Wall v3 SVG!")

