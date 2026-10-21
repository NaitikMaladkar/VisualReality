/* ============================================================
   Visual Reality — Future City Simulator (city.js)
   Year timelines · day/night cycle · building inspector ·
   pollution gauge · live energy mix. Plain JS, no libraries.
   ============================================================ */
(function () {
  "use strict";

  var scene = document.getElementById("cityScene");
  if (!scene) return;

  var $ = function (id) { return document.getElementById(id); };

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------- State ---------------- */
  var state = {
    year: 2026,
    hour: 10,
    auto: null,
    policies: { solar: false, forest: false, transit: false, recycle: false },
    funded: {},
    selected: null
  };

  var YEAR_BASE = { 2026: 68, 2040: 46, 2060: 24 };
  var POLICY_DELTA = { solar: -8, forest: -7, transit: -7, recycle: -5 };
  var FUND_DELTA = -2;

  var YEAR_HINTS = {
    2026: "Today's baseline: cheap solar exists, but the grid still leans on fossil backup.",
    2040: "Renewables at scale: batteries cover the evening peak and most roofs pay rent to the sun.",
    2060: "The solar-punk era: energy-plus buildings, hydrogen buffers and air you can taste."
  };

  /* ---------------- Building data ---------------- */
  var ICONS = {
    sun: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4.4" stroke="currentColor" stroke-width="2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9 19 19M19 5l-2.1 2.1M7.1 16.9 5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    wind: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 8h9a2.5 2.5 0 1 0-2.4-3.2M3 12h14a2.5 2.5 0 1 1-2.4 3.2M3 16h7a2.5 2.5 0 1 1-2.4 3.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    battery: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="7" width="16" height="10" rx="2.5" stroke="currentColor" stroke-width="2"/><path d="M21 10.5v3M7.5 10.5l-1.6 3h2.4l-1.6 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    leaf: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18C6 11 11 6 18 6c0 7-5 12-12 12Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 16c2.5-2.5 5.5-5.5 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    drop: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3s6.5 7.5 6.5 12a6.5 6.5 0 0 1-13 0C5.5 10.5 12 3 12 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    cpu: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="3" stroke="currentColor" stroke-width="2"/><rect x="10.2" y="10.2" width="3.6" height="3.6" rx="1" fill="currentColor"/><path d="M9 6V3m6 3V3M9 21v-3m6 3v-3M6 9H3m3 6H3m18-6h-3m3 6h-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    flame: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3c1 3-2 4.5-2 7a2 2 0 0 0 4 0c0-1 0-1.6-.4-2.4C16.5 9 19 11.5 19 15a7 7 0 0 1-14 0c0-5 5.5-7 7-12Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    people: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="8" r="3.2" stroke="currentColor" stroke-width="2"/><path d="M3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5M16 5.5a3 3 0 0 1 0 5.6m1.5 2.4c1.6.7 2.7 2.2 3 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    cloud: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 18a4.5 4.5 0 0 1-.9-8.9 6 6 0 0 1 11.6 1.4A3.8 3.8 0 0 1 17 18H7Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    glass: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2.5" stroke="currentColor" stroke-width="2"/><path d="m4 16 5-5 4 4 3-3 4 4" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    home: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m4 11 8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    spark: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
  };

  var BUILDINGS = {
    "old-quarter": {
      name: "Old Quarter",
      tag: "Heritage homes",
      fundLabel: "Fund heritage retrofit",
      states: {
        2026: {
          desc: "Drafty pre-war rows with gas boilers and single glazing. Retrofit grants exist, but only a handful of homes have made the leap so far.",
          tech: [["LED retrofits", "spark"], ["Rooftop solar (2 homes)", "sun"]]
        },
        2040: {
          desc: "Deep retrofit done: heat pumps, triple glazing and a community solar garden across the roofs. The lanes go car-free on weekends.",
          tech: [["Heat pumps", "flame"], ["Community solar", "sun"], ["Car-free lanes", "people"]]
        },
        2060: {
          desc: "A heritage-plus district — facades preserved, everything behind them re-engineered. Homes trade surplus power through a neighbourhood ledger.",
          tech: [["Peer-to-peer power", "battery"], ["Thermal store", "flame"], ["Living walls", "leaf"]]
        }
      }
    },
    solaris: {
      name: "Solaris Heights",
      tag: "Residential tower",
      fundLabel: "Fund tower upgrade",
      states: {
        2026: {
          desc: "A 2010s tower slowly waking up. Panels cover a third of the south face, and the lobby runs on LEDs and good intentions.",
          tech: [["Facade solar (partial)", "sun"], ["Smart meters", "cpu"]]
        },
        2040: {
          desc: "Fully draped in a photovoltaic skin. Home batteries smooth the evening peak, and the lift regenerates power as it descends.",
          tech: [["PV facade", "sun"], ["Home batteries", "battery"], ["Regenerative lifts", "spark"]]
        },
        2060: {
          desc: "An energy-plus tower: it makes more power than it uses and bakes bread with the surplus. Windows tint themselves against the glare.",
          tech: [["Energy-plus", "battery"], ["Adaptive glass", "glass"], ["Micro wind edge", "wind"]]
        }
      }
    },
    meridian: {
      name: "Meridian Mall",
      tag: "Retail & community",
      fundLabel: "Fund mall greening",
      states: {
        2026: {
          desc: "Big-box retail with a big-box footprint. Air conditioning runs hard and the parking lot glows all night.",
          tech: [["Smart HVAC (pilot)", "cpu"], ["EV chargers x4", "spark"]]
        },
        2040: {
          desc: "Green-roof gardens cool the slab while skylights with AI dimmers slash the lighting load. The old car park is now a shaded solar grove.",
          tech: [["Green roof", "leaf"], ["AI skylights", "cpu"], ["Solar grove", "sun"]]
        },
        2060: {
          desc: "A circular marketplace — every shop is also a repair cafe, packaging is deposit-based, and the roof farm supplies the food court upstairs.",
          tech: [["Roof farm", "leaf"], ["Deposit packaging", "people"], ["Repair hubs", "cpu"]]
        }
      }
    },
    verdant: {
      name: "Verdant Spire",
      tag: "Vertical farm",
      fundLabel: "Expand the farm",
      states: {
        2026: {
          desc: "A promising pilot: five floors of hydroponics growing greens for two neighbourhoods. A diesel generator still hums during grid hiccups.",
          tech: [["Hydroponics (5 floors)", "leaf"], ["Rainwater tanks", "drop"]]
        },
        2040: {
          desc: "Thirty floors of stacked orchards fed by captured rainwater and LED spectra tuned per crop. Food miles: nine hundred metres.",
          tech: [["Stacked orchards", "leaf"], ["Rainwater capture", "drop"], ["LED spectra", "spark"]]
        },
        2060: {
          desc: "The spire now feeds forty thousand people and doubles as a carbon scrubber, its algae walls quietly drinking the city's exhaust.",
          tech: [["Algae facade", "leaf"], ["Food for 40k", "home"], ["CO2 capture", "cloud"]]
        }
      }
    },
    helix: {
      name: "Helix Labs",
      tag: "Science campus",
      fundLabel: "Fund campus upgrade",
      states: {
        2026: {
          desc: "World-class research, 20th-century plumbing. The labs are energy-hungry and the server hall sweats through summer.",
          tech: [["Geothermal (1 bore)", "flame"], ["Heat recovery (partial)", "spark"]]
        },
        2040: {
          desc: "Geothermal loops and heat-recovery chillers recycle warmth between buildings. Experiments run when the sun does — load-shifting by design.",
          tech: [["Geothermal grid", "flame"], ["Load-shifting", "cpu"], ["Green computing", "cpu"]]
        },
        2060: {
          desc: "A carbon-negative campus: direct-air capture in the basement, open data for the world, and a rooftop observatory for the city's kids.",
          tech: [["Direct-air capture", "cloud"], ["Open data", "cpu"], ["Campus forest", "leaf"]]
        }
      }
    },
    gridhub: {
      name: "The Grid Hub",
      tag: "Energy control",
      fundLabel: "Invest in storage",
      states: {
        2026: {
          desc: "The city's power brain — half smart software, half diesel stubbornness. Batteries cover minutes, not evenings.",
          tech: [["Li-ion buffer", "battery"], ["AI forecasting (beta)", "cpu"]]
        },
        2040: {
          desc: "A seven-hour battery wall balances solar, wind and demand in real time. Blackouts are officially a history lesson here.",
          tech: [["7-hour battery", "battery"], ["V2G channels", "spark"], ["Auto-balancing", "cpu"]]
        },
        2060: {
          desc: "Fusion-assisted and hydrogen-buffered, the Hub now trades electricity with neighbouring cities like a stock exchange.",
          tech: [["Fusion feed", "spark"], ["H2 buffer", "battery"], ["Inter-city trade", "people"]]
        }
      }
    },
    skyline: {
      name: "Skyline One",
      tag: "Office mega-tower",
      fundLabel: "Fund facade swap",
      states: {
        2026: {
          desc: "Prestige glass that bakes in summer and chills in winter. The lobby fountain evaporates more water than the roof garden saves.",
          tech: [["Smart blinds", "cpu"], ["Roof garden (small)", "leaf"]]
        },
        2040: {
          desc: "Photovoltaic glass replaced the curtain wall, and edge-mounted micro turbines sip the tower's wind. The fountain is responsibly recycled.",
          tech: [["PV glass", "sun"], ["Micro turbines", "wind"], ["Greywater loop", "drop"]]
        },
        2060: {
          desc: "A vertical district — offices by day, homes by night, and a public sky-park every twenty floors. It breathes through a double-skin facade.",
          tech: [["Double-skin facade", "glass"], ["Sky-park", "leaf"], ["Mixed-use", "home"]]
        }
      }
    },
    aqua: {
      name: "AquaCycle Works",
      tag: "Water plant",
      fundLabel: "Fund water reuse",
      states: {
        2026: {
          desc: "Solid conventional treatment with one bold pilot: greywater recycling for the eastern district.",
          tech: [["Greywater (pilot)", "drop"], ["Solar drying beds", "sun"]]
        },
        2040: {
          desc: "Every drop is used twice. Treatment runs on biogas from the city's own waste, and surplus heat warms the greenhouse belt.",
          tech: [["Biogas power", "flame"], ["Full water reuse", "drop"], ["Heat to greenhouses", "sun"]]
        },
        2060: {
          desc: "The plant harvests fog and humidity too, topping up aquifers and supplying the vertical farms. The river runs clearer than a century ago.",
          tech: [["Fog harvesters", "drop"], ["Aquifer recharge", "drop"], ["River restoration", "leaf"]]
        }
      }
    }
  };

  /* ---------------- Windows generation ---------------- */
  var sceneNS = "http://www.w3.org/2000/svg";

  function buildWindows() {
    var hosts = scene.querySelectorAll(".windows");
    Array.prototype.forEach.call(hosts, function (host) {
      var cols = +host.getAttribute("data-wcols");
      var rows = +host.getAttribute("data-wrows");
      var ww = +host.getAttribute("data-ww");
      var wh = +host.getAttribute("data-wh");
      var gx = +host.getAttribute("data-gx");
      var gy = +host.getAttribute("data-gy");
      var x0 = +host.getAttribute("data-x0");
      var y0 = +host.getAttribute("data-y0");
      var i = 0;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var rect = document.createElementNS(sceneNS, "rect");
          rect.setAttribute("x", x0 + c * (ww + gx));
          rect.setAttribute("y", y0 + r * (wh + gy));
          rect.setAttribute("width", ww);
          rect.setAttribute("height", wh);
          rect.setAttribute("rx", 1.4);
          var seed = (i * 7 + r * 3) % 9;
          if (seed < 4) rect.setAttribute("class", "win win-lit");
          else if (seed === 4) rect.setAttribute("class", "win win-lit win-lit-x");
          else rect.setAttribute("class", "win");
          host.appendChild(rect);
          i++;
        }
      }
    });
  }

  function buildStars() {
    var stars = $("stars");
    if (!stars) return;
    for (var i = 0; i < 46; i++) {
      var c = document.createElementNS(sceneNS, "circle");
      c.setAttribute("cx", Math.round((i * 173 + 61) % 987) + 6);
      c.setAttribute("cy", Math.round((i * 97 + 37) % 330) + 14);
      c.setAttribute("r", (i % 3 === 0 ? 1.7 : 1.1).toFixed(1));
      c.setAttribute("class", "star");
      stars.appendChild(c);
    }
  }

  /* ---------------- Helpers ---------------- */
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function getAqi() {
    var aqi = YEAR_BASE[state.year];
    Object.keys(state.policies).forEach(function (p) {
      if (state.policies[p]) aqi += POLICY_DELTA[p];
    });
    Object.keys(state.funded).forEach(function (id) {
      if (state.funded[id]) aqi += FUND_DELTA;
    });
    return Math.round(clamp(aqi, 5, 98));
  }

  function phaseOf(hour) {
    if (hour >= 20 || hour < 4.5) return "night";
    if (hour < 7.25) return "dawn";
    if (hour < 17.5) return "day";
    if (hour < 20) return "dusk";
    return "night";
  }

  var PHASE_ICONS = {
    day: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4.4" stroke="currentColor" stroke-width="2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9 19 19M19 5l-2.1 2.1M7.1 16.9 5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    night: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    dawn: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 18h16M7.5 18a4.5 4.5 0 0 1 9 0M12 4v3m-6.5 1.5L7.6 10.6m10.9-2.1-2.1 2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    dusk: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 18h16M7.5 18a4.5 4.5 0 0 1 9 0M12 8V5m6.5 4.5-2.1 2.1M5.5 9.5l2.1 2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  function fmtClock(hour) {
    var h24 = Math.floor(hour) % 24;
    var m = Math.round((hour - Math.floor(hour)) * 60);
    if (m === 60) { h24 = (h24 + 1) % 24; m = 0; }
    var ampm = h24 < 12 ? "AM" : "PM";
    var h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return h12 + ":" + (m < 10 ? "0" : "") + m + " " + ampm;
  }

  /* ---------------- Renders ---------------- */
  var CAPTIONS = {
    night: "Night shift — wind and stored sunshine keep the lights on.",
    dawn: "Morning ramp — solar waking up, kettles everywhere.",
    day: "Full daylight — panels humming, batteries topping up.",
    dusk: "Evening peak — the grid leans on storage as the sun dips."
  };

  function renderScene() {
    var phase = phaseOf(state.hour);
    scene.setAttribute("class",
      "scene y" + state.year +
      " phase-" + phase +
      (state.policies.solar ? " p-solar" : "") +
      (state.policies.forest ? " p-forest" : "") +
      (state.policies.transit ? " p-transit" : "")
    );

    // night tint
    var tint = $("nightTint");
    if (tint) {
      tint.setAttribute("opacity",
        phase === "night" ? 0.34 : phase === "dusk" ? 0.17 : phase === "dawn" ? 0.13 : 0);
    }

    // sun & moon positions
    var sun = $("sun");
    var moon = $("moon");
    var p, x, y;
    if (state.hour >= 6 && state.hour <= 18) {
      p = (state.hour - 6) / 12;
      x = 90 + p * 820;
      y = 475 - Math.sin(p * Math.PI) * 365;
      sun.setAttribute("transform", "translate(" + x + " " + y + ")");
      sun.setAttribute("opacity", 1);
    } else {
      sun.setAttribute("opacity", 0);
    }
    var q = null;
    if (state.hour >= 18) q = (state.hour - 18) / 12;
    else if (state.hour < 6) q = (state.hour + 6) / 12;
    if (q !== null) {
      x = 90 + q * 820;
      y = 475 - Math.sin(q * Math.PI) * 365;
      moon.setAttribute("transform", "translate(" + x + " " + y + ")");
      moon.setAttribute("opacity", 1);
    } else {
      moon.setAttribute("opacity", 0);
    }

    // phase icon + clock + caption
    var ico = $("phase-ico");
    if (ico) ico.innerHTML = PHASE_ICONS[phase];
    var readout = $("time-readout");
    if (readout) readout.textContent = fmtClock(state.hour);
    var caption = $("scene-caption");
    if (caption) {
      caption.textContent = fmtClock(state.hour) + " · " + state.year + " — " + CAPTIONS[phase];
    }
  }

  function renderGauge() {
    var aqi = getAqi();
    var num = $("aqi-num");
    var label = $("aqi-label");
    if (num) num.textContent = aqi;
    if (label) {
      label.textContent = aqi <= 35 ? "Crisp & clean" : aqi <= 60 ? "Moderate" : "Smog alert";
      label.className = "aqi-label " + (aqi <= 35 ? "ok" : aqi <= 60 ? "warn" : "bad");
    }
    var needle = $("needle");
    if (needle) {
      needle.setAttribute("transform", "rotate(" + (-90 + aqi * 1.8) + " 100 110)");
    }
    var smog = $("smog");
    if (smog) {
      smog.setAttribute("opacity", (0.03 + (aqi / 100) * 0.5).toFixed(2));
    }
  }

  function renderMix() {
    var caps = {
      solar: { 2026: 0.22, 2040: 0.45, 2060: 0.68 },
      wind: { 2026: 0.15, 2040: 0.26, 2060: 0.30 },
      batt: { 2026: 0.08, 2040: 0.20, 2060: 0.30 }
    };
    var hour = state.hour;
    var dayF = hour >= 6 && hour <= 18 ? Math.sin(((hour - 6) / 12) * Math.PI) : 0;
    var nightF = hour >= 20 || hour < 4.5 ? 1 : hour < 7.25 ? (7.25 - hour) / 2.75 : hour >= 17.5 ? (hour - 17.5) / 2.5 : 0;

    var solarCap = caps.solar[state.year] + (state.policies.solar ? 0.05 : 0);
    var windCap = caps.wind[state.year];
    var battCap = caps.batt[state.year];

    var solar = solarCap * dayF;
    var wind = windCap * (0.55 + 0.45 * nightF);
    var storageAvail = battCap * clamp(1.5 * dayF + 0.35 * (1 - nightF) - 0.25, 0, 1);
    var used = clamp(solar + wind + storageAvail, 0, 1);
    var battOut = used - solar - wind;
    var fossil = clamp(1 - used, 0, 1);

    var set = function (id, pct, val) {
      var bar = $("mix-" + id);
      var tx = $("pct-" + id);
      if (bar) bar.style.width = pct.toFixed(0) + "%";
      if (tx) tx.textContent = Math.round(val * 100) + "%";
    };
    set("solar", solar * 100, solar);
    set("wind", wind * 100, wind);
    set("batt", battOut * 100, battOut);
    set("fossil", fossil * 100, fossil);

    var status = $("grid-status");
    if (status) {
      var msg;
      if (phaseOf(state.hour) === "day" && solar > 0.25) {
        msg = "Solar is humming — batteries topping up.";
      } else if (phaseOf(state.hour) === "night" || phaseOf(state.hour) === "dusk") {
        msg = fossil > 0.2
          ? "Fossil backup covering " + Math.round(fossil * 100) + "% of the night. Wind helps — storage helps more."
          : "Wind + stored sunshine carry the whole night.";
      } else if (phaseOf(state.hour) === "dawn") {
        msg = "Morning ramp: solar waking, kettles everywhere.";
      } else {
        msg = "Cruising on renewables — the grid is barely breaking a sweat.";
      }
      if (state.policies.transit) msg += " Smart transit trimmed the evening surge.";
      status.textContent = msg;
    }
  }

  function renderPanel() {
    var body = $("panel-body");
    var panel = $("building-panel");
    if (!body || !panel) return;

    if (!state.selected || !BUILDINGS[state.selected]) {
      panel.classList.remove("has-sel");
      body.innerHTML =
        '<div class="panel-hint">' +
        '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 3 6.5 13h5L10 21l8.5-10h-5L15 3Z" stroke="#0e9f6e" stroke-width="1.8" stroke-linejoin="round"/></svg>' +
        "<p><strong>Tap a building</strong> in the skyline to see how its sustainable tech evolves — from clunky pilots in 2026 to city-scale systems in 2060.</p></div>";
      return;
    }

    var data = BUILDINGS[state.selected];
    var yr = data.states[state.year];
    var funded = !!state.funded[state.selected];

    var techHtml = "";
    yr.tech.forEach(function (t) {
      techHtml += "<li>" + (ICONS[t[1]] || ICONS.leaf) + t[0] + "</li>";
    });

    body.innerHTML =
      '<h3 class="bp-name">' + data.name + "</h3>" +
      '<span class="bp-tag">' + data.tag + " · " + state.year + "</span>" +
      '<p class="bp-desc">' + yr.desc + "</p>" +
      '<ul class="bp-tech" aria-label="Sustainable technology in ' + state.year + '">' + techHtml + "</ul>" +
      (funded
        ? '<div class="funded-note"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="m8.5 12.2 2.4 2.4 4.6-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Upgrade funded — smog &#8722;' + Math.abs(FUND_DELTA) + '</div>'
        : '<button type="button" class="btn btn-primary btn-sm fund-btn" id="fund-btn">' + data.fundLabel + " (smog &#8722;" + Math.abs(FUND_DELTA) + ")</button>");

    panel.classList.add("has-sel");

    var btn = $("fund-btn");
    if (btn) {
      btn.addEventListener("click", function () {
        state.funded[state.selected] = true;
        var g = scene.querySelector('.bld[data-bld="' + state.selected + '"]');
        if (g) g.classList.add("funded");
        toast(BUILDINGS[state.selected].name + " upgraded — the air thanks you. Smog " + FUND_DELTA + ".");
        renderGauge();
        renderPanel();
      });
    }
  }

  function renderAll() {
    renderScene();
    renderGauge();
    renderMix();
    renderPanel();
  }

  /* ---------------- Toast ---------------- */
  var toastTimer = null;
  function toast(msg) {
    var el = $("scene-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("show");
    }, 2600);
  }

  /* ---------------- Interactions ---------------- */
  // Year toggle
  var yearBtns = scene.ownerDocument.querySelectorAll(".year-btn");
  Array.prototype.forEach.call(yearBtns, function (btn) {
    btn.addEventListener("click", function () {
      var y = +btn.getAttribute("data-year");
      if (y === state.year) return;
      state.year = y;
      Array.prototype.forEach.call(yearBtns, function (b) {
        var on = +b.getAttribute("data-year") === state.year;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
      });
      var hint = $("year-hint");
      if (hint) hint.textContent = YEAR_HINTS[y];
      toast("Fast-forwarded to " + y + " — " + (2060 - y === 20 ? "two decades" : "four decades") + " of progress in one click.");
      renderAll();
    });
  });

  // Time slider
  var slider = $("time-slider");
  if (slider) {
    slider.addEventListener("input", function () {
      state.hour = parseFloat(slider.value);
      renderScene();
      renderMix();
    });
  }

  // Auto day cycle
  var autoBtn = $("auto-btn");
  function stopAuto() {
    if (state.auto) { clearInterval(state.auto); state.auto = null; }
    if (autoBtn) {
      autoBtn.classList.remove("is-on");
      autoBtn.setAttribute("aria-pressed", "false");
      autoBtn.querySelector("span").textContent = "Auto-run the day";
    }
  }
  if (autoBtn) {
    autoBtn.addEventListener("click", function () {
      if (state.auto) { stopAuto(); return; }
      autoBtn.classList.add("is-on");
      autoBtn.setAttribute("aria-pressed", "true");
      autoBtn.querySelector("span").textContent = "Pause the clock";
      var step = prefersReducedMotion ? 1 : 0.12;
      state.auto = setInterval(function () {
        state.hour = (state.hour + step) % 24;
        if (slider) slider.value = state.hour.toFixed(2);
        renderScene();
        renderMix();
      }, 160);
    });
  }

  // Policies
  var chips = scene.ownerDocument.querySelectorAll(".chip[data-policy]");
  var POLICY_TOAST = {
    solar: "Solar drive adopted — rooftops everywhere sprout panels. Smog \u22128.",
    forest: "City forest planted — 10,000 new trees take root. Smog \u22127.",
    transit: "Smart transit switched on — trams glide, cars vanish. Smog \u22127.",
    recycle: "Zero-waste program launched — landfills go on a diet. Smog \u22125."
  };
  Array.prototype.forEach.call(chips, function (chip) {
    chip.addEventListener("click", function () {
      var id = chip.getAttribute("data-policy");
      state.policies[id] = !state.policies[id];
      chip.setAttribute("aria-pressed", String(state.policies[id]));
      toast(state.policies[id] ? POLICY_TOAST[id] : "Policy rolled back — the air remembers.");
      renderScene();
      renderGauge();
      renderMix();
    });
  });

  // Buildings
  var blds = scene.querySelectorAll(".bld");
  Array.prototype.forEach.call(blds, function (g) {
    var id = g.getAttribute("data-bld");

    function select() {
      state.selected = id;
      Array.prototype.forEach.call(blds, function (b) {
        b.classList.toggle("selected", b === g);
      });
      renderPanel();
      var panel = $("building-panel");
      if (panel && window.innerWidth <= 1080) {
        panel.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
      }
    }

    g.addEventListener("click", select);
    g.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select();
      }
    });
  });

  // Reset
  var resetBtn = $("reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      state.year = 2026;
      state.hour = 10;
      state.policies = { solar: false, forest: false, transit: false, recycle: false };
      state.funded = {};
      state.selected = null;
      Array.prototype.forEach.call(yearBtns, function (b) {
        var on = +b.getAttribute("data-year") === 2026;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
      });
      Array.prototype.forEach.call(chips, function (c) {
        c.setAttribute("aria-pressed", "false");
      });
      Array.prototype.forEach.call(blds, function (b) {
        b.classList.remove("funded", "selected");
      });
      if (slider) slider.value = "10";
      var hint = $("year-hint");
      if (hint) hint.textContent = YEAR_HINTS[2026];
      stopAuto();
      toast("City reset to 2026 — a fresh canvas for your choices.");
      renderAll();
    });
  }

  /* ---------------- Init ---------------- */
  buildWindows();
  buildStars();
  renderAll();
})();
