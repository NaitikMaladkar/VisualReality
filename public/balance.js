/* ============================================================
   Visual Reality — Tech vs Nature (balance game)
   Drag-and-drop trade-off game · live meters · reactive scene
   Pure vanilla JS. Static data, no APIs.
   ============================================================ */
(function () {
  "use strict";

  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Card icons ---------------- */
  function svg(paths) {
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + paths + "</g></svg>";
  }

  var CARD_ICONS = {
    coal: svg('<path d="M3 21h18M5 21v-8l4 2.4V13l4 2.4V13l6-3v11"/><path d="M7.5 7.5h3.5V5"/>'),
    solar: svg('<rect x="3.5" y="9" width="17" height="8" rx="1.5"/><path d="M9.2 9v8M14.8 9v8M3.5 13h17M12 17v4M8.5 21h7"/><path d="M12 3v2.6M6.8 5.2l1.5 1.6M17.2 5.2l-1.5 1.6"/>'),
    wind: svg('<path d="M12 21v-8"/><circle cx="12" cy="11" r="1.6"/><path d="M12 9.4V3.6l4.6 3.4-4.2 2.6M10.7 12l-5 2.9.6-5.6 4.4 2.9M13.4 12.2l4.9 3-.4-5.6-4.5 2.8"/>'),
    highway: svg('<path d="M8 3 4 21M16 3l4 18"/><path d="M10.4 6.5h3.2M9.7 11h4.6M9 15.5h6M8.3 20h7.4"/>'),
    factory: svg('<path d="M3 21h18M5 21v-8l4.5 2.6V13l4.5 2.6V13l5-2.6V21"/><path d="M8 8V4h3v4"/>'),
    datacenter: svg('<rect x="4" y="3.5" width="16" height="7" rx="1.5"/><rect x="4" y="13.5" width="16" height="7" rx="1.5"/><path d="M7.5 7h.01M7.5 17h.01M11 7h3M11 17h3"/>'),
    mine: svg('<path d="m5 19 7.5-7.5M14 4.5c2.5 1 5 3.5 6 6l-4 4c-1-2.5-3.5-5-6-6l4-4Z"/><path d="m3.5 20.5 3-3"/>'),
    forest: svg('<path d="M12 21v-5"/><path d="M12 16 6.5 8.5h3L6 3.5h12l-3.5 5h3L12 16Z"/>'),
    wetland: svg('<path d="M6 15c1.8 1.4 3.2 1.4 5 0 1.8-1.4 3.2-1.4 5 0M3.5 19c1.8 1.4 3.2 1.4 5 0 1.8-1.4 3.2-1.4 5 0 1.8 1.4 3.2 1.4 5 0"/><path d="M9 12V5m6 7V3.5M9 5c1.2 1 2 1 3.2 0M15 3.5c1.2 1 2 1 3.2 0"/>'),
    river: svg('<path d="M20 6.5c-2 0-3.2 1.5-5.4 1.5S11.6 6.5 9.5 6.5 6.2 8 4 8"/><path d="M20 12c-2 0-3.2 1.5-5.4 1.5S11.6 12 9.5 12 6.2 13.5 4 13.5"/><path d="M20 17.5c-2 0-3.2 1.5-5.4 1.5s-3-1.5-5.1-1.5S6.2 19 4 19"/>'),
    vfarm: svg('<path d="M4 20h16M6 20v-3h12v3"/><path d="M7 13.5h10v3.5H7zM8.5 13.5V11h7v2.5"/><path d="M12 11V7.5m0 0c-1.6 0-2.6-1-2.8-2.6C10.8 5 11.8 6 12 7.5Zm0 0c1.6 0 2.6-1 2.8-2.6C13.2 5 12.2 6 12 7.5Z"/>'),
    bikes: svg('<circle cx="6" cy="17" r="3.2"/><circle cx="18" cy="17" r="3.2"/><path d="M6 17 9.5 9h5M18 17l-3-8h-2.5M9.5 9l3.5 8h1.8"/>'),
    gigafactory: svg('<rect x="4" y="7.5" width="15" height="10" rx="2"/><path d="M19.5 10.5h1.5v4h-1.5M12.6 9.5 9.5 13h3l-1.6 3 4.6-4h-3l1.6-2.5Z"/>'),
    sprawl: svg('<path d="M3 20h18M5 20v-7l3.5-3 3.5 3v7M12 20v-9l3.5-2.5L19 11v9"/><path d="M7.2 13.5h2.6M14.6 14.5h2.4"/>'),
    rail: svg('<rect x="5" y="3.5" width="14" height="13" rx="3"/><path d="M5 10h14M9 20l-1.5 1.5M15 20l1.5 1.5M8.5 13.5h.01M15.5 13.5h.01M9 16.5 7 20m8-3.5 2 3.5"/>'),
    reforest: svg('<path d="M12 21v-8"/><path d="M12 13C12 8.5 8.5 6 4.5 6c0 4.5 3.5 7 7.5 7Z"/><path d="M12 10c0-3.2 2.4-5 5.4-5 0 3.2-2.4 5-5.4 5Z"/><path d="M3 21c2.5-1.5 5.5-1.5 9 0 3.5-1.5 6.5-1.5 9 0" opacity="0.6"/>')
  };

  /* ---------------- Deck ---------------- */
  var CARDS = [
    { id: "coal", name: "Coal power plant",
      blurb: "Cheap, around-the-clock power — and the heaviest carbon footprint of any electricity source.",
      build: { ind: 9, nat: -9, note: "Baseload power and hundreds of jobs arrive — with the region's biggest polluter." },
      protect: { ind: 0, nat: 3, note: "The valley keeps its sky; the energy will have to come from somewhere else." },
      fact: "Coal emits roughly 820 g of CO\u2082 per kWh — nearly double the intensity of gas power.", src: "IEA" },
    { id: "solar", name: "Solar farm",
      blurb: "Rows of photovoltaic panels on 120 hectares of quiet farmland.",
      build: { ind: 7, nat: -2, note: "Cheap daytime power and lease income; the field is no longer a meadow." },
      protect: { ind: -2, nat: 2, note: "The meadow stays a meadow — and the region keeps importing power." },
      fact: "Utility-scale solar is the cheapest electricity in history, according to the IEA's 2020 World Energy Outlook.", src: "IEA" },
    { id: "wind", name: "Wind farm",
      blurb: "Turbines along the ridge, sharing the hillside with sheep and crops.",
      build: { ind: 7, nat: -1, note: "Clean power with a small ground footprint — some noise, some views changed." },
      protect: { ind: -2, nat: 2, note: "The ridge stays silent — the grid misses its windiest asset." },
      fact: "A modern turbine repays the carbon of manufacturing it within 6–11 months of clean output.", src: "Vestas LCA" },
    { id: "highway", name: "Highway expansion",
      blurb: "Two extra lanes promising faster freight and shorter commutes.",
      build: { ind: 6, nat: -6, note: "Minutes saved today — until the wider road fills up and the asphalt stays forever." },
      protect: { ind: -3, nat: 4, note: "Congestion stays painful, but the corridor's fields and hedges survive." },
      fact: "\u201CInduced demand\u201D: added lanes tend to fill with new traffic within about a decade.", src: "Transport studies" },
    { id: "factory", name: "Factory district",
      blurb: "A manufacturing campus promising 400 steady jobs to the town.",
      build: { ind: 9, nat: -7, note: "Paychecks anchor the town — and an effluent pipe anchors to the river." },
      protect: { ind: -4, nat: 4, note: "The river runs clean; the jobs board stays empty." },
      fact: "Industry directly produces about 24% of global greenhouse-gas emissions.", src: "IPCC" },
    { id: "datacenter", name: "Data-center campus",
      blurb: "Server halls promising cloud jobs, startup energy and low latency.",
      build: { ind: 6, nat: -3, note: "Digital jobs arrive with a serious appetite for electricity and cooling water." },
      protect: { ind: -3, nat: 2, note: "The aquifer keeps its budget; the packet latency leaves town." },
      fact: "Data centres already use about 1–1.5% of the world's electricity, and AI demand is climbing fast.", src: "IEA" },
    { id: "mine", name: "Copper mine",
      blurb: "An open pit feeding the metal needs of every motor, cable and turbine.",
      build: { ind: 8, nat: -8, note: "Export income and royalties — and a two-kilometre scar in the hillside." },
      protect: { ind: -3, nat: 5, note: "The hill keeps its shape; the energy transition buys its copper elsewhere." },
      fact: "The clean-energy transition is metals-hungry: IEA projects copper demand for clean tech to keep climbing to 2040.", src: "IEA" },
    { id: "forest", name: "Old-growth forest tract",
      blurb: "Three-hundred-year-old trees, flagged for timber leases and a resort road.",
      build: { ind: 5, nat: -8, note: "One-off timber money and a resort access road — the old canopy never returns on schedule." },
      protect: { ind: 0, nat: 9, note: "A national park anchors eco-tourism, the water table and the patience of everyone downstream." },
      fact: "One hectare of mature forest stores roughly 300–500 tonnes of carbon in biomass and soil.", src: "FAO" },
    { id: "wetland", name: "Wetland marsh",
      blurb: "Reed beds and bird colonies, eyed for a marina and lakeside lots.",
      build: { ind: 4, nat: -7, note: "Waterfront property values rise as the marsh's flood buffer disappears." },
      protect: { ind: -1, nat: 8, note: "A storm buffer, a water filter and a birdwatching economy stay put." },
      fact: "Peatlands and wetlands cover only ~3% of land yet store about 30% of soil carbon.", src: "IUCN" },
    { id: "river", name: "Free-flowing river",
      blurb: "A dam proposal promising flood control, storage and firm hydropower.",
      build: { ind: 8, nat: -6, note: "Firm renewable power and flood safety — and blocked fish runs upstream." },
      protect: { ind: -2, nat: 7, note: "The river keeps running free; the flood bill stays with the weather." },
      fact: "Hydropower is the world's largest renewable source — yet only ~37% of long rivers still flow freely.", src: "Nature" },
    { id: "vfarm", name: "Vertical farm",
      blurb: "Salad greens under LEDs in a converted warehouse, twelve months a year.",
      build: { ind: 5, nat: 1, note: "Local greens with 95% less water and zero pesticide runoff — but a real electricity bill." },
      protect: { ind: -1, nat: 2, note: "The warehouse stays a warehouse; greens keep arriving by truck." },
      fact: "Vertical farms can use up to 95% less water than open-field growing — but they run on electricity.", src: "WEF" },
    { id: "bikes", name: "Bike-lane network",
      blurb: "Protected lanes across town — the mildest proposal on the docket.",
      build: { ind: 2, nat: 3, note: "Cheap, healthy mobility that trims both congestion and emissions." },
      protect: { ind: -1, nat: 1, note: "Streets stay as they are — and the car default keeps winning." },
      fact: "Swapping one daily car trip for cycling cuts that trip's CO\u2082 by roughly two-thirds.", src: "Univ. of Oxford" },
    { id: "gigafactory", name: "Battery gigafactory",
      blurb: "Cells for a million electric vehicles — and a mine's worth of lithium upstream.",
      build: { ind: 7, nat: -4, note: "The electrification supply chain lands locally, with extraction impacts upstream." },
      protect: { ind: -3, nat: 3, note: "No gigafactory — and no local stake in the EV decade." },
      fact: "EVs emit roughly 50–70% less CO\u2082 over their lifetime than petrol cars, even on today's grids.", src: "ICCT" },
    { id: "sprawl", name: "Suburban expansion",
      blurb: "Two thousand new homes — planned on what used to be orchards and meadows.",
      build: { ind: 6, nat: -5, note: "Housing supply grows where roads already lead; the orchards do not." },
      protect: { ind: -2, nat: 4, note: "The meadows stay; the housing list stays too." },
      fact: "Cities house 56% of humanity, and sprawl keeps converting farmland on every growing metro's edge.", src: "UN" },
    { id: "rail", name: "Regional rail line",
      blurb: "Electrified rail linking four towns — steel that moves people, not asphalt.",
      build: { ind: 6, nat: -1, note: "Thousands of car trips displaced daily for a one-time corridor cost." },
      protect: { ind: -2, nat: 2, note: "The corridor stays green — and car dependency stays entrenched." },
      fact: "Rail moves 8% of the world's passengers using just 2% of transport energy.", src: "IEA" },
    { id: "reforest", name: "Bare hillside",
      blurb: "An eroded slope: quarry and terrace housing, or a reforestation contract.",
      build: { ind: 3, nat: -2, note: "Modest quarry jobs and terrace lots — and a steeper runoff problem." },
      protect: { ind: 1, nat: 7, note: "Planting crews get seasons of work; the slope gets roots and carbon." },
      fact: "A mature tree absorbs about 22 kg of CO\u2082 per year — forests compound like interest.", src: "EEA" }
  ];

  var ROUNDS = 10;

  /* ---------------- State ---------------- */
  var deck = [], round = 0, ind = 50, nat = 50, choices = [], busy = false, finished = false;

  var els = {};
  function cacheEls() {
    els.round = document.getElementById("bg-round");
    els.pips = document.getElementById("bg-pips");
    els.card = document.getElementById("bg-card");
    els.buildZone = document.getElementById("bg-zone-build");
    els.protectZone = document.getElementById("bg-zone-protect");
    els.indFill = document.getElementById("bg-ind-fill");
    els.natFill = document.getElementById("bg-nat-fill");
    els.indVal = document.getElementById("bg-ind-val");
    els.natVal = document.getElementById("bg-nat-val");
    els.needle = document.getElementById("bg-needle");
    els.status = document.getElementById("bg-status");
    els.debrief = document.getElementById("bg-debrief");
    els.debriefIco = document.getElementById("bg-debrief-ico");
    els.debriefLine = document.getElementById("bg-debrief-line");
    els.debriefFact = document.getElementById("bg-debrief-fact");
    els.debriefSrc = document.getElementById("bg-debrief-src");
    els.verdict = document.getElementById("bg-verdict");
    els.toast = document.getElementById("bg-toast");
  }

  /* ---------------- Utils ---------------- */
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function tween(from, to, dur, cb, done) {
    if (RM) { cb(to); if (done) done(); return; }
    var t0 = performance.now();
    function step(t) {
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      cb(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
      else if (done) done();
    }
    requestAnimationFrame(step);
  }

  var toastTimer = null;
  function toast(msg) {
    if (!els.toast) return;
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.classList.remove("show"); }, 2600);
  }

  function fmtDelta(v, word) {
    if (v > 0) return '<span class="up">+' + v + "</span> " + word;
    if (v < 0) return '<span class="down">&minus;' + Math.abs(v) + "</span> " + word;
    return word + " unchanged";
  }

  /* ---------------- Scene ---------------- */
  var trees, bldgs;
  function applyScene() {
    if (!trees) {
      trees = Array.prototype.slice.call(document.querySelectorAll(".bg-tree"));
      bldgs = Array.prototype.slice.call(document.querySelectorAll(".bg-bldg"));
    }
    var smog = Math.max(0, Math.min(1, (55 - nat) / 50));
    var smoke = Math.max(0, Math.min(1, (ind - 40) / 60));

    var haze = document.getElementById("bg-haze");
    var riverBad = document.getElementById("bg-river-bad");
    var sun = document.getElementById("bg-sun");
    var c1 = document.getElementById("bg-cloud1");
    var c2 = document.getElementById("bg-cloud2");
    var smokeG = document.getElementById("bg-smoke");
    var birds = document.getElementById("bg-birds");

    if (haze) haze.setAttribute("opacity", (smog * 0.55).toFixed(3));
    if (riverBad) riverBad.setAttribute("opacity", (smog * 0.85).toFixed(3));
    if (sun) sun.setAttribute("opacity", Math.max(0.15, 1 - smog * 0.8).toFixed(3));
    if (c1) c1.setAttribute("opacity", (0.55 + smog * 0.3).toFixed(3));
    if (c2) c2.setAttribute("opacity", (0.5 + smog * 0.3).toFixed(3));
    if (smokeG) smokeG.setAttribute("opacity", (smoke * 0.9).toFixed(3));
    if (birds) birds.style.opacity = nat >= 60 ? "1" : "0";

    var treeCount = 1 + Math.round(nat / 100 * (trees.length - 1));
    trees.forEach(function (t, i) { t.classList.toggle("on", i < treeCount); });

    var bldgCount = 1 + Math.round(ind / 100 * (bldgs.length - 1));
    bldgs.forEach(function (b, i) { b.classList.toggle("on", i < bldgCount); });
  }

  /* ---------------- Meters ---------------- */
  function applyMeters(animate) {
    tweenTo(els.indFill, els.indVal, ind, animate);
    tweenTo(els.natFill, els.natVal, nat, animate);

    var gap = ind - nat;
    var pos = Math.max(3, Math.min(97, 50 + gap / 2));
    els.needle.style.left = pos + "%";

    var st = statusOf();
    els.status.textContent = st.text;
    els.status.className = "bg-status " + st.cls;
  }

  function tweenTo(fill, valEl, target, animate) {
    var current = parseFloat(fill.style.width) || 50;
    fill.style.width = target + "%";
    if (!animate || RM) {
      valEl.textContent = Math.round(target) + "%";
      return;
    }
    tween(current, target, 700, function (v) {
      valEl.textContent = Math.round(v) + "%";
    });
  }

  function statusOf() {
    var gap = ind - nat;
    if (nat < 25) return { cls: "m-danger", text: "Nature is collapsing — smog, silence, empty rivers" };
    if (ind < 25) return { cls: "m-danger", text: "The economy is stalling — shuttered cranes, for-sale signs" };
    if (gap > 25) return { cls: "m-warn", text: "Industry pulling ahead — the canopy is thinning" };
    if (gap < -25) return { cls: "m-warn", text: "Nature pulling ahead — but where will the jobs come from?" };
    return { cls: "", text: "In balance — growth and greenery holding hands" };
  }

  /* ---------------- Card rendering ---------------- */
  function currentCard() {
    return CARDS.filter(function (c) { return c.id === deck[round]; })[0];
  }

  function renderCard() {
    var c = currentCard();
    if (!c) return;
    var buildRow = '<span class="bg-impact-tag build">Build</span>' +
      fmtDelta(c.build.ind, "industry") + " &middot; " + fmtDelta(c.build.nat, "nature");
    var protectRow = '<span class="bg-impact-tag protect">Protect</span>' +
      fmtDelta(c.protect.nat, "nature") + " &middot; " + fmtDelta(c.protect.ind, "industry");

    els.card.innerHTML =
      '<div class="bg-card-kicker"><span>Proposal ' + (round + 1) + " of " + ROUNDS + '</span><span class="bg-card-ico">' + CARD_ICONS[c.id] + "</span></div>" +
      '<h3 class="bg-card-name">' + c.name + "</h3>" +
      '<p class="bg-card-blurb">' + c.blurb + "</p>" +
      '<div class="bg-impact">' +
        '<div class="bg-impact-row">' + buildRow + "</div>" +
        '<div class="bg-impact-row">' + protectRow + "</div>" +
      "</div>" +
      '<div class="bg-card-actions">' +
        '<button type="button" class="btn bg-btn-build" data-side="build">Build it</button>' +
        '<button type="button" class="btn btn-primary bg-btn-protect" data-side="protect">Protect it</button>' +
      "</div>";

    els.card.classList.add("is-draggable");
    els.card.classList.remove("enter");
    void els.card.offsetWidth;
    els.card.classList.add("enter");
    els.card.style.opacity = "";
    els.card.style.transform = "";

    els.round.innerHTML = "Round <b>" + (round + 1) + "</b> of " + ROUNDS;
    updatePips();

    /* debrief from the previous decision stays visible until the next one lands */
  }

  function updatePips() {
    var html = "";
    for (var i = 0; i < ROUNDS; i++) {
      var cls = "bg-pip";
      if (choices[i]) cls += choices[i].side === "build" ? " build" : " protect";
      if (i === round && !finished) cls += " now";
      html += '<span class="' + cls + '"></span>';
    }
    els.pips.innerHTML = html;
  }

  /* ---------------- Decide ---------------- */
  function decide(side, dropped) {
    if (busy || finished || !deck.length) return;
    var c = currentCard();
    if (!c) return;
    busy = true;
    choices[round] = { id: c.id, side: side };

    clearSelection();

    var d = side === "build" ? c.build : c.protect;
    var note = d.note;

    function afterFly() {
      ind = Math.max(0, Math.min(100, ind + d.ind));
      nat = Math.max(0, Math.min(100, nat + d.nat));
      applyMeters(true);
      applyScene();
      showDebrief(c, side, note);
      updatePips();
      if (dropped) flashZone(side);

      setTimeout(function () {
        busy = false;
        round++;
        if (round < ROUNDS) {
          renderCard();
        } else {
          finished = true;
          updatePips();
          els.round.innerHTML = "Run <b>complete</b> — " + ROUNDS + " of " + ROUNDS;
          setTimeout(showVerdict, 650);
        }
      }, dropped ? 550 : 1150);
    }

    if (dropped) {
      els.card.classList.remove("is-dragging", "is-draggable");
      els.card.style.transition = "";
      els.card.style.transform = "scale(0.6)";
      els.card.style.opacity = "0";
      setTimeout(afterFly, 260);
    } else {
      flyToZone(side, afterFly);
    }
  }

  function flyToZone(side, cb) {
    var zone = side === "build" ? els.buildZone : els.protectZone;
    var zr = zone.getBoundingClientRect();
    var cr = els.card.getBoundingClientRect();
    var dx = zr.left + zr.width / 2 - (cr.left + cr.width / 2);
    var dy = zr.top + zr.height / 2 - (cr.top + cr.height / 2);
    if (RM) { cb(); return; }
    els.card.classList.remove("is-draggable");
    els.card.style.transition = "transform 0.55s cubic-bezier(0.5, 0, 0.75, 0), opacity 0.4s ease 0.15s";
    els.card.style.transform = "translate(" + dx + "px," + dy + "px) scale(0.12) rotate(" + (side === "build" ? -8 : 8) + "deg)";
    els.card.style.opacity = "0";
    flashZone(side);
    setTimeout(cb, 520);
  }

  function flashZone(side) {
    var zone = side === "build" ? els.buildZone : els.protectZone;
    zone.classList.remove("is-hit");
    void zone.offsetWidth;
    zone.classList.add("is-hit");
  }

  function showDebrief(c, side, note) {
    els.debriefIco.innerHTML = CARD_ICONS[c.id];
    var verb = side === "build" ? "built" : "protected";
    els.debriefLine.innerHTML = "You " + verb + " the <b>" + c.name.toLowerCase() + "</b>. " + note;
    els.debriefFact.innerHTML = "<b>Real-world anchor:</b> " + c.fact;
    els.debriefSrc.textContent = c.src;
    els.debrief.className = "bg-debrief choice-" + side;
    els.debrief.hidden = false;
  }

  /* ---------------- Drag & tap-select ---------------- */
  var drag = null;

  function zoneAt(x, y) {
    var zr = els.buildZone.getBoundingClientRect();
    if (x >= zr.left && x <= zr.right && y >= zr.top && y <= zr.bottom) return els.buildZone;
    var pr = els.protectZone.getBoundingClientRect();
    if (x >= pr.left && x <= pr.right && y >= pr.top && y <= pr.bottom) return els.protectZone;
    return null;
  }

  function clearHotZones() {
    els.buildZone.classList.remove("is-hot");
    els.protectZone.classList.remove("is-hot");
  }

  function clearSelection() {
    els.card.classList.remove("is-selected");
    els.buildZone.classList.remove("is-hint");
    els.protectZone.classList.remove("is-hint");
  }

  function bindCardPointerEvents() {
    els.card.addEventListener("pointerdown", function (e) {
      if (busy || finished) return;
      if (e.target.closest("button")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false };
      try { els.card.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
    });

    els.card.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x0;
      var dy = e.clientY - drag.y0;
      if (!drag.moved && Math.sqrt(dx * dx + dy * dy) > 8) {
        drag.moved = true;
        els.card.classList.add("is-dragging");
        clearSelection();
      }
      if (drag.moved) {
        els.card.style.transition = "none";
        var rot = Math.max(-7, Math.min(7, dx * 0.05));
        els.card.style.transform = "translate(" + dx + "px," + dy + "px) rotate(" + rot + "deg) scale(1.04)";
        var z = zoneAt(e.clientX, e.clientY);
        els.buildZone.classList.toggle("is-hot", z === els.buildZone);
        els.protectZone.classList.toggle("is-hot", z === els.protectZone);
      }
    });

    function endDrag(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var wasMoved = drag.moved;
      drag = null;
      if (wasMoved) {
        var z = zoneAt(e.clientX, e.clientY);
        clearHotZones();
        if (z) {
          decide(z === els.buildZone ? "build" : "protect", true);
        } else {
          els.card.classList.remove("is-dragging");
          els.card.style.transition = "";
          els.card.style.transform = "";
          els.card.style.opacity = "";
        }
      } else {
        els.card.classList.toggle("is-selected");
        var sel = els.card.classList.contains("is-selected");
        els.buildZone.classList.toggle("is-hint", sel);
        els.protectZone.classList.toggle("is-hint", sel);
      }
    }

    els.card.addEventListener("pointerup", endDrag);
    els.card.addEventListener("pointercancel", function () {
      if (drag) {
        drag = null;
        clearHotZones();
        els.card.classList.remove("is-dragging");
        els.card.style.transition = "";
        els.card.style.transform = "";
        els.card.style.opacity = "";
      }
    });
  }

  /* ---------------- Verdict ---------------- */
  var ENDINGS = {
    harmony: {
      title: "The Harmony Years",
      kicker: "Best ending",
      copy: "Ten rounds in, both meters are humming: paychecks and clean air coexist, the river runs clear past a busy skyline, and the birds didn\u2019t file a single complaint. This is what a balanced portfolio buys you.",
      lesson: [
        "Real sustainability is a portfolio, not a purity test.",
        "Every card in this deck exists in the real world — so do the trade-offs.",
        "The best decision-makers aren\u2019t anti-industry or anti-nature; they\u2019re pro-balance."
      ]
    },
    boomtown: {
      title: "The Boomtown Blues",
      kicker: "Nature fell below 40%",
      copy: "The skyline grew fast — and the wetlands, birds and clean-air days paid the bill. Cranes everywhere, respirators nowhere to be seen\u2026 yet. Growth that eats its own foundations has a way of stopping.",
      lesson: [
        "Growth that hollows out its own foundations eventually stalls.",
        "Clean air, water and soil are economic infrastructure — they just never send invoices.",
        "Try keeping one or two high-nature cards in every run."
      ]
    },
    valley: {
      title: "The Quiet Valley",
      kicker: "Jobs & growth fell below 40%",
      copy: "Forest to the horizon, birdsong around the clock — and a \u201CFor Lease\u201D sign on the one factory. Young people keep leaving for cities with jobs. Beauty, it turns out, doesn\u2019t pay rent by itself.",
      lesson: [
        "A beautiful valley with no livelihoods quietly exports its young people.",
        "Solar farms, rail lines and retrofits are nature-side wins that still pay wages.",
        "Look for the cards where both meters move together."
      ]
    },
    stumble: {
      title: "The Long Stumble",
      kicker: "Both meters crashed",
      copy: "Neither the cranes nor the canaries made it. When both meters crash, there\u2019s no happy ending left to spend the savings on. Run it back — and lock in the win-win cards early this time.",
      lesson: [
        "When both meters crash, there is no winning coalition left.",
        "Sequence matters: bank the win-win cards (rail, solar, retrofits) early.",
        "Balance isn\u2019t 50/50 every round — it\u2019s a running average."
      ]
    }
  };

  function endingKey() {
    var gap = Math.abs(ind - nat);
    if (ind >= 40 && nat >= 40 && gap <= 25) return "harmony";
    if (nat < 40 && ind >= nat) return "boomtown";
    if (ind < 40 && nat >= ind) return "valley";
    return "stumble";
  }

  function showVerdict() {
    var e = ENDINGS[endingKey()];
    document.getElementById("bg-verdict-kicker").textContent = e.kicker;
    document.getElementById("bg-verdict-title").textContent = e.title;
    document.getElementById("bg-verdict-copy").textContent = e.copy;

    var vInd = document.getElementById("bg-v-ind");
    var vNat = document.getElementById("bg-v-nat");
    vInd.style.width = "0%";
    vNat.style.width = "0%";
    document.getElementById("bg-v-ind-val").textContent = "0%";
    document.getElementById("bg-v-nat-val").textContent = "0%";
    setTimeout(function () {
      vInd.style.width = ind + "%";
      vNat.style.width = nat + "%";
      tween(0, ind, 800, function (v) { document.getElementById("bg-v-ind-val").textContent = Math.round(v) + "%"; });
      tween(0, nat, 800, function (v) { document.getElementById("bg-v-nat-val").textContent = Math.round(v) + "%"; });
    }, 80);

    var score = Math.round((ind + nat) / 2 + (endingKey() === "harmony" ? 15 : 0));
    var scoreEl = document.getElementById("bg-score");
    tween(0, score, 900, function (v) { scoreEl.textContent = Math.round(v); });

    var lesson = document.getElementById("bg-lesson");
    lesson.innerHTML = e.lesson.map(function (l) { return "<li>" + l + "</li>"; }).join("");

    var recap = document.getElementById("bg-recap");
    recap.innerHTML = choices.map(function (ch) {
      var c = CARDS.filter(function (x) { return x.id === ch.id; })[0];
      return '<span class="bg-recap-chip ' + ch.side + '" title="' + c.name + " — " +
        (ch.side === "build" ? "built" : "protected") + '">' + CARD_ICONS[c.id] + "</span>";
    }).join("");

    els.verdict.hidden = false;
    document.body.style.overflow = "hidden";
    var closeBtn = document.getElementById("bg-verdict-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeVerdict() {
    els.verdict.hidden = true;
    document.body.style.overflow = "";
    /* leave a run-complete card on the table */
    els.card.innerHTML =
      '<div class="bg-card-kicker"><span>Run complete</span><span class="bg-card-ico">' + CARD_ICONS.reforest + "</span></div>" +
      '<h3 class="bg-card-name">That\u2019s a wrap.</h3>' +
      '<p class="bg-card-blurb">All ten proposals are on the record. Shuffle a fresh deck and see if you can hold both meters at once — the deck deals differently every run.</p>' +
      '<div class="bg-card-actions"><button type="button" class="btn btn-primary" id="bg-again-inline">Play again</button>' +
      '<a class="btn btn-ghost" href="/challenge">Eco Challenge</a></div>';
    var again = document.getElementById("bg-again-inline");
    if (again) again.addEventListener("click", startGame);
  }

  /* ---------------- Modals & controls ---------------- */
  var lastFocus = null;

  function openHowto() {
    var m = document.getElementById("bg-howto");
    lastFocus = document.activeElement;
    m.hidden = false;
    document.body.style.overflow = "hidden";
    var x = m.querySelector(".bg-modal-x");
    if (x) x.focus();
  }

  function closeModal(m) {
    m.hidden = true;
    document.body.style.overflow = els.verdict.hidden ? "" : "hidden";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function startGame() {
    deck = shuffle(CARDS.map(function (c) { return c.id; })).slice(0, ROUNDS);
    round = 0;
    ind = 50;
    nat = 50;
    choices = [];
    busy = false;
    finished = false;
    els.debrief.hidden = true;
    els.verdict.hidden = true;
    document.body.style.overflow = "";
    applyMeters(false);
    applyScene();
    renderCard();
  }

  /* ---------------- Init ---------------- */
  function init() {
    cacheEls();

    document.getElementById("bg-howto-btn").addEventListener("click", openHowto);
    document.getElementById("bg-howto").addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) closeModal(document.getElementById("bg-howto"));
    });
    document.getElementById("bg-restart").addEventListener("click", function () {
      startGame();
      toast("New run — deck reshuffled.");
    });
    document.getElementById("bg-verdict-close").addEventListener("click", closeVerdict);
    document.getElementById("bg-again").addEventListener("click", startGame);

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var howto = document.getElementById("bg-howto");
      if (!howto.hidden) { closeModal(howto); return; }
      if (!els.verdict.hidden) { closeVerdict(); return; }
      if (drag) {
        drag = null;
        clearHotZones();
        els.card.classList.remove("is-dragging");
        els.card.style.transition = "";
        els.card.style.transform = "";
        els.card.style.opacity = "";
      }
      clearSelection();
    });

    els.card.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-side]");
      if (btn) decide(btn.getAttribute("data-side"), false);
    });

    [els.buildZone, els.protectZone].forEach(function (zone) {
      zone.addEventListener("click", function () {
        if (finished || busy) return;
        if (els.card.classList.contains("is-selected")) {
          decide(zone === els.buildZone ? "build" : "protect", false);
        } else if (!drag) {
          toast("Drag a card here — or tap the card first, then tap a side.");
        }
      });
    });

    bindCardPointerEvents();
    startGame();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
