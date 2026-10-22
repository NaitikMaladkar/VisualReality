#!/usr/bin/env python3
"""Update all 7 subpages: remove nav tabs, re-point CTA to #join,
   Newsletter footer link -> Join the movement, add footer credit."""
import re, sys, pathlib

PUB = pathlib.Path("/home/z/my-project/public")
PAGES = ["city.html", "timeline.html", "carbon.html", "museum.html",
         "impact.html", "challenge.html", "balance.html"]

HEADER_RE = re.compile(
    r'[ \t]*<button class="nav-toggle".*?</div>\s*\n\s*</nav>',
    re.DOTALL)

FOOTER_CREDIT = (
    '        <p class="footer-credit">Designed &amp; built by '
    '<a href="https://github.com/NaitikMaladkar" target="_blank" rel="noopener">'
    'Naitik Maladkar</a> &middot; <a href="tel:+917821838270">7821838270</a></p>\n'
)

for name in PAGES:
    p = PUB / name
    html = p.read_text(encoding="utf-8")
    orig = html

    # 1. Replace nav-toggle + nav-menu block (up to </nav>) with a clean CTA
    m = HEADER_RE.search(html)
    if not m:
        print(f"[WARN] {name}: header block not found")
    else:
        replacement = (
            '      <a href="index.html#join" class="btn btn-primary btn-sm nav-cta">'
            'Join the movement</a>\n    </nav>'
        )
        html = html[:m.start()] + replacement + html[m.end():]

    # 2. Footer: Newsletter link -> Join the movement
    html = html.replace(
        '<a href="index.html#subscribe">Newsletter</a>',
        '<a href="index.html#join">Join the movement</a>')

    # 3. Footer-bottom: insert credit line after the copyright <p>
    cr_pat = re.compile(
        r'(odul;?)?(<p>&copy; <span id="year">2026</span> Visual Reality\. '
        r'All rights reserved\.</p>\n)')
    html = cr_pat.sub(lambda m: m.group(2) + FOOTER_CREDIT, html, count=1)

    if html != orig:
        p.write_text(html, encoding="utf-8")
        print(f"[OK] {name}: tabs removed, CTA->#join, footer updated")
    else:
        print(f"[WARN] {name}: no changes made")
