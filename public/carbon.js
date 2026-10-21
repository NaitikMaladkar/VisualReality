/* ============================================================
   Visual Reality — carbon.js (Carbon Footprint Calculator)
   Live estimation engine · animated dashboard · action plan
   Factors: DEFRA 2024, IEA/Ember, Poore & Nemecek (2018), OWID
   ============================================================ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Emission factors (tCO2e / year) ---------- */
  var F = {
    car: { petrol: 0.171, diesel: 0.168, hybrid: 0.114, electric: 0.053 }, // kg/km
    transit: 0.07,                    // kg/passenger-km (bus + rail blend)
    shortFlight: 0.3,                 // t per short-haul return
    longFlight: 1.6,                  // t per long-haul return
    grid: { green: 0.02, lowcarbon: 0.25, average: 0.45, coal: 0.75 }, // kg/kWh
    heat: { pump: 0.9, gas: 2.2, oil: 3.0, electric: 2.4, district: 1.3 }, // t/household
    diet: { heavy: 3.3, average: 2.5, low: 1.9, veg: 1.7, vegan: 1.5 },
    waste: { often: 0.3, sometimes: 0.1, careful: -0.05 },
    local: -0.1,
    stuff: { minimal: 0.7, average: 1.5, frequent: 2.6 },
    recycle: { all: -0.15, some: 0, none: 0.2 },
    keepTech: -0.2
  };

  var GAUGE_MAX = 25;
  var WORLD = 4.7;
  var PARIS = 2.0;
  var TREE_KG = 21;        // kg CO2 absorbed per tree per year
  var CAR_G_KM = 171;      // typical petrol car
  var PNY_T = 2.0;         // Paris–New York return, economy incl. RF
  var LED_KG = 8.2;        // one 10 W LED, 5 h/day

  var DEFAULTS = {
    carKm: 120, carType: "petrol", transitKm: 60,
    shortFlights: 2, longFlights: 0,
    household: 2, elecKWh: 250, mix: "average", heating: "gas",
    diet: "average", waste: "sometimes", local: false,
    shopping: "average", recycle: "some", keepTech: false
  };

  var CAT_NAMES = {
    transport: "Transport",
    home: "Home energy",
    food: "Food",
    stuff: "Stuff & services"
  };

  /* ---------- Helpers ---------- */
  function $(id) { return document.getElementById(id); }

  function radioVal(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }

  function setRadio(name, value) {
    var el = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
    if (el) el.checked = true;
  }

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  function fmtT(v) { return v >= 0.3 ? v.toFixed(1) : v.toFixed(2); }

  function fmtInt(v) { return Math.round(v).toLocaleString("en-US"); }

  function fmtRound(v, step) {
    var s = step || 50;
    return (Math.round(v / s) * s).toLocaleString("en-US");
  }

  function setFill(el) {
    var min = +el.min, max = +el.max, v = +el.value;
    el.style.setProperty("--fill", (((v - min) / (max - min)) * 100) + "%");
  }

  var SVG_NS = "http://www.w3.org/2000/svg";

  /* Number tween with per-key rAF registry */
  var rafs = {};
  var cur = {};

  function anim(key, to, el, fmt, dur) {
    if (!el) return;
    var from = typeof cur[key] === "number" ? cur[key] : 0;
    if (rafs[key]) window.cancelAnimationFrame(rafs[key]);
    if (reduced) {
      cur[key] = to;
      el.textContent = fmt(to);
      return;
    }
    var start = null;
    var d = dur || 650;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / d, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = from + (to - from) * eased;
      cur[key] = v;
      el.textContent = fmt(v);
      if (p < 1) rafs[key] = window.requestAnimationFrame(step);
    }
    rafs[key] = window.requestAnimationFrame(step);
  }

  function debounce(fn, ms) {
    var t = null;
    return function () {
      window.clearTimeout(t);
      t = window.setTimeout(fn, ms);
    };
  }

  /* ---------- Element refs ---------- */
  var els = {
    carKm: $("carKm"), carKmOut: $("carKm-out"), carType: $("carType"),
    transitKm: $("transitKm"), transitKmOut: $("transitKm-out"),
    shortFlights: $("shortFlights"), shortFlightsOut: $("shortFlights-out"),
    longFlights: $("longFlights"), longFlightsOut: $("longFlights-out"),
    household: $("household"), householdOut: $("household-out"),
    hhMinus: $("hh-minus"), hhPlus: $("hh-plus"),
    elecKWh: $("elecKWh"), elecKWhOut: $("elecKWh-out"),
    heating: $("heating"), local: $("local"), keepTech: $("keepTech"),
    form: $("cf-form"),
    gaugeWrap: $("cf-gauge-wrap"), gaugeFill: $("gauge-fill"), gaugeMarks: $("gauge-marks"),
    total: $("cf-total"), badge: $("cf-badge"), badgeNote: $("cf-badge-note"), sr: $("cf-sr"),
    donut: {
      transport: $("seg-transport"), home: $("seg-home"),
      food: $("seg-food"), stuff: $("seg-stuff")
    },
    dcVal: $("dc-val"), dcCat: $("dc-cat"),
    legend: {
      transport: $("lgv-transport"), home: $("lgv-home"),
      food: $("lgv-food"), stuff: $("lgv-stuff")
    },
    eqTrees: $("eq-trees"), eqCar: $("eq-car"), eqFly: $("eq-fly"), eqLed: $("eq-led"),
    bars: $("cf-bars"), youVal: $("cbar-you-val"), youFill: $("cbar-you-fill"),
    staticBars: [], earths: $("earths-num"),
    planNow: $("plan-now"), planAfter: $("plan-after"),
    planNowOut: $("plan-now-out"), planAfterOut: $("plan-after-out"),
    planSave: $("plan-save"), planSaveLabel: $("plan-save-label"), planEarths: $("plan-earths"),
    suggests: $("cf-suggests"),
    reset: $("cf-reset"), copy: $("cf-copy"), toast: $("cf-toast"),
    hints: {
      transport: $("cf-t-out"), home: $("cf-h-out"),
      food: $("cf-f-out"), stuff: $("cf-s-out")
    }
  };

  Array.prototype.forEach.call(
    document.querySelectorAll(".cbar[data-v]"),
    function (row) {
      els.staticBars.push({
        v: +row.getAttribute("data-v"),
        fill: row.querySelector(".cbar-fill")
      });
    }
  );

  /* ---------- State ---------- */
  function readState() {
    return {
      carKm: +els.carKm.value,
      carType: els.carType.value || "petrol",
      transitKm: +els.transitKm.value,
      shortFlights: +els.shortFlights.value,
      longFlights: +els.longFlights.value,
      household: Math.max(1, +els.household.value || 1),
      elecKWh: +els.elecKWh.value,
      mix: radioVal("mix") || "average",
      heating: els.heating.value || "gas",
      diet: radioVal("diet") || "average",
      waste: radioVal("waste") || "sometimes",
      local: els.local.checked,
      shopping: radioVal("shopping") || "average",
      recycle: radioVal("recycle") || "some",
      keepTech: els.keepTech.checked
    };
  }

  function computeBreakdown(s) {
    var kmYr = s.carKm * 52;
    var transport =
      (kmYr * F.car[s.carType]) / 1000 +
      ((s.transitKm * 52 * F.transit) / 1000) +
      s.shortFlights * F.shortFlight +
      s.longFlights * F.longFlight;

    var home =
      (s.elecKWh * 12 * F.grid[s.mix]) / 1000 +
      F.heat[s.heating] / s.household;

    var food = Math.max(0.4, F.diet[s.diet] + F.waste[s.waste] + (s.local ? F.local : 0));
    var stuff = Math.max(0, F.stuff[s.shopping] + F.recycle[s.recycle] + (s.keepTech ? F.keepTech : 0));

    return {
      kmYr: kmYr,
      transport: transport,
      home: home,
      food: food,
      stuff: stuff,
      total: transport + home + food + stuff
    };
  }

  /* ---------- Rating ---------- */
  function rating(t) {
    if (t < 3) return { k: "champion", label: "Climate champion", note: "Under 3 t \u2014 living proof tomorrow can work." };
    if (t < 5.5) return { k: "path", label: "On the 1.5 \u00b0C path", note: "Around the fair share \u2014 keep pulling those sliders." };
    if (t < 9) return { k: "average", label: "Around the world average", note: "\u2026and the world average needs to halve by 2030." };
    if (t < 13) return { k: "high", label: "High impact", note: "Above the world average \u2014 big wins are waiting below." };
    return { k: "extreme", label: "Off the charts", note: "Start with flights and the car \u2014 the two big levers." };
  }

  /* ---------- Gauge marks (Paris + world) ---------- */
  function drawMarks() {
    if (!els.gaugeMarks) return;
    [{ v: PARIS, c: "#0d9488" }, { v: WORLD, c: "#0b1f16" }].forEach(function (m) {
      var pct = clamp(m.v / GAUGE_MAX, 0, 1);
      var ang = Math.PI * (1 - pct);
      var cx = 140 + Math.cos(ang) * 104;
      var cy = 148 - Math.sin(ang) * 104;

      var halo = document.createElementNS(SVG_NS, "circle");
      halo.setAttribute("cx", cx.toFixed(1));
      halo.setAttribute("cy", cy.toFixed(1));
      halo.setAttribute("r", "10");
      halo.setAttribute("fill", m.c);
      halo.setAttribute("class", "gauge-mark-halo");

      var dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("cx", cx.toFixed(1));
      dot.setAttribute("cy", cy.toFixed(1));
      dot.setAttribute("r", "5.2");
      dot.setAttribute("fill", "#ffffff");
      dot.setAttribute("stroke", m.c);
      dot.setAttribute("class", "gauge-mark");

      els.gaugeMarks.appendChild(halo);
      els.gaugeMarks.appendChild(dot);
    });
  }

  /* ---------- Dashboard updates ---------- */
  var lastBD = null;
  var lastState = null;
  var donutHovered = false;

  function updateDashboard(bd, s) {
    var r = rating(bd.total);

    // Gauge arc + color
    var pct = clamp(bd.total / GAUGE_MAX, 0, 1) * 100;
    els.gaugeFill.style.strokeDasharray = pct.toFixed(2) + " 100";
    els.gaugeWrap.className = "cf-gauge-wrap r-" + r.k;

    anim("total", bd.total, els.total, function (v) { return v.toFixed(1); }, 750);

    els.badge.textContent = r.label;
    els.badge.className = "cf-badge r-" + r.k;
    els.badgeNote.textContent = r.note;
    els.sr.textContent =
      "Your estimated footprint is " + bd.total.toFixed(1) +
      " tonnes of CO2e per year. Rating: " + r.label + ".";

    // Donut segments
    var cats = ["transport", "home", "food", "stuff"];
    var acc = 0;
    cats.forEach(function (cat) {
      var v = bd[cat];
      var share = bd.total > 0 ? (v / bd.total) * 100 : 0;
      var gap = share > 1.5 ? 0.8 : 0;
      var seg = els.donut[cat];
      seg.style.strokeDasharray = Math.max(0, share - gap).toFixed(2) + " " + (100 - Math.max(0, share - gap)).toFixed(2);
      seg.style.strokeDashoffset = String(-acc);
      acc += share;
      els.legend[cat].textContent =
        (v >= 0.05 || share > 0 ? v.toFixed(1) : "0") + " t \u00b7 " + Math.round(share) + "%";
      els.hints[cat].textContent = (v >= 0.05 ? v.toFixed(1) : "0") + " t a year";
    });

    // Equivalents
    anim("eqTrees", (bd.total * 1000) / TREE_KG, els.eqTrees, fmtInt);
    anim("eqCar", (bd.total * 1000) / CAR_G_KM, els.eqCar, function (v) { return fmtRound(v, 50); });
    anim("eqFly", bd.total / PNY_T, els.eqFly, function (v) { return v.toFixed(1); });
    anim("eqLed", (bd.total * 1000) / LED_KG, els.eqLed, function (v) {
      return v < 10 ? v.toFixed(1) : fmtInt(v);
    });

    // Comparison bars
    var scale = Math.max(15, bd.total * 1.08);
    els.youVal.textContent = bd.total.toFixed(1) + " t";
    els.youFill.style.setProperty("--w", ((bd.total / scale) * 100).toFixed(2) + "%");
    els.staticBars.forEach(function (b) {
      b.fill.style.setProperty("--w", ((b.v / scale) * 100).toFixed(2) + "%");
    });

    anim("earths", (1.7 * bd.total) / WORLD, els.earths, function (v) { return v.toFixed(1); }, 800);

    // Donut center follows the total unless a segment is being inspected
    if (!donutHovered) {
      els.dcVal.textContent = bd.total.toFixed(1) + " t";
      els.dcCat.textContent = "total / year";
    }

    lastBD = bd;
    lastState = s;
  }

  /* ---------- Suggestion engine ---------- */
  var ICONS = {
    ev: '<path d="M4 16.5v-3.4c0-.5.12-1 .36-1.44L6.5 7.8A2.6 2.6 0 0 1 8.86 6.3h6.28c.99 0 1.9.56 2.36 1.5l2.14 3.86c.24.44.36.94.36 1.44v3.4m-16 0h16m-16 0v2m16-2v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.6 12h12.8M13 2.5l-2.2 3.4h3.4L12 9.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    bolt: '<path d="M13 2.5 5.5 13h5l-1.5 8.5L16.5 11h-5l1.5-8.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    sun: '<circle cx="12" cy="12" r="4.4" stroke="currentColor" stroke-width="1.7"/><path d="M12 2.8v2.4m0 13.6v2.4M2.8 12h2.4m13.6 0h2.4M5.5 5.5l1.7 1.7m9.6 9.6 1.7 1.7m0-13-1.7 1.7M7.2 16.8l-1.7 1.7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    flame: '<path d="M12 21c-3.6 0-6-2.4-6-5.6 0-2.6 1.8-4.6 3-6.4.6 1 1.5 1.7 2.4 2C11 8 10.4 5 12.6 2.5c.3 2.8 1.9 4 3.4 6 1.2 1.6 2 3.2 2 5 0 3.6-2.4 7.5-6 7.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    plane: '<path d="M10.5 13.5 4 11l1.6-1.6 5.4.9 4.6-4.6c.6-.6 1.6-.7 2.2-.1.6.6.5 1.6-.1 2.2L13.1 12l.9 5.4L12.4 19l-2.5-6.5-3.5-1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 20h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    train: '<rect x="5" y="3.5" width="14" height="13" rx="3.4" stroke="currentColor" stroke-width="1.7"/><path d="M5 10.5h14M9.5 20.5 8 17.5m8.5 3 1.5-3M9 14h.01M15 14h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="m7 20.5-1.5 1m13-1 1.5 1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
    leaf: '<path d="M6 18C6 10.5 12 6 19 6c0 7.5-4.5 12-11.5 12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.5 16.5C10.5 13.5 13.5 11 17 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    recycle: '<path d="m7 9-2.2 3.8a2 2 0 0 0 1.7 3h2m8.2-10.6L14.5 2.4a2 2 0 0 0-3 0l-1.1 2m6.8 8.4 2.3-3.9a2 2 0 0 0-1.7-3h-2.2m-9.3 9.9 1.8-1.7m-1.8 1.7 2.4.6m8.7-2.3-1.2 2.2m1.2-2.2-2.4-.7M8.5 20.5h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    chip: '<rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M10 2.8v2.4m4-2.4v2.4M10 18.8v2.4m4-2.4v2.4M2.8 10h2.4m-2.4 4h2.4m13.6-4h2.4m-2.4 4h2.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    bag: '<path d="M5.5 8.5h13l-1 11.2a1.8 1.8 0 0 1-1.8 1.6H8.3a1.8 1.8 0 0 1-1.8-1.6l-1-11.2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8.8 11V6.6a3.2 3.2 0 0 1 6.4 0V11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.6" stroke="currentColor" stroke-width="1.7"/><path d="M10.5 18.5h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    loop: '<path d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3M19.5 12a7.5 7.5 0 0 1-12.8 5.3M17.5 3.5v3.4h-3.4M6.5 20.5v-3.4h3.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'
  };

  function iconSvg(key) {
    return '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">' + ICONS[key] + "</svg>";
  }

  function buildSuggestions(s, bd) {
    var list = [];

    // EV switch
    if (s.carKm > 0 && s.carType !== "electric") {
      var f = F.car[s.carType];
      var save = (bd.kmYr * (f - 0.053)) / 1000;
      if (save >= 0.12) {
        list.push({
          ico: "ev", title: "Go electric on four wheels",
          tag: "The electric decade \u00b7 Timeline, 2024", chip: "Investment", chipClass: "chip-invest",
          save: save,
          desc: "Your car drives about " + fmtInt(bd.kmYr) + " km a year at ~" + Math.round(f * 1000) +
            " g/km. An EV on today\u2019s grid emits ~53 g/km \u2014 the same driving takes " +
            fmtT(save) + " t off your transport line."
        });
      }
    }

    // Green tariff (scaled down if solar also applies)
    var solarApplies = s.elecKWh >= 150 && s.mix !== "green";
    if (s.mix !== "green") {
      var saveTariff = (s.elecKWh * 12 * (F.grid[s.mix] - 0.02)) / 1000;
      if (solarApplies) saveTariff *= 0.35;
      if (saveTariff >= 0.12) {
        list.push({
          ico: "bolt", title: "Switch to a 24-7 clean tariff",
          tag: "Carbon-free energy \u00b7 Timeline, 2017", chip: "Easy", chipClass: "chip-easy",
          save: saveTariff,
          desc: "Clean tariffs match your " + fmtInt(s.elecKWh * 12) + " kWh a year with wind, solar and" +
            (solarApplies ? " storage to cover what your panels don\u2019t." : " storage \u2014 the fastest single swap on this list.")
        });
      }
    }

    // Rooftop solar
    if (solarApplies) {
      var saveSolar = Math.min(1.6, (s.elecKWh * 12 * 0.35) / 1000);
      if (saveSolar >= 0.12) {
        list.push({
          ico: "sun", title: "Put HelioGrid on your roof",
          tag: "Rooftop solar \u00b7 4 kW array", chip: "Investment", chipClass: "chip-invest",
          save: saveSolar,
          desc: "A modest 4 kW array covers roughly a third of your " + fmtInt(s.elecKWh * 12) +
            " kWh \u2014 and today\u2019s panels pay their own carbon back in under two years."
        });
      }
    }

    // Heat pump
    if (s.heating === "gas" || s.heating === "oil" || s.heating === "electric") {
      var saveHeat = (F.heat[s.heating] - 0.9) / s.household;
      if (saveHeat >= 0.15) {
        list.push({
          ico: "flame", title: "Trade the boiler for a heat pump",
          tag: "Standard kit in City Simulator 2040", chip: "Investment", chipClass: "chip-invest",
          save: saveHeat,
          desc: "Heat pumps deliver 3\u20134 units of heat per unit of electricity. Your " +
            (s.heating === "gas" ? "gas boiler" : s.heating === "oil" ? "oil boiler" : "resistive heating") +
            " costs " + (F.heat[s.heating] / s.household).toFixed(1) + " t per person; a pump drops that to " +
            (0.9 / s.household).toFixed(1) + " t."
        });
      }
    }

    // Flights
    var flightT = s.shortFlights * F.shortFlight + s.longFlights * F.longFlight;
    if (flightT >= 0.6) {
      list.push({
        ico: "plane", title: "Halve the flying year",
        tag: "One long-haul return \u2248 1.6 t", chip: "Medium", chipClass: "chip-medium",
        save: flightT / 2,
        desc: "Your " + (s.shortFlights + s.longFlights) + " return trips add " + flightT.toFixed(1) +
          " t. Swapping one hop for rail \u2014 or a holiday nearer home \u2014 hands half of it back."
      });
    }

    // Rail swap
    if (s.carKm >= 100 && s.carType !== "electric") {
      var saveRail = (bd.kmYr * 0.5 * (F.car[s.carType] - F.transit)) / 1000;
      if (saveRail >= 0.1) {
        list.push({
          ico: "train", title: "Hand half your car km to rail",
          tag: "Trams beat cars \u00b7 see 2060", chip: "Easy", chipClass: "chip-easy",
          save: saveRail,
          desc: "Moving every second trip \u2014 " + fmtInt(bd.kmYr / 2) + " km \u2014 to bus and rail at ~70 g/km" +
            " frees up about " + fmtT(saveRail) + " t, plus a better commute."
        });
      }
    }

    // Diet
    if (s.diet === "heavy" || s.diet === "average") {
      var saveDiet = F.diet[s.diet] - F.diet.low;
      list.push({
        ico: "leaf", title: "Go plant-forward",
        tag: "Poore & Nemecek \u00b7 Science, 2018", chip: "Easy", chipClass: "chip-easy",
        save: saveDiet,
        desc: s.diet === "heavy"
          ? "Meat at most meals costs ~3.3 t a year in food emissions. A low-meat plate lands at 1.9 t \u2014 same nutrition, lighter planet."
          : "Shifting most of your plate to plants lands you at the 1.9 t low-meat line \u2014 about " + fmtT(saveDiet) + " t saved."
      });
    }

    // Food waste
    if (s.waste !== "careful") {
      var saveWaste = F.waste[s.waste] - F.waste.careful;
      list.push({
        ico: "recycle", title: "Waste less food",
        tag: "LoopWeave \u00b7 circular kitchens", chip: "Easy", chipClass: "chip-easy",
        save: saveWaste,
        desc: "Roughly a third of food is thrown away worldwide. Planning, leftovers and a compost bin claw back about " +
          fmtT(saveWaste) + " t."
      });
    }

    // AI thermostat
    if (bd.home >= 1.2) {
      list.push({
        ico: "chip", title: "Let an AI run the thermostat",
        tag: "TerraSense AI \u00b7 cooling that thinks", chip: "Easy", chipClass: "chip-easy",
        save: 0.35,
        desc: "DeepMind cut Google\u2019s data-centre cooling bill by 40%. The same learning at home shaves heating and cooling by 10\u201315%."
      });
    }

    // Buy less
    if (s.shopping !== "minimal") {
      var saveStuff = F.stuff[s.shopping] * 0.45;
      list.push({
        ico: "bag", title: "Buy less, repair more",
        tag: "LoopWeave \u00b7 repair, resell, refill", chip: "Medium", chipClass: "chip-medium",
        save: saveStuff,
        desc: "Stuff and services cost you " + bd.stuff.toFixed(1) +
          " t a year. The four Rs \u2014 refuse, repair, resell, refill \u2014 take a real bite out of that."
      });
    }

    // Keep tech
    if (!s.keepTech) {
      list.push({
        ico: "phone", title: "Keep your tech 4+ years",
        tag: "Circularity starts with the box you own", chip: "Easy", chipClass: "chip-easy",
        save: 0.2,
        desc: "A smartphone\u2019s footprint is mostly made before you unbox it. Doubling its working life halves its yearly cost."
      });
    }

    // Recycle
    if (s.recycle !== "all") {
      var saveRec = s.recycle === "none" ? 0.35 : 0.15;
      list.push({
        ico: "loop", title: "Close the recycling loop",
        tag: "LoopWeave \u00b7 materials that cycle", chip: "Easy", chipClass: "chip-easy",
        save: saveRec,
        desc: "Recycled aluminium uses 95% less energy than virgin metal. Doing it every time is worth about " + fmtT(saveRec) + " t."
      });
    }

    list.sort(function (a, b) { return b.save - a.save; });
    list = list.slice(0, 5);

    // Cap combined savings at 85% of the footprint
    var sum = list.reduce(function (acc, x) { return acc + x.save; }, 0);
    var cap = bd.total * 0.85;
    if (sum > cap && sum > 0) {
      var k = cap / sum;
      list.forEach(function (x) { x.save = x.save * k; });
      sum = cap;
    }

    return { list: list, sum: sum };
  }

  function renderSuggestions(plan, bd) {
    var grid = els.suggests;
    grid.innerHTML = "";

    if (!plan.list.length) {
      grid.innerHTML =
        '<article class="sug-card">' +
        '<div class="sug-head"><span class="sug-ico">' + iconSvg("leaf") + "</span>" +
        "<div><h4>Nothing left to fix!</h4><span class=\"sug-tag\">Fair-share territory</span></div></div>" +
        "<p>You\u2019re already at \u2014 or under \u2014 the 2 t line. Tell a friend how it\u2019s done, or push a slider to stress-test a scenario.</p>" +
        "</article>";
    } else {
      var max = plan.list[0].save || 1;
      plan.list.forEach(function (item, i) {
        var card = document.createElement("article");
        card.className = "sug-card sug-enter";
        card.style.animationDelay = (i * 70) + "ms";
        card.innerHTML =
          '<div class="sug-head">' +
          '<span class="sug-ico">' + iconSvg(item.ico) + "</span>" +
          "<div><h4>" + item.title + '</h4><span class="sug-tag">' + item.tag + "</span></div>" +
          '<span class="sug-chip ' + item.chipClass + '">' + item.chip + "</span>" +
          "</div>" +
          "<p>" + item.desc + "</p>" +
          '<div class="sug-meter"><div class="sug-meter-fill"></div></div>' +
          '<div class="sug-foot"><strong>\u2212' + fmtT(item.save) + " t/yr</strong>" +
          "<span>\u2248 " + Math.round((item.save / Math.max(bd.total, 0.01)) * 100) + "% of your footprint</span></div>";
        grid.appendChild(card);
        var fill = card.querySelector(".sug-meter-fill");
        window.requestAnimationFrame(function () {
          fill.style.width = ((item.save / max) * 100).toFixed(1) + "%";
        });
      });
    }

    // Plan strip (today -> tomorrow)
    var after = Math.max(1.1, bd.total - plan.sum);
    var planScale = Math.max(bd.total, after, 2) * 1.06;
    els.planNow.style.width = ((bd.total / planScale) * 100).toFixed(1) + "%";
    els.planAfter.style.width = ((after / planScale) * 100).toFixed(1) + "%";
    els.planNowOut.textContent = bd.total.toFixed(1) + " t";
    els.planAfterOut.textContent = after.toFixed(1) + " t";
    els.planSave.textContent = "\u2212" + plan.sum.toFixed(1) + " t";
    els.planSaveLabel.textContent = plan.sum > 0
      ? "saved per year if you did it all"
      : "to save \u2014 tweak your inputs above";
    els.planEarths.textContent =
      "\u2192 " + ((1.7 * after) / WORLD).toFixed(1) + " Earths if everyone joined you";
  }

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      els.toast.classList.remove("show");
    }, 2200);
  }

  /* ---------- Copy summary ---------- */
  function copySummary() {
    if (!lastBD) return;
    var plan = buildSuggestions(lastState, lastBD);
    var after = Math.max(1.1, lastBD.total - plan.sum);
    var top = plan.list.length ? plan.list[0] : null;
    var lines = [
      "My carbon footprint: " + lastBD.total.toFixed(1) + " tCO2e/year " +
        "(transport " + lastBD.transport.toFixed(1) +
        " \u00b7 home " + lastBD.home.toFixed(1) +
        " \u00b7 food " + lastBD.food.toFixed(1) +
        " \u00b7 stuff " + lastBD.stuff.toFixed(1) + ").",
      "That\u2019s " + ((1.7 * lastBD.total) / WORLD).toFixed(1) +
        " Earths if everyone lived like me \u2014 the world average is 4.7 t and the 2030 fair share is 2 t.",
      top ? "Top move: " + top.title + " (\u2212" + fmtT(top.save) + " t/yr) \u2192 tomorrow me: " + after.toFixed(1) + " t." : "",
      "Measured with the Visual Reality Carbon Calculator \u2014 runs entirely in your browser."
    ].filter(Boolean);

    var text = lines.join("\n");

    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        toast("Summary copied \u2014 go share it!");
      } catch (err) {
        toast("Copy failed \u2014 your browser said no.");
      }
      document.body.removeChild(ta);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { toast("Summary copied \u2014 go share it!"); },
        fallback
      );
    } else {
      fallback();
    }
  }

  /* ---------- Reset ---------- */
  function applyDefaults() {
    els.carKm.value = DEFAULTS.carKm;
    els.carType.value = DEFAULTS.carType;
    els.transitKm.value = DEFAULTS.transitKm;
    els.shortFlights.value = DEFAULTS.shortFlights;
    els.longFlights.value = DEFAULTS.longFlights;
    els.elecKWh.value = DEFAULTS.elecKWh;
    els.heating.value = DEFAULTS.heating;
    els.local.checked = DEFAULTS.local;
    els.keepTech.checked = DEFAULTS.keepTech;
    $("household").value = DEFAULTS.household;
    setRadio("mix", DEFAULTS.mix);
    setRadio("diet", DEFAULTS.diet);
    setRadio("waste", DEFAULTS.waste);
    setRadio("shopping", DEFAULTS.shopping);
    setRadio("recycle", DEFAULTS.recycle);

    [els.carKm, els.transitKm, els.shortFlights, els.longFlights, els.elecKWh].forEach(setFill);
    updateOutputs();
    updateAll();
    toast("Reset to a typical Western lifestyle.");
  }

  /* ---------- Output labels ---------- */
  function updateOutputs() {
    var s = readState();
    els.carKmOut.textContent = s.carKm + " km/week";
    els.transitKmOut.textContent = s.transitKm + " km/week";
    els.shortFlightsOut.textContent = s.shortFlights +
      (s.shortFlights === 1 ? " return trip/year" : " return trips/year");
    els.longFlightsOut.textContent = s.longFlights +
      (s.longFlights === 1 ? " return trip/year" : " return trips/year");
    els.elecKWhOut.textContent = s.elecKWh + " kWh/month";
    els.householdOut.textContent = String(s.household);
  }

  /* ---------- Master update ---------- */
  function updateAll() {
    var s = readState();
    var bd = computeBreakdown(s);
    updateDashboard(bd, s);
    renderSuggestionsDebounced();
  }

  var renderSuggestionsDebounced = debounce(function () {
    if (!lastBD) return;
    renderSuggestions(buildSuggestions(lastState, lastBD), lastBD);
  }, 280);

  /* ---------- Events ---------- */
  function bind() {
    if (els.form) {
      els.form.addEventListener("submit", function (e) { e.preventDefault(); });
    }

    [els.carKm, els.transitKm, els.shortFlights, els.longFlights, els.elecKWh].forEach(function (r) {
      r.addEventListener("input", function () {
        setFill(r);
        updateOutputs();
        updateAll();
      });
    });

    [els.carType, els.heating].forEach(function (sel) {
      sel.addEventListener("change", updateAll);
    });

    ["mix", "diet", "waste", "shopping", "recycle"].forEach(function (name) {
      Array.prototype.forEach.call(document.querySelectorAll('input[name="' + name + '"]'), function (r) {
        r.addEventListener("change", updateAll);
      });
    });

    [els.local, els.keepTech].forEach(function (cb) {
      cb.addEventListener("change", updateAll);
    });

    els.hhMinus.addEventListener("click", function () {
      var v = clamp(+els.household.value - 1, 1, 6);
      els.household.value = v;
      updateOutputs();
      updateAll();
    });

    els.hhPlus.addEventListener("click", function () {
      var v = clamp(+els.household.value + 1, 1, 6);
      els.household.value = v;
      updateOutputs();
      updateAll();
    });

    els.reset.addEventListener("click", applyDefaults);
    els.copy.addEventListener("click", copySummary);

    // Donut hover/focus <-> legend highlight
    ["transport", "home", "food", "stuff"].forEach(function (cat) {
      var seg = els.donut[cat];
      var li = document.querySelector('.cf-legend li[data-cat="' + cat + '"]');
      function on() {
        if (!lastBD) return;
        donutHovered = true;
        els.dcVal.textContent = lastBD[cat].toFixed(1) + " t";
        els.dcCat.textContent = CAT_NAMES[cat].toLowerCase() + " / year";
        if (li) li.classList.add("hl");
      }
      function off() {
        if (!lastBD) return;
        donutHovered = false;
        els.dcVal.textContent = lastBD.total.toFixed(1) + " t";
        els.dcCat.textContent = "total / year";
        if (li) li.classList.remove("hl");
      }
      seg.addEventListener("mouseenter", on);
      seg.addEventListener("mouseleave", off);
      seg.addEventListener("focus", on);
      seg.addEventListener("blur", off);
    });

    // Animate comparison bars on first scroll into view
    if ("IntersectionObserver" in window && !reduced) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            els.bars.classList.add("in");
            io.disconnect();
          }
        });
      }, { threshold: 0.35 });
      io.observe(els.bars);
    } else {
      els.bars.classList.add("in");
    }
  }

  /* ---------- Init ---------- */
  function init() {
    drawMarks();

    [els.carKm, els.transitKm, els.shortFlights, els.longFlights, els.elecKWh].forEach(setFill);
    updateOutputs();

    bind();

    var s = readState();
    var bd = computeBreakdown(s);
    updateDashboard(bd, s);
    renderSuggestions(buildSuggestions(s, bd), bd);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
