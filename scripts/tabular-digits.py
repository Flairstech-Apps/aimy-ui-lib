"""Poppins with tabular digits: one woff2 per weight holding only 0-9, every digit as wide as "0" and
centred in it, so a number that changes never moves what is beside it. Poppins has no tabular
figures of its own (font-variant-numeric: tabular-nums does nothing with it), so the library loads
these after Poppins with unicode-range: U+0030-0039 and the browser takes digits from them.

    python scripts/tabular-digits.py      (needs fonttools and brotli: pip install fonttools brotli)

Reads @fontsource/poppins from node_modules; writes package/tokens/fonts/poppins-digits-<w>-<style>.woff2.
"""
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "node_modules" / "@fontsource" / "poppins" / "files"
OUT = ROOT / "package" / "tokens" / "fonts"
OUT.mkdir(parents=True, exist_ok=True)
FACES = [("300", "normal"), ("400", "normal"), ("400", "italic"), ("500", "normal"), ("600", "normal"), ("700", "normal")]
DIGITS = [chr(c) for c in range(0x30, 0x3A)]

for weight, style in FACES:
    font = TTFont(SRC / f"poppins-latin-{weight}-{style}.woff2")
    # Digits only, and no layout tables: kerning between digits would undo equal widths.
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = []
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    sub = subset.Subsetter(opts)
    sub.populate(text="".join(DIGITS))
    sub.subset(font)

    cmap = font.getBestCmap()
    names = [cmap[ord(d)] for d in DIGITS]
    hmtx = font["hmtx"]
    glyf = font["glyf"]
    width = max(hmtx[n][0] for n in names)
    for n in names:
        adv, lsb = hmtx[n]
        dx = (width - adv) // 2
        g = glyf[n]
        if dx and g.numberOfContours > 0:
            g.coordinates.translate((dx, 0))
            g.recalcBounds(glyf)
        hmtx[n] = (width, lsb + dx)
    # The face's own name, so it can't be mistaken for the full Poppins.
    for rec in font["name"].names:
        if rec.nameID in (1, 4, 16):
            rec.string = "Poppins Digits"
    out = OUT / f"poppins-digits-{weight}-{style}.woff2"
    font.flavor = "woff2"
    font.save(out)
    print(f"{out.relative_to(ROOT)}: digits {width} units wide")
