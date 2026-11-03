from PIL import Image
import numpy as np

full_char = Image.open("C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/boy_avatar_full_alpha.png")
w, h = full_char.size
arr = np.array(full_char)

# Hand wrist pivot:
# Look at wrist cuff: around x=725, y=240
wrist_cx, wrist_cy = 725, 240

# Isolate hand above cuff (y < 240 or connecting to wrist)
hand_mask = np.zeros((h, w), dtype=bool)
for y in range(h):
    for x in range(w):
        if y < 245 and x > 680:
            hand_mask[y, x] = True

hand_arr = np.zeros_like(arr)
hand_arr[hand_mask] = arr[hand_mask]
hand_img = Image.fromarray(hand_arr)

# Base image keeps everything up to the cuff
base_arr = arr.copy()
base_arr[hand_mask] = [0, 0, 0, 0]

# Keep cuff in base image
# Cuff is around y=225 to 255, x=700 to 740
for y in range(220, 260):
    for x in range(695, 745):
        if arr[y, x, 3] > 100:
            base_arr[y, x] = arr[y, x]

base_img = Image.fromarray(base_arr)

# Rotate hand around wrist: from -14 to +14 degrees in 9 frames
angles = np.linspace(-14, 14, 9)
for idx, angle in enumerate(angles):
    rot_hand = hand_img.rotate(angle, resample=Image.BICUBIC, center=(wrist_cx, wrist_cy))
    frame = Image.alpha_composite(base_img, rot_hand)
    frame.save(f"C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/wrist_frame_{idx+1}.png")

print("Generated wrist wave frames")

