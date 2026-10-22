/* ============================================================
   Visual Reality — timeline.js
   Rail scrollspy · spine fill · flip cards · counters · filters
   ============================================================ */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Elements ---------- */
  var wrap = document.getElementById("tl-wrap");
  var fill = document.getElementById("tl-fill");
  var railFill = document.getElementById("rail-fill");
  var items = Array.prototype.slice.call(
    document.querySelectorAll(".tl-item")
  );
  var eras = Array.prototype.slice.call(
    document.querySelectorAll(".tl-era")
  );
  var dots = Array.prototype.slice.call(
    document.querySelectorAll(".rail-dot")
  );
  var eraButtons = Array.prototype.slice.call(
    document.querySelectorAll(".rail-era")
  );
  var filterButtons = Array.prototype.slice.call(
    document.querySelectorAll(".tl-filter")
  );
  var countEl = document.getElementById("tl-count");

  /* ---------- 1. Alternating card sides ---------- */
  function assignSides() {
    var visible = items.filter(function (item) {
      return !item.hasAttribute("hidden");
    });
    visible.forEach(function (item, i) {
      item.classList.toggle("right", i % 2 === 1);
    });
  }

  assignSides();

  /* ---------- 2. Count-up for flipped card stats ---------- */
  function formatValue(value, decimals) {
    var text;
    if (decimals > 0) {
      text = value.toFixed(decimals);
    } else {
      text = String(Math.round(value));
      if (Math.round(value) >= 10000) {
        text = Math.round(value).toLocaleString("en-US");
      }
    }
    return text;
  }

  function animateCardStats(card) {
    var vals = Array.prototype.slice.call(
      card.querySelectorAll("[data-tl-count]")
    );

    vals.forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-tl-count"));
      if (isNaN(target)) return;

      var decimals = parseInt(el.getAttribute("data-tl-decimals") || "0", 10);
      var prefix = el.getAttribute("data-tl-prefix") || "";
      var suffix = el.getAttribute("data-tl-suffix") || "";

      if (reducedMotion) {
        el.textContent = prefix + formatValue(target, decimals) + suffix;
        return;
      }

      var duration = 1150;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent =
          prefix + formatValue(target * eased, decimals) + suffix;
        if (progress < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    });
  }

  /* ---------- 3. Flip cards ---------- */
  var cards = Array.prototype.slice.call(
    document.querySelectorAll(".tl-card")
  );

  /* ---------- 1b. Adaptive card heights ---------- */
  /* Card faces are absolutely positioned, so the container needs an
     explicit height. Measure both faces and keep the taller one. */
  var sizeTimer = null;

  function sizeCards() {
    cards.forEach(function (card) {
      var item = card.closest(".tl-item");
      if (item && item.hasAttribute("hidden")) return;
      var front = card.querySelector(".tl-face.front");
      var back = card.querySelector(".tl-face.back");
      if (!front || !back) return;
      var needed = Math.max(
        front.scrollHeight,
        back.scrollHeight,
        340
      );
      card.style.height = Math.ceil(needed + 2) + "px";
    });
  }

  function queueSizeCards() {
    if (sizeTimer) window.clearTimeout(sizeTimer);
    sizeTimer = window.setTimeout(sizeCards, 120);
  }

  sizeCards();
  window.addEventListener("resize", queueSizeCards);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(sizeCards);
  }
  window.addEventListener("load", sizeCards);

  cards.forEach(function (card) {
    function flip() {
      var flipped = card.classList.toggle("flipped");
      card.setAttribute("aria-pressed", String(flipped));

      if (flipped && !card.getAttribute("data-counted")) {
        card.setAttribute("data-counted", "1");
        animateCardStats(card);
      }
    }

    card.addEventListener("click", flip);

    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        flip();
      }
    });
  });

  /* ---------- 4. Scroll-driven progress (spine + rail) ---------- */
  var ticking = false;

  function updateProgress() {
    var viewport = window.innerHeight || 1;
    var center = viewport * 0.55;

    if (wrap && fill) {
      var rect = wrap.getBoundingClientRect();
      var progress = (center - rect.top) / rect.height;
      progress = Math.max(0, Math.min(1, progress));
      fill.style.height = (progress * 100).toFixed(2) + "%";
      if (railFill) {
        railFill.style.transform = "scaleX(" + progress.toFixed(4) + ")";
      }
    }

    items.forEach(function (item, i) {
      if (item.hasAttribute("hidden")) {
        item.classList.remove("lit");
        if (dots[i]) dots[i].classList.remove("lit");
        return;
      }
      var top = item.getBoundingClientRect().top + 44;
      var lit = top < center;
      item.classList.toggle("lit", lit);
      if (dots[i]) dots[i].classList.toggle("lit", lit);
    });

    eras.forEach(function (era) {
      if (era.hasAttribute("hidden")) return;
      var top = era.getBoundingClientRect().top + 40;
      era.classList.toggle("lit", top < center);
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateProgress();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateProgress();

  /* ---------- 5. Rail: jump to a milestone ---------- */
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var index = parseInt(dot.getAttribute("data-target"), 10);
      var item = items[index];
      if (!item) return;

      if (item.hasAttribute("hidden")) {
        setFilter("all");
      }

      var card = item.querySelector(".tl-card");
      if (!card) return;

      card.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center",
      });

      card.classList.remove("flash");
      void card.offsetWidth; /* restart the animation */
      card.classList.add("flash");
      window.setTimeout(function () {
        card.classList.remove("flash");
      }, 1700);
    });
  });

  /* ---------- 6. Rail: jump to an era ---------- */
  eraButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var era = document.getElementById(
        "era-" + button.getAttribute("data-era-target")
      );
      if (!era) return;
      if (era.hasAttribute("hidden")) setFilter("all");
      era.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  });

  /* ---------- 7. Era filters ---------- */
  function setFilter(name) {
    var shown = 0;

    filterButtons.forEach(function (button) {
      var active = button.getAttribute("data-filter") === name;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    items.forEach(function (item) {
      var match = name === "all" || item.getAttribute("data-era") === name;
      if (match) shown++;
      item.toggleAttribute("hidden", !match);
    });

    eras.forEach(function (era) {
      var match = name === "all" || era.getAttribute("data-era") === name;
      era.toggleAttribute("hidden", !match);
    });

    assignSides();
    sizeCards();

    if (countEl) {
      countEl.textContent =
        "Showing " + shown + " of " + items.length + " milestones";
    }

    updateProgress();
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setFilter(button.getAttribute("data-filter"));
    });
  });
})();
