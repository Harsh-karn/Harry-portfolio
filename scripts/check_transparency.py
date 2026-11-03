from PIL import Image
import numpy as np

for name in ['current_avatar_1.png', 'current_avatar_window.png', 'backup_avatar_sketch.png']:
    im = Image.open(f'C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/{name}')
    arr = np.array(im)
    print(f"{name}: mode={im.mode}, size={im.size}, alpha min={arr[:,:,3].min()}, max={arr[:,:,3].max()}")
    # Check if the body fill is white (255,255,255) with alpha=255 and background is alpha=0
    bg_mask = arr[:, :, 3] == 0
    body_white = (arr[:, :, 0] > 240) & (arr[:, :, 1] > 240) & (arr[:, :, 2] > 240) & (arr[:, :, 3] > 200)
    lines_black = (arr[:, :, 0] < 50) & (arr[:, :, 1] < 50) & (arr[:, :, 2] < 50) & (arr[:, :, 3] > 200)
    print(f"  Transparent pixels: {np.sum(bg_mask)}")
    print(f"  White fill pixels: {np.sum(body_white)}")
    print(f"  Black line pixels: {np.sum(lines_black)}")

