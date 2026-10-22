/* ============================================================
   Visual Reality — museum.js
   Green Tech Museum: CSS 3D walk engine, exhibits & modal
   Rooms: Solar · Wind · Hydro · AI — 12 sourced artifacts
   ============================================================ */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- geometry constants (must match museum.css) ---------- */
  var ROOM_W = 1920;
  var ROOM_D = 950;
  var ROOM_H = 620;
  var STAND = 340;            /* camera distance into the room */
  var WALK_MS = 900;

  /* ---------- tiny svg icon glyphs ---------- */
  var ICONS = {
    pv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="6.5" r="2.6"/><path d="M7.5 1.8v1.4M7.5 9.8v1.4M2.8 6.5h1.4M10.8 6.5h1.4M4.2 3.2l1 1M9.8 8.8l1 1M10.8 3.2l-1 1M5.2 8.8l-1 1"/><path d="m9 20 3.4-6.8 8 1.4-2 5.4Z" fill="currentColor" fill-opacity=".15"/><path d="M12.4 13.2 20.4 14.6M12.4 13.2 18.4 20"/></svg>',
    perovskite: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="4" y="4" width="16" height="4" rx="1.4"/><rect x="4" y="10" width="16" height="4" rx="1.4"/><rect x="4" y="16" width="16" height="4" rx="1.4"/><path d="M9 2v18" stroke-dasharray="1.6 2.6"/></svg>',
    csp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 21V8l4-2v15"/><path d="M12 3v2.4M7.6 4.6l1.2 2M16.4 4.6l-1.2 2"/><path d="M4 21h16"/><path d="M6.6 17.4 10 14M2.8 13.6 6 12"/></svg>',
    blade: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.2"/><path d="M12 9.8c0-4 .8-6.3 2.4-7.3.9 1.8.7 4.5-.9 7.6"/><path d="m9.9 13.1-3.4 2c-3-2.4-3.8-4.6-3.3-6.5 2 .1 4 1.7 6.3 5"/><path d="m14.1 13.1 3.4 2c3-2.4 3.8-4.6 3.3-6.5-2 .1-4 1.7-6.3 5"/></svg>',
    offshore: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v9"/><path d="M12 8c0-2.4 1.6-4 3.6-4.6-.5 2-1.6 3.6-3.6 4.6ZM12 8c-2.3-.3-3.8-1.7-4.3-3.8 2 .2 3.5 1.5 4.3 3.8Z"/><path d="M2 20c1.7-1.4 3.3-1.4 5 0s3.3 1.4 5 0 3.3-1.4 5 0 3.3 1.4 5 0"/></svg>',
    kite: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3.5 20 9l-6 5.5L8 9Z"/><path d="M14 3.5 14 14.5M8 9h12"/><path d="m14 14.5-1.4 2.4M14 14.5l1.4 2.4"/><path d="M3.5 20.5c2-1.6 4-1.6 6 0"/></svg>',
    dam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h5v18H9z" fill="currentColor" fill-opacity=".14"/><path d="M9 3v18M14 3v18"/><path d="M14 9h3.5M14 13h3.5"/><path d="M2 21c1.6-1.2 3.2-1.2 4.8 0"/><path d="M20.5 9.5c0 1.4-1 2.4-1 2.4s-1-1-1-2.4a1 1 0 0 1 2 0Z"/></svg>',
    tidal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="11" r="2"/><path d="M12 9V4.5M12 13v4.5M10 11H5.5M14 11h4.5"/><path d="M2 20c1.7-1.4 3.3-1.4 5 0s3.3 1.4 5 0 3.3-1.4 5 0 3.3 1.4 5 0"/></svg>',
    pumped: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3.5" width="8" height="6" rx="1.4"/><rect x="13" y="14.5" width="8" height="6" rx="1.4"/><path d="M7 9.5v4a3 3 0 0 0 3 3h3"/><path d="m11 13.5 2 3-2 3"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="4" r="1.6"/><circle cx="12" cy="20" r="1.6"/><circle cx="4" cy="12" r="1.6"/><circle cx="20" cy="12" r="1.6"/><path d="M12 7.2V5.6M12 16.8v1.6M7.2 12H5.6M16.8 12h1.6"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="7" height="16" rx="1.4"/><rect x="13" y="4" width="7" height="16" rx="1.4"/><path d="M6.2 7.5h.01M8.4 7.5h.01M6.2 10.5h.01M8.4 10.5h.01M15.2 7.5h.01M17.4 7.5h.01M15.2 10.5h.01M17.4 10.5h.01"/></svg>',
    twin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><ellipse cx="12" cy="12" rx="3.6" ry="8.5"/><path d="M3.5 12h17"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/></svg>',
    wind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h9a2.5 2.5 0 1 0-2.4-3.2M3 12h13a2.5 2.5 0 1 1-2.4 3.2M3 16h7a2 2 0 1 1-1.9 2.6"/></svg>',
    hydro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5c3 3.6 5 6.4 5 9a5 5 0 0 1-10 0c0-2.6 2-5.4 5-9Z"/><path d="M8 20c1.4-1 2.8-1 4 0s2.6 1 4 0"/></svg>',
    ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="10" height="10" rx="2.4"/><path d="M12 2.5v4.5M12 17v4.5M2.5 12H7M17 12h4.5M5 5l2.8 2.8M19 5l-2.8 2.8M19 19l-2.8-2.8M5 19l2.8-2.8"/></svg>'
  };

  /* ---------- exhibit data (12 artifacts, 4 halls) ---------- */
  var ROOMS = [
    {
      key: "solar",
      name: "The Helio Hall",
      themeName: "Solar",
      tagline: "Sunlight, bottled by physics",
      ico: "sun",
      vars: {
        accent: "#f59e0b", accentB: "#f97316", deep: "#92400e",
        glow: "rgba(245,158,11,.42)",
        floor: "#f6eeda", ceiling: "linear-gradient(180deg,#fdf8ec,#f5ecd4)",
        wall: "linear-gradient(180deg,#faf3e2,#f0e5c9)",
        backA: "#fbf1da", backB: "#f1e3bd", framebg: "#fffdf4",
        skirting: "rgba(146,64,14,.16)"
      },
      artifacts: [
        {
          id: "pv",
          title: "The Silicon Sun-Chaser",
          tagline: "The panel that turned rooftops into power plants",
          stats: [
            { v: 6, suffix: "%", label: "efficiency of the first practical cell, Bell Labs 1954" },
            { v: 22.8, decimals: 1, suffix: "%", label: "efficiency of a panel you can buy today" },
            { v: 1.6, decimals: 1, suffix: " TW", label: "solar installed worldwide" }
          ],
          story: "A photovoltaic panel is a sandwich of silicon crystals. When sunlight lands on it, photons knock electrons loose, and the sandwich's built-in electric field herds them into a current — no fuel, no moving parts, no noise. In 1954 the first cell converted just 6% of sunlight; seventy years of engineering more than tripled that, and solar became the cheapest electricity in history for most of the planet.",
          source: "Bell Labs 1954 · IRENA & NREL 2024 · IEA PVPS"
        },
        {
          id: "perovskite",
          title: "The Perovskite Prodigy",
          tagline: "A crystal lattice stacking records on records",
          stats: [
            { v: 34.6, decimals: 1, suffix: "%", label: "tandem cell world record, certified 2024" },
            { v: 29, suffix: "%", label: "the silicon-only ceiling it smashes past" },
            { v: 15, suffix: " yrs", label: "from lab curiosity to record-setter" }
          ],
          story: "Silicon is brilliant but approaching its physical ceiling. Perovskite films absorb light differently — so engineers stack an ultrathin perovskite layer on top of a silicon cell, letting the pair harvest different slices of the spectrum together. The result: tandem cells certified at 34.6%, vaulting past silicon's theoretical single-junction limit.",
          source: "LONGi / NREL chart, 2024 · Science"
        },
        {
          id: "csp",
          title: "The Mirror Orchestra",
          tagline: "Sunset-proof solar, stored as molten salt",
          stats: [
            { v: 565, suffix: " °C", label: "temperature of the molten salt store" },
            { v: 10, suffix: " h", label: "of after-dark generation from one day's heat" },
            { v: 392, suffix: " MW", label: "peaking at the Ivanpah mirror field, USA" }
          ],
          story: "Concentrated solar power is solar with a battery built in. Thousands of mirrors — heliostats — tilt in concert to focus sunlight onto a tower, heating salt until it flows like lava. The salt holds its heat for hours, so when the sun sets, the field keeps spinning turbines deep into the night.",
          source: "Ivanpah / Crescent Dunes · NREL"
        }
      ]
    },
    {
      key: "wind",
      name: "The Gale Gallery",
      themeName: "Wind",
      tagline: "Weather, politely harnessed",
      ico: "wind",
      vars: {
        accent: "#38bdf8", accentB: "#0ea5e9", deep: "#075985",
        glow: "rgba(56,189,248,.4)",
        floor: "#e3f1f7", ceiling: "linear-gradient(180deg,#f2fafd,#e3f2f9)",
        wall: "linear-gradient(180deg,#eff7fb,#dcecf5)",
        backA: "#e9f5fa", backB: "#d3e9f3", framebg: "#fbfeff",
        skirting: "rgba(7,89,133,.16)"
      },
      artifacts: [
        {
          id: "blade",
          title: "The 115-Metre Feather",
          tagline: "A blade longer than a football pitch, lighter than it looks",
          stats: [
            { v: 115, suffix: " m", label: "blade length on today's largest turbines" },
            { v: 43, suffix: " t", label: "of glass-fibre and balsa wood per blade" },
            { v: 80, suffix: "%", label: "of new blade mass now recyclable by design" }
          ],
          story: "A modern blade is an aerospace part turned weather vane: carbon spars, balsa cores and glass-fibre skin, sculpted so a few grams per square metre decide how much of the sky it can harvest. The bigger the rotor, the cheaper the electricity — which is why blades keep outgrowing football pitches.",
          source: "Vestas V236-15.0 MW · Siemens Gamesa RecyclableBlade"
        },
        {
          id: "offshore",
          title: "The Gentle Giant",
          tagline: "Fourteen megawatts parked out at sea",
          stats: [
            { v: 14, suffix: " MW", label: "rated output of one offshore turbine" },
            { v: 260, suffix: " m", label: "tip height — taller than the Tower of London is long" },
            { v: 2, suffix: " days", label: "one rotation powers a typical home" }
          ],
          story: "Offshore wind is where turbines stop being polite. Fixed to the seabed in waters once thought too deep, each machine sweeps an area bigger than the Vatican with blades the size of jumbo-jet wings. One rotation of the rotor can power a home for two days.",
          source: "GE Haliade-X · Vestas V236 · Danish Energy Agency"
        },
        {
          id: "kite",
          title: "The Sky Sailor",
          tagline: "A drone kite tugging a giant yo-yo",
          stats: [
            { v: 800, suffix: " m", label: "altitude where the best winds live" },
            { v: 90, suffix: "%", label: "less material than an equal tower turbine" },
            { v: 100, suffix: " kW", label: "flown by the record-setting Makani prototype" }
          ],
          story: "Why build a 260-metre tower when the wind you want is overhead? Airborne systems fly tethered kites or drones in figure-eights, reeling a line that spins a drum on the ground. When the kite returns, the drum becomes a motor and reels it back in — a yo-yo that spits out far more energy than it swallows.",
          source: "Makani (Google X) · SkySails · TU Delft"
        }
      ]
    },
    {
      key: "hydro",
      name: "The Flow Wing",
      themeName: "Hydro",
      tagline: "Gravity's original power plant",
      ico: "hydro",
      vars: {
        accent: "#06b6d4", accentB: "#0891b2", deep: "#155e75",
        glow: "rgba(6,182,212,.4)",
        floor: "#e0f1f5", ceiling: "linear-gradient(180deg,#f0fafc,#e0f2f7)",
        wall: "linear-gradient(180deg,#edf7fa,#d8ebf2)",
        backA: "#e6f5f9", backB: "#cfe9f1", framebg: "#fafdfe",
        skirting: "rgba(21,94,117,.16)"
      },
      artifacts: [
        {
          id: "dam",
          title: "The Gravity Engine",
          tagline: "Rain, uphill — electricity, downhill",
          stats: [
            { v: 22.5, decimals: 1, suffix: " GW", label: "capacity of the Three Gorges Dam, the largest power plant on Earth" },
            { v: 98.8, decimals: 1, suffix: " TWh", label: "generated by Itaipu in its record year 2016" },
            { v: 1882, suffix: "", label: "the year the first hydroelectric plant lit up Wisconsin" }
          ],
          story: "Hydropower is the oldest trick in the clean-energy book: water falls, water spins a turbine, done. What changed is scale — Three Gorges spans 2.3 kilometres and out-powers entire national grids. The engineering marvel is invisible: a Francis runner casting water so smoothly it barely trembles.",
          source: "Three Gorges · Itaipu Binacional · IEEE"
        },
        {
          id: "tidal",
          title: "The Moon Mill",
          tagline: "Turbines that keep lunar time",
          stats: [
            { v: 6.8, decimals: 1, suffix: " MW", label: "grid-connected at the MeyGen tidal array, Scotland" },
            { v: 4, suffix: "×/day", label: "the tide reverses — every cycle, forever" },
            { v: 25, suffix: " yrs", label: "design life of a seabed turbine" }
          ],
          story: "Tidal energy is hydropower with the moon as project manager. Seabed turbines look like underwater windmills, but their fuel arrives twice a day with astronomical punctuality — no droughts, no calm spells, no forecasts needed. Scotland's Pentland Firth runs so hard it could power half a million homes.",
          source: "MeyGen, Scotland · Orbital Marine Power"
        },
        {
          id: "pumped",
          title: "The Water Battery",
          tagline: "Ninety-four percent of the world's grid storage",
          stats: [
            { v: 94, suffix: "%", label: "share of global grid storage that is pumped hydro" },
            { v: 80, suffix: "%", label: "typical round-trip efficiency, water lifted then released" },
            { v: 181, suffix: " GW", label: "installed worldwide and growing" }
          ],
          story: "When wind farms make more power than the grid can drink, pumped storage drinks it: water is pushed uphill into a reservoir, waiting as altitude. When demand spikes, gravity is given back its job. It is the quiet workhorse that keeps renewable grids stable — a battery measured in lakes.",
          source: "IEA Hydropower Special Report 2021 · IHA"
        }
      ]
    },
    {
      key: "ai",
      name: "The Neural Vault",
      themeName: "AI",
      tagline: "Silicon minds for a cooler planet",
      ico: "ai",
      vars: {
        accent: "#8b5cf6", accentB: "#0d9488", deep: "#5b21b6",
        glow: "rgba(139,92,246,.36)",
        floor: "#ecebf6", ceiling: "linear-gradient(180deg,#f7f6fd,#ecebf7)",
        wall: "linear-gradient(180deg,#f3f2fb,#e6e4f5)",
        backA: "#efedfa", backB: "#dfdcf3", framebg: "#fcfbff",
        skirting: "rgba(91,33,182,.16)"
      },
      artifacts: [
        {
          id: "gridbrain",
          title: "The Grid Whisperer",
          tagline: "The AI that taught data centres to sweat less",
          stats: [
            { v: 40, suffix: "%", label: "cut in data-centre cooling energy by DeepMind's AI" },
            { v: 15, suffix: "%", label: "overall overhead (PUE) improvement once live" },
            { v: 24, suffix: "/7", label: "hours a day it keeps negotiating with the weather" }
          ],
          story: "Cooling is a data centre's tax on physics. In 2016 DeepMind trained a network on sensors, pumps and chillers, then let it schedule the cooling itself — five-minute forecasts, thousands of settings juggled. The result cut cooling energy by 40% and has been running ever since, proof that software can be a power plant too.",
          source: "DeepMind & Google, 2016 · Nature"
        },
        {
          id: "cloud",
          title: "The Green Cloud",
          tagline: "Servers on a 24/7 clean-energy diet",
          stats: [
            { v: 1.3, decimals: 1, suffix: "%", label: "of global electricity used by data centres — nearly flat since 2015" },
            { v: 64, suffix: "%", label: "of Google's fleet already matched with clean energy, hourly, 2023" },
            { v: 2030, suffix: "", label: "the year 24/7 carbon-free pledges land" }
          ],
          story: "The cloud sounds weightless; it is actually millions of thirsty servers. The fix is a software diet: hourly matching of every watt a data centre draws with clean generation on the same grid — not annual averages that hide fossil night shifts. Under that rule, every new server purchase becomes a new solar farm order.",
          source: "IEA Data Centres & Data Transmission · Google CFE 2023"
        },
        {
          id: "twin",
          title: "The Digital Twin",
          tagline: "A planet simulator that outruns supercomputers",
          stats: [
            { v: 90, suffix: "%", label: "of 1,380 weather targets beaten by GraphCast vs the gold standard" },
            { v: 10, suffix: " days", label: "forecast horizon, in about one minute of compute" },
            { v: 1000, suffix: "×", label: "cheaper to run than a traditional physics model" }
          ],
          story: "Weather models are climate's antivirus software. GraphCast, a network trained on four decades of reanalysis data, rewrote the playbook: instead of simulating fluid equations step by step, it learned the atmosphere's habits. It now beats the world's best physics model on 90% of verified targets — minutes instead of supercomputer hours.",
          source: "DeepMind GraphCast, Science 2023 · ECMWF"
        }
      ]
    }
  ];

  /* flatten exhibits for modal nav */
  var EXHIBITS = [];
  ROOMS.forEach(function (room, r) {
    room.artifacts.forEach(function (art, a) {
      art.roomIndex = r;
      art.globalIndex = EXHIBITS.length;
      art.no = "Exhibit " + String(EXHIBITS.length + 1).padStart(2, "0");
      EXHIBITS.push(art);
    });
  });

  var HALL_WORDS = ["One", "Two", "Three", "Four"];

  /* ---------- element handles ---------- */
  var world = document.getElementById("ms-world");
  var stage = document.getElementById("ms-stage");
  var dots = Array.prototype.slice.call(document.querySelectorAll(".ms-dot"));
  var cells = Array.prototype.slice.call(document.querySelectorAll(".ms-minimap-cell"));
  var walker = document.getElementById("ms-walker");
  var walkFwd = document.getElementById("walk-fwd");
  var walkFwdLabel = document.getElementById("walk-fwd-label");
  var walkBack = document.getElementById("walk-back");
  var lookL = document.getElementById("look-l");
  var lookR = document.getElementById("look-r");
  var calloutKicker = document.getElementById("ms-callout-kicker");
  var calloutName = document.getElementById("ms-callout-name");
  var progressTxt = document.getElementById("ms-progress-txt");
  var live = document.getElementById("ms-live");
  var hint = document.getElementById("ms-hint");
  var blink = document.getElementById("ms-blink");
  var view3d = document.getElementById("view-3d");
  var view2d = document.getElementById("view-2d");
  var modal = document.getElementById("ms-modal");
  var modalStage = document.getElementById("ms-modal-stage");
  var modalKicker = document.getElementById("ms-modal-kicker");
  var modalTitle = document.getElementById("ms-modal-title");
  var modalTagline = document.getElementById("ms-modal-tagline");
  var modalStats = document.getElementById("ms-modal-stats");
  var modalStory = document.getElementById("ms-modal-story");
  var modalSource = document.getElementById("ms-modal-source");
  var modalCount = document.getElementById("ms-modal-count");
  var btnPrev = document.getElementById("ms-prev");
  var btnNext = document.getElementById("ms-next");
  var indexRooms = document.getElementById("ms-index-rooms");

  if (!world || !stage) return;

  /* ============================================================
     PART 2 — build, walk engine, modal, index
     ============================================================ */

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* ---------- world construction ---------- */
  var roomEls = [];

  function buildWorld() {
    ROOMS.forEach(function (room, r) {
      var roomEl = el("div", "ms-room");
      roomEl.dataset.room = r;
      var v = room.vars;
      var s = roomEl.style;
      s.setProperty("--room-accent", v.accent);
      s.setProperty("--room-accent-b", v.accentB);
      s.setProperty("--room-deep", v.deep);
      s.setProperty("--room-glow", v.glow);
      s.setProperty("--room-floor", v.floor);
      s.setProperty("--room-ceiling", v.ceiling);
      s.setProperty("--room-wall", v.wall);
      s.setProperty("--room-back-a", v.backA);
      s.setProperty("--room-back-b", v.backB);
      s.setProperty("--room-framebg", v.framebg);
      s.setProperty("--room-skirting", v.skirting);
      s.setProperty("--room-w", ROOM_W + "px");
      s.setProperty("--room-d", ROOM_D + "px");
      s.setProperty("--room-h", "620px");
      roomEl.style.transform = "translateZ(" + (-r * ROOM_D) + "px)";

      var HW = ROOM_W / 2;

      /* floor (faces up) */
      var floor = el("div", "ms-room-surface ms-floor");
      floor.style.transform =
        "translate3d(" + -HW + "px," + (ROOM_H / 2 - ROOM_D / 2) + "px," + -ROOM_D / 2 + "px) rotateX(90deg)";
      roomEl.appendChild(floor);

      /* ceiling (faces down) */
      var ceil = el("div", "ms-room-surface ms-ceiling");
      ceil.style.transform =
        "translate3d(" + -HW + "px," + (-310 - 475) + "px," + -ROOM_D / 2 + "px) rotateX(-90deg)";
      roomEl.appendChild(ceil);

      /* left + right walls */
      var wallL = el("div", "ms-room-surface ms-wall-left");
      wallL.style.transform = "translate3d(" + (-HW - 475) + "px,-310px," + -ROOM_D / 2 + "px) rotateY(90deg)";
      var wallR = el("div", "ms-room-surface ms-wall-right");
      wallR.style.transform = "translate3d(" + (HW - 475) + "px,-310px," + -ROOM_D / 2 + "px) rotateY(-90deg)";

      [wallL, wallR].forEach(function (w, i) {
        var f1 = el("div", "ms-wallframe", ICONS[room.artifacts[0].id]);
        var f2 = el("div", "ms-wallframe", ICONS[room.artifacts[2].id]);
        f1.style.left = "190px"; f1.style.top = "170px";
        f2.style.right = "190px"; f2.style.top = "170px";
        f2.style.left = "auto";
        if (i === 1) { /* mirror layout on right wall */
          f1.style.right = "190px"; f1.style.left = "auto";
          f2.style.left = "190px"; f2.style.right = "auto";
        }
        w.appendChild(f1); w.appendChild(f2);
      });
      roomEl.appendChild(wallL);
      roomEl.appendChild(wallR);

      /* back wall with name + doorway */
      var back = el("div", "ms-room-surface ms-backwall");
      back.style.transform = "translate3d(" + -HW + "px,-310px," + -ROOM_D + "px)";
      back.appendChild(el("div", "ms-room-name", room.name));
      back.appendChild(el("div", "ms-room-sub", room.themeName + " · " + HALL_WORDS[r]));
      var door = el("div", "ms-door");
      var doorBtn = el("button", "ms-door-btn");
      doorBtn.type = "button";
      if (r < ROOMS.length - 1) {
        doorBtn.innerHTML = "Next: " + ROOMS[r + 1].themeName + " &rarr;";
        doorBtn.setAttribute("aria-label", "Walk into " + ROOMS[r + 1].name);
        doorBtn.addEventListener("click", function () { goToRoom(r + 1); });
      } else {
        doorBtn.innerHTML = "Restart the tour &nearr;";
        doorBtn.setAttribute("aria-label", "Restart the tour from the first hall");
        doorBtn.addEventListener("click", function () { goToRoom(0); });
      }
      door.appendChild(doorBtn);
      back.appendChild(door);
      roomEl.appendChild(back);

      /* three exhibit plinths */
      room.artifacts.forEach(function (art, a) {
        var p = el("div", "ms-plinth");
        p.dataset.idx = art.globalIndex;
        p.innerHTML =
          '<button class="ms-plinth-btn" type="button" aria-label="' + art.title +
          ' — open the animated exhibit story">' +
          '<span class="ms-plinth-no">' + art.no + "</span>" +
          '<span class="ms-plinth-frame" aria-hidden="true">' + ICONS[art.id] + "</span>" +
          '<span class="ms-plinth-title">' + art.title + "</span>" +
          '<span class="ms-plinth-cta">View exhibit &rarr;</span>' +
          "</button>" +
          '<div class="ms-plinth-base" aria-hidden="true"></div>';
        p.querySelector("button").addEventListener("click", function () {
          openExhibit(art.globalIndex);
        });
        roomEl.appendChild(p);
        art.plinth = p;
      });

      world.appendChild(roomEl);
      roomEls.push(roomEl);
    });
  }

  function layoutPlinths() {
    var w = stage.clientWidth || 1100;
    var sideX = clamp(w * 0.28, 120, 470);
    var rot = w < 620 ? 18 : 28;
    ROOMS.forEach(function (room) {
      var ps = room.artifacts.map(function (a) { return a.plinth; });
      if (!ps[0]) return;
      ps[0].style.transform = "translate3d(" + -sideX + "px,14px,-560px) rotateY(" + rot + "deg)";
      ps[1].style.transform = "translate3d(0,-54px,-700px)";
      ps[2].style.transform = "translate3d(" + sideX + "px,14px,-560px) rotateY(" + -rot + "deg)";
    });
  }

  /* ---------- walk engine ---------- */
  var cam = STAND, camTarget = STAND;
  var look = 0, lookTarget = 0;
  var par = 0, parTarget = 0;
  var rx = 0, rxTarget = 0;
  var currentRoom = 0;
  var interacted = false;

  function goToRoom(r, fromWalk) {
    r = clamp(r, 0, ROOMS.length - 1);
    var nextCam = r * ROOM_D + STAND;
    var far = Math.abs(nextCam - camTarget) > 400;
    camTarget = nextCam;
    if (!fromWalk) lookTarget = 0;
    if (far && !prefersReducedMotion && blink) {
      blink.classList.remove("on");
      void blink.offsetWidth; /* restart animation */
      blink.classList.add("on");
    }
    markInteracted();
  }

  function markInteracted() {
    if (interacted) return;
    interacted = true;
    window.setTimeout(function () { hint.classList.add("is-dim"); }, 1600);
  }

  function updateRoomUI(r) {
    var room = ROOMS[r];
    dots.forEach(function (d, i) { d.classList.toggle("active", i === r); });
    cells.forEach(function (c, i) { c.classList.toggle("is-active", i === r); });
    calloutKicker.textContent = "Hall " + HALL_WORDS[r] + " of 4";
    calloutName.textContent = room.name;
    progressTxt.textContent = "Hall " + HALL_WORDS[r] + " of 4";
    walkBack.disabled = r === 0;
    walkFwd.disabled = r === ROOMS.length - 1;
    if (r < ROOMS.length - 1) {
      walkFwdLabel.textContent = "Walk to " + ROOMS[r + 1].name;
    } else {
      walkFwdLabel.textContent = "Tour complete";
    }
    if (live) live.textContent = room.name + " — " + room.themeName + ": " + room.tagline;
  }

  function frame() {
    if (prefersReducedMotion) {
      cam = camTarget; look = lookTarget; par = 0; rx = 0;
    } else {
      cam += (camTarget - cam) * 0.085;
      if (Math.abs(camTarget - cam) < 0.4) cam = camTarget;
      look += (lookTarget - look) * 0.1;
      par += (parTarget - par) * 0.06;
      rx += (rxTarget - rx) * 0.06;
    }
    world.style.transform =
      "rotateX(" + rx.toFixed(3) + "deg) rotateY(" + (look + par).toFixed(3) + "deg) translateZ(" + cam.toFixed(2) + "px)";

    /* minimap walker slides with real position */
    var pos = clamp((cam - STAND) / ROOM_D, 0, ROOMS.length - 1);
    walker.style.left = 21 + pos * 68 + "px";

    var r = Math.round(pos);
    if (r !== currentRoom) {
      currentRoom = r;
      updateRoomUI(r);
    }

    /* zone culling: a room is visible from one hall before you enter it
       until just before its back wall would sweep past the camera;
       plinths only show once you are inside their own hall */
    roomEls.forEach(function (re, i) {
      var lo = i * ROOM_D - ROOM_D;
      var hi = (i + 1) * ROOM_D - 480;
      re.classList.toggle("is-far", !(cam > lo && cam < hi));
    });
    ROOMS.forEach(function (room, i) {
      var on = cam > i * ROOM_D - 60 && cam < (i + 1) * ROOM_D - 480;
      room.artifacts.forEach(function (a) {
        if (a.plinth) a.plinth.classList.toggle("is-far", !on);
      });
    });
    requestAnimationFrame(frame);
  }

  /* ---------- controls wiring ---------- */
  walkFwd.addEventListener("click", function () { goToRoom(currentRoom + 1, true); });
  walkBack.addEventListener("click", function () { goToRoom(currentRoom - 1, true); });
  lookL.addEventListener("click", function () { lookTarget = clamp(lookTarget - 32, -44, 44); markInteracted(); });
  lookR.addEventListener("click", function () { lookTarget = clamp(lookTarget + 32, -44, 44); markInteracted(); });
  dots.forEach(function (d) {
    d.addEventListener("click", function () { goToRoom(parseInt(d.dataset.room, 10)); });
  });

  stage.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "w" || k === "W" || k === "ArrowUp") { goToRoom(currentRoom + 1, true); e.preventDefault(); }
    else if (k === "s" || k === "S" || k === "ArrowDown") { goToRoom(currentRoom - 1, true); e.preventDefault(); }
    else if (k === "ArrowLeft" || k === "a" || k === "A") { lookTarget = clamp(lookTarget - 30, -44, 44); e.preventDefault(); markInteracted(); }
    else if (k === "ArrowRight" || k === "d" || k === "D") { lookTarget = clamp(lookTarget + 30, -44, 44); e.preventDefault(); markInteracted(); }
    else if (k >= "1" && k <= "4") { goToRoom(parseInt(k, 10) - 1); }
  });

  /* drag to look */
  var dragging = false, dragStartX = 0, dragStartLook = 0;
  stage.addEventListener("pointerdown", function (e) {
    if (e.target.closest("button")) return;
    dragging = true;
    dragStartX = e.clientX;
    dragStartLook = lookTarget;
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", function (e) {
    if (dragging) {
      lookTarget = clamp(dragStartLook + (e.clientX - dragStartX) * 0.14, -44, 44);
      markInteracted();
    } else if (e.pointerType === "mouse" && !prefersReducedMotion) {
      var rect = stage.getBoundingClientRect();
      var nx = (e.clientX - rect.left) / rect.width - 0.5;
      var ny = (e.clientY - rect.top) / rect.height - 0.5;
      parTarget = clamp(nx * 12, -7, 7);
      rxTarget = clamp(-ny * 6, -3.5, 3.5);
    }
  });
  function endDrag(e) {
    if (dragging) { dragging = false; }
  }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("pointerleave", function () {
    parTarget = 0; rxTarget = 0;
  });

  var resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(layoutPlinths, 120);
  });

  /* ---------- exhibit modal ---------- */
  var currentIdx = 0;
  var lastFocus = null;
  var statTweens = [];

  function fmtStat(v, decimals) {
    if (decimals > 0) return v.toFixed(decimals);
    return Math.round(v).toLocaleString("en-US");
  }

  function tweenStats() {
    statTweens.forEach(function (t) { window.cancelAnimationFrame(t._raf); });
    statTweens = [];
    var nodes = modalStats.querySelectorAll(".ms-modal-stat-val");
    var t0 = performance.now();
    var DUR = prefersReducedMotion ? 1 : 950;
    nodes.forEach(function (node) {
      var v = parseFloat(node.dataset.v);
      var dec = parseInt(node.dataset.dec || "0", 10);
      var prefix = node.dataset.prefix || "";
      var suffix = node.dataset.suffix || "";
      function step(now) {
        var p = clamp((now - t0) / DUR, 0, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        node.textContent = prefix + fmtStat(v * ease, dec) + suffix;
        if (p < 1) node._raf = requestAnimationFrame(step);
      }
      node._raf = requestAnimationFrame(step);
      statTweens.push(node);
    });
  }

  function openExhibit(idx) {
    currentIdx = (idx + EXHIBITS.length) % EXHIBITS.length;
    var art = EXHIBITS[currentIdx];
    var room = ROOMS[art.roomIndex];
    lastFocus = document.activeElement;

    modalStage.innerHTML = "";
    modalStage.dataset.roomTheme = room.key;
    var tpl = document.querySelector('template[data-exhibit="' + art.id + '"]');
    if (tpl) {
      var svg = tpl.content.firstElementChild.cloneNode(true);
      svg.classList.add("ms-art");
      modalStage.appendChild(svg);
    }
    modalKicker.textContent = "Hall " + HALL_WORDS[art.roomIndex] + " · " + room.themeName;
    modalTitle.textContent = art.title;
    modalTagline.textContent = art.tagline;
    modalStats.innerHTML = art.stats.map(function (st) {
      return (
        "<li>" +
        '<span class="ms-modal-stat-val" data-v="' + st.v + '" data-dec="' + (st.decimals || 0) +
        '" data-suffix="' + (st.suffix || "") + '">0</span>' +
        '<span class="ms-modal-stat-label">' + st.label + "</span></li>"
      );
    }).join("");
    modalStory.textContent = art.story;
    modalSource.textContent = "Sources: " + art.source;
    modalCount.textContent = "Exhibit " + (currentIdx + 1) + " of " + EXHIBITS.length;

    modal.hidden = false;
    document.body.classList.add("ms-modal-open");
    tweenStats();
    modal.querySelector(".ms-modal-close").focus();

    if (prefersReducedMotion) {
      var sv = modalStage.querySelector("svg");
      if (sv && sv.pauseAnimations) sv.pauseAnimations();
    }
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("ms-modal-open");
    statTweens.forEach(function (n) { window.cancelAnimationFrame(n._raf); });
    var sv = modalStage.querySelector("svg");
    if (sv && sv.resumeAnimations) sv.resumeAnimations();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  modal.querySelectorAll("[data-ms-close]").forEach(function (b) {
    b.addEventListener("click", closeModal);
  });
  btnPrev.addEventListener("click", function () { openExhibit(currentIdx - 1); });
  btnNext.addEventListener("click", function () { openExhibit(currentIdx + 1); });

  document.addEventListener("keydown", function (e) {
    if (modal.hidden) return;
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key === "Tab") {
      var focusables = modal.querySelectorAll("button");
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });

  /* ---------- 2D collection index ---------- */
  function buildIndex() {
    ROOMS.forEach(function (room) {
      var group = el("div", "ms-roomgroup");
      group.style.setProperty("--room-accent", room.vars.accent);
      group.style.setProperty("--room-accent-b", room.vars.accentB);
      var head = el("div", "ms-roomgroup-head");
      head.innerHTML =
        '<span class="ms-roomgroup-ico" aria-hidden="true">' + ICONS[room.ico] + "</span>" +
        "<div><h3>" + room.name + "</h3><p>" + room.tagline + "</p></div>";
      group.appendChild(head);
      var grid = el("div", "ms-roomgroup-grid");
      room.artifacts.forEach(function (art) {
        var card = el("button", "ms-card");
        card.type = "button";
        card.innerHTML =
          '<span class="ms-card-top">' +
          '<span class="ms-card-no">' + art.no + " · " + room.themeName + "</span>" +
          '<span class="ms-card-ico" aria-hidden="true">' + ICONS[art.id] + "</span></span>" +
          "<h4>" + art.title + "</h4>" +
          "<p>" + art.tagline + ".</p>" +
          '<span class="ms-card-cta">Open the animated story' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m0 0-5.5-5.5M19 12l-5.5 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
        card.addEventListener("click", function () { openExhibit(art.globalIndex); });
        grid.appendChild(card);
      });
      group.appendChild(grid);
      indexRooms.appendChild(group);
    });
  }

  /* ---------- view toggle ---------- */
  view3d.addEventListener("click", function () {
    document.body.classList.remove("flat-view");
    view3d.classList.add("active");
    view3d.setAttribute("aria-pressed", "true");
    view2d.classList.remove("active");
    view2d.setAttribute("aria-pressed", "false");
    stage.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  });
  view2d.addEventListener("click", function () {
    document.body.classList.add("flat-view");
    view2d.classList.add("active");
    view2d.setAttribute("aria-pressed", "true");
    view3d.classList.remove("active");
    view3d.setAttribute("aria-pressed", "false");
    document.getElementById("exhibits").scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth", block: "start"
    });
  });

  /* ---------- boot ---------- */
  buildWorld();
  layoutPlinths();
  buildIndex();
  updateRoomUI(0);
  requestAnimationFrame(frame);
})();
