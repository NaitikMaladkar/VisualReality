/* ============================================================
   Visual Reality — script.js
   Scroll state · reveals · counters · Join the movement form
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

  /* ---------- Reveal on scroll + counters ----------
     Wrapped in initReveals() so the homepage can defer them until the
     cinematic intro dissolves (vrIntroDone) — the site then animates in
     underneath the fading overlay. Other pages: instant, unchanged. */
  function initReveals() {

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

  } // end initReveals

  if (document.getElementById("introOverlay")) {
    var revealsStarted = false;
    var startReveals = function () {
      if (revealsStarted) return;
      revealsStarted = true;
      initReveals();
    };
    document.addEventListener("vrIntroDone", startReveals, { once: true });
    setTimeout(startReveals, 9500); // failsafe if intro.js ever fails
  } else {
    initReveals();
  }

  /* ---------- Join the movement: idea form ---------- */
  var joinForm = document.getElementById("join-form");
  var joinCard = document.getElementById("join-card");
  var joinMsg = document.getElementById("join-msg");
  var ideaText = document.getElementById("idea-text");
  var ideaName = document.getElementById("idea-name");
  var ideaEmail = document.getElementById("idea-email");
  var joinSend = joinForm ? joinForm.querySelector(".join-send") : null;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (joinForm && joinMsg && ideaText) {
    joinForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var idea = ideaText.value.trim();
      var name = ideaName ? ideaName.value.trim() : "";
      var email = ideaEmail ? ideaEmail.value.trim() : "";

      if (idea === "") {
        joinMsg.textContent = "Don't be shy — type your idea in first. Even half-formed ideas matter!";
        joinMsg.className = "form-msg error";
        ideaText.classList.add("input-error");
        ideaText.focus();
        return;
      }

      if (idea.length < 12) {
        joinMsg.textContent =
          "A few more words, please — tell us a little more so your idea shines.";
        joinMsg.className = "form-msg error";
        ideaText.classList.add("input-error");
        ideaText.focus();
        return;
      }

      if (email !== "" && !EMAIL_RE.test(email)) {
        joinMsg.textContent =
          "That email doesn't look quite right — mind checking it? (Or leave it blank.)";
        joinMsg.className = "form-msg error";
        ideaEmail.classList.add("input-error");
        ideaEmail.focus();
        return;
      }

      ideaText.classList.remove("input-error");
      if (ideaEmail) ideaEmail.classList.remove("input-error");

      var who = name ? name.split(/\s+/)[0] : "future-builder";
      joinMsg.textContent =
        "Thanks, " + who + "! Your idea just joined the movement \u2726 Keep imagining tomorrow \u2014 the planet thanks you.";
      joinMsg.className = "form-msg success";

      if (joinCard) {
        joinCard.classList.remove("sent");
        void joinCard.offsetWidth;
        joinCard.classList.add("sent");
      }
      if (joinSend) {
        joinSend.classList.add("is-sent");
        window.setTimeout(function () {
          joinSend.classList.remove("is-sent");
        }, 1200);
      }

      joinForm.reset();
    });

    ideaText.addEventListener("input", function () {
      ideaText.classList.remove("input-error");
      joinMsg.textContent = "";
      joinMsg.className = "form-msg";
    });

    if (ideaEmail) {
      ideaEmail.addEventListener("input", function () {
        ideaEmail.classList.remove("input-error");
      });
    }
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Reading progress bar (all pages) ---------- */
  var progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  progressBar.setAttribute("aria-hidden", "true");
  document.body.appendChild(progressBar);

  var progressTicking = false;

  function updateProgressBar() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min((window.scrollY || window.pageYOffset) / max, 1) : 0;
    progressBar.style.transform = "scaleX(" + ratio + ")";
    progressTicking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!progressTicking) {
        progressTicking = true;
        window.requestAnimationFrame(updateProgressBar);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", updateProgressBar);
  updateProgressBar();

  /* ---------- Hero: ambient falling leaves (homepage) ---------- */
  var hero = document.querySelector(".hero");

  if (hero && !prefersReducedMotion) {
    var leafCount = 11;

    for (var i = 0; i < leafCount; i++) {
      var leaf = document.createElement("span");
      leaf.className = "leaf-fall";
      leaf.setAttribute("aria-hidden", "true");

      var size = 9 + Math.random() * 9; // 9–18px
      leaf.style.width = size + "px";
      leaf.style.height = size + "px";
      leaf.style.left = 2 + Math.random() * 96 + "%";
      leaf.style.setProperty("--dx", Math.round(-90 + Math.random() * 180) + "px");
      leaf.style.setProperty("--fy", Math.round(hero.offsetHeight + 70) + "px");
      leaf.style.setProperty("--o", (0.22 + Math.random() * 0.26).toFixed(2));
      leaf.style.setProperty("--t", (9 + Math.random() * 8).toFixed(1) + "s");
      leaf.style.setProperty("--dl", "-" + (Math.random() * 14).toFixed(1) + "s");

      hero.appendChild(leaf);
    }

    // Re-measure on resize so leaves always fall the full hero height
    window.addEventListener(
      "resize",
      function () {
        var fy = Math.round(hero.offsetHeight + 70) + "px";
        Array.prototype.forEach.call(
          hero.querySelectorAll(".leaf-fall"),
          function (l) {
            l.style.setProperty("--fy", fy);
          }
        );
      },
      { passive: true }
    );
  }

  /* ---------- Hero art: gentle cursor parallax (fine pointers) ---------- */
  var heroArt = document.querySelector(".hero-art");
  var heroSvg = document.querySelector(".hero-art .hero-svg");

  if (
    heroArt &&
    heroSvg &&
    !prefersReducedMotion &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  ) {
    heroArt.addEventListener("mousemove", function (e) {
      var rect = heroArt.getBoundingClientRect();
      var dx = (e.clientX - rect.left) / rect.width - 0.5;
      var dy = (e.clientY - rect.top) / rect.height - 0.5;
      heroSvg.style.transform =
        "translate(" + (dx * 12).toFixed(1) + "px," + (dy * 12).toFixed(1) + "px)";
    });

    heroArt.addEventListener("mouseleave", function () {
      heroSvg.style.transform = "translate(0px, 0px)";
    });
  }
})();
