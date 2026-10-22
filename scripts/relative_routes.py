#!/usr/bin/env python3
"""
Visual Reality — make navigation base-path-proof + cache-bust assets.

1. Absolute internal links -> RELATIVE (immune to subpath/query-embedded hosting):
     href="/#join"        -> href="./#join"
     href="/"             -> href="./"
     href="/city"         -> href="./city"   (and 6 more routes)
     terrasense.js  |/city]] -> |./city]]
   All still land on the clean /city-style routes in the address bar.
2. Cache-bust every local CSS/JS asset reference: styles.css -> styles.css?v=20261022a
   (defeats stale caches that mix old JS/CSS with new HTML).
"""
import re
import sys
from pathlib import Path

PUB = Path("/home/z/my-project/public")
PAGES = ["index", "city", "timeline", "carbon", "museum", "impact", "challenge", "balance"]
V = "20261022a"

ROUTES = [
    ("/#join", "./#join"),
    ("/#innovations", "./#innovations"),
    ("/#home", "./#home"),
    ("/city", "./city"),
    ("/timeline", "./timeline"),
    ("/carbon", "./carbon"),
    ("/museum", "./museum"),
    ("/impact", "./impact"),
    ("/challenge", "./challenge"),
    ("/balance", "./balance"),
]

def bust(src: str) -> tuple[str, int]:
    """Append ?v= to local .css/.js asset refs (skip absolute/external URLs)."""
    n = 0

    def rep(m):
        nonlocal n
        attr, path, ext = m.group(1), m.group(2), m.group(3)
        if path.startswith(("http", "/", "//")) or "?" in path:
            return m.group(0)
        n += 1
        return f'{attr}="{path}.{ext}?v={V}"'

    src = re.sub(r'(href|src)="([A-Za-z0-9_\-./]+)\.(css|js)"', rep, src)
    return src, n

def main():
    total = 0
    for name in PAGES:
        p = PUB / f"{name}.html"
        src = p.read_text(encoding="utf-8")
        n = 0
        for old, new in ROUTES:
            c = src.count(f'"{old}"')
            n += c
            src = src.replace(f'"{old}"', f'"{new}"')
        src, b = bust(src)
        n += b
        p.write_text(src, encoding="utf-8")
        total += n
        print(f"{name}.html  rel:{n - b:3d}  busted:{b}")

    ts = PUB / "terrasense.js"
    src = ts.read_text(encoding="utf-8")
    n = 0
    for old, new in ROUTES:
        c = src.count(f"|{old}]]")
        n += c
        src = src.replace(f"|{old}]]", f"|{new}]]")
    ts.write_text(src, encoding="utf-8")
    print(f"terrasense.js  rel:{n}")
    total += n
    print(f"TOTAL changes: {total}")

    # sanity: no absolute internal links left
    left = []
    for name in PAGES:
        s = (PUB / f"{name}.html").read_text(encoding="utf-8")
        for old, _ in ROUTES:
            if f'"{old}"' in s:
                left.append(f"{name}.html: {old}")
    if left:
        print("LEFTOVER ABSOLUTE:", left)
        sys.exit(1)
    print("OK: no absolute internal links remain")

if __name__ == "__main__":
    main()
