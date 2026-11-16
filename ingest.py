#!/usr/bin/env python3
"""Trend Detective -- ingest + trend statistics.

NASA Space Apps 2026, challenge "Be An Earth System Trend Detective!".

Pulls monthly NASA POWER point data for a handful of sites, aggregates it to
annual values, and runs a Mann-Kendall trend test with a Sen's slope estimate
for each site and variable. Writes web/data.js so the demo is a plain static
page with no server, no build step and no API key.

Run:  python3 ingest.py
Out:  data/raw/*.json   cached API responses (safe to delete)
      data/series.json  cleaned annual series
      web/data.js       what the demo reads
      web/world.js      world outline for the map (Natural Earth, public domain)
"""

import json
import math
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from pathlib import Path
from statistics import median

ROOT = Path(__file__).resolve().parent
RAW = ROOT / "data" / "raw"
WEB = ROOT / "web"

START_YEAR = 1991
END_YEAR = 2025
BASE = "https://power.larc.nasa.gov/api/temporal/monthly/point"
FILL = -999.0
MIN_YEARS = 25          # a trend on fewer years than this is not worth printing
FDR_Q = 0.05            # Benjamini-Hochberg false-discovery rate across all tests
GRID_MAX = 36           # cap on systematically sampled points (network-bound)

DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

# A spread of places a ranger, a farmer, a city planner or a satellite engineer
# might actually ask about. Los Angeles first: it is the home event.
SITES = [
    {"id": "los-angeles", "name": "Los Angeles, USA", "lat": 34.05, "lon": -118.24,
     "region": "North America", "note": "The home city. A coastal basin with a desert behind it."},
    {"id": "mau-forest", "name": "Mau Forest, Kenya", "lat": -0.50, "lon": 35.90,
     "region": "East Africa", "note": "The landscape in the land-cover project. Highland forest island."},
    {"id": "manaus", "name": "Manaus, Brazil", "lat": -3.10, "lon": -60.02,
     "region": "Amazon", "note": "Central Amazon. Rain, not temperature, is the variable that matters."},
    {"id": "nuuk", "name": "Nuuk, Greenland", "lat": 64.18, "lon": -51.72,
     "region": "Arctic", "note": "Where a small change in the mean moves a lot of ice."},
    {"id": "niamey", "name": "Niamey, Niger", "lat": 13.51, "lon": 2.11,
     "region": "Sahel", "note": "The Sahel drought and recovery is a trend-detection classic."},
    {"id": "dhaka", "name": "Dhaka, Bangladesh", "lat": 23.81, "lon": 90.41,
     "region": "South Asia", "note": "Monsoon timing and total, on a delta that floods."},
    {"id": "alice-springs", "name": "Alice Springs, Australia", "lat": -23.70, "lon": 133.88,
     "region": "Central Australia", "note": "Arid interior. A good control for wet-region trends."},
    {"id": "reykjavik", "name": "Reykjavik, Iceland", "lat": 64.15, "lon": -21.94,
     "region": "North Atlantic", "note": "Ocean-moderated high latitude, mid-Atlantic ridge."},
    {"id": "athens", "name": "Athens, Greece", "lat": 37.98, "lon": 23.73,
     "region": "Mediterranean", "note": "A drying summer is the headline question here."},
    {"id": "chennai", "name": "Chennai, India", "lat": 13.08, "lon": 80.27,
     "region": "South Asia", "note": "Bengaluru's neighbour, on the Bay of Bengal monsoon edge."},
    {"id": "anchorage", "name": "Anchorage, USA", "lat": 61.22, "lon": -149.90,
     "region": "Alaska", "note": "High-latitude warming, US soil."},
    {"id": "cape-town", "name": "Cape Town, South Africa", "lat": -33.92, "lon": 18.42,
     "region": "Southern Africa", "note": "Mediterranean climate in the southern hemisphere."},
]

# POWER monthly parameter: mode is how twelve months become one year.
VARIABLES = {
    "t2m": {"param": "T2M", "mode": "mean"},
    "precip": {"param": "PRECTOTCORR", "mode": "sum"},
}


