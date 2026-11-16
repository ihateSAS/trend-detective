# Methodology and findings

NASA POWER provides the monthly data used in this project. The analysis asks where temperature
and rainfall changed between 1991 and 2025, how much they changed, and whether the trends are
statistically significant. It then checks how the apparent relationship between those trends
depends on the selected locations.

**Data and method.** Monthly NASA POWER point data (MERRA-2, community AG), 1991–2025, at **40
sites**: 12 named places (Los Angeles, Mau Forest, Manaus, Nuuk, Niamey, Dhaka, Alice Springs,
Reykjavik, Athens, Chennai, Anchorage, Cape Town) and **28 points on a fixed 20° grid over land**,
selected by a land mask before any data was fetched. Twelve complete months make a year; a year
missing one is dropped. Temperature is the annual mean; precipitation is the annual total.

**Statistics.** Two-sided **Mann–Kendall** (tie-corrected, continuity correction) with **Sen's
slope** — the median of all pairwise slopes, so one extreme year cannot bend the line. If all 80
null hypotheses were true, tests at p < 0.05 would yield four false positives on average. We apply
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

- **DeepSeek V4.1 Flash Fast** assisted with the code — the analysis pipeline, `ingest.py`, the web
  demo and first drafts of this document — under the team's direction and review.
- Running that code against NASA POWER's public API, reading its output and drawing the conclusions
  were done by the authors. Every number in this submission comes from that run, so every figure,
  statistic and claim here is reproducible and checkable. The statistical choices (Mann–Kendall,
  Sen's slope, Benjamini–Hochberg) are standard published methods, cited below, selected and reviewed
  by the team.

## NASA Data

- **NASA POWER monthly point API** (MERRA-2 reanalysis), community AG, parameters `T2M` and
  `PRECTOTCORR`, 1991–2025 — <https://power.larc.nasa.gov/docs/services/api/temporal/monthly/>

## Space Agency Partner & Other Data

- **Natural Earth 1:110m admin 0 countries** (public domain) — land mask and map outline.
- **Mann (1945); Kendall (1975); Sen (1968); Benjamini & Hochberg (1995)** — test, slope estimator,
  multiple-comparison correction.


[Back to the project overview](../README.md)
