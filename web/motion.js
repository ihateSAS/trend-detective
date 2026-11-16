/* Trend Detective — page motion.
 *
 * Smooth wheel scrolling, a scroll-progress line, section reveals and the
 * count-up in the number strip. Everything here is decoration: with reduced
 * motion, a touch screen, or this file missing, the page works the same.
 */
(() => {
  "use strict";

  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const bar = document.querySelector(".topbar");
  const progress = document.querySelector(".progress");
  const maxScroll = () => root.scrollHeight - innerHeight;
  const clamp = (y) => Math.max(0, Math.min(maxScroll(), y));

  // ------------------------------------------------------------ smooth scroll
  // The wheel sets a target; each frame the page eases a fraction of the way
  // there. Keyboard, scrollbar and touch scrolling stay native.
  if (!reduce && finePointer) {
    root.style.scrollBehavior = "auto";
    let target = scrollY, current = scrollY, running = false, last = 0;

    const frame = (now) => {
      const dt = last ? Math.min(64, now - last) : 16.7;
      last = now;
      current += (target - current) * (1 - Math.pow(1 - 0.12, dt / 16.7));
      if (Math.abs(target - current) < 0.4) { current = target; running = false; last = 0; }
      scrollTo(0, current);
      if (running) requestAnimationFrame(frame);
    };
    const start = () => {
      if (running) return;
      running = true;
      current = scrollY;
      requestAnimationFrame(frame);
    };

    // Let an inner element scroll first if it can (none today, but cheap to respect).
    const innerCanScroll = (node, dy) => {
      for (; node && node !== document.body; node = node.parentElement) {
        const s = getComputedStyle(node);
        if (!/(auto|scroll)/.test(s.overflowY) || node.scrollHeight <= node.clientHeight) continue;
        if (dy > 0 ? node.scrollTop + node.clientHeight < node.scrollHeight - 1 : node.scrollTop > 0) return true;
      }
      return false;
    };

    addEventListener("wheel", (e) => {
      if (e.ctrlKey || e.defaultPrevented) return;                  // pinch-zoom
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;          // sideways: table scroll
      if (innerCanScroll(e.target, e.deltaY)) return;
      const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1;
      e.preventDefault();
      if (!running) target = scrollY;
      target = clamp(target + e.deltaY * unit);
      start();
    }, { passive: false });

    // Native scrolling (keys, scrollbar) moves the page under us: follow it.
    addEventListener("scroll", () => { if (!running) target = current = scrollY; }, { passive: true });

    window.smoothScrollTo = (y) => { target = clamp(y); start(); };

    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const id = a.getAttribute("href").slice(1);
      const node = id ? document.getElementById(id) : null;
      if (id && !node) return;
      e.preventDefault();
      window.smoothScrollTo(node ? node.getBoundingClientRect().top + scrollY - 72 : 0);
      history.replaceState(null, "", id ? `#${id}` : location.pathname);
    });
  }

  // ------------------------------------------------- top bar + progress line
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (bar) bar.classList.toggle("scrolled", scrollY > 40);
      if (progress) progress.style.transform = `scaleX(${maxScroll() > 0 ? scrollY / maxScroll() : 0})`;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  // ------------------------------------------------------- reveal on scroll
  const reveals = document.querySelectorAll(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    root.classList.add("js-reveal");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
    // Fail open: if the observer never fires (background tab, print), show everything.
    setTimeout(() => reveals.forEach((el) => el.classList.add("in")), 4000);
  }

  // ------------------------------------------------- chapters fade in as a group
  const chapters = document.querySelectorAll(".chapter");
  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add("seen"); io.unobserve(e.target); }
      }
    }, { rootMargin: "0px 0px -22% 0px" });
    chapters.forEach((el) => io.observe(el));
    setTimeout(() => chapters.forEach((el) => el.classList.add("seen")), 4000);
  }

  // ------------------------------------------------------ globe / flat map
  const viewButtons = document.querySelectorAll("#view-toggle button");
  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      root.classList.toggle("flat-map", button.dataset.view === "flat");
      viewButtons.forEach((other) => other.classList.toggle("on", other === button));
    });
  });

  // ------------------------------------------------ count-up in number strip
  const strip = document.querySelector(".audit-strip");
  if (strip && !reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      // Only plain counts ("40", "30 of 80"); the rho sentence stays as written.
      const cells = [...strip.querySelectorAll(".v")].filter((v) => /^\d+$/.test(v.textContent.trim()));
      const finals = cells.map((v) => v.textContent.trim());
      const t0 = performance.now(), dur = 1400;
      const step = (now) => {
        const k = 1 - Math.pow(1 - Math.min(1, (now - t0) / dur), 4);
        cells.forEach((v, i) => {
          v.textContent = finals[i].replace(/^\d+/, (n) => String(Math.round(Number(n) * k)));
        });
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(strip);
  }
})();