# ------------------------------------------------------------------ fetching
def fetch(site, params):
    """Monthly values for one site, cached to disk so reruns are free."""
    RAW.mkdir(parents=True, exist_ok=True)
    path = RAW / f"{site['id']}.json"
    if path.exists():
        return json.loads(path.read_text())

    query = urllib.parse.urlencode({
        "parameters": ",".join(params),
        "community": "AG",
        "longitude": site["lon"],
        "latitude": site["lat"],
        "start": START_YEAR,
        "end": END_YEAR,
        "format": "JSON",
    })
    url = f"{BASE}?{query}"
    print(f"  GET {site['id']} ({site['lat']}, {site['lon']})")
    try:
        with urllib.request.urlopen(url, timeout=60) as r:
            payload = json.loads(r.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"    failed: {exc}")
        return None
    path.write_text(json.dumps(payload))
    time.sleep(2.0)  # POWER asks for a gentle request rate
    return payload


def annual_series(monthly, mode):
    """{"YYYYMM": value} -> [(year, annual value)], complete years only."""
    per_year = {}
    for key, value in monthly.items():
        if len(key) != 6 or key.endswith("13"):
            continue  # month 13 is POWER's own annual aggregate
        if value is None or value <= FILL / 2:
            continue
        per_year.setdefault(int(key[:4]), {})[int(key[4:])] = float(value)

    out = []
    for year in sorted(per_year):
        months = per_year[year]
        if len(months) != 12:
            continue  # a year missing a month is not comparable with a full one
        if mode == "mean":
            out.append((year, sum(months.values()) / 12.0))
        else:  # mm/day * days in month, summed = mm/year
            out.append((year, sum(months[m] * DAYS_IN_MONTH[m - 1] for m in range(1, 13))))
    return out


# ------------------------------------------------------------------ statistics
def mann_kendall(values):
    """Two-sided Mann-Kendall test. Returns (S, z, p).

    The normal approximation with a continuity correction, and the tie-corrected
    variance, which is the version everyone means when they say 'Mann-Kendall'.
    """
    n = len(values)
    s = 0
    for k in range(n - 1):
        for j in range(k + 1, n):
            diff = values[j] - values[k]
            if diff > 0:
                s += 1
            elif diff < 0:
                s -= 1

    var = n * (n - 1) * (2 * n + 5)
    for t in Counter(values).values():
        if t > 1:
            var -= t * (t - 1) * (2 * t + 5)
    var /= 18.0

    if var <= 0:
        return s, 0.0, 1.0
    if s > 0:
        z = (s - 1) / math.sqrt(var)
    elif s < 0:
        z = (s + 1) / math.sqrt(var)
    else:
        z = 0.0
    p = 2.0 * (1.0 - 0.5 * (1.0 + math.erf(abs(z) / math.sqrt(2.0))))
    return s, z, p


def sens_slope(years, values):
    """Median of all pairwise slopes -- resistant to one bad year."""
    slopes = []
    for i in range(len(values) - 1):
        for j in range(i + 1, len(values)):
            dx = years[j] - years[i]
            if dx:
                slopes.append((values[j] - values[i]) / dx)
    slope = median(slopes) if slopes else 0.0
    intercept = median([v - slope * y for y, v in zip(years, values)])
    return slope, intercept


def describe(years, values):
    n = len(values)
    s, z, p = mann_kendall(values)
    slope, intercept = sens_slope(years, values)
    mean = sum(values) / n
    first = sum(values[:10]) / len(values[:10])
    last = sum(values[-10:]) / len(values[-10:])
    return {
        "years": years,
        "values": [round(v, 3) for v in values],
        "n": n,
        "slope_per_year": slope,
        "sen_intercept": intercept,
        "rel_pct_per_decade": (slope * 10.0 / mean * 100.0) if mean else None,
        "p_value": p,
        "z": z,
        "kendall_tau": s / (n * (n - 1) / 2.0),
        "mean": mean,
        "first_decade": first,
        "last_decade": last,
        "decade_delta": last - first,
    }


