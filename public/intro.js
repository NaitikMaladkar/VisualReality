/* ============================================================
   Visual Reality — Cinematic Intro Overlay · timeline driver
   Pure JS, no libraries. Drives intro.css stage classes:
     0.0s   stage-cloud   brand-text cloud + tagline cycle
     2.1s   stage-build   logo pieces converge to center
     3.1s   stage-trace   neon stroke draws the emblem
     5.55s  stage-lit     shine flash + wordmark reveal
     7.15s  is-leaving    overlay dissolves → website reveals
   Dispatches "vrIntroDone" when the dissolve begins, so the
   homepage (reveals, wizard welcome) animates in underneath.
   Skippable: button (bottom-right) or Escape key.
   ============================================================ */
(function () {
  "use strict";

  var overlay = document.getElementById("introOverlay");
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function announce() {
    try {
      document.dispatchEvent(new CustomEvent("vrIntroDone"));
    } catch (e) {
      // very old browsers: createEvent fallback
      var ev = document.createEvent("Event");
      ev.initEvent("vrIntroDone", true, true);
      document.dispatchEvent(ev);
    }
  }

  /* Reduced motion (or overlay never activated): never show it.
     The CSS also hard-hides via `display:none !important`. */
  if (!overlay || reduce || !root.classList.contains("will-intro")) {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    announce();
    return;
  }

  var done = false;
  var timers = [];

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
  }

  /* STAGE 4 — dissolve; the page underneath starts animating in */
  function finish() {
    if (done) return;
    done = true;
    clearTimers();
    document.removeEventListener("keydown", onKey);
    announce(); // reveals + wizard welcome start under the fading veil
    overlay.classList.add("is-leaving");
    overlay.style.pointerEvents = "none";
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      root.classList.remove("intro-lock", "will-intro");
    }, 950);
  }

  function onKey(e) {
    if (e.key === "Escape" || e.key === "Esc") finish();
  }

  /* lock scroll for the duration of the show */
  root.classList.add("intro-lock");

  var skipBtn = document.getElementById("introSkip");
  if (skipBtn) skipBtn.addEventListener("click", finish);
  document.addEventListener("keydown", onKey);

  /* If the tab is hidden the moment we start, don't make the visitor
     sit through the whole film when they come back — end gracefully. */
  document.addEventListener("visibilitychange", function onVis() {
    if (document.hidden) {
      document.removeEventListener("visibilitychange", onVis);
      finish();
    }
  });

  /* ---------- the timeline ---------- */

  // STAGE 1 is pure CSS from first paint (cloud + tagline).
  overlay.classList.add("stage-cloud");

  later(function () {
    overlay.classList.add("stage-build"); // STAGE 2 — convergence
  }, 2100);

  later(function () {
    overlay.classList.add("stage-trace"); // STAGE 3 — neon drawing
  }, 3100);

  later(function () {
    overlay.classList.add("stage-lit"); // shine flash + wordmark
  }, 5550);

  later(finish, 7150); // STAGE 4 — reveal the website
})();
