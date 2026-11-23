"""Optional: rebuilds public/assets/madhav/*.webp from the original Madhav_assets.zip PNGs.
Usage:  python scripts/optimize-assets.py "path/to/Madhav assets" public/assets/madhav
(The optimised files are already committed in public/assets/madhav, so you do not need to run this.)"""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else 'Madhav assets'
DST = sys.argv[2] if len(sys.argv) > 2 else 'public/assets/madhav'
os.makedirs(DST, exist_ok=True)

# name -> (source file, max side px, kind)   kind: 'a' alpha, 'cut' remove baked-in checkerboard, 'tex' opaque texture
MAP = {
 'logo-wordmark':      ('Teal Madhav Calligraphic Logo.png', 900, 'a'),
 'emblem':             ('madhav_teal_emblem_transparent.png', 720, 'disc'),
 'krishna-standing':   ('Krishna with Peacock Feather and Flute.png', 700, 'a'),
 'krishna-pond':       ('Krishna by the Lotus Pond.png', 760, 'tex'),
 'krishna-frame':      ('Watercolor Krishna with Flute and Lotus Frame.png', 760, 'tex'),
 'lotus-ivory':        ('Elegant Ivory Lotus Blossom.png', 640, 'a'),
 'lotus-pink':         ('Golden-Edged Pink Lotus Bloom.png', 640, 'cut'),
 'lotus-bud':          ('Golden Lotus Bud with Leaves.png', 600, 'a'),
 'lotus-petals':       ('Watercolor Lotus Petals with Golden Edges.png', 640, 'a'),
 'lotus-emblem':       ('Ornate Watercolor Lotus Emblem.png', 520, 'a'),
 'lotus-border':       ('Ornate Watercolor Lotus Border.png', 1100, 'a'),
 'lotus-vine':         ('Ornate Golden Lotus Vine Flourish.png', 1100, 'a'),
 'lotus-water':        ('Ornate Golden Lotus Water Emblem.png', 900, 'a'),
 'lotus-sunrise':      ('Ornate Golden Lotus Sunrise Emblem.png', 800, 'a'),
 'peacock-feather':    ('Ornate Peacock Feather in Jewel Tones.png', 560, 'a'),
 'krishna-flute':      ('Ornate Krishna Flute with Peacock Feather.png', 800, 'a'),
 'diya':               ('Ornate Teal and Gold Diya Lamp.png', 520, 'a'),
 'diya-twin':          ('Ornate Twin Diya Lamps.png', 700, 'cut'),
 'temple':             ('Ornate Teal and Gold Temple Sticker.png', 600, 'cut'),
 'moon':               ('Ornate Crescent Moon Floral Emblem.png', 560, 'a'),
 'arch-frame':         ('Ornate Teal and Gold Mughal Arch Frame.png', 640, 'a'),
 'offering-hands':     ('Ornate Lotus Offering Hands.png', 640, 'a'),
 'quill':              ('Ornate Mughal Quill and Ink Pot.png', 520, 'a'),
 'lotus-book':         ('Ornate Teal Lotus Book.png', 640, 'a'),
 'jewel-orb':          ('Ornate Teal Lotus Jewel Orb.png', 520, 'cut'),
 'gem-teal':           ('Teal Gemstone Sphere with Gold Veins.png', 360, 'a'),

 'tex-ivory':          ('Warm Ivory Handmade Paper Texture.png', 760, 'tex'),
 'tex-amethyst':       ('Royal Amethyst Fibrous Paper Texture.png', 640, 'tex'),
 'tex-teal':           ('Teal Mughal Lotus Trellis Pattern.png', 640, 'tex'),
 'tex-plum':           ('Mughal Lotus Trellis in Plum and Gold.png', 640, 'tex'),
}

def cut_checker(im, dotted=False):
    """Make a baked-in white/grey checkerboard background transparent (flood fill from the border).
    dotted=True handles the finer grey dot pattern used on the temple image."""
    rgb = np.array(im.convert('RGB')).astype(int)
    mx, mn = rgb.max(2), rgb.min(2)
    if dotted:
        bg = (mn > 150) & ((mx - mn) < 13)
        bg = ndi.binary_closing(np.pad(bg, 12, constant_values=True), iterations=3)[12:-12, 12:-12]
    else:
        bg = (mn > 212) & ((mx - mn) < 14)
    lab, _ = ndi.label(bg)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    mask = np.isin(lab, edge[edge > 0])
    mask = ndi.binary_dilation(mask, iterations=3 if dotted else 1)
    alpha = np.where(mask, 0, 255).astype(np.uint8)
    alpha = np.array(Image.fromarray(alpha).filter(__import__('PIL.ImageFilter', fromlist=['x']).GaussianBlur(0.8)))
    out = np.dstack([np.array(im.convert('RGB')), alpha])
    return Image.fromarray(out, 'RGBA')

def disc_cut(im):
    """The emblem has a grey linen fringe outside its gold ring: keep the file's circular alpha, eroded past the fringe."""
    al = np.array(im.convert('RGBA'))[..., 3] > 128
    ys, xs = np.where(al)
    cy, cx = (ys.min() + ys.max()) / 2 - 7, (xs.min() + xs.max()) / 2 - 7
    r = (ys.max() - ys.min() + xs.max() - xs.min()) / 4
    yy, xx = np.mgrid[:al.shape[0], :al.shape[1]]
    d = np.hypot(yy - cy, xx - cx)
    a = np.clip((r * 0.945 - d) * 1.5 + 1, 0, 1) * 255
    out = np.dstack([np.array(im.convert('RGB')), a.astype(np.uint8)])
    print('emblem centre', round(cx), round(cy), 'radius', round(r))
    return Image.fromarray(out, 'RGBA')

for name, (f, side, kind) in MAP.items():
    im = Image.open(os.path.join(SRC, f))
    if kind == 'disc':
        im = disc_cut(im)
    im = cut_checker(im, dotted=(name == 'temple')) if kind == 'cut' else (im.convert('RGBA') if kind in ('a','disc') else im.convert('RGB'))
    if kind in ('a', 'cut', 'disc'):
        bbox = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()   # trim empty margins
        if bbox: im = im.crop(bbox)
    im.thumbnail((side, side), Image.LANCZOS)
    q = 78 if kind == 'tex' else 86
    im.save(os.path.join(DST, name + '.webp'), 'WEBP', quality=q, method=6)
    print(f'{name:18s} {im.size} {os.path.getsize(os.path.join(DST, name + ".webp"))//1024} KB')

# corner ornament: crop the top-left corner of the Mughal frame (it is mirrored with CSS, never stretched)
im = Image.open(os.path.join(SRC, 'Ornate Mughal Floral Corner Frame.png')).convert('RGBA')
tl = im.crop((0, 0, im.width // 2, im.height // 2)); tl = tl.crop(tl.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())
tl.thumbnail((360, 360), Image.LANCZOS); tl.save(os.path.join(DST, 'corner-tl.webp'), 'WEBP', quality=88, method=6)
