/* ============================================================
   TerraSense AI — Visual Reality's on-site science copilot
   A friendly fake AI: a rule-based knowledge engine that runs
   100% in the browser. Zero APIs, zero tracking, zero storage —
   chat history lives in memory only and clears on refresh.
   ============================================================ */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ============================================================
     1 · KNOWLEDGE BASE — everything TerraSense knows
     Each topic: { k: keyword list, a: answer, more: follow-up }
     [[label|/route]] becomes a real link, **text** becomes bold.
     ============================================================ */
  var KB = [
    {
      k: ["what is this site", "what is visual reality", "about the site", "about visual reality", "this website", "this site", "what is this", "what do you do", "what is this about"],
      a: "Visual Reality is a home for **Tech for tomorrow — science, innovation and sustainability**. We turn dense climate science into playful, hands-on experiences: a [[Future City Simulator|/city]], an [[Innovation Timeline|/timeline]], a [[Carbon Calculator|/carbon]], a walkable [[Green Tech Museum|/museum]], an [[Impact Simulator|/impact]] and two learning games. Where would you like to start?"
    },
    {
      k: ["tech for tomorrow", "theme", "topic of"],
      a: "**Tech for tomorrow** is our guiding theme: technology that is brilliant *and* benign. It blends three lenses — **science** (peer-reviewed discovery), **innovation** (engineering that scales) and **sustainability** (progress the planet can afford). Every page on this site passes through those same three filters."
    },
    {
      k: ["how many pages", "how many features", "what can i explore", "everything on this site", "site map", "list of pages", "what is there to do", "all the pages"],
      a: "Seven interactive experiences await: the [[City Simulator|/city]] (fast-forward a city to 2060), the [[Innovation Timeline|/timeline]] (1952→today), the [[Carbon Calculator|/carbon]] (your live footprint), the [[Green Tech Museum|/museum]] (four 3D halls), the [[Impact Simulator|/impact]] (country-level climate what-ifs), the [[Eco Challenge|/challenge]] (daily quests & badges) and [[Tech vs Nature|/balance]] (the balancing game). Plus me, of course ✦"
    },
    {
      k: ["solar", "photovoltaic", " pv ", "solar panel", "sun power", "solar energy"],
      a: "Solar is the quiet revolution of our century — the IEA called it **the cheapest electricity in history**. Module costs fell about 90% in a decade, and in our [[Impact Simulator|/impact]] you can push a country to 50% solar and watch the tonnes of CO₂ disappear in real time. Fun fact from our [[Timeline|/timeline]]: the first practical silicon cell in 1954 was ~6% efficient; today's lab cells pass 47%."
    },
    {
      k: ["wind power", "wind turbine", "wind energy", "offshore wind"],
      a: "Wind now supplies roughly **10% of the world's electricity**, and the newest offshore turbines sweep a circle taller than the Eiffel Tower — one rotation can power a home for two days. Life-cycle analysis says a turbine pays back its build carbon in under a year, then serves 20–25 years of clean energy. Our [[City Simulator|/city]] lets you fund turbine upgrades and watch the smog gauge respond."
    },
    {
      k: ["hydro", "hydroelectric", "hydro power", "tidal", "wave energy"],
      a: "Hydropower is the grandparent of clean electricity — about **14% of global generation** — and it still stores more energy than every battery on Earth combined (pumped hydro). The frontier is now tidal and wave energy: predictable, dense, and finally reaching commercial arrays. You'll find record-breaking stats in our [[Green Tech Museum|/museum]] hydro hall."
    },
    {
      k: ["fusion", "net energy gain", "tokamak", "iter", "nif"],
      a: "Fusion had its Wright-brothers moment in **December 2022**: the National Ignition Facility got more energy out of a fusion shot than the laser put in — the first net-energy gain ever. It's still decades from your wall socket, but the physics milestone is real. The full story lives in our [[Innovation Timeline|/timeline]]."
    },
    {
      k: ["battery", "batteries", "storage", "grid scale", "microgrid", "power grid"],
      a: "Batteries are the missing puzzle piece falling into place: lithium-ion pack prices fell ~90% since 2010, and grid-scale storage is now the fastest-growing power technology on the planet. Pair cheap solar + storage and you get microgrids that keep neighbourhoods powered through blackouts — the kind of system you can experiment with in our [[City Simulator|/city]]."
    },
    {
      k: ["ev", "electric vehicle", "electric car", "electric cars"],
      a: "Electric vehicles went from 1-in-25 new cars in 2020 to roughly **1-in-5 in 2024**. An EV on today's average grid already saves about half the lifetime emissions of a petrol car — and as the grid gets greener, every EV gets greener too, automatically. Try the EV lever in our [[Impact Simulator|/impact]] and watch traffic turn emerald."
    },
    {
      k: ["heat pump", "heating", "home heating", "boiler"],
      a: "Heat pumps are magic-adjacent: they move heat instead of making it, delivering 3–4 units of warmth per unit of electricity. Swapping a gas boiler cuts home heating emissions by half or more, depending on your grid. Our [[Carbon Calculator|/carbon]] includes a retrofit lever so you can see the exact tonnes you'd save."
    },
    {
      k: ["climate ai", "ai for climate", "machine learning", "artificial intelligence", "weather forecasting", "predict flood", "predict drought"],
      a: "AI is climate science's new telescope: models that fuse satellite and ground sensors can now flag floods, droughts and heatwaves **weeks earlier** than traditional methods — vital lead time for farmers, insurers and cities. That same family of ideas inspires this site's namesake. For the big picture, visit our [[Impact Simulator|/impact]]."
    },
    {
      k: ["carbon calculator", "footprint calculator", "count my carbon", "carbon page"],
      a: "The [[Carbon Calculator|/carbon]] asks twelve honest questions — travel, home, food, shopping — and builds your live dashboard: yearly tonnes, a comparison with the world average, and a green-tech game plan ranked by tonnes saved. No email, no account; everything computes in your browser."
    },
    {
      k: ["reduce my carbon", "cut my carbon", "lower my footprint", "shrink my footprint", "be more sustainable", "eco friendly tips", "green tips", "live sustainably", "help the planet", "save the planet"],
      a: "The biggest levers, roughly in order: ✦ how you travel (flight-free years, EV, rail) ✦ how you heat (heat pumps, insulation) ✦ how you eat (more plants, less waste) ✦ how long you keep things (repair > replace). Our [[Eco Challenge|/challenge]] turns these into a daily-streak game, and the [[Carbon Calculator|/carbon]] ranks them by *your* numbers."
    },
    {
      k: ["city simulator", "city sim", "future city", "smart city", "2060"],
      a: "The [[Future City Simulator|/city]] hands you the keys to a living block: jump from 2026 to 2060, tap buildings to explore solar skins, green roofs and smart lighting, then fund the upgrades that clear the smog gauge. It runs a full day–night cycle so you can watch the city's energy dance."
    },
    {
      k: ["timeline", "innovation timeline", "history", "milestone", "1952"],
      a: "The [[Innovation Timeline|/timeline]] is seventy years of saving tomorrow: from the first silicon solar cell (~6% efficient, 1954) through wind farms, EVs and lithium batteries to fusion's 2022 net-energy gain. Flip the deck and watch efficiency curves climb."
    },
    {
      k: ["museum", "green tech museum", "exhibit", "gallery", "halls"],
      a: "Our [[Green Tech Museum|/museum]] is a 3D gallery built from pure CSS — no WebGL. Four halls (Solar, Wind, Hydro and AI) hold twelve animated exhibits; walk with arrow keys, click any plinth and it animates its own explanation. Don't miss the record-breaking stats scattered around."
    },
    {
      k: ["impact simulator", "impact page", "what if", "adoption", "country", "simulat"],
      a: "The [[Impact Simulator|/impact]] answers climate what-ifs with honest math on real data: pick one of eight regions, push adoption sliders (solar, wind, EVs, retrofits) and watch emissions fall live — with a before/after landscape that clears its smog as you decarbonise. Presets include *Paris 2035* and *Net-zero 2050*."
    },
    {
      k: ["eco challenge", "challenge page", "daily quest", "streak", "badge"],
      a: "The [[Eco Challenge|/challenge]] turns planet-saving into a habit game: three fresh quests every day, streak tracking, points, and eight badges to unlock. Quests come with sourced facts (UNEP, IEA, FAO…), and your progress is stored privately on your device."
    },
    {
      k: ["tech vs nature", "balance game", "balance page", "drag", "trade-off", "trade off"],
      a: "[[Tech vs Nature|/balance]] is a 10-round balancing act: drag each proposal into *Build* or *Protect* and watch the industry/nature meters swing. Every decision comes with a real-world trade-off note, and the ending you earn — Harmony or Boomtown Blues — depends on your judgement."
    },
    {
      k: ["games", "game", "play something", "play a game", "fun"],
      a: "Two games are open all night: the [[Eco Challenge|/challenge]] (daily eco-habit quests with badges and confetti) and [[Tech vs Nature|/balance]] (a drag-and-drop balancing act with live meters). Both teach real, sourced sustainability — no wrong answers, just consequences ✦"
    },
    {
      k: ["wizard", "ecoverius", "druid", "the character", "hero character", "voice", "talks"],
      a: "That's **Ecoverius**, our eco-wizard — he lives in the homepage banner and greets every visitor out loud (text-to-speech, still on-device). Click him for spoken Earth-protection tips; the mute button keeps him quiet if you prefer reading."
    },
    {
      k: ["join the movement", "join", "share my idea", "share an idea", "submit an idea", "send my idea", "my idea", "ideas", "contribute", "get involved", "be part", "take part"],
      a: "The movement is open ✦ Scroll to the **Join the movement** section at the bottom of the [[homepage|/]] and send your idea — an invention, a climate app, a city hack, a wild what-if. Ideas of every size are welcome, and they all help build a planet-friendly tomorrow."
    },
    {
      k: ["newsletter", "tomorrow brief", "subscribe", "email list", "mailing list"],
      a: "We retired the old newsletter for something better: **Join the movement** — a section at the bottom of the [[homepage|/]] where you can send your own ideas straight to the team. Much more fun than another inbox visitor."
    },
    {
      k: ["mission", "2040", "roadmap", "vision", "1,000", "goal of"],
      a: "Our mission: by **2040**, map 1,000 scalable climate solutions and connect the people who can deploy them — students, mayors, engineers, founders — with the rigorous science to back their choices. The full roadmap is on the [[homepage|/]] mission panel."
    },
    {
      k: ["net zero", "net-zero", "decarboni", "emissions target", "carbon neutral"],
      a: "**Net zero** means the greenhouse gases we emit are balanced by the ones we remove — the world aims for mid-century, we aim our operations at **2040**. It isn't emission *ignoring*: the math only works if gross emissions fall fast first. Model pathways in the [[Impact Simulator|/impact]]."
    },
    {
      k: ["global emissions", "how much co2", "co2 emissions", "greenhouse gas emissions", "37.4"],
      a: "Humanity emitted about **37.4 Gt of CO₂ in 2024** — a record, but one with a twist: clean energy is now growing faster than demand in leading economies, bending the curve. See what bending it fully would take in the [[Impact Simulator|/impact]]."
    },
    {
      k: ["renewable growth", "renewables added", "1.6 tw", "how fast is solar growing", "clean energy growth"],
      a: "In 2024 the world added roughly **1.6 TW of renewable capacity** — think of it as a second industrial revolution, in fast-forward. Solar leads, wind follows, and storage now tags along everywhere. Our [[Innovation Timeline|/timeline]] charts the whole climb."
    },
    {
      k: ["paris agreement", "1.5 degrees", "1.5°c", "warming target", "temperature goal", "global warming target"],
      a: "The Paris Agreement's heart is the **1.5 °C goal**: hold warming well below 2 °C, strive for 1.5. Current pledges land us near 2.1–2.8 °C — close enough to succeed, far enough to demand speed. Every tool on this site exists to close that gap."
    },
    {
      k: ["circular", "recycl", "compost", "biodegradable", "plastic", "waste"],
      a: "A circular economy designs waste out entirely: products become nutrients — compostable packaging, textiles that return to soil, electronics that disassemble. Recycling is the floor, not the ceiling. Our pillars section on the [[homepage|/]] has the full philosophy."
    },
    {
      k: ["water tech", "drinking water", "desalination", "water scarcity", "water from air"],
      a: "Water tech is having a breakthrough decade: modern desalination plants now deliver fresh water at under 1 kWh per cubic metre, and atmospheric harvesters pull moisture from desert air using sunlight alone. The frontier is equity — getting water where pipelines forgot."
    },
    {
      k: ["hydrogen", "green hydrogen", "electrolyzer", "electrolysis"],
      a: "**Green hydrogen** — made by splitting water with renewable electricity — is the missing fuel for steel, shipping and seasonal storage. Costs are falling as electrolysers scale, though most hydrogen today is still grey. Think of it as solar's long-distance cousin: same sun, longer journey."
    },
    {
      k: ["agriculture", "farming", "food", "vertical farm", "precision agriculture", "soil"],
      a: "Feeding 10 billion within planetary limits is *the* engineering challenge: precision agriculture trims fertiliser with satellite eyes, vertical farms grow lettuce with 95% less water, and regenerative practices rebuild soil carbon. Food systems touch a third of global emissions — huge leverage."
    },
    {
      k: ["biodiversity", "wildlife", "forest", "deforestation", "trees", "ocean", "reef"],
      a: "Climate and biodiversity are one crisis with two faces: forests and oceans absorb about half our fossil CO₂, so protecting them *is* decarbonisation. The [[Tech vs Nature|/balance]] game lets you feel that tension — every build decision shadows a habitat."
    },
    {
      k: ["career", "job", "study", "green skills", "work in sustainability", "learn climate"],
      a: "Green is the fastest-growing job market on Earth — the ILO projects **25 million new roles by 2030**. Skills in demand: energy systems, climate data (like the AI this site is named after), circular design and climate finance. Start with our [[Timeline|/timeline]] to learn the landscape, then specialise."
    },
    {
      k: ["terrasense", "who are you", "what are you", "your name", "chatbot", "assistant", "are you real", "are you ai", "real ai", "about you", "about yourself"],
      a: "I'm **TerraSense AI**, Visual Reality's resident copilot ✦ — a friendly, rule-based guide who runs entirely in your browser: no servers, no APIs, no tracking, and my answers are computed on the spot from the site's own library. Honest small print: I'm a curated knowledge engine, not a large language model — which makes me small, fast and completely private."
    },
    {
      k: ["free", "cost", "price", "pay", "subscription fee", "money"],
      a: "Everything on Visual Reality — all seven experiences, my services, and the **Join the movement** idea box — is **free to read and free to use, forever**. No paywalls, no accounts, no data harvested. That's a deliberate part of the mission."
    },
    {
      k: ["contact", "email", "reach you", "get in touch", "hello@"],
      a: "Three doors, all open ✦ Email **hello@visualreality.earth** · Call or message the creator, **Naitik Maladkar**, at **7821838270** · Find him on GitHub as **NaitikMaladkar**. Or use the [[Join the movement|/#join]] box on the homepage — it's the fastest route for ideas."
    },
    {
      k: ["phone", "phone number", "call", "mobile number", "contact number", "whatsapp", "7821838270", "ring him", "give him a call"],
      a: "You can reach **Naitik Maladkar**, the creator of Visual Reality, directly at **7821838270** — call or message. For ideas and collaborations, the [[Join the movement|/#join]] section on the homepage works too ✦"
    },
    {
      k: ["climate change", "global warming", "climate crisis"],
      a: "The science in one breath: burning fossil fuels adds ~37.4 Gt of CO₂ a year; the extra heat is already melting ice, lifting seas and intensifying storms — but the same decade that broke the record built the tools to fix it. Solar became history's cheapest energy, EVs hit 1-in-5 sales, and net-zero pledges cover 90% of GDP. Optimism, backed by math — that's the Visual Reality way. Dive into the [[Impact Simulator|/impact]] to run the numbers yourself."
    }
  ];

  /* Follow-up facts for "tell me more" on popular topics */
  var MORE = {
    "solar": "More solar sparkles: the world now installs about **1 GW of solar every day** — a powerhouse-worth of sunlight capture daily. Agrivoltaics lets crops and panels share the same field, boosting land yield and farmer income at once.",
    "wind": "More wind whispers: a single modern offshore turbine can power ~20,000 homes, and recycled turbine blades are becoming skateboards and bridges. Repowering old sites with bigger rotors can triple output without new land.",
    "fusion": "More fusion fuel: over 30 private fusion companies have raised billions since 2021, and the new milestone to watch is *repeated* net gain — ignition is a flare, a power plant needs a fireplace.",
    "ev": "More EV volts: battery prices passed the magic $100/kWh line, used-EV markets are blossoming, and the charging network doubled in three years. The cleanest EV is the one charged on a sunny afternoon.",
    "city simulator": "Insider tip for the [[City Simulator|/city]]: fund the tram line *before* the big solar farm — transport choices unlock bigger smog wins, and the night cycle is the prettiest time to check your work.",
    "carbon calculator": "Calculator secret: your biggest lever usually hides in one of the first three questions — most people find flights or heating outweigh every lightbulb they'll ever switch. Small print, big tonnes."
  };

  var CREATOR_RE = /\b(naitik|maladkar)\b|\b(who|whom)\s+(made|makes|created|creates|built|builds|designed|developed|develops|coded|founded|owns|wrote|invented)\s+(all|everything|this|the site|the website|visual reality|it all|all of (this|it)|every(thin)?g|you)\b|\b(creator|founder|developer|maker|author|owner)\s+(of|behind)\b|\bwho\s+(did|does)\s+(all|everything|this)\b/;
  var GH_PROFILE_RE = /github/;
  var GH_CONTEXT_RE = /\b(naitik|maladkar|creator|founder|developer|his|him|he|profile|link|handle|account|follow|yours?)\b/;
  var CODE_RE = /\b(html|css|javascript|js|code|coding|codebase|coder|program|programming|script|scripts|source|repo|github|git|framework|react|vue|angular|svelte|next\s?js|node|npm|backend|frontend|fullstack|database|sql|api|deploy|deployment|hosting|server|stack|tailwind|bootstrap|library|libraries|vscode|ide|tech stack|file structure|source code|open source|programming language|built with|written in)\b|how (is|was) (this|the) (site|website|page) built|what (is|was) (this|the) (site|website|page) built (with|in|from)/;
  var GREET_RE = /^(hi|hii+|hello+|hey+|yo|howdy|greetings|good\s(morning|afternoon|evening)|namaste|sup|hiya|hola)\b/;
  var THANKS_RE = /\b(thanks|thank you|thx|ty|appreciated|appreciate it)\b/;
  var BYE_RE = /\b(bye|goodbye|see ya|see you|farewell|good night|cya)\b/;
  var HELP_RE = /\b(help|what can you do|options|commands|how do you work|abilities)\b/;
  var MORE_RE = /\b(more|tell me more|go on|continue|another|extra|elaborate|details?)\b/;
  var YES_RE = /^(yes|yeah|yep|sure|ok|okay|please do|go ahead)\b/;

  var lastTopic = null;
  var offeredMore = false;

  function normalize(s) {
    s = (s || "").toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[^a-z0-9\s.+'°%$]/g, " ");
    return s.replace(/\s+/g, " ").trim();
  }

  function linkify(text) {
    var out = text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '<a href="$2" class="ts-link">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return out;
  }

  function getReply(raw) {
    var q = " " + normalize(raw) + " ";

    /* --- creator credit beats everything, as designed --- */
    if (CREATOR_RE.test(q)) {
      lastTopic = "creator";
      return "Every pixel, page, game and animation here — the city, the museum, the games, even my circuits — was imagined and built by **Naitik Maladkar** ✦ He built Visual Reality to prove that climate storytelling can feel like play. You'll find him on GitHub as **NaitikMaladkar**, or ring him at **7821838270**.";
    }

    /* --- GitHub profile requests: point to the creator (still no code talk) --- */
    if (GH_PROFILE_RE.test(q) && GH_CONTEXT_RE.test(q)) {
      lastTopic = "creator";
      return "You'll find the creator, **Naitik Maladkar**, on GitHub as **NaitikMaladkar** — github.com/NaitikMaladkar ✦ That's his home base. Now, shall I show you the science side of the site instead?";
    }

    /* --- codebase questions: politely out of scope --- */
    if (CODE_RE.test(q)) {
      return "Ah — that question lives in the engine room, and I only give guided tours of the science floor 🌱 I'm TerraSense: ask me about **the site's pages and games**, clean energy (solar, wind, fusion…), climate science, circular design — or **who made all this**.";
    }

    if (GREET_RE.test(q)) {
      return "Hello, traveller! ✦ I'm **TerraSense AI**, your guide to *Tech for tomorrow — science, innovation and sustainability*. Ask me about any page, game or green-tech topic — or start with the suggestion chips below.";
    }

    if (THANKS_RE.test(q)) {
      return "Anytime! Curiosity is the first renewable resource — it never runs out, and the more you use it the more you have. 🌍";
    }

    if (BYE_RE.test(q)) {
      return "Farewell, future-builder! May your grids be clean and your footprints light. The ✦ button is always in the corner if you need me.";
    }

    if (HELP_RE.test(q)) {
      return "I can help with: ✦ **Site guide** — every page, game and simulator ✦ **Green tech** — solar, wind, fusion, EVs, batteries, hydrogen ✦ **Climate science** — net zero, 1.5 °C, global emissions ✦ **Sustainable living** — footprint-cutting levers, ranked ✦ **Credits** — who made all this. Try me!";
    }

    /* --- "tell me more" follow-ups --- */
    if (MORE_RE.test(q) && lastTopic && MORE[lastTopic]) {
      return MORE[lastTopic];
    }
    if (MORE_RE.test(q) && lastTopic === "creator") {
      return "Want the full tour of " + "**Naitik Maladkar's**" + " work? Ask me for the *site map* — I'll list everything he built, from the 3D museum to the climate what-if engine.";
      }
    if (MORE_RE.test(q) && lastTopic) {
      return "That's the extent of my grove on that topic — but the site itself goes deeper. Try the page I linked, or ask me something fresh: fusion, EVs, net zero, the wizard…";
    }

    /* --- knowledge base scoring --- */
    var best = null, bestScore = 0;
    for (var i = 0; i < KB.length; i++) {
      var topic = KB[i], score = 0;
      for (var j = 0; j < topic.k.length; j++) {
        if (q.indexOf(topic.k[j]) !== -1) score++;
      }
      if (score > bestScore) { bestScore = score; best = topic; }
    }

    if (best) {
      lastTopic = best.k[0];
      offeredMore = !!MORE[lastTopic];
      return best.a;
    }

    if (YES_RE.test(q) && lastTopic) {
      return "Wonderful! Pick a chip below or ask me directly — I know the whole site and a fair slice of climate science.";
    }

    /* --- graceful fallback --- */
    return "Hmm — that's outside my grove of knowledge 🌿 I'm sharpest on: **the site's seven labs & games**, clean energy (solar, wind, fusion…), climate science, sustainable living, and **who made all this**. Try one of those, or tap a suggestion below.";
  }

  /* ============================================================
     2 · CHAT UI — floating button + panel (injected on every page)
     History is intentionally memory-only: it clears on refresh.
     ============================================================ */

  var ICON_BOT = '<svg width="26" height="26" viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="8" y="14" width="32" height="26" rx="9" fill="rgba(255,255,255,0.16)" stroke="currentColor" stroke-width="2.4"/><path d="M24 14V7.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="6" r="2.6" fill="currentColor"/><circle cx="18" cy="26" r="2.6" fill="currentColor"/><circle cx="30" cy="26" r="2.6" fill="currentColor"/><path d="M18.5 33.5c3.4 2.4 7.6 2.4 11 0" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M40 24h3M5 24h3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

  var WELCOME = "Greetings! I'm <strong>TerraSense&nbsp;AI</strong> — Visual Reality's resident guide for <em>Tech for tomorrow: science, innovation &amp; sustainability</em> ✦<br><br>Ask me about any page or game on this site, any green-tech topic — or <strong>who made all this</strong>. I run entirely in your browser, and this chat clears on refresh.";

  var CHIPS = [
    "What is this site about?",
    "How can I cut my carbon footprint?",
    "What can TerraSense do?",
    "Who made all this?"
  ];

  var fab, panel, log, input, form, chipsRow, clearBtn, closeBtn;
  var busy = false;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function build() {
    /* ---- floating action button ---- */
    fab = el("button", "ts-fab");
    fab.type = "button";
    fab.id = "terrasenseFab";
    fab.setAttribute("aria-expanded", "false");
    fab.setAttribute("aria-controls", "terrasensePanel");
    fab.setAttribute("aria-label", "Open the TerraSense AI chat");
    fab.innerHTML =
      ICON_BOT +
      '<span class="ts-fab-label">Ask TerraSense AI</span>';
    document.body.appendChild(fab);

    /* ---- panel ---- */
    panel = el("aside", "ts-panel");
    panel.id = "terrasensePanel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "TerraSense AI chat");
    panel.hidden = true;
    panel.innerHTML =
      '<header class="ts-head">' +
      '  <span class="ts-avatar" aria-hidden="true">' + ICON_BOT + "</span>" +
      '  <span class="ts-id">' +
      '    <span class="ts-name">TerraSense AI</span>' +
      '    <span class="ts-status"><i class="ts-dot" aria-hidden="true"></i>Online · Visual Reality&rsquo;s guide</span>' +
      "  </span>" +
      '  <span class="ts-head-actions">' +
      '    <button type="button" class="ts-icon-btn" id="tsClear" title="Clear chat" aria-label="Clear chat">' +
      '      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2m3 0-.8 12.05A2 2 0 0 1 15.2 19H8.8a2 2 0 0 1-2-1.95L6 7" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M10 11.5v4M14 11.5v4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>' +
      "    </button>" +
      '    <button type="button" class="ts-icon-btn" id="tsClose" title="Close chat" aria-label="Close chat">' +
      '      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>' +
      "    </button>" +
      "  </span>" +
      "</header>" +
      '<div class="ts-log" id="tsLog" role="log" aria-live="polite"></div>' +
      '<div class="ts-chips" id="tsChips"></div>' +
      '<form class="ts-form" id="tsForm">' +
      '  <label class="sr-only" for="tsInput">Ask TerraSense AI</label>' +
      '  <input id="tsInput" type="text" autocomplete="off" spellcheck="false" placeholder="Ask about green tech or this site…" />' +
      '  <button type="submit" class="ts-send" aria-label="Send message">' +
      '    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 12 20 4.5 15.5 20l-4-6.2L4.5 12Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="m11.5 13.8 3.6-4.3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>' +
      "  </button>" +
      "</form>" +
      '<p class="ts-foot">Session chat · history clears on refresh · nothing leaves your device</p>';
    document.body.appendChild(panel);

    log = panel.querySelector("#tsLog");
    chipsRow = panel.querySelector("#tsChips");
    clearBtn = panel.querySelector("#tsClear");
    closeBtn = panel.querySelector("#tsClose");
    form = panel.querySelector("#tsForm");
    input = panel.querySelector("#tsInput");

    CHIPS.forEach(function (c) {
      var chip = el("button", "ts-chip", c);
      chip.type = "button";
      chip.addEventListener("click", function () { send(c); });
      chipsRow.appendChild(chip);
    });

    fab.addEventListener("click", togglePanel);
    closeBtn.addEventListener("click", closePanel);
    clearBtn.addEventListener("click", resetChat);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text || busy) return;
      input.value = "";
      send(text);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) closePanel();
    });
    /* Banner CTA hook (homepage) + any [data-terrasense-open] trigger */
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-terrasense-open]")) {
        e.preventDefault();
        openPanel();
      }
    });
  }

  function openPanel() {
    if (!panel.hidden) return;
    panel.hidden = false;
    /* next frame → open transition */
    window.requestAnimationFrame(function () {
      panel.classList.add("open");
    });
    fab.classList.add("active");
    fab.setAttribute("aria-expanded", "true");
    document.body.classList.add("ts-panel-open");
    if (!log.childElementCount) greet();
    window.setTimeout(function () { input.focus(); }, prefersReducedMotion ? 0 : 240);
  }

  function closePanel() {
    if (panel.hidden) return;
    panel.classList.remove("open");
    fab.classList.remove("active");
    fab.setAttribute("aria-expanded", "false");
    document.body.classList.remove("ts-panel-open");
    window.setTimeout(function () { panel.hidden = true; }, prefersReducedMotion ? 0 : 230);
    fab.focus();
  }

  function togglePanel() {
    if (panel.hidden) openPanel(); else closePanel();
  }

  function greet() {
    addMsg("bot", WELCOME, true);
  }

  function resetChat() {
    log.innerHTML = "";
    lastTopic = null;
    greet();
    input.focus();
  }

  function addMsg(who, html, instant) {
    var msg = el("div", "ts-msg " + who);
    var bubble = el("div", "ts-bubble");
    bubble.innerHTML = html;
    msg.appendChild(bubble);
    log.appendChild(msg);
    scrollLog();
    if (who === "bot" && !instant && !prefersReducedMotion) {
      typeInto(bubble, html);
    }
    return msg;
  }

  function typeInto(bubble, html) {
    busy = true;
    var plain = html;
    var dur = Math.min(45, Math.max(9, 1400 / plain.length + 8));
    /* Reveal via character slicing on the HTML string is unsafe mid-tag;
       instead fade in words with a CSS helper. */
    bubble.classList.add("ts-typing");
    bubble.innerHTML = "";
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    var nodes = [];
    (function flatten(src) {
      Array.prototype.forEach.call(src.childNodes, function (n) {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (w) nodes.push(document.createTextNode(w));
          });
        } else {
          flatten(n);
        }
      });
    })(tmp);
    var i = 0;
    (function step() {
      if (i >= nodes.length) {
        bubble.classList.remove("ts-typing");
        bubble.innerHTML = html;
        busy = false;
        scrollLog();
        return;
      }
      bubble.appendChild(nodes[i++]);
      scrollLog();
      window.setTimeout(step, dur);
    })();
  }

  function showTyping() {
    var t = el("div", "ts-msg bot ts-typing-msg");
    t.innerHTML =
      '<div class="ts-bubble ts-bubble-typing"><span class="ts-dots" aria-label="TerraSense is typing"><i></i><i></i><i></i></span></div>';
    log.appendChild(t);
    scrollLog();
    return t;
  }

  function scrollLog() {
    log.scrollTop = log.scrollHeight;
  }

  function send(text) {
    if (busy) return;
    addMsg("user", linkify(text), true);
    input.value = "";
    busy = true;
    var typing = showTyping();
    var delay = prefersReducedMotion ? 120 : 620 + Math.min(900, text.length * 14) + Math.random() * 350;
    window.setTimeout(function () {
      typing.remove();
      var reply = linkify(getReply(text));
      busy = false;
      addMsg("bot", reply, prefersReducedMotion);
    }, delay);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
