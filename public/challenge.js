/* ============================================================
   Visual Reality — Eco Challenge
   Daily quests · streaks · badges · localStorage · confetti
   Pure vanilla JS. Progress never leaves the browser.
   ============================================================ */
(function () {
  "use strict";

  var STORE_KEY = "vr-eco-challenge-v1";
  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Icons ---------------- */
  function svg(paths, cls) {
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : "") + ">" + paths + "</svg>";
  }

  var S = 'stroke="#047857" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  var W = 'stroke="#ffffff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none"';

  var CAT_ICONS = {
    plastic: svg('<path d="M10 3h4v3l1.5 2.3c.6.9 1 2 1 3.1V19a2 2 0 0 1-2 2H9.5a2 2 0 0 1-2-2v-7.6c0-1.1.4-2.2 1-3.1L10 6V3Z" ' + S + '/><path d="M8.2 13.5h7.6" ' + S + '/>'),
    food: svg('<path d="M12 7.4C9 5.6 5.5 7 5.5 11c0 4.4 3 8.4 6.5 8.4s6.5-4 6.5-8.4c0-4-3.5-5.4-6.5-3.6Z" ' + S + '/><path d="M12 7.2c-.2-1.9.8-3.2 2.4-3.8" ' + S + '/>'),
    energy: svg('<path d="M13 2 4.5 13.5H11L9.5 22 19 10.5h-6.5L13 2Z" ' + S + '/>'),
    water: svg('<path d="M12 3s6.5 6.6 6.5 11a6.5 6.5 0 0 1-13 0C5.5 9.6 12 3 12 3Z" ' + S + '/>'),
    transport: svg('<rect x="4" y="3.5" width="16" height="13.5" rx="2.5" ' + S + '/><path d="M4 10.5h16M7.5 17v2.5M16.5 17v2.5M7.6 14h.01M16.4 14h.01" ' + S + '/>'),
    stuff: svg('<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" ' + S + '/><path d="M4 7.5 12 12l8-4.5M12 12v9" ' + S + '/>'),
    digital: svg('<path d="M7 18a4.5 4.5 0 1 1 .8-8.9A5.5 5.5 0 0 1 18.6 11a3.7 3.7 0 0 1-.8 7H7Z" ' + S + '/>')
  };

  var BADGE_ICONS = {
    sprout: svg('<path d="M12 21v-7" ' + W + '/><path d="M12 14C12 9.5 8.5 7 4.5 7c0 4.5 3.5 7 7.5 7Z" ' + W + '/><path d="M12 11.5c0-3.6 2.7-5.5 6-5.5 0 3.6-2.7 5.5-6 5.5Z" ' + W + '/>'),
    flame: svg('<path d="M12 3c1.6 2.4 2.4 4.4 2.4 6.3 0 1.4-.4 2.7-1.2 3.9M12 3c-1.6 2.4-2.4 4.4-2.4 6.3 0 1.4.4 2.7 1.2 3.9M5.8 13.8 12 21l6.2-7.2" ' + W + '/>'),
    shield: svg('<path d="M12 3 5 5.8v5.4c0 4.3 2.9 7.4 7 9 4.1-1.6 7-4.7 7-9V5.8L12 3Z" ' + W + '/><path d="m9.3 11.6 1.9 1.9 3.5-3.6" ' + W + '/>'),
    star: svg('<path d="m12 3.5 2.4 5 5.4.7-4 3.8 1 5.4-4.8-2.6-4.8 2.6 1-5.4-4-3.8 5.4-.7 2.4-5Z" ' + W + '/>'),
    coin: svg('<circle cx="12" cy="12" r="8.5" ' + W + '/><path d="M12 7.5v9M9.4 9.7c0-1 1.2-1.7 2.6-1.7s2.6.7 2.6 1.7c0 2.5-5.2 1.6-5.2 4.1 0 1 1.2 1.8 2.6 1.8s2.6-.8 2.6-1.8" ' + W + '/>'),
    compass: svg('<circle cx="12" cy="12" r="8.5" ' + W + '/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" ' + W + '/>'),
    medal: svg('<circle cx="12" cy="14.5" r="5.5" ' + W + '/><path d="m9 10-3-6h4l2 4 2-4h4l-3 6" ' + W + '/>'),
    trophy: svg('<path d="M8 4h8v6a4 4 0 0 1-8 0V4Z" ' + W + '/><path d="M8 5.5H4.5a3.5 3.5 0 0 0 3.6 3.5M16 5.5h3.5a3.5 3.5 0 0 1-3.6 3.5M12 14v3m-3.5 3.5h7M9.5 20.5c0-1.8 1-3.5 2.5-3.5s2.5 1.7 2.5 3.5" ' + W + '/>')
  };

  var TIP_ICO = svg('<path d="M12 3s6 6 6 10.5a6 6 0 0 1-12 0C6 9 12 3 12 3Z" stroke="#047857" stroke-width="1.7" fill="none" stroke-linejoin="round"/>', "ec-tip-ico");
  var CHECK_ICO = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5.5 12.5 4.2 4.2L18.5 8" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var BTN_CHECK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5.5 12.5 4.2 4.2L18.5 8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------------- Quest pool ---------------- */
  var QUESTS = [
    { id: "plastic-freeze", cat: "plastic", catName: "Plastic", pts: 10, diff: "Easy", title: "Single-use plastic freeze",
      desc: "Refuse straws, throwaway cutlery and plastic bags for the entire day — carry the reusables that make it easy.",
      tip: "About 8 million tonnes of plastic enter the ocean every year; the top six single-use items are a surprisingly big slice of it.", src: "UNEP" },
    { id: "refill-run", cat: "plastic", catName: "Plastic", pts: 10, diff: "Easy", title: "Refill run",
      desc: "Use a refillable bottle or cup for every drink today — including the coffee stop.",
      tip: "One million plastic bottles are bought around the world every minute; a reusable bottle repays its production carbon after a handful of refills.", src: "UNEP" },
    { id: "package-detective", cat: "plastic", catName: "Plastic", pts: 15, diff: "Medium", title: "Package detective",
      desc: "Buy at least one item today with zero — or fully recyclable — packaging.",
      tip: "Packaging is roughly 40% of Europe's plastic use, the single largest share of what gets tossed.", src: "UNEP" },
    { id: "snack-reboot", cat: "food", catName: "Food", pts: 10, diff: "Easy", title: "Snack reboot",
      desc: "Swap one packaged snack for something homemade or bought in bulk.",
      tip: "Ultraprocessed food carries a double footprint: factory energy upstream and mixed packaging downstream.", src: "FAO" },
    { id: "phantom-hunt", cat: "energy", catName: "Energy", pts: 10, diff: "Easy", title: "Phantom-power hunt",
      desc: "Unplug idle chargers and switch off gear that is secretly on standby — all day.",
      tip: "Standby power quietly eats an estimated 5–10% of a typical home's electricity bill.", src: "IEA" },
    { id: "cold-wash", cat: "energy", catName: "Energy", pts: 15, diff: "Easy", title: "Cold wash day",
      desc: "Run today's laundry at 30°C or colder — modern detergent is engineered for it.",
      tip: "Up to 90% of a washing machine's energy goes to heating water, so cold cycles cut most of the load.", src: "Energy Saving Trust" },
    { id: "lights-out", cat: "energy", catName: "Energy", pts: 10, diff: "Easy", title: "Lights-out hour",
      desc: "Give one full evening hour to daylight and lamps-off rooms — candles count.",
      tip: "Lighting is about 5% of global electricity; LEDs already cut it roughly in half, habits cut it further.", src: "IEA" },
    { id: "thermostat-nudge", cat: "energy", catName: "Energy", pts: 15, diff: "Medium", title: "Thermostat nudge",
      desc: "Nudge the thermostat one degree down (heating season) or up (cooling season) for the whole day.",
      tip: "Each degree of heating saves roughly 6–8% of the energy a building uses.", src: "IEA" },
    { id: "shower-sprint", cat: "water", catName: "Water", pts: 10, diff: "Medium", title: "Five-minute shower sprint",
      desc: "Keep every shower today under five minutes — timer on, singing allowed.",
      tip: "Every minute of a typical shower sends 9–12 litres of heated water down the drain.", src: "EPA WaterSense" },
    { id: "tap-guard", cat: "water", catName: "Water", pts: 10, diff: "Easy", title: "Tap-guard day",
      desc: "Never let the tap run while brushing, and finally report that drip.",
      tip: "A faucet dripping once per second wastes about 11,000 litres over a year.", src: "EPA" },
    { id: "meatless-day", cat: "food", catName: "Food", pts: 20, diff: "Spicy", title: "Meatless day",
      desc: "Keep every meal today plant-based — yes, breakfast counts.",
      tip: "One plant-based day saves roughly 2 kg of CO₂e versus a meat-heavy menu; beef alone runs near 60 kg per kilo.", src: "Poore & Nemecek" },
    { id: "leftovers-remix", cat: "food", catName: "Food", pts: 10, diff: "Easy", title: "Leftovers remix",
      desc: "Turn yesterday's leftovers into today's lunch — zero new ingredients.",
      tip: "About a third of all food produced is wasted, worth roughly 8–10% of global emissions.", src: "FAO" },
    { id: "local-plate", cat: "food", catName: "Food", pts: 10, diff: "Easy", title: "Local & seasonal plate",
      desc: "Build one meal today from local, in-season ingredients.",
      tip: "Food transport is only ~6% of food emissions — what you eat matters more than where it is from.", src: "Our World in Data" },
    { id: "carfree-commute", cat: "transport", catName: "Transport", pts: 20, diff: "Spicy", title: "Car-free commute",
      desc: "Walk, cycle or take transit for today's commute — every trip counts.",
      tip: "The average petrol car emits about 170 g of CO₂ per kilometre; a bike emits none of it.", src: "DEFRA" },
    { id: "trip-stack", cat: "transport", catName: "Transport", pts: 10, diff: "Easy", title: "Two-for-one trip",
      desc: "Stack errands into a single journey instead of two separate drives.",
      tip: "Cold engines burn up to twice the fuel per kilometre on short hops, so combined trips earn double credit.", src: "US DOE" },
    { id: "eco-drive", cat: "transport", catName: "Transport", pts: 10, diff: "Easy", title: "Eco-drive hour",
      desc: "If you must drive: steady speed, gentle starts, no idling in queues.",
      tip: "Smooth eco-driving can cut fuel use by around 10–15% on the very same route.", src: "IEA" },
    { id: "buy-nothing", cat: "stuff", catName: "Stuff", pts: 15, diff: "Medium", title: "Buy-nothing day",
      desc: "No new purchases today — essentials like food and medicine excepted.",
      tip: "A smartphone carries roughly 55–80 kg of CO₂e before it is ever unboxed; the greenest purchase is the one skipped.", src: "Apple product report" },
    { id: "repair-mission", cat: "stuff", catName: "Stuff", pts: 15, diff: "Medium", title: "Repair mission",
      desc: "Mend, patch or fix one thing today instead of replacing it.",
      tip: "Extending clothing life by nine months cuts its waste and water footprint by around 20–30%.", src: "WRAP" },
    { id: "second-life", cat: "stuff", catName: "Stuff", pts: 10, diff: "Easy", title: "Second-life swap",
      desc: "Give one forgotten item a new home — donate, resell or gift it today.",
      tip: "The average garment is worn only 7–10 times before being discarded; every extra owner compounds its value.", src: "Ellen MacArthur Fdn." },
    { id: "paperless", cat: "stuff", catName: "Stuff", pts: 10, diff: "Easy", title: "Paper-free hours",
      desc: "Go fully digital for the day: no printing, e-receipts only, notes on screen.",
      tip: "Paper is one of the lowest-recycled waste streams; going digital removes the stream entirely.", src: "EPA" },
    { id: "digital-declutter", cat: "digital", catName: "Digital", pts: 10, diff: "Easy", title: "Digital declutter",
      desc: "Delete a gigabyte of cloud clutter — old backups, duplicate photos, forgotten subscriptions.",
      tip: "Data centres already draw 1–1.5% of the world's electricity, and storage is the quietest growing slice.", src: "IEA" }
  ];

  /* ---------------- Badges ---------------- */
  var BADGES = [
    { id: "first-sprout", name: "First Sprout", desc: "Complete your very first quest.", icon: "sprout", test: function (s) { return s.total >= 1; } },
    { id: "hat-trick", name: "Hat Trick", desc: "Keep a 3-day streak alive.", icon: "flame", test: function (s) { return s.best >= 3; } },
    { id: "week-warrior", name: "Week Warrior", desc: "Keep a 7-day streak alive.", icon: "shield", test: function (s) { return s.best >= 7; } },
    { id: "point-collector", name: "Point Collector", desc: "Bank 100 points in total.", icon: "coin", test: function (s) { return s.points >= 100; } },
    { id: "challenger", name: "Challenge Chaser", desc: "Complete 10 quests in total.", icon: "compass", test: function (s) { return s.total >= 10; } },
    { id: "side-hero", name: "Side-Quest Hero", desc: "Complete 5 side quests.", icon: "medal", test: function (s) { return s.sideTotal >= 5; } },
    { id: "fortnight-force", name: "Fortnight Force", desc: "Keep a 14-day streak alive.", icon: "star", test: function (s) { return s.best >= 14; } },
    { id: "eco-legend", name: "Eco Legend", desc: "Complete 25 quests in total.", icon: "trophy", test: function (s) { return s.total >= 25; } }
  ];

  /* ---------------- State ---------------- */
  var state = { v: 1, days: {}, best: 0, unlocked: {} };
  var storageOk = true;

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.v === 1 && parsed.days) state = parsed;
      }
    } catch (e) {
      storageOk = false;
    }
    if (!storageOk) {
      try {
        localStorage.setItem(STORE_KEY, "");
        localStorage.removeItem(STORE_KEY);
        storageOk = true;
      } catch (e) { /* truly blocked */ }
    }
  }

  function save() {
    if (!storageOk) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) { /* quota or privacy mode */ }
  }

  /* ---------------- Dates & daily deal ---------------- */
  function keyOf(d) {
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (day < 10 ? "0" + day : day);
  }

  function todayKey() { return keyOf(new Date()); }

  function dayNumber() {
    var n = new Date();
    return Math.floor(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()) / 864e5);
  }

  function dealOfDay() {
    var dn = dayNumber();
    var pool = QUESTS;
    var main = pool[(dn * 7 + 3) % pool.length];
    var candidates = pool.filter(function (q) { return q.id !== main.id; });
    var b1 = candidates[(dn * 5 + 1) % candidates.length];
    var b2 = candidates[(dn * 11 + 6) % candidates.length];
    var guard = 0;
    while (b2.id === b1.id && guard < candidates.length) {
      b2 = candidates[(candidates.indexOf(b2) + 1) % candidates.length];
      guard++;
    }
    return { main: main, bonuses: [b1, b2] };
  }

  /* ---------------- Stats ---------------- */
  function questById(id) {
    for (var i = 0; i < QUESTS.length; i++) if (QUESTS[i].id === id) return QUESTS[i];
    return null;
  }

  function computeStats() {
    var total = 0, sideTotal = 0, points = 0;
    Object.keys(state.days).forEach(function (k) {
      var d = state.days[k];
      if (d.m) { total++; var mq = questById(d.m); if (mq) points += mq.pts; }
      (d.b || []).forEach(function (id) {
        sideTotal++; total++;
        var q = questById(id);
        if (q) points += q.pts;
      });
    });
    var streak = currentStreak();
    var best = Math.max(state.best || 0, streak);
    if (best !== state.best) { state.best = best; save(); }
    return { total: total, sideTotal: sideTotal, points: points, streak: streak, best: best };
  }

  function currentStreak() {
    var streak = 0;
    var d = new Date();
    if (!(state.days[keyOf(d)] && state.days[keyOf(d)].m)) d.setDate(d.getDate() - 1);
    var guard = 0;
    while (state.days[keyOf(d)] && state.days[keyOf(d)].m && guard < 3650) {
      streak++;
      d.setDate(d.getDate() - 1);
      guard++;
    }
    return streak;
  }

  /* ---------------- Rendering ---------------- */
  var els = {};
  function cacheEls() {
    els.date = document.getElementById("ec-date");
    els.mainCard = document.getElementById("ec-main-card");
    els.sideList = document.getElementById("ec-side-list");
    els.strip = document.getElementById("ec-strip");
    els.badges = document.getElementById("ec-badges");
    els.badgeCount = document.getElementById("ec-badge-count");
    els.stats = {
      total: document.getElementById("ec-stat-total"),
      streak: document.getElementById("ec-stat-streak"),
      points: document.getElementById("ec-stat-points"),
      best: document.getElementById("ec-stat-best")
    };
    els.toast = document.getElementById("ec-toast");
    els.canvas = document.getElementById("ec-confetti");
  }

  var deal = null;

  function renderQuests() {
    deal = dealOfDay();
    var today = todayKey();
    var dayEntry = state.days[today] || { m: null, b: [] };

    /* main card */
    var q = deal.main;
    var mainDone = dayEntry.m === q.id;
    els.mainCard.innerHTML =
      '<div class="ec-q-check" aria-hidden="true">' + CHECK_ICO + "</div>" +
      '<div class="ec-q-top">' +
        '<span class="ec-q-ico">' + CAT_ICONS[q.cat] + "</span>" +
        '<span class="ec-q-flag">Today&rsquo;s main quest</span>' +
        '<span class="ec-q-pts">+' + q.pts + " pts</span>" +
      "</div>" +
      '<h3 class="ec-q-title">' + q.title + "</h3>" +
      '<p class="ec-q-desc">' + q.desc + "</p>" +
      '<div class="ec-q-meta">' +
        '<span class="ec-chip ec-chip-diff-' + q.diff.toLowerCase() + '">' + q.diff + "</span>" +
        '<span class="ec-chip">' + q.catName + "</span>" +
      "</div>" +
      '<div class="ec-q-tip">' + TIP_ICO +
        "<div><b>Why it matters:</b> " + q.tip + ' <span class="ec-q-src">&mdash; ' + q.src + "</span></div>" +
      "</div>" +
      '<button type="button" class="btn btn-primary ec-done-btn' + (mainDone ? " is-done-btn" : "") + '" data-quest="' + q.id + '" data-kind="main"' + (mainDone ? " disabled" : "") + ">" +
        (mainDone ? BTN_CHECK + " Completed today" : "Mark as done") +
      "</button>" +
      (mainDone ? '<p class="ec-q-after">Streak safe &mdash; the next quest lands at midnight.</p>' : "");
    els.mainCard.setAttribute("data-state", mainDone ? "done" : "idle");

    /* side cards */
    els.sideList.innerHTML = deal.bonuses.map(function (sq) {
      var done = (dayEntry.b || []).indexOf(sq.id) !== -1;
      return '<article class="ec-side-card" data-state="' + (done ? "done" : "idle") + '">' +
        '<div class="ec-side-head">' +
          '<span class="ec-q-ico">' + CAT_ICONS[sq.cat] + "</span>" +
          '<h4 class="ec-side-name">' + sq.title + "</h4>" +
          '<span class="ec-q-pts">+' + sq.pts + "</span>" +
        "</div>" +
        '<p class="ec-side-desc">' + sq.desc + "</p>" +
        '<div class="ec-side-foot">' +
          '<span class="ec-chip ec-chip-diff-' + sq.diff.toLowerCase() + '">' + sq.diff + "</span>" +
          '<button type="button" class="btn btn-primary ec-done-btn ec-done-btn-sm' + (done ? " is-done-btn" : "") + '" data-quest="' + sq.id + '" data-kind="side"' + (done ? " disabled" : "") + ">" +
            (done ? BTN_CHECK + " Done" : "Mark as done") +
          "</button>" +
        "</div>" +
        '<div class="ec-q-check" aria-hidden="true">' + CHECK_ICO + "</div>" +
      "</article>";
    }).join("");

    /* date label */
    try {
      els.date.textContent = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      els.date.textContent = today;
    }
  }

  function renderStats(popKeys) {
    var s = computeStats();
    setStat("total", s.total, popKeys);
    setStat("streak", s.streak, popKeys);
    setStat("points", s.points, popKeys);
    setStat("best", s.best, popKeys);
  }

  function setStat(key, val, popKeys) {
    var el = els.stats[key];
    if (!el || el.textContent === String(val)) {
      if (el) el.textContent = String(val);
      return;
    }
    el.textContent = String(val);
    if (popKeys && popKeys.indexOf(key) !== -1 && !RM) {
      el.classList.remove("pop");
      void el.offsetWidth; /* restart animation */
      el.classList.add("pop");
    }
  }

  function renderStrip() {
    var html = "";
    var names = ["S", "M", "T", "W", "T", "F", "S"];
    for (var i = 13; i >= 0; i--) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      var k = keyOf(d);
      var entry = state.days[k];
      var cls = "ec-day";
      var mark = "&nbsp;";
      if (entry) {
        if (entry.m) { cls += " is-done"; mark = "&#10003;"; }
        else if ((entry.b || []).length) { cls += " is-part"; mark = "&bull;"; }
      }
      if (i === 0) cls += " is-today";
      html += '<div class="' + cls + '"><span class="ec-day-box">' + mark + '</span><span class="ec-day-name">' + names[d.getDay()] + "</span></div>";
    }
    els.strip.innerHTML = html;
  }

  function renderBadges(newIds) {
    var s = computeStats();
    var unlockedCount = 0;
    els.badges.innerHTML = BADGES.map(function (b) {
      var earnedOn = state.unlocked[b.id];
      var isUnlocked = !!earnedOn;
      if (isUnlocked) unlockedCount++;
      var just = newIds && newIds.indexOf(b.id) !== -1;
      return '<li class="ec-badge' + (isUnlocked ? "" : " is-locked") + (just ? " just-unlocked" : "") + '">' +
        '<span class="ec-badge-ico">' + (isUnlocked ? BADGE_ICONS[b.icon] : svg('<path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="currentColor" stroke-width="1.9" fill="none" stroke-linecap="round"/><rect x="5" y="11" width="14" height="9" rx="2.5" stroke="currentColor" stroke-width="1.9" fill="none"/>')) + "</span>" +
        '<span class="ec-badge-name">' + b.name + "</span>" +
        '<span class="ec-badge-desc">' + (isUnlocked ? "Unlocked" : b.desc) + "</span>" +
        (earnedOn ? '<span class="ec-badge-earned">Earned ' + earnedOn + "</span>" : "") +
      "</li>";
    }).join("");
    els.badgeCount.textContent = unlockedCount + " of " + BADGES.length + " unlocked";
    return s;
  }

  function renderAll(popKeys) {
    renderQuests();
    renderStats(popKeys);
    renderStrip();
    renderBadges();
  }

  /* ---------------- Toast ---------------- */
  var toastTimer = null;
  function toast(msg) {
    if (!els.toast) return;
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      els.toast.classList.remove("show");
    }, 2800);
  }

  /* ---------------- Confetti ---------------- */
  var confetti = { canvas: null, ctx: null, parts: [], raf: null };

  function initConfetti() {
    confetti.canvas = els.canvas;
    if (!confetti.canvas) return;
    confetti.ctx = confetti.canvas.getContext("2d");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }

  function resizeCanvas() {
    if (!confetti.canvas) return;
    confetti.canvas.width = window.innerWidth;
    confetti.canvas.height = window.innerHeight;
  }

  var CONF_COLORS = ["#10b981", "#0d9488", "#0ea672", "#f59e0b", "#38bdf8", "#f472b6", "#a7f3d0", "#fbbf24"];

  function fireConfetti(x, y, count) {
    if (RM || !confetti.ctx) return;
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 4 + Math.random() * 8;
      confetti.parts.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        g: 0.22 + Math.random() * 0.08,
        size: 5 + Math.random() * 6,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: CONF_COLORS[(Math.random() * CONF_COLORS.length) | 0],
        shape: Math.random() < 0.65 ? "rect" : "circle",
        life: 1,
        decay: 0.008 + Math.random() * 0.012
      });
    }
    if (confetti.parts.length > 420) {
      confetti.parts.splice(0, confetti.parts.length - 420);
    }
    if (!confetti.raf) confetti.raf = requestAnimationFrame(tickConfetti);
  }

  function tickConfetti() {
    var ctx = confetti.ctx;
    ctx.clearRect(0, 0, confetti.canvas.width, confetti.canvas.height);
    for (var i = confetti.parts.length - 1; i >= 0; i--) {
      var p = confetti.parts[i];
      p.vx *= 0.985;
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= p.decay;
      if (p.life <= 0 || p.y > confetti.canvas.height + 30) {
        confetti.parts.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (confetti.parts.length) {
      confetti.raf = requestAnimationFrame(tickConfetti);
    } else {
      confetti.raf = null;
      ctx.clearRect(0, 0, confetti.canvas.width, confetti.canvas.height);
    }
  }

  function confettiBurst(el, big) {
    if (!el || RM) return;
    var r = el.getBoundingClientRect();
    var x = r.left + r.width / 2;
    var y = r.top + Math.min(r.height / 2, 180);
    fireConfetti(x, y, big ? 160 : 70);
  }

  /* ---------------- Completion flow ---------------- */
  function findButton(questId) {
    return els.mainCard.querySelector('[data-quest="' + questId + '"]') ||
      els.sideList.querySelector('[data-quest="' + questId + '"]');
  }

  function completeQuest(questId, kind) {
    var q = questById(questId);
    if (!q) return;
    var today = todayKey();
    if (!state.days[today]) state.days[today] = { m: null, b: [] };
    var entry = state.days[today];

    if (kind === "main") {
      if (entry.m) return;
      entry.m = questId;
    } else {
      entry.b = entry.b || [];
      if (entry.b.indexOf(questId) !== -1) return;
      entry.b.push(questId);
    }
    save();

    var s = computeStats();
    var btn = findButton(questId);
    if (btn) {
      btn.classList.add("is-done-btn");
      btn.disabled = true;
      btn.innerHTML = BTN_CHECK + (kind === "main" ? " Completed today" : " Done");
    }

    /* toast + confetti */
    if (kind === "main") {
      toast("Main quest done — +" + q.pts + " pts, " + s.streak + "-day streak!");
      els.mainCard.setAttribute("data-state", "done");
      var after = document.createElement("p");
      after.className = "ec-q-after";
      after.textContent = "Streak safe — the next quest lands at midnight.";
      var oldAfter = els.mainCard.querySelector(".ec-q-after");
      if (oldAfter) oldAfter.remove();
      els.mainCard.appendChild(after);
      confettiBurst(els.mainCard, true);
    } else {
      toast("Side quest done — +" + q.pts + " pts");
      var card = btn && btn.closest(".ec-side-card");
      if (card) card.setAttribute("data-state", "done");
      confettiBurst(btn, false);
    }

    renderStats(kind === "main" ? ["total", "streak", "points", "best"] : ["total", "points"]);
    renderStrip();

    /* badges */
    var newly = [];
    BADGES.forEach(function (b) {
      if (!state.unlocked[b.id] && b.test(s)) {
        state.unlocked[b.id] = today;
        newly.push(b);
      }
    });
    if (newly.length) {
      save();
      renderBadges(newly.map(function (b) { return b.id; }));
      newly.forEach(function (b, i) {
        setTimeout(function () {
          toast("Badge unlocked: " + b.name);
          var badgeEl = els.badges.querySelector(".ec-badge.just-unlocked, .ec-badge:not(.is-locked)");
          if (badgeEl && !RM) {
            badgeEl.classList.remove("just-unlocked");
            void badgeEl.offsetWidth;
            badgeEl.classList.add("just-unlocked");
          }
          confettiBurst(els.badges, false);
        }, 900 + i * 1200);
      });
    }
  }

  /* ---------------- Modals ---------------- */
  var lastFocus = null;

  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    lastFocus = document.activeElement;
    m.hidden = false;
    document.body.style.overflow = "hidden";
    var panel = m.querySelector(".ec-modal-panel");
    if (panel) panel.focus();
    var tabbable = m.querySelectorAll("button, a[href]");
    if (tabbable.length) tabbable[0].focus();
  }

  function closeModal(m) {
    m.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function bindModals() {
    ["ec-howto-hero", "ec-howto-btn"].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) b.addEventListener("click", function () { openModal("ec-howto"); });
    });
    var resetBtn = document.getElementById("ec-reset-btn");
    if (resetBtn) resetBtn.addEventListener("click", function () { openModal("ec-reset"); });

    document.querySelectorAll(".ec-modal").forEach(function (m) {
      m.addEventListener("click", function (e) {
        if (e.target.closest("[data-close]")) closeModal(m);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      document.querySelectorAll(".ec-modal:not([hidden])").forEach(function (m) { closeModal(m); });
    });
    var confirmBtn = document.getElementById("ec-reset-confirm");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", function () {
        state = { v: 1, days: {}, best: 0, unlocked: {} };
        save();
        var m = document.getElementById("ec-reset");
        if (m) closeModal(m);
        renderAll();
        toast("Fresh start — day one begins now.");
      });
    }
  }

  /* ---------------- Init ---------------- */
  function init() {
    cacheEls();
    load();
    renderAll();
    initConfetti();
    bindModals();

    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-quest]");
      if (btn && !btn.disabled) {
        completeQuest(btn.getAttribute("data-quest"), btn.getAttribute("data-kind"));
      }
    });

    if (!storageOk) {
      setTimeout(function () {
        toast("This browser blocks local storage — progress will not survive a refresh.");
      }, 1400);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