# ----------------------------------------------------------------------- world
def load_land_rings():
    """Full-precision country rings, used only for land/water tests."""
    src = ROOT.parent / "outbreak" / "data" / "ne_countries.geojson"
    if not src.exists():
        return []
    geo = json.loads(src.read_text())
    rings = []
    for feature in geo.get("features", []):
        geom = feature.get("geometry") or {}
        if geom.get("type") not in ("Polygon", "MultiPolygon"):
            continue
        polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
        for poly in polys:
            rings.append(poly[0])  # outer ring only; holes are noise at this scale
    return rings


def point_in_ring(x, y, ring):
    inside = False
    n = len(ring)
    for i in range(n):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % n]
        if (y1 > y) != (y2 > y):
            if x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
                inside = not inside
    return inside


def on_land(rings, lon, lat):
    return any(point_in_ring(lon, lat, ring) for ring in rings)


def build_world():
    """A low-resolution land outline for the map, from Natural Earth."""
    src = ROOT.parent / "outbreak" / "data" / "ne_countries.geojson"
    rings = []
    if src.exists():
        geo = json.loads(src.read_text())
        for feature in geo.get("features", []):
            geom = feature.get("geometry") or {}
            if geom.get("type") not in ("Polygon", "MultiPolygon"):
                continue
            polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
            for poly in polys:
                for ring in poly:
                    pts = [(round(x, 1), round(y, 1)) for x, y in ring]
                    if len(pts) < 14:
                        continue
                    xs = [p[0] for p in pts]
                    ys = [p[1] for p in pts]
                    if (max(xs) - min(xs)) * (max(ys) - min(ys)) < 1.5:
                        continue  # island specks are noise at this scale
                    clean = [pts[0]]
                    for p in pts[1:]:
                        if p != clean[-1]:
                            clean.append(p)
                    if len(clean) >= 14:
                        rings.append(clean)
    WEB.mkdir(parents=True, exist_ok=True)
    (WEB / "world.js").write_text(
        "// Generated by ingest.py from Natural Earth 1:110m (public domain).\n"
        "window.WORLD = " + json.dumps({"rings": rings}, separators=(",", ":")) + ";\n"
    )
    print(f"  world: {len(rings)} rings")


