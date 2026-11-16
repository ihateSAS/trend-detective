# Trend Detective

**Challenge:** Be An Earth System Trend Detective!
**Event:** NASA Space Apps Challenge 2026 — Universal Event
**Team:** _(add both names, emails and schools)_

## Summary

We tested 80 site-variable trends in NASA's MERRA-2 reanalysis. **34 look significant; 30 survive a
false-discovery-rate correction.** Then we audited our own headline: the relationship between
rainfall and temperature trends was **−0.55 across the 12 sites we chose and −0.05 across 28 grid
points nobody chose.** The tool exists to make that difference visible.

That is the project: a significance test, a correction, and a self-audit that killed our best story.

## Project Demonstration

_(2-minute video link here — open on the collapse, not on the architecture.)_

Four beats, in this order:

1. Dhaka cooled **−0.23 °C per decade** (p = 0.012) while its rainfall rose **+24.7 %** (p < 0.001).
2. We ran 80 tests. Thirty-four look significant. **Thirty survive Benjamini–Hochberg at q = 0.05.**
3. Then we checked whether we had picked the right places: named sites give rho = **−0.55**, the
   systematic grid gives **−0.05**. The pattern was in our sample, not the planet.
4. So we report the audit, not the headline — and the tool shows both, side by side, on one chart.

## Project

- **Live:** <https://ihatesas.github.io/trend-detective/>
- **Code:** `ingest.py` (data + statistics), `web/` (the demo), `build.py` (single-file bundle)

## Project Details

**The question.** NASA POWER publishes 35 years of modelled climate for any point on Earth. Almost
everyone who plots it ships a line chart. The challenge asks a sharper question: *is the change
significant?* We answer with a test, an effect size, a correction — and then we test the answer.

**Data and method.** Monthly NASA POWER point data (MERRA-2, community AG), 1991–2025, at **40
sites**: 12 named places (Los Angeles, Mau Forest, Manaus, Nuuk, Niamey, Dhaka, Alice Springs,
Reykjavik, Athens, Chennai, Anchorage, Cape Town) and **28 points on a fixed 20° grid over land**,
selected by a land mask before any data was fetched. Twelve complete months make a year; a year
missing one is dropped. Temperature is the annual mean; precipitation is the annual total.

**Statistics.** Two-sided **Mann–Kendall** (tie-corrected, continuity correction) with **Sen's
slope** — the median of all pairwise slopes, so one extreme year cannot bend the line. Across 80
tests at p < 0.05 you expect four false positives before anything is happening, so we apply
**Benjamini–Hochberg** at q = 0.05: 34 raw significant results become 30.

**The finding we had to give up.** In the 12 named sites, rainfall trend and temperature trend were
strongly anti-correlated (Spearman −0.55): Dhaka cooled while it wettened, Cape Town cooled while it
wettened, Athens warmed and stayed dry. It looked like a mechanism. Adding 28 systematically chosen
grid points moved the correlation to **−0.19 overall and −0.05 within the grid**. The named sites are
a coastline-and-city sample; they were never a sample of the planet. We report the audit because a
result that only exists in the places you picked is not a result.

**What survives.** The corrected trend map itself: 30 of 80 site-variable trends survive FDR, and the
per-site numbers are unchanged —

| Site | Temperature | Rainfall | corr(annual rain, temp) |
|---|---|---|---|
| Dhaka | −0.23 °C/dec (p = 0.012) | +24.7 %/dec (p < 0.001) | −0.59 |
| Cape Town | −0.16 °C/dec (p = 0.005) | +14.9 %/dec (p = 0.001) | −0.38 |
| Athens | +0.50 °C/dec (p < 0.001) | +5.9 %/dec (p = 0.211, n.s.) | +0.15 |
| Manaus | +0.27 °C/dec (p = 0.011) | −7.9 %/dec (p = 0.012) | — |
| Los Angeles | +0.30 °C/dec (p = 0.011) | −4.5 %/dec (p = 0.53, **no trend**) | — |

**Validity check we ran on ourselves.** Relative change is only meaningful on a ratio scale. Celsius
has an arbitrary zero, so a "% per decade" for temperature is nonsense — Nuuk would read −21 %. The
demo shows "n/a · ratio scale only" for temperature and keeps percentages for rainfall only.

**Where it fails.**

- **Reanalysis, not thermometers.** MERRA-2 is a model constrained by observations.
- **The grid is coarse.** 20° spacing is 28 land points; it is systematic, not dense.
- **Correlating two trends is not causation**, and we no longer have a correlation worth explaining.
- **35 years** is short enough that a multi-decade cycle can impersonate a trend.
- **Grid temperature and precipitation are not independent** in a reanalysis: if the surface energy
  budget ties evaporation to precipitation, part of any relationship is structural.
- **One null we keep:** Los Angeles rainfall, p = 0.53. No trend, reported as no trend.

**What's next.** Block-bootstrap slope intervals; monthly decomposition to test whether Dhaka's
cooling is monsoon-concentrated; a 5° grid so the audit has power to detect a real relationship
rather than only to break a fake one.

## Use of Artificial Intelligence

- **DeepSeek V4.1 Flash** — used by the team for research, drafting and prose editing.
- **AI coding agent** — wrote `ingest.py`, the web demo and the first draft of this document under the
  team's direction, from prompts the team wrote and reviewed.
- Every number in this submission comes from executing that committed code against NASA POWER's public
  API. No figure was produced by a language model. The statistical choices (Mann–Kendall, Sen's slope,
  Benjamini–Hochberg) are standard published methods, cited below, selected and reviewed by the team.

## NASA Data

- **NASA POWER monthly point API** (MERRA-2 reanalysis), community AG, parameters `T2M` and
  `PRECTOTCORR`, 1991–2025 — <https://power.larc.nasa.gov/docs/services/api/temporal/monthly/>

## Space Agency Partner & Other Data

- **Natural Earth 1:110m admin 0 countries** (public domain) — land mask and map outline.
- **Mann (1945); Kendall (1975); Sen (1968); Benjamini & Hochberg (1995)** — test, slope estimator,
  multiple-comparison correction.

## Reproduce

```bash
python3 ingest.py        # fetch + compute; writes data/series.json and web/data.js
cd web && python3 -m http.server 4517
cd .. && python3 build.py   # optional: one self-contained dist/trenddetective.html
```

Standard library only. No API key, no login, no build step. `NO_GRID=1 python3 ingest.py` reproduces
the 12-site version, which is how the selection effect was found.
