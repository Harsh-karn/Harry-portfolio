from PIL import Image
import numpy as np

img = Image.open("C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/current_avatar_1.png").convert("RGBA")
arr = np.array(img)

# Let's find vertical segments of the character:
# y range of character:
rows = np.where(arr[:, :, 3] > 100)[0]
cols = np.where(arr[:, :, 3] > 100)[1]

print(f"Total character Y range: {rows.min()} to {rows.max()}")
print(f"Total character X range: {cols.min()} to {cols.max()}")

# Head top to chin:
# Head top is rows.min() ≈ 0
# Where is the chin? Where is the neck? Where is the necklace?
# Let's inspect the necklace region:
# Look at necklace Y range in image