# ------------------------------------------------------------------------ main
def main():
    print(f"NASA POWER monthly, {START_YEAR}-{END_YEAR}")
    params = [v["param"] for v in VARIABLES.values()]

    sites = []
    for site in SITES:
        payload = fetch(site, params)
        if not payload:
            print(f"  skip {site['id']}: no data")
            continue
        monthly = payload.get("properties", {}).get("parameter", {})

        series = {}
        for key, spec in VARIABLES.items():
            values = monthly.get(spec["param"])
            if not values:
                continue
            pairs = annual_series(values, spec["mode"])
            if len(pairs) < MIN_YEARS:
                print(f"  skip {site['id']}/{key}: only {len(pairs)} complete years")
                continue
            years = [y for y, _ in pairs]
            vals = [v for _, v in pairs]
            series[key] = describe(years, vals)

        if not series:
            print(f"  skip {site['id']}: nothing usable")
            continue

        sites.append({
            "id": site["id"], "name": site["name"], "lat": site["lat"], "lon": site["lon"],
            "region": site["region"], "note": site["note"], "sample": "curated",
            "series": series,
        })
        got = ", ".join(f"{k} n={v['n']} p={v['p_value']:.3f}" for k, v in series.items())
        print(f"  ok {site['id']}: {got}")

    # ------------------------------------------------ systematic global sample
    # Twelve named sites are a story, not a sample. Add a fixed grid over land
    # so the pattern can be checked against places nobody chose in advance.
    if os.environ.get("NO_GRID") != "1":
        rings = load_land_rings()
        added = 0
        print("  grid sample over land (20 degree spacing)")
        for lat in range(-60, 61, 20):
            if added >= GRID_MAX:
                break
            for lon in range(-180, 180, 20):
                if added >= GRID_MAX:
                    break
                if not rings or not on_land(rings, lon, lat):
                    continue
                if any(abs(lat - s["lat"]) < 8 and abs(lon - s["lon"]) < 8 for s in sites):
                    continue
                site = {
                    "id": f"grid_{lat}_{lon}",
                    "name": f"{abs(lat):.0f}\u00b0{'N' if lat >= 0 else 'S'} {abs(lon):.0f}\u00b0{'E' if lon >= 0 else 'W'}",
                    "lat": float(lat), "lon": float(lon),
                    "region": "Systematic grid",
                    "note": "A grid point, not a chosen place: it was selected before any data was seen.",
                }
                payload = fetch(site, params)
                if not payload:
                    continue
                monthly = payload.get("properties", {}).get("parameter", {})
                series = {}
                for key, spec in VARIABLES.items():
                    values = monthly.get(spec["param"])
                    if not values:
                        continue
                    pairs = annual_series(values, spec["mode"])
                    if len(pairs) < MIN_YEARS:
                        continue
                    series[key] = describe([y for y, _ in pairs], [v for _, v in pairs])
                if len(series) < 2:
                    continue
                site["sample"] = "grid"
                site["series"] = series
                sites.append(site)
                added += 1
                print(f"    + {site['name']}  ({added}/{GRID_MAX})")

    build_world()

    # --------------------------------------------------- multiple comparisons
    # Twenty-four tests at p<0.05 hand you a false positive even when nothing is
    # happening. Benjamini-Hochberg keeps only the discoveries whose p-values
    # are small enough to survive being one of many.
    tests = sorted(
        ((s["series"][v]["p_value"], s["id"], v) for s in sites for v in s["series"]),
        key=lambda t: t[0],
    )
    m = len(tests)
    fdr_cut = 0
    for k, (p, _, _) in enumerate(tests, 1):
        if p <= k / m * FDR_Q:
            fdr_cut = k
    qvals = [min(1.0, p * m / k) for k, (p, _, _) in enumerate(tests, 1)]
    for i in range(m - 2, -1, -1):
        qvals[i] = min(qvals[i], qvals[i + 1])
    for (_, site_id, var), q in zip(tests, qvals):
        series = next(s for s in sites if s["id"] == site_id)["series"][var]
        series["q_value"] = q
        series["survives_fdr"] = bool(q <= FDR_Q)

    raw_count = sum(1 for p, _, _ in tests if p < 0.05)
    print(f"  FDR q={FDR_Q}: {raw_count}/{m} raw p<0.05, {fdr_cut} survive")

    payload = {
        "generated": "2026-11-16",
        "challenge": "Be An Earth System Trend Detective!",
        "source": "NASA POWER monthly point API (MERRA-2), community AG",
        "start_year": START_YEAR,
        "end_year": END_YEAR,
        "method": "Mann-Kendall test (two-sided, tie-corrected, continuity correction) with Sen's slope",
        "fdr_q": FDR_Q,
        "tests_total": m,
        "tests_significant": raw_count,
        "tests_surviving": fdr_cut,
        "variables": {
            "t2m": {"label": "Air temperature at 2 m", "units": "\u00b0C", "agg": "annual mean",
                    "short": "Temperature"},
            "precip": {"label": "Precipitation", "units": "mm/year", "agg": "annual total",
                       "short": "Precipitation"},
        },
        "sites": sites,
    }

    WEB.mkdir(parents=True, exist_ok=True)
    (ROOT / "data").mkdir(exist_ok=True)
    (ROOT / "data" / "series.json").write_text(json.dumps(payload, indent=1))
    (WEB / "data.js").write_text(
        "// Generated by ingest.py. Do not edit by hand.\n"
        "window.TREND_DATA = " + json.dumps(payload, separators=(",", ":")) + ";\n"
    )
    print(f"\n{len(sites)} sites -> web/data.js")


if __name__ == "__main__":
    main()
