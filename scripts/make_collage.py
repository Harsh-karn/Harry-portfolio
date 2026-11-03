from PIL import Image, ImageFont, ImageDraw

W, H = 1600, 1060
collage = Image.new('RGB', (W, H), (242, 240, 236))

# 1. Canvas 1 preview (Steve Jobs quote)
c1_im = Image.new('RGB', (700, 380), (254, 254, 254))
c1_draw = ImageDraw.Draw(c1_im)
font_q = ImageFont.truetype('C:/Windows/Fonts/Inkfree.ttf', 30)
font_a = ImageFont.truetype('C:/Windows/Fonts/Inkfree.ttf', 24)
c1_draw.text((350, 150), '"The only way to do great work', font=font_q, fill=(40, 40, 40), anchor='mm')
c1_draw.text((350, 195), 'is to love what you do."', font=font_q, fill=(40, 40, 40), anchor='mm')
c1_draw.text((350, 255), '- Steve Jobs', font=font_a, fill=(80, 80, 80), anchor='mm')
c1_draw.rectangle([0, 0, 699, 379], outline=(180, 140, 90), width=18)
c1_draw.rectangle([18, 18, 681, 361], outline=(140, 105, 65), width=4)

# 2. Canvas 2 preview (Hogwarts in Frame)
c2_im = Image.open('C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/hogwarts_in_frame_sketch.jpg').resize((1480, 500))

# 3. Canvas 3 preview (Edgar Degas art quote)
c3_im = Image.new('RGB', (700, 380), (254, 254, 254))
c3_draw = ImageDraw.Draw(c3_im)
c3_draw.text((350, 150), '"Art is not what you see,', font=font_q, fill=(131, 60, 70), anchor='mm')
c3_draw.text((350, 195), 'but what you make others see."', font=font_q, fill=(131, 60, 70), anchor='mm')
c3_draw.text((350, 255), '- Edgar Degas', font=font_a, fill=(100, 50, 60), anchor='mm')
c3_draw.rectangle([0, 0, 699, 379], outline=(180, 140, 90), width=18)
c3_draw.rectangle([18, 18, 681, 361], outline=(140, 105, 65), width=4)

# Paste into collage
collage.paste(c2_im, (60, 40))
collage.paste(c1_im, (60, 600))
collage.paste(c3_im, (840, 600))

collage.save('C:/Users/harsh/.gemini/antigravity/brain/3a0cab72-107c-4d8c-83a5-2c21cc9d131e/three_canvases_preview.jpg', quality=92)
print('Three canvases collage saved!')

