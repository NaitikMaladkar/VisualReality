#!/usr/bin/env python3
"""Remove the white background from the uploaded wizard image (flood-fill from
borders so interior whites — beard, robes highlights — survive), feather the
edge, trim, resize and save to public/wizard.png."""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

SRC = "/home/z/my-project/upload/Gemini_Generated_Image_1tkhea1tkhea1tkh.png"
DST = "/home/z/my-project/public/wizard.png"

img = Image.open(SRC).convert("RGBA")
arr = np.array(img)
h, w = arr.shape[:2]
print(f"source: {w}x{h}")

rgb = arr[..., :3].astype(np.int16)
# near-white AND low chroma = background white (protects gray beard, pale robes)
mn = rgb.min(axis=2)
mx = rgb.max(axis=2)
whiteish = (mn >= 238) & ((mx - mn) <= 14)

# connected components; only whiteish regions touching the border go transparent
labels, n = ndimage.label(whiteish)
border_labels = set(np.unique(np.concatenate([
    labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]
])))
border_labels.discard(0)
bg = np.isin(labels, list(border_labels)) if border_labels else np.zeros_like(whiteish)
print(f"components={n}, bg components={len(border_labels)}, bg px={int(bg.sum())} ({bg.mean()*100:.1f}%)")

alpha = np.where(bg, 0, 255).astype(np.uint8)
a_img = Image.fromarray(alpha, "L")
# erode 1px to cut the white fringe, then feather for smooth anti-aliased edge
a_img = a_img.filter(ImageFilter.MinFilter(3))
a_img = a_img.filter(ImageFilter.GaussianBlur(1.1))
arr[..., 3] = np.array(a_img)

out = Image.fromarray(arr, "RGBA")

# trim to content bbox with a small pad
ys, xs = np.where(np.array(out)[..., 3] > 8)
pad = 10
x0, x1 = max(0, xs.min() - pad), min(w, xs.max() + 1 + pad)
y0, y1 = max(0, ys.min() - pad), min(h, ys.max() + 1 + pad)
out = out.crop((x0, y0, x1, y1))
print(f"cropped: {out.size[0]}x{out.size[1]}")

# resize for web (displayed ~300px tall, keep 2x for retina)
target_h = 760
if out.size[1] > target_h:
    scale = target_h / out.size[1]
    out = out.resize((round(out.size[0] * scale), target_h), Image.LANCZOS)
print(f"final: {out.size[0]}x{out.size[1]}")

out.save(DST, optimize=True)
import os
print(f"saved {DST} ({os.path.getsize(DST)/1024:.0f} KB)")

# preview copies on white + on mint to inspect edge quality
prev = Image.new("RGBA", out.size, (247, 251, 249, 255))
prev.alpha_composite(out)
prev.convert("RGB").save("/home/z/my-project/scripts/wizard_preview_mint.jpg", quality=90)
print("preview saved")
