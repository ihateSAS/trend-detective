# Third-party notices

The MIT License in [`LICENSE`](LICENSE) covers the work the team wrote: the
analysis code (`ingest.py`), the web demo (`web/`, `build.py`), the film source
(`video/`), the documentation and the generated results in `data/`.

It does **not** cover the material below, which belongs to others and keeps its
own terms.

| Material | Where | Owner and terms |
|---|---|---|
| NASA POWER monthly point data (MERRA-2) | fetched by `ingest.py`; results in `data/`, `web/data.js` | NASA Langley Research Center POWER Project. NASA data are generally not subject to copyright in the United States; cite NASA POWER when reusing. |
| Blue Marble and Black Marble Earth imagery | `web/earth-day.jpg`, `web/earth-night.jpg`, and embedded in `docs/index.html`, `dist/trenddetective.html` | NASA Earth Observatory. NASA imagery is generally not subject to copyright in the United States; credit NASA. Use must not imply NASA endorsement. |
| Natural Earth 1:110m country boundaries | `web/world.js`, `video/assets/world.js` | Natural Earth, public domain. |
| NASA Space Apps Challenge logo | `video/assets/spaceapps.png`, embedded in `web/index.html`, `assets/banner.png` | Official event branding, used unmodified to identify the challenge. Not licensed by this project; do not reuse it under the MIT License. |
| Geist and Geist Mono typefaces | `video/assets/Geist*.ttf`; loaded from Google Fonts by the site | Vercel, SIL Open Font License 1.1. |
| Instrument Serif typeface | `video/assets/InstrumentSerif-*.ttf` | Instrument, SIL Open Font License 1.1. |
| GSAP 3.12.5 | `video/assets/gsap.min.js` | GreenSock. Not MIT: subject to GreenSock's standard license at <https://gsap.com/standard-license>. Used only to render the film. |
| three.js r160 | `video/assets/three.module.min.js` | three.js authors, MIT License. Used only to render the README banner. |
| Film narration | `video/audio/`, `docs/demo.mp4`, `docs/film.mp4` | AI-generated voice (Microsoft Edge neural voice via `edge-tts`), labelled in the film. |

Statistical methods are standard published methods: Mann (1945), Kendall (1975),
Sen (1968), Benjamini & Hochberg (1995).
