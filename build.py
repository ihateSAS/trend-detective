#!/usr/bin/env python3
"""Bundle the demo into one self-contained HTML file.

Judges get a link, not a folder. Inlining the four scripts and the stylesheet
means one file works anywhere: double-clicked locally, or served by GitHub Pages.

Writes two copies of the same bytes:
  dist/trenddetective.html   what you drag onto any static host
  docs/index.html            what GitHub Pages serves from Settings -> Pages -> /docs

Run:  python3 build.py
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent
WEB = ROOT / "web"
DIST = ROOT / "dist"
DOCS = ROOT / "docs"

html = (WEB / "index.html").read_text()
html = html.replace(
    '<link rel="stylesheet" href="styles.css">',
    "<style>\n" + (WEB / "styles.css").read_text() + "\n</style>",
)
for name in ("world.js", "data.js", "app.js", "motion.js"):
    html = html.replace(f'<script src="{name}"></script>',
                        "<script>\n" + (WEB / name).read_text() + "\n</script>")

targets = [DIST / "trenddetective.html", DOCS / "index.html"]
for target in targets:
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html)
    print(f"{target.relative_to(ROOT.parent)}  ({target.stat().st_size / 1024:.0f} KB)")

# Stops GitHub Pages running the file through Jekyll. Harmless, avoids surprises.
(DOCS / ".nojekyll").write_text("")
print("docs/.nojekyll")
