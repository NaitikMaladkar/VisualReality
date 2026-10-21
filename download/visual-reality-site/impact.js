/* ============================================================
   Visual Reality — impact.js
   Impact Simulator: region what-if engine (static data, no APIs)
   Model: renewables displace fossil at fossil intensity;
   EVs charge on the post-plan grid; retrofits halve heating CO2.
   ============================================================ */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- reference data (approx 2023-24, Ember/IEA/OWID) ---------- */
  var REGIONS = [
    {
      key: "world", name: "World", article: "the world",
      gen: 29500, intensity: 480, co2: 37400, cars: 1550, heat: 2600,
      mix: { solar: 5.5, wind: 10.2, hydro: 14.3, nuclear: 9.1, bio: 2.4, fossil: 58.5 },
      note: "29,500 TWh a year — everything, everywhere. The heavyweight what-if."
    },
    {
      key: "china", name: "China", article: "China",
      gen: 9460, intensity: 540, co2: 11900, cars: 330, heat: 620,
      mix: { solar: 6.4, wind: 9.4, hydro: 13.6, nuclear: 4.6, bio: 1.8, fossil: 64.2 },
      note: "9,460 TWh at ~540 g CO2/kWh — the single biggest grid-decarbonisation prize on Earth."
    },
    {
      key: "usa", name: "United States", article: "the US",
      gen: 4270, intensity: 369, co2: 4900, cars: 290, heat: 480,
      mix: { solar: 5.6, wind: 10.2, hydro: 5.7, nuclear: 18.2, bio: 1.4, fossil: 58.9 },
      note: "4,270 TWh at ~369 g CO2/kWh — gas and coal still do the heavy lifting."
    },
    {
      key: "eu", name: "European Union", article: "the EU",
      gen: 2740, intensity: 240, co2: 2600, cars: 290, heat: 420,
      mix: { solar: 8.3, wind: 17.0, hydro: 11.4, nuclear: 23.0, bio: 4.8, fossil: 35.5 },
      note: "2,740 TWh at ~240 g CO2/kWh — already ~47% nuclear, hydro and bio."
    },
    {
      key: "india", name: "India", article: "India",
      gen: 1960, intensity: 713, co2: 3100, cars: 70, heat: 300,
      mix: { solar: 6.7, wind: 4.6, hydro: 8.6, nuclear: 2.4, bio: 0.3, fossil: 77.4 },
      note: "1,960 TWh at ~713 g CO2/kWh — the fastest-growing big grid, still coal-first."
    },
    {
      key: "germany", name: "Germany", article: "Germany",
      gen: 515, intensity: 381, co2: 610, cars: 49, heat: 120,
      mix: { solar: 11.9, wind: 27.2, hydro: 4.3, nuclear: 1.4, bio: 7.0, fossil: 48.2 },
      note: "515 TWh at ~381 g CO2/kWh — the Energiewende's mixed report card."
    },
    {
      key: "japan", name: "Japan", article: "Japan",
      gen: 1010, intensity: 466, co2: 1000, cars: 78, heat: 130,
      mix: { solar: 11.4, wind: 0.9, hydro: 7.6, nuclear: 4.7, bio: 4.0, fossil: 71.4 },
      note: "1,010 TWh at ~466 g CO2/kWh — imports its fossil fuel, and its anxiety."
    },
    {
      key: "brazil", name: "Brazil", article: "Brazil",
      gen: 710, intensity: 95, co2: 480, cars: 45, heat: 40,
      mix: { solar: 4.9, wind: 9.9, hydro: 62.0, nuclear: 2.2, bio: 8.0, fossil: 13.0 },
      note: "710 TWh at ~95 g CO2/kWh — already one of the cleanest big grids on Earth."
    }
  ];

  var CAR_KM = 12000;          /* km per car per year */
  var EV_KWH_KM = 0.19;        /* kWh per km */
  var ICE_T_PER_CAR = 2.1;     /* tailpipe tCO2 per petrol car per year */
  var HEAT_CUT = 0.5;          /* heat pump + insulation cut share */
  var COAL_PLANT_T = 3.8e6;    /* tCO2 per average coal plant per year */
  var TREE_T = 0.022;          /* tCO2 absorbed per mature tree per year */
  var HOME_KWH = 4800;         /* kWh per home per year */

  /* ---------- state ---------- */
  var region = REGIONS[0];
  var levers = { solar: 0, wind: 0, ev: 0, retro: 0 };
  var lastShownTotal = 0;

  /* ---------- elements ---------- */
  var regionsBox = document.getElementById("im-regions");
  var regionNote = document.getElementById("im-region-note");
  var inputs = {
    solar: document.getElementById("im-solar"),
    wind: document.getElementById("im-wind"),
    ev: document.getElementById("im-ev"),
    retro: document.getElementById("im-retro")
  };
  var vals = {
    solar: document.getElementById("im-solar-val"),
    wind: document.getElementById("im-wind-val"),
    ev: document.getElementById("im-ev-val"),
    retro: document.getElementById("im-retro-val")
  };
  var subs = {
    solar: document.getElementById("im-solar-sub"),
    wind: document.getElementById("im-wind-sub"),
    ev: document.getElementById("im-ev-sub"),
    retro: document.getElementById("im-retro-sub")
  };
  var totalEl = document.getElementById("im-total");
  var totalUnit = document.getElementById("im-total-unit");
  var totalSub = document.getElementById("im-total-sub");
  var barBefore = document.getElementById("im-bar-before");
  var barAfter = document.getElementById("im-bar-after");
  var barBeforeVal = document.getElementById("im-bar-before-val");
  var barAfterVal = document.getElementById("im-bar-after-val");
  var barNote = document.getElementById("im-bar-note");
  var mixBefore = document.getElementById("im-mix-before");
  var mixAfter = document.getElementById("im-mix-after");
  var eq = {
    coal: document.getElementById("im-eq-coal"),
    cars: document.getElementById("im-eq-cars"),
    trees: document.getElementById("im-eq-trees"),
    homes: document.getElementById("im-eq-homes")
  };
  var badgeBefore = document.getElementById("im-badge-before");
  var badgeAfter = document.getElementById("im-badge-after");
  var smog = document.getElementById("im-smogrect");
  var toast = document.getElementById("im-toast");

  if (!regionsBox || !smog) return;

  /* ---------- formatting ---------- */
  function fmtMt(mt) {
    if (mt >= 1000) return (mt / 1000).toLocaleString("en-US", { maximumFractionDigits: 2 }) + " Gt";
    return Math.round(mt).toLocaleString("en-US") + " Mt";
  }

  function fmtCompact(x) {
    if (x >= 1e12) return (x / 1e12).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "T";
    if (x >= 1e9) return (x / 1e9).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "B";
    if (x >= 1e6) return (x / 1e6).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "M";
    if (x >= 1e3) return Math.round(x).toLocaleString("en-US");
    return String(Math.round(x));
  }

  function fmtInt(x) {
    return Math.round(x).toLocaleString("en-US");
  }

  /* ---------- the model ---------- */
  function compute() {
    var R = region;
    var solarPct = levers.solar, windPct = levers.wind;
    var evPct = levers.ev, retroPct = levers.retro;

    var solarAdd = R.gen * solarPct / 100;   /* TWh */
    var windAdd = R.gen * windPct / 100;
    var renAdd = solarAdd + windAdd;

    var fossilShare = R.mix.fossil / 100;
    var fossilTWh = R.gen * fossilShare;
    var displaced = Math.min(renAdd, fossilTWh);

    var fossilIntensity = R.intensity / fossilShare;              /* g/kWh */
    var powerSavedT = displaced * 1e9 * fossilIntensity / 1e6;    /* tonnes */

    var newFossilTWh = fossilTWh - displaced;
    /* new grid intensity: remaining fossil emissions spread over all generation */
    var newIntensity = newFossilTWh * fossilIntensity / R.gen; /* g/kWh */

    var evCount = R.cars * 1e6 * evPct / 100;
    var chargeT = CAR_KM * EV_KWH_KM * newIntensity / 1e6;        /* t per EV per year */
    var evSavedT = evCount * Math.max(0, ICE_T_PER_CAR - chargeT);

    var heatSavedT = R.heat * 1e6 * (retroPct / 100) * HEAT_CUT;

    var totalT = powerSavedT + evSavedT + heatSavedT;
    var sharePct = R.co2 > 0 ? totalT / (R.co2 * 1e6) * 100 : 0;
    var afterTotalMt = Math.max(0, R.co2 - totalT / 1e6);

    var afterMix = {
      solar: R.mix.solar + solarAdd / R.gen * 100,
      wind: R.mix.wind + windAdd / R.gen * 100,
      clean: R.mix.hydro + R.mix.nuclear + R.mix.bio,
      fossil: Math.max(0, newFossilTWh / R.gen * 100)
    };
    /* round to one decimal, keep sum at 100 via fossil remainder */
    afterMix.solar = Math.round(afterMix.solar * 10) / 10;
    afterMix.wind = Math.round(afterMix.wind * 10) / 10;
    afterMix.clean = Math.round(afterMix.clean * 10) / 10;
    afterMix.fossil = Math.max(0, Math.round((100 - afterMix.solar - afterMix.wind - afterMix.clean) * 10) / 10);

    return {
      renTWh: renAdd, displaced: displaced, solarAdd: solarAdd, windAdd: windAdd,
      powerSavedT: powerSavedT, evSavedT: evSavedT, heatSavedT: heatSavedT,
      totalT: totalT, sharePct: sharePct, afterTotalMt: afterTotalMt,
      newIntensity: newIntensity, afterMix: afterMix, evCount: evCount,
      curtailed: Math.max(0, renAdd - displaced)
    };
  }

  /* ---------- counter tween ---------- */
  var tweenRaf = null;
  function tweenTotal(targetT) {
    if (tweenRaf) window.cancelAnimationFrame(tweenRaf);
    var from = lastShownTotal;
    lastShownTotal = targetT;
    var t0 = performance.now();
    var DUR = prefersReducedMotion ? 1 : 520;
    function step(now) {
      var p = Math.min(1, (now - t0) / DUR);
      var ease = 1 - Math.pow(1 - p, 3);
      var v = from + (targetT - from) * ease;
      if (v >= 1e9) {
        totalEl.textContent = (v / 1e9).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        totalUnit.textContent = "Gt";
      } else {
        totalEl.textContent = Math.round(v / 1e6).toLocaleString("en-US");
        totalUnit.textContent = "Mt";
      }
      if (p < 1) tweenRaf = requestAnimationFrame(step);
    }
    tweenRaf = requestAnimationFrame(step);
  }

  /* ---------- UI update ---------- */
  function updateMixBar(box, mix, label) {
    box.innerHTML =
      '<span class="seg-solar" style="width:' + mix.solar + '%"></span>' +
      '<span class="seg-wind" style="width:' + mix.wind + '%"></span>' +
      '<span class="seg-clean" style="width:' + mix.clean + '%"></span>' +
      '<span class="seg-fossil" style="width:' + mix.fossil + '%"></span>';
    box.setAttribute("aria-label", label +
      ": solar " + mix.solar + "%, wind " + mix.wind + "%, hydro and nuclear " +
      mix.clean + "%, fossil " + mix.fossil + "%");
  }

  function render(res) {
    tweenTotal(res.totalT);

    if (res.totalT < 1e6) {
      totalSub.textContent = "nudge a lever to begin";
    } else {
      totalSub.textContent =
        (res.sharePct >= 0.1 ? res.sharePct.toFixed(1) : "<0.1") +
        "% of " + region.article + "'s yearly emissions · " +
        fmtInt(res.displaced) + " TWh of fossil power displaced";
    }

    barBefore.style.width = "100%";
    barAfter.style.width = (region.co2 > 0 ? res.afterTotalMt / region.co2 * 100 : 0) + "%";
    barBeforeVal.textContent = fmtMt(region.co2);
    barAfterVal.textContent = fmtMt(res.afterTotalMt);
    barNote.textContent = res.curtailed > 0
      ? "Note: " + fmtInt(res.curtailed) + " TWh of the additions exceed remaining fossil plants — shown as curtailed/exported."
      : "";

    updateMixBar(mixBefore, {
      solar: region.mix.solar, wind: region.mix.wind,
      clean: Math.round((region.mix.hydro + region.mix.nuclear + region.mix.bio) * 10) / 10,
      fossil: region.mix.fossil
    }, "Grid mix today");
    updateMixBar(mixAfter, res.afterMix, "Grid mix under your plan");

    eq.coal.textContent = fmtCompact(res.totalT / COAL_PLANT_T);
    eq.cars.textContent = fmtCompact(res.totalT / ICE_T_PER_CAR);
    eq.trees.textContent = fmtCompact(res.totalT / TREE_T);
    eq.homes.textContent = fmtCompact(res.renTWh * 1e9 / HOME_KWH);

    badgeBefore.textContent = region.intensity + " g/kWh";
    badgeAfter.textContent = Math.round(res.newIntensity) + " g/kWh";
    smog.style.opacity = (Math.max(0.05, Math.min(0.5, res.afterMix.fossil / 100 * 0.55))).toFixed(3);

    /* scene: turbines */
    var tCount = Math.min(5, Math.round(levers.wind / 12));
    turbineEls.forEach(function (t, i) {
      t.style.opacity = i < tCount ? "1" : "0";
    });
    /* solar field */
    var pCount = Math.min(12, Math.round(levers.solar / 5));
    panelEls.forEach(function (p, i) {
      p.style.opacity = i < pCount ? "1" : "0";
    });
    cityPv.style.opacity = levers.solar > 0 ? "1" : "0";
    /* cars */
    var evVisible = Math.round(levers.ev / 100 * carEls.length);
    carEls.forEach(function (c, i) {
      var isEv = i < evVisible;
      c.body.setAttribute("fill", isEv ? "#10b981" : "#64748b");
      c.roof.setAttribute("fill", isEv ? "#a7f3d0" : "#94a3b8");
      c.exhaust.style.opacity = isEv ? "0" : "0.65";
    });
    /* trees grow with retrofits */
    treeEls.forEach(function (tr, i) {
      var on = levers.retro >= (i + 1) * 15;
      tr.el.style.opacity = on ? "1" : "0.25";
      tr.el.style.transform = "scale(" + (on ? tr.scale : tr.scale * 0.62) + ")";
    });
  }

  /* ---------- slider labels ---------- */
  function updateLeverLabels() {
    vals.solar.textContent = levers.solar + "%";
    vals.wind.textContent = levers.wind + "%";
    vals.ev.textContent = levers.ev + "%";
    vals.retro.textContent = levers.retro + "%";

    subs.solar.textContent = "adds " + fmtInt(region.gen * levers.solar / 100) + " TWh of solar generation";
    subs.wind.textContent = "adds " + fmtInt(region.gen * levers.wind / 100) + " TWh of wind generation";
    subs.ev.textContent = fmtCompact(region.cars * 1e6 * levers.ev / 100) + " of " +
      fmtCompact(region.cars * 1e6) + " cars go electric";
    subs.retro.textContent = levers.retro === 0
      ? "0% of homes get heat pumps & insulation"
      : levers.retro + "% of homes get heat pumps & insulation";

    [inputs.solar, inputs.wind, inputs.ev, inputs.retro].forEach(function (inp) {
      var pct = (inp.value - inp.min) / (inp.max - inp.min) * 100;
      inp.style.setProperty("--fill", pct + "%");
    });
  }

  function recompute() {
    var res = compute();
    updateLeverLabels();
    render(res);
  }

  /* ---------- scene construction ---------- */
  var svg = document.getElementById("im-svg");
  var turbineEls = [], panelEls = [], carEls = [], treeEls = [], cityPv;

  var SVGNS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function buildTurbines() {
    var g = document.getElementById("im-turbines");
    var spots = [
      { x: 52, y: 306 }, { x: 122, y: 288 }, { x: 196, y: 300 },
      { x: 268, y: 282 }, { x: 338, y: 296 }
    ];
    spots.forEach(function (s) {
      var t = svgEl("g", { class: "im-turbine", opacity: "0", style: "transition:opacity .5s ease" });
      t.appendChild(svgEl("path", {
        d: "M" + s.x + " " + (s.y + 52) + "L" + s.x + " " + s.y,
        stroke: "#e2e8f0", "stroke-width": "4", "stroke-linecap": "round"
      }));
      var rotor = svgEl("g", { class: "im-rotor" });
      for (var b = 0; b < 3; b++) {
        rotor.appendChild(svgEl("path", {
          d: "M" + s.x + " " + s.y + " c 2 -9 6 -15 12 -19 c -5 9 -8 15 -12 19 Z",
          fill: "#f8fafc",
          transform: "rotate(" + (b * 120) + " " + s.x + " " + s.y + ")"
        }));
      }
      rotor.appendChild(svgEl("circle", { cx: s.x, cy: s.y, r: "3.4", fill: "#475569" }));
      t.appendChild(rotor);
      g.appendChild(t);
      turbineEls.push(t);
    });
  }

  function buildSolarField() {
    var g = document.getElementById("im-solarfield");
    for (var i = 0; i < 12; i++) {
      var col = i % 4, row = Math.floor(i / 4);
      var x = 372 + col * 46, y = 330 + row * 15;
      var p = svgEl("g", { opacity: "0", style: "transition:opacity .45s ease" });
      p.appendChild(svgEl("polygon", {
        points: x + "," + (y + 7) + " " + (x + 7) + "," + y + " " + (x + 34) + "," + y + " " + (x + 27) + "," + (y + 7),
        fill: "#1e3a5f", stroke: "#38bdf8", "stroke-width": "1"
      }));
      p.appendChild(svgEl("path", {
        d: "M" + (x + 16) + " " + (y + 7) + "v6", stroke: "#64748b", "stroke-width": "2"
      }));
      g.appendChild(p);
      panelEls.push(p);
    }
  }

  function buildCityExtras() {
    /* windows */
    var wins = document.getElementById("im-city-win");
    var blds = [
      { x: 566, y: 226, w: 22, h: 114 }, { x: 606, y: 198, w: 30, h: 142 },
      { x: 654, y: 248, w: 18, h: 92 }, { x: 512, y: 262, w: 36, h: 78 }
    ];
    blds.forEach(function (b) {
      for (var wy = b.y + 8; wy < b.y + b.h - 8; wy += 16) {
        for (var wx = b.x + 4; wx < b.x + b.w - 6; wx += 10) {
          wins.appendChild(svgEl("rect", {
            x: wx, y: wy, width: "5", height: "7", rx: "1",
            fill: Math.random() > 0.35 ? "#fde68a" : "#1e293b", opacity: "0.9"
          }));
        }
      }
    });
    /* rooftop solar appears with the solar lever */
    cityPv = svgEl("g", { opacity: "0", style: "transition:opacity .5s ease" });
    [[560, 212, 34], [600, 184, 42], [506, 248, 48]].forEach(function (r) {
      cityPv.appendChild(svgEl("rect", {
        x: r[0], y: r[1], width: r[2], height: "5", rx: "1.5", fill: "#0f172a", stroke: "#38bdf8", "stroke-width": "1"
      }));
    });
    document.getElementById("im-city").appendChild(cityPv);
  }

  function buildTrees() {
    var g = document.getElementById("im-trees");
    var spots = [
      { x: 40, y: 368, s: 1 }, { x: 84, y: 374, s: 0.85 }, { x: 300, y: 370, s: 0.9 },
      { x: 348, y: 376, s: 0.75 }, { x: 470, y: 372, s: 0.9 }, { x: 520, y: 366, s: 1.05 }
    ];
    spots.forEach(function (s) {
      var t = svgEl("g", {
        opacity: "0.25",
        style: "transition:opacity .5s ease, transform .5s ease; transform-box: fill-box; transform-origin: 50% 100%"
      });
      t.appendChild(svgEl("rect", { x: s.x - 2, y: s.y - 12, width: "4", height: "12", fill: "#7c5a3a" }));
      t.appendChild(svgEl("circle", { cx: s.x, cy: s.y - 19, r: 9 * s.s + 4, fill: "#10b981" }));
      t.appendChild(svgEl("circle", { cx: s.x - 5, cy: s.y - 14, r: 6 * s.s + 3, fill: "#34d399" }));
      t.appendChild(svgEl("circle", { cx: s.x + 5, cy: s.y - 14, r: 6 * s.s + 3, fill: "#059669" }));
      g.appendChild(t);
      treeEls.push({ el: t, scale: s.s });
    });
  }

  function buildCars() {
    var g = document.getElementById("im-cars");
    for (var i = 0; i < 8; i++) {
      var rev = i >= 4;
      var y = rev ? 402 : 383;
      var car = svgEl("g", {
        class: "im-car" + (rev ? " rev" : ""),
        style: "animation-duration:" + (11 + (i % 4) * 2.3) + "s; animation-delay:" + (-(i * 3.1)) + "s"
      });
      /* inner group: flipped for the oncoming lane so the CSS
         animation transform on the outer group is never overridden */
      var body = svgEl("g", rev ? { transform: "scale(-1 1) translate(-34 0)" } : {});
      body.appendChild(svgEl("rect", { x: "0", y: y, width: "34", height: "10", rx: "4", fill: "#64748b", class: "im-car-body" }));
      body.appendChild(svgEl("path", { d: "M8 " + y + " q 4 -8 12 -8 h 6 q 6 0 8 8 Z", fill: "#94a3b8", class: "im-car-roof" }));
      body.appendChild(svgEl("circle", { cx: 9, cy: y + 11, r: "3.4", fill: "#1e293b" }));
      body.appendChild(svgEl("circle", { cx: 25, cy: y + 11, r: "3.4", fill: "#1e293b" }));
      var ex = svgEl("g", { class: "im-car-exhaust", opacity: "0.65" });
      ex.appendChild(svgEl("circle", { cx: -5, cy: y + 7, r: "2.4", fill: "#9ca3af" }));
      ex.appendChild(svgEl("circle", { cx: -11, cy: y + 5, r: "1.7", fill: "#b0b7c3" }));
      body.appendChild(ex);
      car.appendChild(body);
      g.appendChild(car);
      carEls.push({ el: car, body: car.querySelector(".im-car-body"), roof: car.querySelector(".im-car-roof"), exhaust: car.querySelector(".im-car-exhaust") });
    }
  }

  /* ---------- region picker ---------- */
  function intensityClass(g) {
    if (g >= 450) return "hot";
    if (g >= 300) return "mid";
    return "low";
  }

  function buildRegions() {
    REGIONS.forEach(function (R) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "im-region";
      b.dataset.key = R.key;
      b.setAttribute("aria-pressed", "false");
      b.innerHTML =
        '<span class="im-region-name">' + R.name + "</span>" +
        '<span class="im-region-meta">' + fmtInt(R.gen) + " TWh" +
        '<i class="' + intensityClass(R.intensity) + '">' + R.intensity + " g/kWh</i></span>";
      b.addEventListener("click", function () { selectRegion(R.key); });
      regionsBox.appendChild(b);
    });
  }

  function selectRegion(key) {
    REGIONS.forEach(function (R) {
      if (R.key !== key) return;
      region = R;
    });
    regionsBox.querySelectorAll(".im-region").forEach(function (b) {
      var on = b.dataset.key === key;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    regionNote.textContent = region.note;
    lastShownTotal = 0; /* restart counter from zero for drama */
    recompute();
  }

  /* ---------- presets ---------- */
  var PRESETS = {
    classic: { solar: 50, wind: 0, ev: 0, retro: 0 },
    paris: { solar: 25, wind: 25, ev: 40, retro: 40 },
    netzero: { solar: 60, wind: 60, ev: 100, retro: 90 },
    reset: { solar: 0, wind: 0, ev: 0, retro: 0 }
  };

  document.querySelectorAll(".im-preset").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var p = PRESETS[btn.dataset.preset];
      if (!p) return;
      Object.keys(p).forEach(function (k) {
        levers[k] = p[k];
        inputs[k].value = p[k];
      });
      recompute();
      showToast(
        btn.dataset.preset === "reset"
          ? "Levers reset — a blank planet."
          : "Scenario loaded: " + btn.textContent.trim() + "."
      );
    });
  });

  /* ---------- copy / share ---------- */
  function planText() {
    var res = compute();
    return [
      "Visual Reality — Impact Simulator",
      "Region: " + region.name,
      "Extra solar: " + levers.solar + "% (+" + fmtInt(res.solarAdd) + " TWh/yr)",
      "Extra wind: " + levers.wind + "% (+" + fmtInt(res.windAdd) + " TWh/yr)",
      "Electric cars: " + levers.ev + "% of " + fmtCompact(region.cars * 1e6),
      "Home retrofits: " + levers.retro + "%",
      "=> CO2 avoided: " + (res.totalT >= 1e9
        ? (res.totalT / 1e9).toFixed(2) + " Gt"
        : Math.round(res.totalT / 1e6) + " Mt") + "/yr (" +
        (res.sharePct >= 0.1 ? res.sharePct.toFixed(1) : "<0.1") + "% of " + region.article + "'s emissions)",
      "Grid carbon intensity: " + region.intensity + " -> " + Math.round(res.newIntensity) + " g/kWh",
      "Simulated with static reference data (Ember, IEA, OWID) — visualreality.earth"
    ].join("\n");
  }

  function copyPlan() {
    var text = planText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { showToast("Plan copied — go convince someone."); },
        function () { fallbackCopy(text); }
      );
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); showToast("Plan copied — go convince someone."); }
    catch (e) { showToast("Copy failed — your browser is shy."); }
    document.body.removeChild(ta);
  }

  function sharePlan() {
    var res = compute();
    var headline = "If " + region.article + " went " + levers.solar + "% solar + " +
      levers.wind + "% wind, " + levers.ev + "% EVs: " +
      (res.totalT >= 1e9 ? (res.totalT / 1e9).toFixed(1) + " Gt" : Math.round(res.totalT / 1e6) + " Mt") +
      " CO2 saved / year";
    if (navigator.share) {
      navigator.share({ title: "Visual Reality Impact Simulator", text: headline })
        .catch(function () {});
    } else {
      copyPlan();
    }
  }

  document.getElementById("im-copy").addEventListener("click", copyPlan);
  document.getElementById("im-share").addEventListener("click", sharePlan);

  /* ---------- toast ---------- */
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove("show"); }, 2600);
  }

  /* ---------- wiring ---------- */
  Object.keys(inputs).forEach(function (k) {
    inputs[k].addEventListener("input", function () {
      levers[k] = parseInt(inputs[k].value, 10);
      recompute();
    });
  });

  /* ---------- boot ---------- */
  buildRegions();
  buildTurbines();
  buildSolarField();
  buildCityExtras();
  buildTrees();
  buildCars();
  selectRegion("world");
})();