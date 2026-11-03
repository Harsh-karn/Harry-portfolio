from PIL import Image
import numpy as np

img = Image.open("C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/current_avatar_1.png").convert("RGBA")
arr = np.array(img)

# Crop head region: y from 0 to 350, x from 380 to 620
head = img.crop((380, 0, 620, 350))
head.save("C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/crop_head_1.png")

# Crop torso region: y from 200 to 600, x from 350 to 900
torso = img.crop((350, 200, 900, 600))
torso.save("C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/crop_torso_1.png")

print("Cropped head and torso")

