#!/usr/bin/env python3
"""
Visual Reality — add hamburger nav to all pages + convert internal links to clean /routes.

1. Rewrites internal links in all 8 HTML files:
     index.html#join  -> /#join      city.html -> /city   timeline.html -> /timeline
     carbon.html -> /carbon          museum.html -> /museum
     impact.html -> /impact          challenge.html -> /challenge
     balance.html -> /balance        bare index.html -> /
2. Rewrites wiki-links inside terrasense.js the same way.
3. Inserts an identical hamburger nav block (toggle button + dropdown panel) into
   every page's header, wrapping the "Join the movement" CTA with the toggle.
"""
import re
import sys
from pathlib import Path

PUB = Path("/home/z/my-project/public")
PAGES = ["index", "city", "timeline", "carbon", "museum", "impact", "challenge", "balance"]

# Ordered link replacements (hash-variants first!)
ROUTES = [
    ("index.html#join", "/#join"),
    ("index.html#innovations", "/#innovations"),
    ("index.html#home", "/#home"),
    ("index.html", "/"),
    ("city.html", "/city"),
    ("timeline.html", "/timeline"),
    ("carbon.html", "/carbon"),
    ("museum.html", "/museum"),
    ("impact.html", "/impact"),
    ("challenge.html", "/challenge"),
    ("balance.html", "/balance"),
]

NAV_MENU = """      <div class="nav-right">
        {cta}
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu" aria-label="Open menu">
          <span class="nav-toggle-bar" aria-hidden="true"></span>
          <span class="nav-toggle-bar" aria-hidden="true"></span>
          <span class="nav-toggle-bar" aria-hidden="true"></span>
        </button>
      </div>
    </nav>

    <div class="nav-menu" id="nav-menu">
      <div class="container nav-menu-inner">
        <nav class="nav-links" aria-label="Site pages">
          <a href="/"><span class="nl-t">Home</span><span class="nl-d">Start here</span></a>
          <a href="/city"><span class="nl-t">Future City</span><span class="nl-d">Build a 2060 city</span></a>
          <a href="/timeline"><span class="nl-t">Timeline</span><span class="nl-d">1952 &rarr; today</span></a>
          <a href="/carbon"><span class="nl-t">Carbon Calculator</span><span class="nl-d">Measure your footprint</span></a>
          <a href="/museum"><span class="nl-t">Green Tech Museum</span><span class="nl-d">Walk the halls</span></a>
          <a href="/impact"><span class="nl-t">Impact Simulator</span><span class="nl-d">What-if the world</span></a>
          <a href="/challenge"><span class="nl-t">Eco Challenge</span><span class="nl-d">Daily green quests</span></a>
          <a href="/balance"><span class="nl-t">Tech vs Nature</span><span class="nl-d">The balance game</span></a>
        </nav>
        <a href="/#join" class="btn btn-primary btn-sm nav-menu-cta">Join the movement</a>
      </div>
    </div>
  </header>"""

# CTA line + closing </nav> + </header>  (header markup is identical on all pages
# except the CTA href, which may be #join on index or index.html#join on subpages)
HEADER_RE = re.compile(
    r'[ \t]*<a href="[^"]*" class="btn btn-primary btn-sm nav-cta">Join the movement</a>\n'
    r"[ \t]*</nav>\n"
    r"[ \t]*</header>"
)

def main():
    total_nav, total_links = 0, 0

    for name in PAGES:
        path = PUB / f"{name}.html"
        src = path.read_text(encoding="utf-8")

        # --- 1. clean-route links ---
        n_links = 0
        for old, new in ROUTES:
            count = src.count(f'"{old}"')
            n_links += count
            src = src.replace(f'"{old}"', f'"{new}"')

        # --- 2. hamburger nav insertion ---
        cta = '<a href="#join" class="btn btn-primary btn-sm nav-cta">Join the movement</a>' \
            if name == "index" else \
            '<a href="/#join" class="btn btn-primary btn-sm nav-cta">Join the movement</a>'
        replacement = NAV_MENU.replace("{cta}", cta)
        src, n_nav = HEADER_RE.subn(replacement, src, count=1)

        path.write_text(src, encoding="utf-8")
        total_nav += n_nav
        total_links += n_links
        print(f"{name}.html  links:{n_links:2d}  nav-inserted:{n_nav}")

    # --- 3. terrasense.js wiki links ---
    ts = PUB / "terrasense.js"
    src = ts.read_text(encoding="utf-8")
    n_ts = 0
    for old, new in ROUTES:
        count = src.count(old)
        n_ts += count
        src = src.replace(old, new)
    ts.write_text(src, encoding="utf-8")
    print(f"terrasense.js  links:{n_ts}")

    ok = total_nav == len(PAGES)
    print(f"\nTOTAL: nav blocks {total_nav}/{len(PAGES)}, html links {total_links}, js links {n_ts}")
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
