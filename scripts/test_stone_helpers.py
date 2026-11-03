import math
import random
import os
import subprocess
import numpy as np

random.seed(101)

WIDTH = 2048
HEIGHT = 1024

# Cutout definitions matching original wall_bricks_2.webp
DOOR_X1, DOOR_X2 = 895, 1153
DOOR_Y1, DOOR_Y2 = 693, 1024

WIN_X1, WIN_X2 = 1254, 1432
WIN_Y1, WIN_Y2 = 693, 872

def jitter(val, amount=1.2):
    return val + random.uniform(-amount, amount)

def sketch_line(x1, y1, x2, y2, strokes=2, wobble=1.2, stroke_width=2.5, color="#1e1e1e", opacity=0.9):
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

def sketch_rect_block(x, y, w, h, fill="#ffffff", stroke_color="#1e1e1e", stroke_width=2.4, wobble=1.2):
    # Hand-drawn rounded rectangle for stone block
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
    
    # SVG polygon/path with jitter
    j_pts = [(jitter(px, wobble*0.4), jitter(py, wobble*0.4)) for px, py in pts]
    d = f"M {j_pts[0][0]:.1f} {j_pts[0][1]:.1f} "
    for px, py in j_pts[1:]:
        d += f"L {px:.1f} {py:.1f} "
    d += "Z"
    
    res = [f'<path d="{d}" fill="{fill}" stroke="{stroke_color}" stroke-width="{stroke_width:.1f}" stroke-linejoin="round" stroke-linecap="round"/>']
    
    # Internal stone chisel marks / texture (in ~40% of stones)
    if random.random() < 0.45:
        # Subtle horizontal or angled chisel strokes
        num_marks = random.randint(1, 3)
        for _ in range(num_marks):
            mx = x + random.uniform(w * 0.15, w * 0.5)
            my = y + random.uniform(h * 0.2, h * 0.8)
            mlen = random.uniform(15, min(w * 0.5, 45))
            mang = random.uniform(-0.15, 0.15)
            ex = mx + mlen * math.cos(mang)
            ey = my + mlen * math.sin(mang)
            res.append(sketch_line(mx, my, ex, ey, strokes=1, wobble=0.8, stroke_width=1.2, color="#444444", opacity=0.35))
            
    # Occasional ancient stone crack (~15% of stones)
    if random.random() < 0.15 and w > 80:
        cx = x + random.uniform(w*0.3, w*0.7)
        cy = y + (0 if random.random() < 0.5 else h)
        c_len = random.uniform(12, h * 0.6)
        c_dir = 1 if cy == y else -1
        mid_cx = cx + random.uniform(-6, 6)
        end_cx = cx + random.uniform(-10, 10)
        res.append(sketch_line(cx, cy, mid_cx, cy + c_dir * c_len * 0.5, strokes=1, stroke_width=1.4, color="#222222", opacity=0.6))
        res.append(sketch_line(mid_cx, cy + c_dir * c_len * 0.5, end_cx, cy + c_dir * c_len, strokes=1, stroke_width=1.1, color="#222222", opacity=0.5))
        
    return "\n".join(res)

print("Helper functions ready")

