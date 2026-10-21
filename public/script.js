/* ============================================================
   Visual Reality — script.js
   Mobile nav · scroll state · reveals · counters · newsletter
   ============================================================ */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Header scroll state + back-to-top ---------- */
  var header = document.querySelector(".site-header");
  var toTop = document.getElementById("to-top");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (toTop) toTop.classList.toggle("show", y > 600);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");

  function closeMenu() {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    menu.classList.remove("open");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
      menu.classList.toggle("open", !isOpen);
    });

    // Close after tapping a link (mobile)
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });

    // Close with Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    // Reset state when resizing back to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 880) closeMenu();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll(".reveal")
  );

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---------- Animated counters ---------- */
  var counters = Array.prototype.slice.call(
    document.querySelectorAll("[data-count-to]")
  );

  function getTarget(el) {
    var v = parseFloat(el.getAttribute("data-count-to"));
    return isNaN(v) ? 0 : v;
  }

  function getDecimals(el) {
    return parseInt(el.getAttribute("data-decimals") || "0", 10) || 0;
  }

  function fmtCount(v, decimals, plain) {
    if (decimals > 0) return v.toFixed(decimals);
    if (plain) return String(Math.round(v));
    return Math.round(v).toLocaleString("en-US");
  }

  function renderFinal(el) {
    el.textContent =
      fmtCount(getTarget(el), getDecimals(el), el.hasAttribute("data-plain")) +
      (el.getAttribute("data-suffix") || "");
  }

  function animateCounter(el) {
    var target = getTarget(el);
    var decimals = getDecimals(el);
    var suffix = el.getAttribute("data-suffix") || "";
    var plain = el.hasAttribute("data-plain");
    var duration = 1700;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = fmtCount(target * eased, decimals, plain) + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }
    window.requestAnimationFrame(step);
  }

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    counters.forEach(renderFinal);
  } else {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  /* ---------- Newsletter form (client-side demo) ---------- */
  var form = document.getElementById("subscribe-form");
  var msg = document.getElementById("form-msg");
  var emailInput = document.getElementById("email");

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (form && msg && emailInput) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = emailInput.value.trim();

      if (value === "") {
        msg.textContent = "Please enter your email address first.";
        msg.className = "form-msg error";
        emailInput.classList.add("input-error");
        emailInput.focus();
        return;
      }

      if (!EMAIL_RE.test(value)) {
        msg.textContent =
          "That doesn't look like a valid email — mind checking it?";
        msg.className = "form-msg error";
        emailInput.classList.add("input-error");
        emailInput.focus();
        return;
      }

      emailInput.classList.remove("input-error");
      msg.textContent =
        "Welcome aboard, future-builder! Your first Tomorrow Brief lands on Sunday.";
      msg.className = "form-msg success";
      form.reset();
    });

    emailInput.addEventListener("input", function () {
      emailInput.classList.remove("input-error");
      msg.textContent = "";
      msg.className = "form-msg";
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
