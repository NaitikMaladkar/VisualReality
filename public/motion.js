/* ============================================================
   Site-wide motion driver — the JS half of motion.css
   Click ripples · 3D tilt with glare · TerraSense banner demo.
   Every effect is pointer/reduced-motion aware.
   ============================================================ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Click ripple on every .btn ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".btn");
    if (!btn || reduced) return;

    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 1.15;
    var ripple = document.createElement("span");
    ripple.className = "ts-ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    window.setTimeout(function () { ripple.remove(); }, 700);
  });

  /* ---------- 3D tilt + glare on featured cards ---------- */
  var TILT_SELECTORS = [".pillar-card", ".join-card", ".ts-banner"];

  function initTilt() {
    if (reduced || !finePointer) return;

    TILT_SELECTORS.forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (card) {
        if (card.dataset.tiltBound) return;
        card.dataset.tiltBound = "1";

        var glare = document.createElement("span");
        glare.className = "ts-glare";
        glare.setAttribute("aria-hidden", "true");
        card.appendChild(glare);

        var raf = null;

        card.addEventListener("pointermove", function (e) {
          if (raf) return;
          raf = window.requestAnimationFrame(function () {
            raf = null;
            var rect = card.getBoundingClientRect();
            var dx = (e.clientX - rect.left) / rect.width - 0.5;
            var dy = (e.clientY - rect.top) / rect.height - 0.5;
            var max = card.classList.contains("ts-banner") ? 2.4 : 6;
            card.style.transform =
              "perspective(950px) rotateX(" + (-dy * max).toFixed(2) +
              "deg) rotateY(" + (dx * max).toFixed(2) + "deg)";
            card.style.transition = "transform 0.12s ease-out";
            glare.style.setProperty("--gx", ((dx + 0.5) * 100).toFixed(1) + "%");
            glare.style.setProperty("--gy", ((dy + 0.5) * 100).toFixed(1) + "%");
          });
        });

        card.addEventListener("pointerleave", function () {
          if (raf) { window.cancelAnimationFrame(raf); raf = null; }
          card.style.transition = "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)";
          card.style.transform = "";
          window.setTimeout(function () { card.style.transition = ""; }, 480);
        });
      });
    });
  }

  /* ---------- TerraSense banner: live demo conversation (homepage) ---------- */
  var DEMO = [
    ["How do I shrink my footprint?", "Twelve questions, live dashboard — try the Carbon Calculator ✦"],
    ["What happened in 2024?", "Record 37.4 Gt CO₂ — but also 1.6 TW of new renewables."],
    ["Is fusion real yet?", "Dec 2022: first net-energy gain. Full story in our Timeline."],
    ["Who made all this?", "Naitik Maladkar — every page, game and pixel of it."]
  ];

  function initBannerDemo() {
    var qEl = document.getElementById("tsDemoQ");
    var aEl = document.getElementById("tsDemoA");
    if (!qEl || !aEl || reduced) {
      if (qEl && aEl) { qEl.textContent = DEMO[0][0]; aEl.textContent = DEMO[0][1]; }
      return;
    }

    var pair = 0;

    function typeText(el, text, speed, done) {
      el.textContent = "";
      var i = 0;
      (function step() {
        if (document.hidden) { el.textContent = text; done(); return; }
        el.textContent = text.slice(0, ++i);
        el.parentElement.classList.add("typing");
        if (i < text.length) {
          window.setTimeout(step, speed);
        } else {
          el.parentElement.classList.remove("typing");
          done();
        }
      })();
    }

    function runPair() {
      typeText(qEl, DEMO[pair][0], 34, function () {
        window.setTimeout(function () {
          typeText(aEl, DEMO[pair][1], 18, function () {
            window.setTimeout(function () {
              pair = (pair + 1) % DEMO.length;
              runPair();
            }, 3400);
          });
        }, 420);
      });
    }

    runPair();
  }

  /* ---------- Boot ---------- */
  function boot() {
    initTilt();
    initBannerDemo();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
