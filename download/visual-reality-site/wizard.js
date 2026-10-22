/* ============================================================
   Visual Reality — Eco Wizard "Ecoverius" (image edition)
   Fixed in the hero banner. Speaks a welcome message when the
   site opens/refreshes (with a first-gesture fallback for
   browsers that block TTS before interaction), and shares one
   Earth-protection method per click — spoken aloud via the
   browser's built-in Web Speech API. No external services.
   ============================================================ */
(function () {
  "use strict";

  var root = document.getElementById("ecoWizard");
  if (!root) return;

  var bubble = document.getElementById("wizardBubble");
  var textEl = document.getElementById("wizardText");
  var hintEl = document.getElementById("wizardHint");
  var muteBtn = document.getElementById("wizardMute");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ttsOK = "speechSynthesis" in window;

  /* ============================================
     DATA
     ============================================ */

  var WELCOME =
    "Greetings, traveller! I am Ecoverius, keeper of the green arts. " +
    "Welcome to Visual Reality — click me any time and I shall share " +
    "the ancient secrets of protecting our beautiful Earth!";

  var HUSH = "As you wish — I shall hush. Click me when you seek wisdom again!";

  // Methods for protecting the Earth — the wizard's core wisdom
  var TIPS = [
    "🌱 Turn off lights when you leave a room. Save energy, save Earth!",
    "💧 A 5-minute shower saves 25 gallons of water. Be a water hero!",
    "♻️ One recycled aluminum can saves enough energy to run a TV for 3 hours!",
    "🚶 Walk or cycle for short trips. Zero emissions, healthier you!",
    "🌳 A single tree absorbs 48 lbs of CO₂ per year. Plant one today!",
    "🔌 Unplug chargers when not in use. Phantom power is real!",
    "🛍️ Carry a reusable bag. Say no to plastic!",
    "☀️ Solar panels on your roof can cut your carbon footprint by up to 80%!",
    "🍎 Eat local and seasonal. Food miles matter!",
    "💡 LED bulbs use 75% less energy than incandescent ones!",
    "🌊 Keep our oceans clean. 8 million tonnes of plastic enter yearly!",
    "📱 Donate old electronics. E-waste is a growing problem!",
    "🏠 Smart thermostats can save 10-12% on heating costs!",
    "🌿 Compost your food waste. Black gold for plants!",
    "🚰 Fix leaky faucets. One drip per second wastes 3,000 gallons a year!",
    "🌡️ Every degree higher on your AC adds about 6% to its energy use!",
    "🥕 Growing your own veggies reduces food transport emissions!",
    "🪟 Open curtains during the day. Natural light saves electricity!",
    "🚮 Join a local cleanup day. Every piece of litter counts!",
    "🚌 Take the bus once a week — one full coach can replace 40 cars!"
  ];

  /* ============================================
     STATE
     ============================================ */

  var muted = false;
  try { muted = localStorage.getItem("ecoWizardMuted") === "1"; } catch (e) {}

  var tipIndex = 0;
  var lastMsg = WELCOME;
  var typeTimer = null;
  var hideTimer = null;
  var bounceTimer = null;
  var pendingWelcome = false;
  var HINT_DEFAULT = "Click for eco tips · click while I speak to hush me";

  /* ============================================
     HELPERS
     ============================================ */

  function stripEmoji(s) {
    return s
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, "")
      .replace(/CO₂/g, "CO2")
      .replace(/\s+/g, " ")
      .trim();
  }

  function pickVoice() {
    var voices = speechSynthesis.getVoices();
    if (!voices.length) return null;
    var en = voices.filter(function (v) { return /^en[-_]?/i.test(v.lang); });
    var pool = en.length ? en : voices;
    return (
      pool.find(function (v) { return /natural|neural|google uk english female|samantha|aria|serena/i.test(v.name); }) ||
      pool.find(function (v) { return /google|samantha|daniel|zira|karen|moira/i.test(v.name); }) ||
      pool[0]
    );
  }

  function speak(text) {
    if (muted || !ttsOK) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(stripEmoji(text));
      u.rate = 0.97;
      u.pitch = 1.02;
      u.volume = 0.9;
      var v = pickVoice();
      if (v) u.voice = v;
      u.onstart = function () { root.classList.add("is-speaking"); setHint("Speaking… click to hush me"); };
      u.onend = u.onerror = function () {
        root.classList.remove("is-speaking");
        setHint(HINT_DEFAULT);
      };
      speechSynthesis.speak(u);
    } catch (e) { /* TTS is a bonus — never break the page */ }
  }

  function stopSpeaking() {
    if (ttsOK) { try { speechSynthesis.cancel(); } catch (e) {} }
    root.classList.remove("is-speaking");
  }

  function setHint(t) { hintEl.textContent = t; }

  function typeText(s) {
    clearInterval(typeTimer);
    if (reduceMotion) {
      textEl.textContent = s;
      return;
    }
    textEl.textContent = "";
    textEl.classList.add("typing");
    var i = 0;
    typeTimer = setInterval(function () {
      textEl.textContent = s.slice(0, ++i);
      if (i >= s.length) {
        clearInterval(typeTimer);
        textEl.classList.remove("typing");
      }
    }, 20);
  }

  function scheduleHide(ms) {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      bubble.classList.remove("show");
    }, ms);
  }

  function say(msg, opts) {
    opts = opts || {};
    lastMsg = msg;
    clearTimeout(hideTimer);
    bubble.classList.add("show");
    typeText(msg);
    if (opts.speech !== false) speak(msg);
    if (opts.hideAfter) scheduleHide(opts.hideAfter);
  }

  function spokenMillis(s) {
    var words = stripEmoji(s).split(/\s+/).length;
    return Math.max(4200, words * 340 + 2600);
  }

  function bounce() {
    if (reduceMotion) return;
    root.classList.remove("is-bounce");
    void root.offsetWidth; // restart the animation
    root.classList.add("is-bounce");
    clearTimeout(bounceTimer);
    bounceTimer = setTimeout(function () { root.classList.remove("is-bounce"); }, 600);
  }

  /* ============================================
     WELCOME — speak when the site opens/refreshes
     ============================================ */

  function welcome() {
    say(WELCOME, { hideAfter: spokenMillis(WELCOME) + 2500 });
    if (!ttsOK || muted) return;
    speak(WELCOME);
    // Some browsers (Safari, newer Chrome policies) block TTS before any
    // user gesture. If nothing is playing after 800ms, defer to the first
    // interaction anywhere on the page.
    setTimeout(function () {
      var playing = false;
      try { playing = speechSynthesis.speaking || speechSynthesis.pending; } catch (e) {}
      if (!playing && !muted) {
        pendingWelcome = true;
        setHint("Tap anywhere to hear my welcome!");
        window.addEventListener("pointerdown", firstGesture, true);
        window.addEventListener("keydown", firstGesture, true);
      }
    }, 800);
  }

  function firstGesture(e) {
    window.removeEventListener("pointerdown", firstGesture, true);
    window.removeEventListener("keydown", firstGesture, true);
    if (!pendingWelcome) return;
    pendingWelcome = false;
    if (root.contains(e.target)) return; // wizard click will speak anyway
    setHint(HINT_DEFAULT);
    bubble.classList.add("show");
    clearTimeout(hideTimer);
    speak(WELCOME);
    scheduleHide(spokenMillis(WELCOME) + 2000);
  }

  // slight delay so the hero entrance animation settles first
  setTimeout(welcome, 900);

  /* ============================================
     INTERACTION — one eco tip per click
     ============================================ */

  function wizardTap() {
    bounce();
    if (root.classList.contains("is-speaking")) {
      stopSpeaking();
      clearTimeout(hideTimer);
      typeText(HUSH);
      lastMsg = HUSH;
      setHint(HINT_DEFAULT);
      scheduleHide(3200);
      return;
    }
    var tip = TIPS[tipIndex % TIPS.length];
    tipIndex += 1;
    say(tip, { hideAfter: spokenMillis(tip) + 2000 });
  }

  root.addEventListener("click", function (e) {
    if (muteBtn.contains(e.target)) return;
    wizardTap();
  });

  root.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      wizardTap();
    }
  });

  /* ============================================
     MUTE — persisted
     ============================================ */

  function renderMute() {
    muteBtn.textContent = muted ? "🔇" : "🔊";
    muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
    muteBtn.title = muted ? "Unmute voice" : "Mute voice";
    muteBtn.setAttribute("aria-label", muteBtn.title);
  }

  muteBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    muted = !muted;
    try { localStorage.setItem("ecoWizardMuted", muted ? "1" : "0"); } catch (err) {}
    renderMute();
    if (muted) {
      stopSpeaking();
      setHint("Voice muted — I will whisper on screen instead");
    } else {
      setHint(HINT_DEFAULT);
      speak(lastMsg); // replay what's on screen so nothing is missed
    }
  });

  renderMute();
  setHint(HINT_DEFAULT);

  /* ============================================
     HOUSEKEEPING
     ============================================ */

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      stopSpeaking();
      bubble.classList.remove("show");
      pendingWelcome = false;
    }
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopSpeaking();
  });

  // avoid the Chrome "speech keeps playing after unload" quirk
  window.addEventListener("pagehide", function () {
    if (ttsOK) { try { speechSynthesis.cancel(); } catch (e) {} }
  });

  // warm the voice list (Chrome loads it async)
  if (ttsOK && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.getVoices();
  }
})();
