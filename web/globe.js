/* Trend Detective — the globe.
 *
 * One fixed full-screen WebGL canvas behind the page. A single fragment shader
 * draws the Earth (NASA Blue Marble by day, Black Marble by night), its
 * atmosphere and a star field; no mesh, no library. A 2D canvas above it draws
 * the 40 sites. Each page section carries a `data-globe` attribute saying where
 * the globe should be while that section is on screen, and the globe eases
 * there as you scroll. In the explorer it follows the pointer instead.
 *
 * Decoration with one job: if WebGL is missing the page falls back to the flat
 * map and nothing else changes.
 */
(() => {
  "use strict";

  const canvas = document.getElementById("globe");
  const pinCanvas = document.getElementById("pins");
  if (!canvas || !pinCanvas) return;

  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
  if (!gl) { document.documentElement.classList.add("no-gl"); return; }
  document.documentElement.classList.add("has-gl");

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const RAD = Math.PI / 180;

  // ------------------------------------------------------------------ shader
  const VS = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }";
  const FS = `
precision highp float;
uniform vec2 uC; uniform float uR, uDim, uTime, uNightOnly;
uniform mat3 uM; uniform vec3 uSun; uniform sampler2D uDay, uNight;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec2 fc = gl_FragCoord.xy;
  vec2 p = (fc - uC) / uR;
  float d = length(p);
  vec3 col = vec3(0.010, 0.014, 0.026);
  vec2 g = floor(fc / 2.5);
  float h = hash(g);
  float star = step(0.9982, h) * (0.3 + 0.7 * hash(g + 7.3)) * (0.75 + 0.25 * sin(uTime * 1.3 + h * 97.0));
  col += vec3(0.85, 0.9, 1.0) * star;
  float lim = dot(normalize(vec3(p, 0.35)), uSun);
  float side = smoothstep(-0.55, 0.75, lim);
  if (d > 1.0) {
    float a = exp(-(d - 1.0) * 11.0);
    col = col * (1.0 - a * 0.9) + vec3(0.30, 0.56, 1.0) * a * (0.10 + 0.95 * side);
    col += vec3(0.30, 0.56, 1.0) * exp(-(d - 1.0) * 2.4) * 0.07 * side;
  } else {
    vec3 n = vec3(p, sqrt(1.0 - d * d));
    vec3 e = uM * n;
    vec2 uv = vec2(atan(e.x, e.z) / 6.28318530718 + 0.5, 0.5 - asin(clamp(e.y, -1.0, 1.0)) / 3.14159265359);
    vec3 day = texture2D(uDay, uv).rgb;
    vec3 night = texture2D(uNight, uv).rgb;
    float l = dot(n, uSun);
    float dl = smoothstep(-0.16, 0.36, l) * (1.0 - uNightOnly);
    day = mix(vec3(dot(day, vec3(0.3, 0.59, 0.11))), day, 1.12);
    vec3 c = day * (0.035 + 1.18 * dl);
    c += night * night * vec3(1.0, 0.82, 0.55) * 2.3 * (1.0 - dl);
    float spec = pow(max(dot(reflect(-uSun, n), vec3(0., 0., 1.)), 0.0), 34.0);
    c += vec3(1.0, 0.95, 0.85) * spec * 0.22 * dl * step(day.r + day.g, day.b * 1.9);
    float f = pow(1.0 - n.z, 2.7);
    c += vec3(0.28, 0.54, 1.0) * f * (0.10 + 1.05 * dl);
    float edge = smoothstep(1.0, 1.0 - 2.0 / uR, d);
    vec3 outside = col + vec3(0.30, 0.56, 1.0) * (0.10 + 0.95 * side);
    col = mix(outside, c, edge);
  }
  col *= (1.0 - uDim);
  gl_FragColor = vec4(col, 1.0);
}`;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    document.documentElement.classList.remove("has-gl");
    document.documentElement.classList.add("no-gl");
    return;
  }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  for (const n of ["uC", "uR", "uDim", "uTime", "uM", "uSun", "uDay", "uNight", "uNightOnly"]) U[n] = gl.getUniformLocation(prog, n);

  // ---------------------------------------------------------------- textures
  const makeTex = (unit, source) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
    return t;
  };
  // Until (or unless) the imagery arrives: land drawn from the Natural Earth outline.
  const drawn = (night) => {
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 512;
    const x = c.getContext("2d");
    x.fillStyle = night ? "#000" : "#0a1626"; x.fillRect(0, 0, 1024, 512);
    if (!night && window.WORLD) {
      x.fillStyle = "#24384a";
      for (const ring of window.WORLD.rings) {
        x.beginPath();
        ring.forEach((p, i) => { const px = (p[0] + 180) / 360 * 1024, py = (90 - p[1]) / 180 * 512; i ? x.lineTo(px, py) : x.moveTo(px, py); });
        x.closePath(); x.fill();
      }
    }
    return c;
  };
  makeTex(0, drawn(false));
  makeTex(1, drawn(true));
  gl.uniform1i(U.uDay, 0);
  gl.uniform1i(U.uNight, 1);
  const SRC = window.EARTH_TEX || {};
  const load = (unit, src) => {
    if (!src) return;
    const img = new Image();
    img.onload = () => { try { makeTex(unit, img); canvas.classList.add("tex"); } catch (e) { /* keep the drawn land */ } };
    img.src = src;
  };
  load(0, SRC.day);
  load(1, SRC.night);

  // ------------------------------------------------------------------- state
  let W = 0, H = 0, dpr = 1;
  const pctx = pinCanvas.getContext("2d");
  const resize = () => {
    W = innerWidth; H = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, W * H > 2.2e6 ? 1.25 : 1.75);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    const pd = Math.min(devicePixelRatio || 1, 2);
    pinCanvas.width = Math.round(W * pd); pinCanvas.height = Math.round(H * pd);
    pctx.setTransform(pd, 0, 0, pd, 0, 0);
  };
  resize();
  addEventListener("resize", resize);

  // Section configs: data-globe="lon:90;lat:24;r:.9;x:.7;y:.5;dim:0;pins:all;spin:1;focus:dhaka"
  const parse = (node) => {
    const o = { lon: 20, lat: 15, r: 0.5, x: 0.7, y: 0.5, dim: 0, pins: 1, spin: 0, focus: "", anchor: "", mode: "story" };
    for (const part of (node.dataset.globe || "").split(";")) {
      const i = part.indexOf(":");
      if (i < 0) continue;
      const k = part.slice(0, i).trim(), v = part.slice(i + 1).trim();
      o[k] = k === "focus" || k === "anchor" || k === "mode" ? v : Number(v);
    }
    if (node.dataset.globeM) {
      o.m = {};
      for (const part of node.dataset.globeM.split(";")) {
        const i = part.indexOf(":");
        if (i > 0) o.m[part.slice(0, i).trim()] = Number(part.slice(i + 1));
      }
    }
    o.node = node;
    return o;
  };
  const sections = [...document.querySelectorAll("[data-globe]")].map(parse);
  if (!sections.length) return;

  const cur = { lon: sections[0].lon - 50, lat: sections[0].lat, r: 0.2, x: sections[0].x, y: sections[0].y, dim: 1, pins: 0, focus: 0, explore: 0 };
  let active = sections[0];
  let spinLon = 0;
  const user = { lon: 20, lat: 15, dragging: false, moved: false, px: 0, py: 0, vx: 0 };
  let pins = [], selected = "", hover = "";
  let projected = [];
  const lifts = {};

  const activeSection = () => {
    const line = H * 0.55;
    let best = sections[0];
    for (const s of sections) {
      const r = s.node.getBoundingClientRect();
      if (r.top <= line) best = s;
    }
    return best;
  };

  // Shortest way round for longitudes.
  const wrap = (d) => ((d + 540) % 360) - 180;

  // --------------------------------------------------------- explorer input
  const stage = document.getElementById("stage");
  const label = document.getElementById("pin-label");
  const nearest = (cx, cy, reach) => {
    let best = null, bd = reach * reach;
    for (const p of projected) {
      if (p.z < 0.08) continue;
      const d = (p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy);
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  };
  if (stage) {
    stage.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button, a, .map-wrap")) return;
      user.dragging = true; user.moved = false; user.px = e.clientX; user.py = e.clientY; user.vx = 0;
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("grabbing");
    });
    stage.addEventListener("pointermove", (e) => {
      if (user.dragging) {
        const dx = e.clientX - user.px, dy = e.clientY - user.py;
        if (Math.abs(dx) + Math.abs(dy) > 3) user.moved = true;
        const k = 60 / Math.max(120, cur.r);            // degrees per pixel at the sub-point
        user.lon = wrap(user.lon - dx * k);
        user.lat = Math.max(-80, Math.min(80, user.lat + dy * k));
        user.vx = -dx * k;
        user.px = e.clientX; user.py = e.clientY;
        return;
      }
      const hit = nearest(e.clientX, e.clientY, 18);
      hover = hit ? hit.id : "";
      stage.classList.toggle("over-pin", Boolean(hit));
    });
    const up = (e) => {
      if (!user.dragging) return;
      user.dragging = false;
      stage.classList.remove("grabbing");
      if (!user.moved) {
        const hit = nearest(e.clientX, e.clientY, 22);
        if (hit && window.TD) window.TD.select(hit.id);
      }
    };
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", () => { user.dragging = false; stage.classList.remove("grabbing"); });
    stage.addEventListener("pointerleave", () => { if (!user.dragging) { hover = ""; stage.classList.remove("over-pin"); } });
    stage.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 30 : 10;
      if (e.key === "ArrowLeft") user.lon = wrap(user.lon - step);
      else if (e.key === "ArrowRight") user.lon = wrap(user.lon + step);
      else if (e.key === "ArrowUp") user.lat = Math.min(80, user.lat + step);
      else if (e.key === "ArrowDown") user.lat = Math.max(-80, user.lat - step);
      else return;
      e.preventDefault();
    });
  }

  // Outside the explorer the pins sit behind the page, so the page listens for them:
  // hover names the place, a click opens it in the explorer.
  const BUSY = "a, button, input, select, textarea, label, table, svg, .card, .topbar, #stage";
  const free = (e) => !(e.target instanceof Element) || !e.target.closest(BUSY);
  const pinsLive = () => cur.pins > 0.6 && cur.dim < 0.5;
  // Dragging the planet itself, in the story chapters. Only from empty space (never from text,
  // buttons or panels) and only with a mouse or pen, so touch scrolling is left alone. The turn
  // is an offset from where the chapter wants the globe; it eases away when the chapter changes.
  const off = { lon: 0, lat: 0, dragging: false, moved: false, px: 0, py: 0, releasing: false };
  const onGlobe = (e) => Math.hypot(e.clientX - cur.x, e.clientY - cur.y) < cur.r;
  // "Empty" means no control or panel under the pointer and no actual letters: a headline's box
  // is as wide as the page, but only its words should block a grab.
  const overText = (el, x, y) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = walker.nextNode(), n = 0; node && n < 400; node = walker.nextNode(), n++) {
      if (!node.nodeValue.trim()) continue;
      range.selectNodeContents(node);
      for (const r of range.getClientRects()) {
        if (x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 4 && y <= r.bottom + 4) return true;
      }
    }
    return false;
  };
  const empty = (e) => {
    const el = e.target;
    if (!(el instanceof Element) || el.closest(BUSY + ", img, .official-logo")) return false;
    if (el.matches(".chapter, .chapter-body, footer, body, html")) return true;
    return !overText(el, e.clientX, e.clientY);
  };
  let suppressClick = false;
  addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.pointerType === "touch" || !empty(e) || !onGlobe(e) || cur.dim > 0.5 || cur.explore > 0.5) return;
    off.dragging = true; off.moved = false; off.releasing = false; off.px = e.clientX; off.py = e.clientY;
    document.documentElement.classList.add("globe-drag");
  });
  addEventListener("pointerup", () => {
    if (!off.dragging) return;
    off.dragging = false;
    suppressClick = off.moved;
    document.documentElement.classList.remove("globe-drag");
  });
  addEventListener("pointercancel", () => { off.dragging = false; document.documentElement.classList.remove("globe-drag"); });

  addEventListener("pointermove", (e) => {
    if (off.dragging) {
      const dx = e.clientX - off.px, dy = e.clientY - off.py;
      if (Math.abs(dx) + Math.abs(dy) > 3) off.moved = true;
      const k = 60 / Math.max(120, cur.r);
      off.lon = wrap(off.lon - dx * k);
      off.lat = Math.max(-150, Math.min(150, off.lat + dy * k));
      off.px = e.clientX; off.py = e.clientY;
      hover = "";
      return;
    }
    if (e.target instanceof Element && e.target.closest("#stage")) return;      // the stage handles its own
    const hit = e.pointerType !== "touch" && free(e) && pinsLive() ? nearest(e.clientX, e.clientY, 20) : null;
    hover = hit ? hit.id : "";
    document.documentElement.classList.toggle("pin-hover", Boolean(hit));
    document.documentElement.classList.toggle("globe-grab", !hit && e.pointerType !== "touch" && empty(e) && onGlobe(e) && cur.dim < 0.5 && cur.explore < 0.5);
  }, { passive: true });
  addEventListener("click", (e) => {
    if (e.target instanceof Element && e.target.closest("#stage")) return;
    if (suppressClick) { suppressClick = false; return; }                       // that was the end of a drag
    if (!free(e) || !pinsLive() || String(getSelection()) !== "") return;
    const hit = nearest(e.clientX, e.clientY, 24) || (hover ? { id: hover } : null);
    if (!hit || !window.TD) return;
    window.TD.select(hit.id);
    const dest = document.getElementById("map-section");
    if (dest) {
      const y = dest.getBoundingClientRect().top + scrollY;
      if (window.smoothScrollTo) window.smoothScrollTo(y); else scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    }
  });

  // app.js tells us what the sites look like right now.
  document.addEventListener("td:state", (e) => {
    const d = e.detail;
    pins = d.pins;
    if (d.selected !== selected) {
      selected = d.selected;
      const p = pins.find((q) => q.id === selected);
      if (p) { user.lon = p.lon; user.lat = Math.max(-60, Math.min(60, p.lat)); }
    }
  });
  if (window.TD && window.TD.snapshot) document.dispatchEvent(new CustomEvent("td:state", { detail: window.TD.snapshot() }));

  // -------------------------------------------------------------------- loop
  let last = 0, visible = true, lastVeil = "";
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; if (visible) requestAnimationFrame(frame); });

  function frame(now) {
    if (!visible) return;
    const dt = last ? Math.min(50, now - last) : 16.7;
    last = now;
    const k = reduce ? 1 : 1 - Math.pow(1 - 0.065, dt / 16.7);
    const kFast = reduce ? 1 : 1 - Math.pow(1 - 0.22, dt / 16.7);

    const was = active;
    active = activeSection();
    if (active !== was && !off.dragging) off.releasing = true;                  // new chapter: give the globe back to the story
    if (off.releasing) {
      off.lon += -off.lon * k * 1.4; off.lat += -off.lat * k * 1.4;
      if (Math.abs(off.lon) + Math.abs(off.lat) < 0.05) { off.lon = off.lat = 0; off.releasing = false; }
    }
    const narrow = W < 860;
    const cfg = narrow && active.m ? Object.assign({}, active, active.m) : active;
    const unit = Math.min(W, H);
    let tx = cfg.x * W, ty = cfg.y * H, tr = cfg.r * unit;
    let anchored = false;
    if (cfg.anchor) {
      const a = document.querySelector(cfg.anchor);
      const flat = document.documentElement.classList.contains("flat-map");
      if (a && !flat) {
        const r = a.getBoundingClientRect();
        tx = r.left + r.width / 2; ty = r.top + r.height / 2;
        tr = Math.min(r.width, r.height) * 0.44;
        anchored = true;
      }
    }
    const explore = cfg.mode === "explore";
    if (cfg.spin && !reduce && !hover && !off.dragging) spinLon += dt * 0.0022 * cfg.spin;   // hold still while a pin is under the pointer
    if (explore && !user.dragging && Math.abs(user.vx) > 0.01) { user.lon = wrap(user.lon + user.vx); user.vx *= 0.93; }
    const tLon = explore ? user.lon : cfg.lon + spinLon + off.lon;
    const tLat = explore ? user.lat : Math.max(-85, Math.min(85, cfg.lat + off.lat));

    const held = (explore && user.dragging) || off.dragging;
    cur.lon += wrap(tLon - cur.lon) * (held ? 1 : k * 1.2);
    cur.lat += (tLat - cur.lat) * (held ? 1 : k * 1.2);
    cur.r += (tr - cur.r) * k;
    cur.x += (tx - cur.x) * (anchored && Math.abs(tr - cur.r) < 12 ? kFast * 2.2 : k);
    cur.y += (ty - cur.y) * (anchored && Math.abs(tr - cur.r) < 12 ? kFast * 2.2 : k);
    const flatNow = explore && document.documentElement.classList.contains("flat-map");
    cur.dim += ((flatNow ? 0.86 : cfg.dim) - cur.dim) * k;
    cur.pins += ((flatNow ? 0 : cfg.pins) - cur.pins) * k;
    cur.focus += ((cfg.focus ? 1 : 0) - cur.focus) * k;
    cur.explore += ((explore ? 1 : 0) - cur.explore) * k;

    // Earth -> view: tilt(lat) * turn(-lon). Uploaded row-major, so the shader gets its transpose (view -> Earth).
    const la = cur.lat * RAD, lo = -cur.lon * RAD;
    const cl = Math.cos(lo), sl = Math.sin(lo), ca = Math.cos(la), sa = Math.sin(la);
    const V = [
      cl, 0, sl,
      sa * sl, ca, -sa * cl,
      -ca * sl, sa, ca * cl,
    ];
    gl.uniformMatrix3fv(U.uM, false, new Float32Array(V));
    gl.uniform2f(U.uC, cur.x * dpr, (H - cur.y) * dpr);
    gl.uniform1f(U.uR, Math.max(1, cur.r * dpr));
    gl.uniform1f(U.uDim, cur.dim);
    gl.uniform1f(U.uTime, now / 1000);
    gl.uniform1f(U.uNightOnly, 0);
    gl.uniform3f(U.uSun, -0.58, 0.30, 0.757);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // The reading shade lifts where the globe is the subject.
    const veil = (1 - cur.explore).toFixed(2);
    if (veil !== lastVeil) { lastVeil = veil; document.documentElement.style.setProperty("--veil", veil); }

    // ---- sites
    pctx.clearRect(0, 0, W, H);
    projected = [];
    const alphaAll = cur.pins * (1 - cur.dim * 0.9);
    let labelPin = null;
    if (alphaAll > 0.01) {
      const scale = Math.max(0.8, Math.min(1.45, cur.r / 340));
      const draw = [];
      for (const p of pins) {
        const phi = p.lat * RAD, lam = p.lon * RAD;
        const ex = Math.cos(phi) * Math.sin(lam), ey = Math.sin(phi), ez = Math.cos(phi) * Math.cos(lam);
        const vx = V[0] * ex + V[1] * ey + V[2] * ez;
        const vy = V[3] * ex + V[4] * ey + V[5] * ez;
        const vz = V[6] * ex + V[7] * ey + V[8] * ez;
        if (vz < 0.02) continue;
        const sx = cur.x + cur.r * vx, sy = cur.y - cur.r * vy;
        const isFocus = Boolean(cfg.focus) && p.id === cfg.focus;
        const isSel = cur.explore > 0.5 && p.id === selected;
        const isHover = p.id === hover;
        // A pin rises a little when it is the subject: hovered, selected, or the chapter's focus.
        const want = isHover ? 1 : isSel || (isFocus && cur.focus > 0.5) ? 0.7 : 0;
        const lift = lifts[p.id] = (lifts[p.id] || 0) + (want - (lifts[p.id] || 0)) * kFast;
        const R = (p.named ? 7 : 5) * scale * (1 + 0.42 * lift);      // head radius
        const h = R * 3.05;                                           // tip to top of head
        const limb = Math.min(1, vz / 0.25);
        let a = alphaAll * limb;
        if (cur.focus > 0.02 && !isFocus) a *= 1 - 0.7 * cur.focus;
        projected.push({ id: p.id, x: sx, y: sy - h + R, z: vz, name: p.name });
        draw.push({ p, sx, sy, R, h, a, lift, isSel, isHover, isFocus });
      }
      draw.sort((m, n) => m.sy - n.sy);                               // nearer the bottom of the screen draws on top
      for (const d of draw) {
        const { p, sx, sy, R, h } = d;
        const top = sy - h, cy = top + R;
        const explore = cur.explore > 0.5;
        const fill = explore ? p.color : (p.named ? "rgb(255,107,74)" : "rgb(244,246,251)");
        const a = d.a * (explore && !p.sig && !d.isSel && !d.isHover ? 0.6 : 1);
        // shadow where the pin touches the ground
        pctx.globalAlpha = a * 0.5;
        pctx.fillStyle = "#04060b";
        pctx.beginPath(); pctx.ellipse(sx, sy + 1, R * 0.62, R * 0.24, 0, 0, 6.2832); pctx.fill();
        // the pin: a round head tapering to a point on the site
        pctx.globalAlpha = a;
        pctx.beginPath();
        pctx.moveTo(sx, sy);
        pctx.bezierCurveTo(sx - R * 0.42, sy - h * 0.40, sx - R, cy + R * 0.95, sx - R, cy);
        pctx.arc(sx, cy, R, Math.PI, 0);
        pctx.bezierCurveTo(sx + R, cy + R * 0.95, sx + R * 0.42, sy - h * 0.40, sx, sy);
        pctx.closePath();
        pctx.fillStyle = fill;
        pctx.fill();
        pctx.lineWidth = d.isSel || d.isHover ? 2 : 1.3;
        pctx.strokeStyle = d.isSel || d.isHover ? "#ffffff" : "rgba(4,6,11,.8)";
        pctx.stroke();
        // the eye of the pin
        pctx.fillStyle = p.named || explore ? "rgba(255,255,255,.95)" : "rgba(4,6,11,.78)";
        pctx.beginPath(); pctx.arc(sx, cy, R * 0.36, 0, 6.2832); pctx.fill();
        if ((d.isFocus && cur.focus > 0.5) || d.isHover || (d.isSel && !hover)) {
          labelPin = { x: sx + R, y: top, name: p.name, lat: p.lat, lon: p.lon, a: d.a };
        }
      }
      pctx.globalAlpha = 1;
    }
    if (label) {
      if (labelPin && labelPin.a > 0.3) {
        const ns = labelPin.lat >= 0 ? "N" : "S", ew = labelPin.lon >= 0 ? "E" : "W";
        const text = `${labelPin.name} · ${Math.abs(labelPin.lat).toFixed(1)}°${ns} ${Math.abs(labelPin.lon).toFixed(1)}°${ew}`;
        if (label.textContent !== text) label.textContent = text;
        label.style.transform = `translate(${Math.round(labelPin.x + 10)}px, ${Math.round(labelPin.y - 14)}px)`;
        label.classList.add("on");
      } else label.classList.remove("on");
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // For the film and for tests: put the globe somewhere exactly.
  window.GLOBE = { cur, user, get projected() { return projected; } };
})();
