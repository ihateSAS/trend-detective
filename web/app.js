/* Trend Detective — static demo.
 *
 * All statistics arrive precomputed from ingest.py; this file only draws them
 * and answers clicks. No framework, no build step, no network calls.
 */
(() => {
  "use strict";

  const D = window.TREND_DATA;
  const WORLD = window.WORLD || { rings: [] };
  const SVG_NS = "http://www.w3.org/2000/svg";

  if (!D || !D.sites || !D.sites.length) {
    document.body.innerHTML =
      '<p style="padding:40px;font-family:system-ui">No data yet. Run <code>python3 ingest.py</code> first.</p>';
    return;
  }

  const state = { variable: "t2m", siteId: D.sites[0].id };

  const $ = (id) => document.getElementById(id);

  // One floating readout, reused by every mark on the page. Marks carry a short
  // aria-label instead of a native <title>, so the custom tip is the only one shown.
  const tip = document.createElement("div");
  tip.id = "tip";
  document.body.appendChild(tip);

  const moveTip = (ev) => {
    tip.style.left = `${ev.clientX}px`;
    tip.style.top = `${ev.clientY}px`;
  };

  function attachTip(node, html) {
    node.addEventListener("mouseenter", (ev) => {
      tip.innerHTML = html;
      tip.classList.add("on");
      moveTip(ev);
    });
    node.addEventListener("mousemove", moveTip);
    node.addEventListener("mouseleave", () => tip.classList.remove("on"));
    node.addEventListener("click", () => tip.classList.remove("on"));
  }

  // ------------------------------------------------------------------ helpers
  function fmt(value, digits) {
    if (value === null || value === undefined) return "—";
    const rounded = Number(value).toFixed(digits);
    return (value > 0 ? "+" : "") + rounded;
  }

  function el(name, attrs) {
    const node = document.createElementNS(SVG_NS, name);
    for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, v);
    return node;
  }

  function colorFor(slope, maxAbs) {
    const t = Math.max(-1, Math.min(1, slope / (maxAbs || 1)));
    const a = [47, 111, 181];   // cool
    const b = [99, 116, 138];   // neutral
    const c = [201, 67, 47];    // warm
    const from = t < 0 ? a : b;
    const to = t < 0 ? b : c;
    const f = Math.abs(t);
    const mix = from.map((v, i) => Math.round(v + (to[i] - v) * f));
    return `rgb(${mix[0]},${mix[1]},${mix[2]})`;
  }

  function significant(series) {
    return series && series.p_value !== null && series.p_value < 0.05;
  }

  /** Slope in native units per decade. */
  function perDecade(series) {
    return series.slope_per_year * 10;
  }

  /** What the map and the ranking sort on: change relative to the baseline. */
  function comparable(series, variable) {
    return relIsMeaningful(variable)
      ? Math.abs(series.rel_pct_per_decade)
      : Math.abs(perDecade(series));
  }

  const units = (variable) => D.variables[variable].units;
  const shortName = (variable) => D.variables[variable].short;
  // Units for a *change*, which is not the same as units for a level.
  const deltaUnit = (variable) => (variable === "precip" ? "mm" : "\u00b0C");
  const pLabel = (p) => (p < 0.001 ? "< 0.001" : p.toFixed(3));

  // A percentage change is only meaningful on a ratio scale. Celsius has an
  // arbitrary zero, so "+31%" of a mean near 0 C is meaningless -- a trap worth
  // showing rather than hiding.
  const relIsMeaningful = (variable) => variable === "precip";

  // ------------------------------------------------------------------ scatter
  function spearman(xs, ys) {
    const rank = (a) => {
      const order = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]);
      const r = new Array(a.length);
      order.forEach(([, i], pos) => { r[i] = pos + 1; });
      return r;
    };
    const rx = rank(xs), ry = rank(ys), n = xs.length;
    const mx = rx.reduce((a, b) => a + b, 0) / n;
    const my = ry.reduce((a, b) => a + b, 0) / n;
    let num = 0, dx = 0, dy = 0;
    for (let i = 0; i < n; i++) {
      num += (rx[i] - mx) * (ry[i] - my);
      dx += (rx[i] - mx) ** 2;
      dy += (ry[i] - my) ** 2;
    }
    return dx && dy ? num / Math.sqrt(dx * dy) : 0;
  }

  function drawScatter() {
    const svg = $("scatter");
    if (!svg) return;
    svg.innerHTML = "";

    const pts = D.sites
      .filter((s) => s.series.t2m && s.series.precip && s.series.precip.rel_pct_per_decade !== null)
      .map((s) => ({
        site: s,
        x: s.series.precip.rel_pct_per_decade,
        y: s.series.t2m.slope_per_year * 10,
        sig: significant(s.series.t2m),
      }));
    if (pts.length < 3) return;

    const W = 900, H = 380, pad = { l: 66, r: 26, t: 20, b: 50 };
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const xPad = (Math.max(...xs) - Math.min(...xs)) * 0.16 || 1;
    const yPad = (Math.max(...ys) - Math.min(...ys)) * 0.22 || 0.2;
    const X0 = Math.min(...xs) - xPad, X1 = Math.max(...xs) + xPad;
    const Y0 = Math.min(...ys) - yPad, Y1 = Math.max(...ys) + yPad;

    const sx = (v) => pad.l + ((v - X0) / (X1 - X0)) * (W - pad.l - pad.r);
    const sy = (v) => H - pad.b - ((v - Y0) / (Y1 - Y0)) * (H - pad.t - pad.b);

    const axis = el("g", { class: "axis" });
    for (const t of niceTicks(Y0, Y1, 4)) {
      axis.appendChild(el("line", { x1: pad.l, y1: sy(t), x2: W - pad.r, y2: sy(t) }));
      const lab = el("text", { x: pad.l - 9, y: sy(t) + 3.5, "text-anchor": "end" });
      lab.textContent = t.toFixed(1);
      axis.appendChild(lab);
    }
    for (const t of niceTicks(X0, X1, 5)) {
      const lab = el("text", { x: sx(t), y: H - 24, "text-anchor": "middle" });
      lab.textContent = t.toFixed(0) + "%";
      axis.appendChild(lab);
    }
    svg.appendChild(axis);

    if (Y0 < 0 && Y1 > 0) {
      svg.appendChild(el("line", { x1: pad.l, y1: sy(0), x2: W - pad.r, y2: sy(0), class: "zero-line" }));
    }
    if (X0 < 0 && X1 > 0) {
      svg.appendChild(el("line", { x1: sx(0), y1: pad.t, x2: sx(0), y2: H - pad.b, class: "zero-line" }));
    }

    const n = pts.length;
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = ys.reduce((a, b) => a + b, 0) / n;
    let sxx = 0, sxy = 0;
    for (let i = 0; i < n; i++) { sxx += (xs[i] - mx) ** 2; sxy += (xs[i] - mx) * (ys[i] - my); }
    const b = sxx ? sxy / sxx : 0;
    const a = my - b * mx;
    svg.appendChild(el("line", {
      x1: sx(X0), y1: sy(a + b * X0), x2: sx(X1), y2: sy(a + b * X1), class: "fit-line",
    }));

    for (const p of pts) {
      const dot = el("circle", {
        cx: sx(p.x), cy: sy(p.y),
        r: p.site.id === state.siteId ? 7 : (p.site.sample === "grid" ? 4.2 : 6),
        fill: p.y > 0 ? "#c9432f" : "#2f6fb5",
        class: "dot" + (p.site.id === state.siteId ? " sel" : ""),
        "fill-opacity": p.sig ? 0.95 : 0.42,
      });
      dot.setAttribute("aria-label", p.site.name);
      attachTip(dot,
        `<b>${p.site.name}</b><br>rain ${fmt(p.x, 1)} % \u00b7 temp ${fmt(p.y, 2)} \u00b0C per decade<br><span class="muted">temp p ${pLabel(p.site.series.t2m.p_value)} \u00b7 ${p.site.series.t2m.survives_fdr ? "survives FDR" : "raw p only"}</span>`);
      dot.addEventListener("click", () => select(p.site.id));
      svg.appendChild(dot);
      // Label the named sites only; grid points would turn this into a word cloud.
      if (p.site.sample !== "grid") {
        const label = el("text", { x: sx(p.x) + 8, y: sy(p.y) - 7, class: "dot-label" });
        label.textContent = p.site.name.split(",")[0];
        svg.appendChild(label);
      }
    }

    // The audit: the same correlation, computed three ways. The named sites are
    // ones we chose; the grid points we did not. If those disagree, the choice
    // was doing the work, not the climate.
    const rhoOf = (arr) => spearman(arr.map((p) => p.x), arr.map((p) => p.y));
    const named = pts.filter((p) => p.site.sample !== "grid");
    const grid = pts.filter((p) => p.site.sample === "grid");
    const rhoAll = rhoOf(pts);
    const rhoNamed = named.length > 2 ? rhoOf(named) : null;
    const rhoGrid = grid.length > 2 ? rhoOf(grid) : null;
    const fmtRho = (r) => (r === null ? "n/a" : r.toFixed(2));

    const yLab = el("text", { x: pad.l, y: 12, class: "annot" });
    yLab.textContent = "Temperature trend (°C per decade)";
    svg.appendChild(yLab);
    const xLab = el("text", { x: W - pad.r, y: H - 6, class: "annot", "text-anchor": "end" });
    xLab.textContent = "Precipitation trend (% per decade)";
    svg.appendChild(xLab);
    const annot = el("text", { x: pad.l + 8, y: pad.t + 16, class: "annot" });
    annot.textContent =
      `Spearman rho — named ${fmtRho(rhoNamed)} (n=${named.length}) · grid ${fmtRho(rhoGrid)} (n=${grid.length}) · all ${fmtRho(rhoAll)}`;
    svg.appendChild(annot);

    // The masthead strip has ids but no owner otherwise, so it would sit at "—" forever.
    const setAudit = (id, html) => {
      const node = $(id);
      if (node) node.innerHTML = html;
    };
    setAudit("audit-sites", `${n}`);
    setAudit("audit-split", `${named.length} named \u00b7 ${grid.length} grid`);
    setAudit("audit-tests", `${D.tests_total}`);
    setAudit("audit-fdr", `${D.tests_surviving} <span style="color:var(--muted)">of ${D.tests_significant}</span>`);
    setAudit("audit-rho", `named <b>${fmtRho(rhoNamed)}</b> \u00b7 grid <i>${fmtRho(rhoGrid)}</i>`);

    $("scatter-note").textContent =
      `One dot per site. ${named.length} named sites, ${grid.length} systematic grid points, the same ${D.end_year - D.start_year + 1} years. Faded dots: temperature trend not significant at 5%.`;
    $("fdr-chip").textContent =
      `${D.tests_surviving} of ${D.tests_total} trends survive FDR (q = ${D.fdr_q})`;

    // Masthead audit strip — always filled from the live data so it can never
    // go stale or disagree with the scatter.
    const strip = {
      sites: $("audit-sites"),
      split: $("audit-split"),
      tests: $("audit-tests"),
      fdr: $("audit-fdr"),
      rho: $("audit-rho"),
    };
    if (strip.rho) {
      strip.sites.textContent = String(D.sites.length);
      strip.split.textContent = `${named.length} named · ${grid.length} grid`;
      strip.tests.textContent = String(D.tests_total);
      strip.fdr.textContent = `${D.tests_surviving} of ${D.tests_total}`;
      strip.rho.innerHTML =
        `named <b>${fmtRho(rhoNamed)}</b> (n=${named.length}) → grid <i>${fmtRho(rhoGrid)}</i> (n=${grid.length})`;
    }

    const collapse = rhoNamed !== null && rhoGrid !== null &&
      Math.abs(rhoNamed) > 0.35 && Math.abs(rhoGrid) < 0.25;
    $("scatter-reading").textContent = collapse
      ? `We found this relationship in the ${named.length} named sites: rho = ${fmtRho(rhoNamed)}. On the ${grid.length} grid points nobody chose, it is ${fmtRho(rhoGrid)}. That is what selection looks like — the pattern was in our choice of places, not in the planet. We report the audit instead of the headline.`
      : Math.abs(rhoAll) > 0.35
        ? `Across ${n} sites, rainfall trend and temperature trend move in opposite directions (Spearman rho = ${fmtRho(rhoAll)}), and the relationship holds in both subsets — so it is not just where we looked.`
        : `Across ${n} sites, rainfall trend and temperature trend are not strongly associated (Spearman rho = ${fmtRho(rhoAll)}). Report that null rather than reaching for a story.`;
  }

  // ---------------------------------------------------------------------- map
  function drawMap() {
    const svg = $("map");
    svg.innerHTML = "";

    // graticule
    for (let lon = -180; lon <= 180; lon += 60) {
      svg.appendChild(el("line", { x1: lon, y1: -90, x2: lon, y2: 90, class: "grid-line" }));
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      svg.appendChild(el("line", { x1: -180, y1: -lat, x2: 180, y2: -lat, class: "grid-line" }));
    }

    // land
    for (const ring of WORLD.rings) {
      const d = ring
        .map((p, i) => `${i ? "L" : "M"}${p[0]},${-p[1]}`)
        .join(" ") + " Z";
      svg.appendChild(el("path", { d, class: "land" }));
    }

    // sites -- colour on the same measure the ranking uses
    const measure = (s) =>
      relIsMeaningful(state.variable) ? s.rel_pct_per_decade : perDecade(s);
    const maxAbs = Math.max(
      ...D.sites.map((s) => Math.abs(measure(s.series[state.variable]) || 0)),
      0.0001
    );

    for (const site of D.sites) {
      const series = site.series[state.variable];
      const slope = measure(series);
      const dot = el("circle", {
        cx: site.lon,
        cy: -site.lat,
        r: 2.5,
        fill: colorFor(slope, maxAbs),
        class: "site-dot" + (site.id === state.siteId ? " sel" : ""),
        "fill-opacity": significant(series) ? 1 : 0.32,
      });
      dot.setAttribute("aria-label", site.name);
      attachTip(dot,
        `<b>${site.name}</b><br>${fmt(slope, 2)} ${relIsMeaningful(state.variable) ? "%" : deltaUnit(state.variable)} per decade \u00b7 p ${pLabel(series.p_value)}<br><span class="muted">${series.survives_fdr ? "survives FDR" : significant(series) ? "raw p only" : "not significant"}</span>`);
      dot.addEventListener("click", () => select(site.id));
      svg.appendChild(dot);
    }

    // legend
    const legend = $("legend");
    const unitLabel = relIsMeaningful(state.variable)
      ? "% per decade"
      : `${deltaUnit(state.variable)} per decade`;
    legend.innerHTML = `
      <span>${fmt(-maxAbs, 2)}</span>
      <span class="bar" style="background:linear-gradient(90deg,${colorFor(-maxAbs, maxAbs)},${colorFor(-maxAbs / 2, maxAbs)},${colorFor(0, maxAbs)},${colorFor(maxAbs / 2, maxAbs)},${colorFor(maxAbs, maxAbs)})"></span>
      <span>${fmt(maxAbs, 2)} ${unitLabel}</span>`;
  }

  // -------------------------------------------------------------------- chart
  function niceTicks(min, max, count) {
    const span = (max - min) || 1;
    const raw = span / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || mag * 10;
    const ticks = [];
    for (let v = Math.ceil(min / step) * step; v <= max + step * 0.001; v += step) {
      ticks.push(Number(v.toFixed(6)));
    }
    return ticks;
  }

  function drawChart(site) {
    const series = site.series[state.variable];
    const svg = $("chart");
    const W = 760, H = 300;
    const pad = { l: 58, r: 18, t: 14, b: 34 };
    svg.innerHTML = "";
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

    const years = series.years;
    const values = series.values;
    const x0 = years[0], x1 = years[years.length - 1];

    const senStart = series.sen_intercept + series.slope_per_year * x0;
    const senEnd = series.sen_intercept + series.slope_per_year * x1;

    let lo = Math.min(...values, senStart, senEnd);
    let hi = Math.max(...values, senStart, senEnd);
    const padY = (hi - lo || 1) * 0.12;
    lo -= padY; hi += padY;

    const sx = (v) => pad.l + ((v - x0) / (x1 - x0 || 1)) * (W - pad.l - pad.r);
    const sy = (v) => H - pad.b - ((v - lo) / (hi - lo || 1)) * (H - pad.t - pad.b);

    // axes
    const axis = el("g", { class: "axis" });
    for (const tick of niceTicks(lo, hi, 4)) {
      axis.appendChild(el("line", { x1: pad.l, y1: sy(tick), x2: W - pad.r, y2: sy(tick) }));
      const label = el("text", { x: pad.l - 9, y: sy(tick) + 3.5, "text-anchor": "end" });
      label.textContent = tick.toFixed(1);
      axis.appendChild(label);
    }
    const yearTicks = [];
    const start = Math.ceil(x0 / 5) * 5;
    for (let y = start; y <= x1; y += 5) yearTicks.push(y);
    if (!yearTicks.includes(x1)) yearTicks.push(x1);
    for (const y of yearTicks) {
      const label = el("text", { x: sx(y), y: H - 12, "text-anchor": "middle" });
      label.textContent = y;
      axis.appendChild(label);
    }
    svg.appendChild(axis);

    // annual series
    svg.appendChild(el("path", {
      d: values.map((v, i) => `${i ? "L" : "M"}${sx(years[i])},${sy(v)}`).join(" "),
      class: "series-line",
    }));

    const dots = el("g", { class: "series-dots" });
    values.forEach((v, i) => dots.appendChild(el("circle", { cx: sx(years[i]), cy: sy(v), r: 1.7 })));
    svg.appendChild(dots);

    // Sen's slope
    svg.appendChild(el("line", {
      x1: sx(x0), y1: sy(senStart), x2: sx(x1), y2: sy(senEnd), class: "sen-line",
    }));

    // axis unit
    const unit = el("text", { x: pad.l, y: 10, class: "axis" });
    unit.setAttribute("fill", "#64798c");
    unit.setAttribute("font-size", "10.5");
    unit.textContent = `${D.variables[state.variable].label} (${units(state.variable)})`;
    svg.appendChild(unit);
  }

  // ------------------------------------------------------------------- detail
  function drawDetail(site) {
    const series = site.series[state.variable];
    const unit = units(state.variable);
    const slope = perDecade(series);
    const sig = significant(series);
    const pText = series.p_value < 0.001 ? "< 0.001" : series.p_value.toFixed(3);

    $("site-name").textContent = site.name;
    $("site-meta").textContent = `${site.region} · ${site.lat.toFixed(2)}°, ${site.lon.toFixed(2)}° · ${series.n} complete years`;

    const verdict = $("verdict");
    verdict.textContent = series.survives_fdr
      ? "significant · survives FDR"
      : sig ? "significant · raw p only" : "not significant";
    verdict.className = "verdict" + (series.survives_fdr ? " yes" : "");

    const rel = relIsMeaningful(state.variable) ? series.rel_pct_per_decade : null;
    $("stats").innerHTML = `
      <div class="stat"><div class="k">Sen's slope</div>
        <div class="v">${fmt(slope, 2)}<small>${deltaUnit(state.variable)} / decade</small></div></div>
      <div class="stat"><div class="k">Relative trend</div>
        <div class="v">${rel === null ? "n/a" : fmt(rel, 1) + "<small>% / decade</small>"}${rel === null ? "<small>ratio scale only</small>" : ""}</div></div>
      <div class="stat"><div class="k">Mann–Kendall p</div>
        <div class="v">${pText}</div></div>
      <div class="stat"><div class="k">First → last decade</div>
        <div class="v">${fmt(series.decade_delta, 1)}<small>${deltaUnit(state.variable)}</small></div></div>`;

    drawChart(site);

    const direction = slope > 0 ? "rising" : "falling";
    const magnitude = Math.abs(slope);
    const grade = magnitude < 0.05 ? "essentially flat" : `about ${magnitude.toFixed(2)} ${unit} per decade`;

    $("reading").textContent = sig
      ? `${site.name} is ${direction} at ${grade}. Under the Mann–Kendall test (p = ${pText}) a change this consistent is unlikely to be chance, and the first decade averaged ${series.first_decade.toFixed(1)} ${unit} against ${series.last_decade.toFixed(1)} ${unit} in the last. ${site.note}`
      : `${site.name} shows no trend that this test separates from chance (p = ${pText}); the fitted slope is ${grade}. ${site.note} Note the difference between "no evidence of a trend" and "evidence of no trend" — 35 years of one modelled grid cell is not enough for the second claim.`;
  }

  // -------------------------------------------------------------------- table
  function drawTable() {
    const variable = state.variable;
    const rows = [...D.sites].sort(
      (a, b) => comparable(b.series[variable], variable) - comparable(a.series[variable], variable)
    );
    $("table-note").textContent =
      `${shortName(variable)} · sorted by absolute ${relIsMeaningful(variable) ? "percentage " : ""}change per decade · n = ${D.sites.length} sites`;

    $("rows").innerHTML = "";
    for (const site of rows) {
      const series = site.series[variable];
      const sig = significant(series);
      const survives = Boolean(series.survives_fdr);
      const tr = document.createElement("tr");
      if (site.id === state.siteId) tr.className = "sel";
      const perDecadeCell = relIsMeaningful(variable)
        ? `${fmt(perDecade(series), 1)} <span style="color:var(--muted)">mm (${fmt(series.rel_pct_per_decade, 1)}%)</span>`
        : `${fmt(perDecade(series), 2)} <span style="color:var(--muted)">${deltaUnit(variable)}</span>`;
      tr.innerHTML = `
        <td>${site.name}</td>
        <td style="color:var(--muted)">${site.region}</td>
        <td class="num">${perDecadeCell}</td>
        <td class="num">${fmt(series.decade_delta, 1)} <span style="color:var(--muted)">${deltaUnit(variable)}</span></td>
        <td class="num">${pLabel(series.p_value)}</td>
        <td><span class="tag${survives ? " yes" : ""}">${survives ? "survives FDR" : sig ? "raw p only" : "not significant"}</span></td>`;
      tr.addEventListener("click", () => select(site.id));
      $("rows").appendChild(tr);
    }
  }

  // ------------------------------------------------------------------- wiring
  function render() {
    const site = D.sites.find((s) => s.id === state.siteId) || D.sites[0];
    drawScatter();
    drawMap();
    drawDetail(site);
    drawTable();
  }

  function select(id) {
    state.siteId = id;
    render();
  }

  for (const button of document.querySelectorAll("#variable-toggle button")) {
    button.addEventListener("click", () => {
      state.variable = button.dataset.variable;
      for (const other of document.querySelectorAll("#variable-toggle button")) {
        other.classList.toggle("on", other === button);
      }
      render();
    });
  }

  $("range-chip").textContent = `${D.start_year}–${D.end_year}`;
  render();
})();
