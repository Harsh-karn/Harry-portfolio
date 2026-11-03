from PIL import Image, ImageDraw
import numpy as np

# We can create a high-res silhouette of the Marauder's Map foot prints (sole + heel)
# Let's verify by plotting both left and right shoe prints

w, h = 600, 300
img = Image.new("RGBA", (w, h), (245, 240, 230, 255))
draw = ImageDraw.Draw(img)

# Let's test Bézier or polygon points for Left Foot & Right Foot (pointing right)
# Sole: x from 12 to 34, y from -8 to 8
# Heel: x from -2 to 8, y from -6 to 6
def draw_footstep(draw, cx, cy, angle_deg, is_left=True, scale=1.0, color=(25, 22, 20, 255)):
    # Base local coordinates for right-facing left foot
    # Sole
    sole_pts = [
        (12, -7), (18, -8), (26, -7), (32, -4), (34, 0), (32, 4),
        (26, 7), (20, 6), (15, 3), (12, 1), (11, -3)
    ]
    if not is_left:
        # Mirror Y for right foot
        sole_pts = [(x, -y) for x, y in sole_pts]
        
    # Heel
    heel_pts = [
        (-4, -5), (3, -5.5), (6, -4), (7, 0), (6, 4),
        (3, 5.5), (-4, 5), (-6, 3), (-7, 0), (-6, -3)
    ]
    if not is_left:
        heel_pts = [(x, -y) for x, y in heel_pts]
        
    rad = np.radians(angle_deg)
    cos_a, sin_a = np.cos(rad), np.sin(rad)
    
    def transform(pts):
        res = []
        for x, y in pts:
            tx = (x * cos_a - y * sin_a) * scale + cx
            ty = (x * sin_a + y * cos_a) * scale + cy
            res.append((tx, ty))
        return res

    draw.polygon(transform(sole_pts), fill=color)
    draw.polygon(transform(heel_pts), fill=color)

# Test drawing walking trail from left to right
for i in range(12):
    progress = i / 11.0
    x = 40 + progress * 500
    is_left = (i % 2 == 0)
    # Natural walking lane offset: left foot slightly up (-10), right foot slightly down (+10)
    lane_y = -9 if is_left else 9
    # Slight gentle wandering wave
    wave_y = np.sin(progress * np.pi * 2) * 15
    y = 150 + lane_y + wave_y
    
    # Slight toe-out angle
    angle = 5 if is_left else -5
    draw_footstep(draw, x, y, angle, is_left=is_left, scale=1.2)

preview_path = "C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/footprints_test.png"
img.save(preview_path)
print(f"Saved preview: {preview_path}")

