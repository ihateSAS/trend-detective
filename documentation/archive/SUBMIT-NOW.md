> Historical draft: this checklist predates the 40-site analysis and contains outdated results
> and demo requirements. For the current project, see the [README](../../README.md).

# SUBMIT NOW — Trend Detective

Everything in this folder is the submission. Work in this order.

## 1. Host the demo (3 minutes)

Drag **`TrendDetective.html`** onto <https://app.netlify.com/drop>. You get a public URL instantly.
That URL is the "Project" link. It is one file with everything inlined — no server, no build.

## 2. Paste this as the Summary

> Across 12 sites in NASA's MERRA-2 reanalysis, 9 of 24 site trends survive a false-discovery-rate
> correction. The two sites that cool significantly are the two that wetten most (Spearman rho = -0.55),
> so a single grid cell does not report what a global average reports.

Then paste **`SUBMISSION-README.md`** into the project page, keeping its section order:

Summary → Project Demonstration → Project → Project Details → Use of AI → NASA Data → Partner Data.

## 3. Video (only if the form asks for one)

Record `http://127.0.0.1:4517` — still running. 90 seconds, four beats:

1. Dhaka cooled 0.23 °C per decade while its rainfall rose 24.7 %. (p = 0.012 and p < 0.001)
2. We ran 24 tests. Eleven look significant. Nine survive the correction.
3. The scatter: wetter places cool, drier places warm, rho = -0.55.
4. One failure, out loud: a reanalysis is a model, twelve sites is a sample, and this could be how the
   model closes its water budget.

Your teammate narrates. Keep anyone under 18 off camera.

## 4. Before you hit Submit

- [ ] Team page lists **two or more** participants, both registered for the **Universal Event**
- [ ] Project link opens in a private window (not localhost)
- [ ] Challenge selected: *Be An Earth System Trend Detective!*
- [ ] Both teammates' names, emails and schools on the project
- [ ] Submit for Judging

## Numbers, if you need to quote them

| What | Value |
|---|---|
| Sites / years / tests | 12 / 1991–2025 / 24 |
| Raw p < 0.05 | 11 |
| Survive Benjamini–Hochberg, q = 0.05 | 9 |
| Dropped by correction | Nuuk temp (p = 0.027), Anchorage rain (p = 0.036) |
| Rainfall vs temperature trend | Spearman rho = **-0.55** |
| Dhaka | -0.23 °C/dec (p = 0.012) · rain +24.7 %/dec (p < 0.001) · corr -0.59 |
| Cape Town | -0.16 °C/dec (p = 0.005) · rain +14.9 %/dec (p = 0.001) · corr -0.38 |
| Athens | +0.50 °C/dec (p < 0.001) · rain +5.9 %/dec (n.s.) |
| Manaus | +0.27 °C/dec (p = 0.011) · rain -7.9 %/dec (p = 0.012) |
| Los Angeles rain | -4.5 %/dec, p = 0.53 — **no trend, reported as none** |

## Where the working copy lives

`~/Desktop/home/trenddetective/`

- `ingest.py` — data + Mann–Kendall, Sen's slope, Benjamini–Hochberg
- `web/` — the demo source
- `build.py` — regenerates the single-file HTML
- `data/raw/` — cached NASA POWER responses (rerun `python3 ingest.py` offline)

`TrendDetective-source.zip` in this folder is the whole project, for any form that wants code.
