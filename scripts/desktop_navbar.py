#!/usr/bin/env python3
"""
Desktop nav bar restructure (all 8 pages):

1. Move the .nav-menu block INSIDE the .nav flex row (between brand and nav-right)
   so it can render as an inline bar on desktop and stay an absolute dropdown
   on mobile (positioning context is .site-header either way).
2. Add short desktop labels: <span class="nl-s" aria-hidden="true">City</span>
   plus aria-label="Future City" on each link (a11y-safe label swap).
"""
import re
import sys
from pathlib import Path

PUB = Path("/home/z/my-project/public")
PAGES = ["index", "city", "timeline", "carbon", "museum", "impact", "challenge", "balance"]

SHORT = {
    "Home": "Home",
    "Future City": "City",
    "Timeline": "Timeline",
    "Carbon Calculator": "Carbon",
    "Green Tech Museum": "Museum",
    "Impact Simulator": "Impact",
    "Eco Challenge": "Challenge",
    "Tech vs Nature": "Balance",
}

MENU_RE = re.compile(
    r"\n[ \t]*<div class=\"nav-menu\" id=\"nav-menu\">\n(.*?)\n[ \t]*</div>\n[ \t]*</header>",
    re.DOTALL,
)
LINK_RE = re.compile(
    r'<a href="(\./[a-z]*)">(<span class="nl-t">([^<]+)</span>)(<span class="nl-d">[^<]*</span></a>)'
)

def main():
    total = 0
    for name in PAGES:
        p = PUB / f"{name}.html"
        src = p.read_text(encoding="utf-8")

        m = MENU_RE.search(src)
        if not m:
            print(f"{name}.html: nav-menu block NOT FOUND", file=sys.stderr)
            sys.exit(1)

        block = m.group(0)

        # 1. short labels + aria-labels
        def add_short(mm):
            href, nl_t, full, nl_d = mm.group(1), mm.group(2), mm.group(3), mm.group(4)
            short = SHORT.get(full)
            if short is None:
                print(f"{name}.html: no short label for '{full}'", file=sys.stderr)
                sys.exit(1)
            return (
                f'<a href="{href}" aria-label="{full}">'
                f'{nl_t}<span class="nl-s" aria-hidden="true">{short}</span>{nl_d}'
            )

        new_block_inner, n_links = LINK_RE.subn(add_short, m.group(1))
        if n_links != 8:
            print(f"{name}.html: expected 8 links, got {n_links}", file=sys.stderr)
            sys.exit(1)

        # 2. re-indent one level deeper (2 spaces) and move inside <nav>
        indented = "\n".join(
            ("  " + line) if line.strip() else line
            for line in ("      <div class=\"nav-menu\" id=\"nav-menu\">\n" + new_block_inner + "\n      </div>").split("\n")
        )

        # remove old block (keep the </header>)
        src = src.replace(block, "\n  </header>")
        # insert before <div class="nav-right"> inside the nav
        anchor = '      <div class="nav-right">'
        if anchor not in src:
            print(f"{name}.html: nav-right anchor NOT FOUND", file=sys.stderr)
            sys.exit(1)
        src = src.replace(anchor, indented + "\n\n" + anchor, 1)

        p.write_text(src, encoding="utf-8")
        total += n_links
        print(f"{name}.html  links-updated:{n_links}")

    print(f"\nTOTAL links updated: {total} (expect {len(PAGES) * 8})")
    sys.exit(0 if total == len(PAGES) * 8 else 1)

if __name__ == "__main__":
    main()
