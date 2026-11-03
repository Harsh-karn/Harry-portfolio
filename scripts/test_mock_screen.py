from PIL import Image, ImageDraw
import numpy as np

def render_mock_screen(screen_w, screen_h, filename):
    img = Image.new("RGBA", (screen_w, screen_h), (247, 242, 234, 255))
    draw = ImageDraw.Draw(img)
    
    # Paper tear center line (jagged down middle)
    mid_x = screen_w / 2
    pts = [(mid_x, 0)]
    for y in range(20, screen_h, 30):
        pts.append((mid_x + np.random.uniform(-15, 15), y))
    pts.append((mid_x, screen_h))
    draw.line(pts, fill=(30, 25, 20, 180), width=1)
    
    # 26 footsteps
    N = 26
    for i in range(N):
        pct = (i / (N - 1)) * 0.92 + 0.04
        x = pct * screen_w
        is_left = (i % 2 == 0)
        lane = -9 if is_left else 9
        meander = np.sin((i / (N - 1)) * np.pi * 2) * 12
        y = screen_h / 2 + lane + meander
        
        # Draw sole and heel pointing right
        sole_x = x + 4
        sole_y = y + (-1 if is_left else 1)
        draw.ellipse([sole_x - 7, sole_y - 4, sole_x + 7, sole_y + 4], fill=(35, 28, 22, 230))
        heel_x = x - 8
        heel_y = y
        draw.ellipse([heel_x - 3.5, heel_y - 3, heel_x + 3.5, heel_y + 3], fill=(35, 28, 22, 230))
        
    img.save(filename)
    print(f"Rendered mock: {filename}")

render_mock_screen(1200, 700, "C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/mock_desktop.png")
render_mock_screen(400, 800, "C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/mock_mobile.png")

