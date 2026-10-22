/* ============================================================
   Visual Reality — Eco Wizard "Ecoverius"
   Click → spoken eco wisdom (TTS) + animated expressions.
   Refined from the community version:
   - scoped in an IIFE (no globals), site-safe
   - TTS strips emoji/unicode so the voice reads clean text
   - keyboard shortcuts ignore typing fields; H can un-hide
   - restore chip lets touch users bring the wizard back
   - auto-hide waits for the speech to finish (estimated)
   - quiz copy matches the real 8-question deck
   ============================================================ */
(function () {
  "use strict";

  var wizardEl = document.getElementById("ecoWizard");
  if (!wizardEl) return;

  document.body.classList.add("has-wizard");

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ============================================
     DATA
     ============================================ */

  // Methods for protecting the Earth — the wizard's core wisdom
  var ecoTips = [
    "🌱 Turn off lights when you leave a room. Save energy, save Earth!",
    "💧 A 5-minute shower saves 25 gallons of water. Be a water hero!",
    "♻️ One recycled aluminum can saves enough energy to run a TV for 3 hours!",
    "🚶 Walk or cycle for short trips. Zero emissions, healthier you!",
    "🌳 A single tree absorbs 48 lbs of CO₂ per year. Plant one today!",
    "🔌 Unplug chargers when not in use. Phantom power is real!",
    "🛍️ Carry a reusable bag. Say no to plastic!",
    "🌍 The Earth is 4.5 billion years old. Let's keep it beautiful!",
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
    "🧊 Keep fridge coils clean. Dirty coils use 25% more energy!",
    "🪟 Open curtains during the day. Natural light saves electricity!",
    "🚮 Join a local cleanup day. Every piece of litter counts!",
    "🚌 Take the bus once a week — one full coach can replace 40 cars!"
  ];

  var funFacts = [
    "Did you know? The first Earth Day was celebrated in 1970!",
    "Honey never spoils! Archaeologists found 3,000-year-old edible honey!",
    "A group of flamingos is called a flamboyance!",
    "Bananas are berries, but strawberries aren't!",
    "Your brain generates enough electricity to power a small light bulb!",
    "Octopuses have three hearts and blue blood!",
    "The Eiffel Tower grows 15 cm taller in summer due to expansion!",
    "A day on Venus is longer than a year on Venus!",
    "Sea otters hold hands while sleeping so they don't drift apart!",
    "The Great Barrier Reef is visible from space!"
  ];

  var motivationalQuotes = [
    "The Earth does not belong to us. We belong to the Earth.",
    "Small acts, when multiplied by millions, can transform the world!",
    "We don't inherit the Earth from our ancestors — we borrow it from our children.",
    "The greatest threat to our planet is the belief that someone else will save it.",
    "Nature is not a place to visit. It is home.",
    "Be the change you wish to see in the world.",
    "Every day is Earth Day!",
    "Green is the new cool!"
  ];

  var wizard = {
    name: "Ecoverius",
    greetings: {
      morning: [
        "Good morning, eco-warrior! The sun's energy powers my magic today!",
        "Rise and shine! A new day to heal our planet!",
        "Morning! Did you know morning air is freshest? Take a deep breath!"
      ],
      afternoon: [
        "Greetings! The afternoon sun reminds us of solar power's potential!",
        "Hello there! Perfect time for eco-friendly actions!",
        "Good day! Let's make every hour count for Earth!"
      ],
      evening: [
        "Good evening! As the day ends, reflect on your green choices...",
        "Evening greetings! Time to recharge — just like solar batteries!",
        "Hello! Stars are appearing, reminding us of the vast universe we call home!"
      ],
      night: [
        "Good night! Even wizards need rest. Remember to save energy at night!",
        "The moon watches over us. Sleep well, eco-hero!",
        "Rest now, for tomorrow we continue our green mission!"
      ]
    },
    farewells: [
      "Go forth and spread green magic!",
      "Remember: every small action counts!",
      "The Earth thanks you for listening!",
      "Until next time, keeper of the planet!",
      "May your days be green and bright!",
      "Keep fighting the good fight for our planet!"
    ]
  };

  var welcomeMessages = [
    "Hello! I'm Ecoverius, your eco guide. Click me for Earth-saving wisdom!",
    "Welcome! Click me and I'll share a way to protect the planet!",
    "Hi there! I know 20+ ways to protect the Earth. Ask me anything!",
    "Greetings! Let's save the Earth together — click me for a green tip!"
  ];

  var secretMessages = [
    "You found my secret! Here's a virtual high-five!",
    "Double magic! You're a true eco-legend!",
    "Secret unlocked: you have the heart of a guardian!",
    "Wow! Double-click power activated!",
    "You've discovered ancient wizard secrets!"
  ];

  var quizQuestions = [
    {
      question: "How many years does it take for a plastic bottle to decompose?",
      options: ["10 years", "50 years", "450 years", "1,000 years"],
      correct: 2,
      fact: "A plastic bottle can take up to 450 years to decompose in the ocean!"
    },
    {
      question: "What percentage of Earth's water is easily drinkable?",
      options: ["50%", "25%", "10%", "Less than 1%"],
      correct: 3,
      fact: "Less than 1% of Earth's water is readily accessible fresh water!"
    },
    {
      question: "Which country produces the most solar energy?",
      options: ["USA", "China", "Germany", "India"],
      correct: 1,
      fact: "China leads the world in solar power production!"
    },
    {
      question: "How many trees are cut down every year?",
      options: ["1 million", "10 million", "100 million", "15 billion"],
      correct: 3,
      fact: "Around 15 billion trees are cut down annually — that's 41 million per day!"
    },
    {
      question: "What is the most eco-friendly mode of transport?",
      options: ["Electric car", "Bus", "Bicycle", "Train"],
      correct: 2,
      fact: "Bicycles produce zero emissions and keep you healthy too!"
    },
    {
      question: "How much energy does recycling one aluminum can save?",
      options: [
        "Enough to power a TV for 3 hours",
        "Enough to power a phone for 1 hour",
        "Enough to light a bulb for 10 minutes",
        "Barely any energy"
      ],
      correct: 0,
      fact: "Recycling one can saves enough energy to run a TV for 3 hours!"
    },
    {
      question: "Which gas is most responsible for global warming?",
      options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
      correct: 1,
      fact: "CO₂ from burning fossil fuels is the main driver of climate change!"
    },
    {
      question: "How many species are estimated to go extinct every day?",
      options: ["1", "10", "150", "1,000"],
      correct: 2,
      fact: "An estimated 150 species go extinct every day due to human activities!"
    }
  ];

  var themeNames = {
    purple: "Mystical Purple",
    green: "Nature Green",
    blue: "Ocean Blue",
    orange: "Sunset Orange",
    pink: "Bubblegum Pink",
    dark: "Midnight Dark"
  };

  /* ============================================
     STATE + ELEMENTS
     ============================================ */

  var state = {
    isSpeaking: false,
    isMuted: false,
    tipIndex: Math.floor(Math.random() * ecoTips.length),
    speechCount: 0,
    currentExpression: "happy",
    currentTheme: "purple",
    isHidden: false,
    userInteracted: false,
    hideTimer: null,
    quiz: { active: false, currentQuestion: 0, score: 0 }
  };

  var el = {
    wizard: wizardEl,
    speechBubble: document.getElementById("speechBubble"),
    speechText: document.getElementById("speechText"),
    speechHint: document.getElementById("speechHint"),
    wizardName: document.getElementById("wizardName"),
    wizardMouth: document.getElementById("wizardMouth"),
    colorPanel: document.getElementById("colorPanel"),
    quizPanel: document.getElementById("quizPanel"),
    gestureHint: document.getElementById("gestureHint"),
    restore: document.getElementById("wizRestore"),
    gameModeBtn: document.getElementById("gameModeBtn"),
    colorBtn: document.getElementById("colorBtn"),
    muteBtn: document.getElementById("muteBtn"),
    closeColorPanel: document.getElementById("closeColorPanel"),
    closeQuiz: document.getElementById("closeQuiz"),
    quizStart: document.getElementById("quizStart"),
    quizGame: document.getElementById("quizGame"),
    quizResult: document.getElementById("quizResult"),
    startQuizBtn: document.getElementById("startQuizBtn"),
    retryQuizBtn: document.getElementById("retryQuizBtn"),
    quizProgressBar: document.getElementById("quizProgressBar"),
    quizQuestion: document.getElementById("quizQuestion"),
    quizOptions: document.getElementById("quizOptions"),
    quizFeedback: document.getElementById("quizFeedback"),
    quizBadge: document.getElementById("quizBadge"),
    quizScore: document.getElementById("quizScore"),
    quizMessage: document.getElementById("quizMessage"),
    colorOptions: Array.prototype.slice.call(
      document.querySelectorAll(".color-option")
    )
  };

  var ttsSupported =
    "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  var audioCtx = null;

  /* ============================================
     HELPERS
     ============================================ */

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Strip emoji / pictographs / subscripts so TTS reads clean prose
  function speakableText(text) {
    return text
      .replace(
        /[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu,
        ""
      )
      .replace(/[\u2080-\u209C]/g, function (ch) {
        return String(ch.charCodeAt(0) - 0x2080);
      })
      .replace(/\s*([.,!?;:])/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  }

  function typeText(node, text, speed) {
    if (node._typeTimer) window.clearInterval(node._typeTimer);
    node.textContent = "";
    var i = 0;
    node._typeTimer = window.setInterval(function () {
      node.textContent += text[i];
      i++;
      if (i >= text.length) window.clearInterval(node._typeTimer);
    }, speed || 18);
  }

  function showToast(message) {
    var old = document.querySelector(".wiz-toast");
    if (old) old.remove();

    var toast = document.createElement("div");
    toast.className = "wiz-toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(function () {
      if (toast.parentNode) toast.remove();
    }, 2300);
  }

  /* ============================================
     TEXT-TO-SPEECH
     ============================================ */

  var voices = [];

  function loadVoices() {
    if (!ttsSupported) return;
    voices = window.speechSynthesis.getVoices() || [];
  }

  function pickVoice() {
    if (!voices.length) loadVoices();
    var english = voices.filter(function (v) {
      return /^en(-|_)?/i.test(v.lang);
    });
    var pool = english.length ? english : voices;
    var preferred = pool.find(function (v) {
      return (
        /daniel/i.test(v.name) ||
        /google uk english male/i.test(v.name) ||
        /microsoft (david|guy|ryan)/i.test(v.name) ||
        /\bmale\b/i.test(v.name)
      );
    });
    return preferred || pool[0] || null;
  }

  function speakWithVoice(rawText) {
    if (!ttsSupported || state.isMuted) return;
    var text = speakableText(rawText);
    if (!text) return;

    window.speechSynthesis.cancel();

    var utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 0.85;
    utterance.volume = 1;
    utterance.lang = "en-US";

    var voice = pickVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || utterance.lang;
    }

    utterance.onstart = function () {
      if (el.wizardMouth)
        el.wizardMouth.style.animation = "mouthTalk 0.3s infinite";
    };
    utterance.onend = utterance.onerror = function () {
      if (el.wizardMouth) el.wizardMouth.style.animation = "";
    };

    window.speechSynthesis.speak(utterance);
  }

  function stopVoice() {
    if (ttsSupported) window.speechSynthesis.cancel();
    if (el.wizardMouth) el.wizardMouth.style.animation = "";
  }

  // Rough spoken-length estimate so the bubble stays while the voice talks
  function estimateSpeechMs(text) {
    var words = speakableText(text).split(/\s+/).filter(Boolean).length;
    return Math.min(14000, Math.max(6000, (words / 2.4) * 1000 + 1200));
  }

  /* ============================================
     SOUND EFFECTS (Web Audio, no assets)
     ============================================ */

  function getAudioContext() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended" && audioCtx.resume)
      audioCtx.resume();
    return audioCtx;
  }

  function tone(ctx, freq, start, dur, volume) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + dur);
  }

  function playMagicalSound(type) {
    if (state.isMuted) return;
    try {
      var ctx = getAudioContext();
      if (!ctx) return;

      switch (type) {
        case "speak":
          tone(ctx, 620, 0, 0.2, 0.08);
          break;
        case "correct":
          [523, 659, 784].forEach(function (f, i) {
            tone(ctx, f, i * 0.1, 0.3, 0.12);
          });
          break;
        case "wrong":
          tone(ctx, 300, 0, 0.3, 0.08);
          tone(ctx, 220, 0.12, 0.25, 0.08);
          break;
        case "special":
          [523, 659, 784, 1047, 784, 659, 523].forEach(function (f, i) {
            tone(ctx, f, i * 0.08, 0.2, 0.09);
          });
          break;
        case "theme":
          tone(ctx, 400, 0, 0.3, 0.09);
          tone(ctx, 800, 0.15, 0.25, 0.08);
          break;
        case "open":
          tone(ctx, 500, 0, 0.15, 0.07);
          tone(ctx, 700, 0.08, 0.15, 0.07);
          break;
        case "start":
          [440, 554, 659].forEach(function (f, i) {
            tone(ctx, f, i * 0.1, 0.2, 0.09);
          });
          break;
        case "complete":
          [523, 523, 523, 659, 784, 784, 1047].forEach(function (f, i) {
            var delay = i < 3 ? i * 0.15 : 0.45 + (i - 3) * 0.2;
            tone(ctx, f, delay, 0.3, 0.11);
          });
          break;
      }
    } catch (e) {
      /* audio unsupported — stay silent */
    }
  }

  /* ============================================
     SPARKLES
     ============================================ */

  function createSparkles(count) {
    if (reduceMotion) return;
    var rect = el.wizard.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;

    for (var i = 0; i < count; i++) {
      (function () {
        var sparkle = document.createElement("div");
        sparkle.className = "sparkle";
        var size = 5 + Math.random() * 9;
        sparkle.style.width = size + "px";
        sparkle.style.height = size + "px";
        sparkle.style.left = centerX + "px";
        sparkle.style.top = centerY + "px";
        document.body.appendChild(sparkle);

        var angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        var velocity = 3 + Math.random() * 5;
        var vx = Math.cos(angle) * velocity;
        var vy = Math.sin(angle) * velocity - 3;
        var life = 1;
        var rotation = 0;

        function step() {
          life -= 0.015;
          rotation += 5;
          vy += 0.2;
          sparkle.style.left = parseFloat(sparkle.style.left) + vx + "px";
          sparkle.style.top = parseFloat(sparkle.style.top) + vy + "px";
          sparkle.style.opacity = Math.max(life, 0);
          sparkle.style.transform =
            "scale(" + Math.max(life, 0) + ") rotate(" + rotation + "deg)";
          if (life > 0) {
            window.requestAnimationFrame(step);
          } else {
            sparkle.remove();
          }
        }
        window.requestAnimationFrame(step);
      })();
    }
  }

  /* ============================================
     SPEECH FLOW
     ============================================ */

  function showMessage(message) {
    typeText(el.speechText, message, 18);
    el.speechBubble.classList.add("active");
    el.speechHint.textContent = "Click again to stop";
  }

  function stopSpeaking() {
    state.isSpeaking = false;
    if (state.hideTimer) {
      window.clearTimeout(state.hideTimer);
      state.hideTimer = null;
    }
    el.speechBubble.classList.remove("active");
    stopVoice();
  }

  function getMessage() {
    var hour = new Date().getHours();
    var random = Math.random();

    if (state.speechCount === 0) {
      if (hour < 12) return pick(wizard.greetings.morning);
      if (hour < 17) return pick(wizard.greetings.afternoon);
      if (hour < 21) return pick(wizard.greetings.evening);
      return pick(wizard.greetings.night);
    }

    // Heavier weighting on Earth-protection methods, as requested
    if (random < 0.55) {
      setExpression("happy");
      var tip = ecoTips[state.tipIndex % ecoTips.length];
      state.tipIndex++;
      return tip;
    }
    if (random < 0.72) {
      setExpression("thinking");
      return pick(funFacts);
    }
    if (random < 0.87) {
      setExpression("love");
      return pick(motivationalQuotes);
    }
    setExpression("wink");
    return pick(wizard.farewells);
  }

  function speak() {
    state.isSpeaking = true;
    el.colorPanel.classList.remove("active");
    el.quizPanel.classList.remove("active");

    var message = getMessage();
    showMessage(message);
    speakWithVoice(message);
    playMagicalSound("speak");

    state.speechCount++;

    if (state.hideTimer) window.clearTimeout(state.hideTimer);
    state.hideTimer = window.setTimeout(function () {
      if (state.isSpeaking) stopSpeaking();
    }, estimateSpeechMs(message));
  }

  function showWelcomeMessage() {
    if (state.speechCount > 0 || state.isHidden) return;

    state.isSpeaking = true;
    var message = pick(welcomeMessages);
    showMessage(message);
    if (state.userInteracted) speakWithVoice(message);

    state.hideTimer = window.setTimeout(function () {
      if (state.isSpeaking) stopSpeaking();
    }, estimateSpeechMs(message));
  }

  /* ============================================
     EXPRESSIONS
     ============================================ */

  var EXPRESSIONS = [
    "happy", "excited", "thinking", "surprised",
    "sleepy", "love", "wink", "angry"
  ];

  function setExpression(expression) {
    EXPRESSIONS.forEach(function (name) {
      el.wizard.classList.remove(name);
    });
    el.wizard.classList.add(expression);
    state.currentExpression = expression;
  }

  function startExpressionCycle() {
    window.setInterval(function () {
      if (state.isSpeaking || state.quiz.active) return;
      var hour = new Date().getHours();
      if (hour >= 23 || hour < 6) {
        setExpression("sleepy");
      } else {
        setExpression(pick(["happy", "thinking", "happy", "wink"]));
      }
    }, 9000);
  }

  /* ============================================
     EYE TRACKING (fine pointers only)
     ============================================ */

  function startEyeTracking() {
    if (
      reduceMotion ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    document.addEventListener("mousemove", function (e) {
      if (state.isHidden) return;
      var rect = el.wizard.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      var distance = Math.min(3, Math.hypot(e.clientX - cx, e.clientY - cy) / 100);

      var pupils = el.wizard.querySelectorAll(".pupil");
      Array.prototype.forEach.call(pupils, function (pupil) {
        pupil.style.transform =
          "translate(" +
          Math.cos(angle) * distance +
          "px," +
          Math.sin(angle) * distance +
          "px)";
      });
    });
  }

  /* ============================================
     THEME PANEL
     ============================================ */

  function changeTheme(color) {
    state.currentTheme = color;
    document.body.setAttribute("data-wiz-theme", color);

    el.colorOptions.forEach(function (opt) {
      opt.classList.toggle("selected", opt.getAttribute("data-color") === color);
    });

    savePreferences();

    setExpression("excited");
    createSparkles(10);
    playMagicalSound("theme");
    showToast("Theme: " + (themeNames[color] || color));

    if (state.isSpeaking) {
      stopSpeaking();
      showMessage("✨ " + themeNames[color] + " — looking stylish!");
      state.isSpeaking = true;
      state.hideTimer = window.setTimeout(function () {
        if (state.isSpeaking) stopSpeaking();
      }, 3500);
    }
  }

  function toggleColorPanel(forceClose) {
    var isActive = el.colorPanel.classList.contains("active");
    var willOpen = !isActive && !forceClose;

    el.quizPanel.classList.remove("active");
    el.colorPanel.classList.toggle("active", willOpen);

    if (willOpen) {
      if (state.isSpeaking) stopSpeaking();
      setExpression("happy");
      playMagicalSound("open");
    }
  }

  /* ============================================
     QUIZ
     ============================================ */

  function toggleQuizPanel(forceClose) {
    var isActive = el.quizPanel.classList.contains("active");
    var willOpen = !isActive && !forceClose;

    el.colorPanel.classList.remove("active");
    el.quizPanel.classList.toggle("active", willOpen);

    if (willOpen) {
      if (state.isSpeaking) stopSpeaking();
      setExpression("excited");
      playMagicalSound("open");
      if (!state.quiz.active) showQuizScreen("start");
    } else {
      state.quiz.active = false;
    }
  }

  function showQuizScreen(screen) {
    el.quizStart.style.display = "none";
    el.quizGame.style.display = "none";
    el.quizResult.style.display = "none";

    if (screen === "start") el.quizStart.style.display = "block";
    if (screen === "game") el.quizGame.style.display = "block";
    if (screen === "result") el.quizResult.style.display = "block";
  }

  function startQuiz() {
    state.quiz = { active: true, currentQuestion: 0, score: 0 };
    showQuizScreen("game");
    loadQuestion();
    playMagicalSound("start");
  }

  function loadQuestion() {
    var question = quizQuestions[state.quiz.currentQuestion];

    el.quizProgressBar.style.width =
      (state.quiz.currentQuestion / quizQuestions.length) * 100 + "%";
    el.quizQuestion.textContent =
      "Q" + (state.quiz.currentQuestion + 1) + ": " + question.question;

    el.quizOptions.innerHTML = "";
    question.options.forEach(function (option, index) {
      var btn = document.createElement("div");
      btn.className = "quiz-option";
      btn.setAttribute("role", "button");
      btn.setAttribute("tabindex", "0");
      btn.textContent = option;

      function choose() {
        selectAnswer(index);
      }
      btn.addEventListener("click", choose);
      btn.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          choose();
        }
      });
      el.quizOptions.appendChild(btn);
    });

    el.quizFeedback.className = "quiz-feedback";
    el.quizFeedback.textContent = "";
  }

  function selectAnswer(selectedIndex) {
    var question = quizQuestions[state.quiz.currentQuestion];
    var isCorrect = selectedIndex === question.correct;

    Array.prototype.forEach.call(
      el.quizOptions.querySelectorAll(".quiz-option"),
      function (opt, index) {
        opt.classList.add("disabled");
        if (index === question.correct) opt.classList.add("correct");
        else if (index === selectedIndex && !isCorrect) opt.classList.add("wrong");
      }
    );

    el.quizFeedback.className =
      "quiz-feedback show " + (isCorrect ? "correct" : "wrong");
    el.quizFeedback.textContent = (isCorrect ? "✅ Correct! " : "❌ Not quite! ") + question.fact;

    if (isCorrect) {
      state.quiz.score++;
      setExpression("excited");
      playMagicalSound("correct");
      createSparkles(6);
    } else {
      setExpression("thinking");
      playMagicalSound("wrong");
    }

    window.setTimeout(function () {
      state.quiz.currentQuestion++;
      if (state.quiz.currentQuestion < quizQuestions.length) {
        loadQuestion();
      } else {
        showQuizResults();
      }
    }, 2500);
  }

  function showQuizResults() {
    state.quiz.active = false;

    var score = state.quiz.score;
    var total = quizQuestions.length;
    var percentage = (score / total) * 100;

    var badge, message;
    if (percentage === 100) {
      badge = "🏆";
      message = "Perfect score! You're a true Eco Master! The Earth is lucky to have you!";
      setExpression("love");
    } else if (percentage >= 80) {
      badge = "🥇";
      message = "Excellent! You're an Eco Champion! Keep spreading the green magic!";
      setExpression("excited");
    } else if (percentage >= 60) {
      badge = "🥈";
      message = "Great job! You're an Eco Warrior! A bit more learning and you'll be unstoppable!";
      setExpression("happy");
    } else if (percentage >= 40) {
      badge = "🥉";
      message = "Good effort! You're an Eco Apprentice! Keep learning about our planet!";
      setExpression("thinking");
    } else {
      badge = "📚";
      message = "Every master was once a beginner. Keep exploring eco topics!";
      setExpression("surprised");
    }

    el.quizBadge.textContent = badge;
    el.quizScore.textContent = score + " / " + total;
    el.quizMessage.textContent = message;
    el.quizProgressBar.style.width = "100%";

    showQuizScreen("result");
    playMagicalSound("complete");
    createSparkles(20);

    if (!state.isMuted) {
      speakWithVoice("Quiz complete! You scored " + score + " out of " + total + ". " + message);
    }
  }

  /* ============================================
     VISIBILITY / MUTE
     ============================================ */

  function toggleMute() {
    state.isMuted = !state.isMuted;
    el.muteBtn.textContent = state.isMuted ? "🔇" : "🔊";
    el.muteBtn.title = el.muteBtn.getAttribute("aria-label") = state.isMuted
      ? "Unmute voice"
      : "Mute voice";

    if (state.isMuted) {
      stopVoice();
      showToast("Muted 🔇");
    } else {
      showToast("Sound on 🔊");
    }
    savePreferences();
  }

  function toggleWizardVisibility(hide) {
    var shouldHide = typeof hide === "boolean" ? hide : !state.isHidden;
    state.isHidden = shouldHide;
    el.wizard.classList.toggle("wizard-hidden", shouldHide);
    el.restore.classList.toggle("show", shouldHide);

    if (shouldHide) {
      el.speechBubble.classList.remove("active");
      el.colorPanel.classList.remove("active");
      el.quizPanel.classList.remove("active");
      stopVoice();
      state.isSpeaking = false;
    }
    savePreferences();
  }

  /* ============================================
     PREFERENCES (localStorage)
     ============================================ */

  function savePreferences() {
    try {
      localStorage.setItem(
        "ecoWizardPrefs",
        JSON.stringify({
          theme: state.currentTheme,
          muted: state.isMuted,
          hidden: state.isHidden
        })
      );
    } catch (e) {
      /* storage unavailable — run session-only */
    }
  }

  function loadPreferences() {
    try {
      var saved = localStorage.getItem("ecoWizardPrefs");
      if (!saved) return;
      var prefs = JSON.parse(saved);

      if (prefs.theme && themeNames[prefs.theme]) {
        state.currentTheme = prefs.theme;
        document.body.setAttribute("data-wiz-theme", prefs.theme);
        el.colorOptions.forEach(function (opt) {
          opt.classList.toggle(
            "selected",
            opt.getAttribute("data-color") === prefs.theme
          );
        });
      }

      if (prefs.muted) {
        state.isMuted = true;
        el.muteBtn.textContent = "🔇";
        el.muteBtn.title = el.muteBtn.getAttribute("aria-label") = "Unmute voice";
      }
    } catch (e) {
      /* ignore malformed prefs */
    }
  }

  /* ============================================
     EVENTS
     ============================================ */

  function handleWizardClick(e) {
    if (e.target.closest(".control-btn")) return;

    state.userInteracted = true;
    if (state.isSpeaking) {
      stopSpeaking();
      return;
    }
    speak();
  }

  function handleDoubleClick(e) {
    e.preventDefault();
    stopSpeaking();

    setExpression("excited");
    showMessage(pick(secretMessages));
    state.isSpeaking = true;
    state.hideTimer = window.setTimeout(function () {
      if (state.isSpeaking) stopSpeaking();
    }, 4200);

    createSparkles(15);
    playMagicalSound("special");
    state.speechCount++;
  }

  function handleKeyDown(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (
      e.target.closest &&
      e.target.closest("input, textarea, select, [contenteditable]")
    ) {
      return;
    }

    switch (e.key.toLowerCase()) {
      case "w":
        if (state.isSpeaking) stopSpeaking();
        else if (!state.isHidden) speak();
        break;
      case "q":
        if (!state.isHidden) toggleQuizPanel();
        break;
      case "c":
        if (!state.isHidden) toggleColorPanel();
        break;
      case "m":
        toggleMute();
        break;
      case "h":
        toggleWizardVisibility(); // works both ways — fixes the dead-end
        break;
      case "escape":
        el.colorPanel.classList.remove("active");
        el.quizPanel.classList.remove("active");
        if (state.isSpeaking) stopSpeaking();
        break;
    }
  }

  function handleOutsideClick(e) {
    if (
      !e.target.closest(".eco-wizard") &&
      !e.target.closest(".color-panel") &&
      !e.target.closest(".quiz-panel")
    ) {
      el.colorPanel.classList.remove("active");
      el.quizPanel.classList.remove("active");
    }
  }

  function setupTouchGestures() {
    var startX = 0, startY = 0;

    el.wizard.addEventListener(
      "touchstart",
      function (e) {
        startX = e.changedTouches[0].screenX;
        startY = e.changedTouches[0].screenY;
      },
      { passive: true }
    );

    el.wizard.addEventListener(
      "touchend",
      function (e) {
        var diffX = e.changedTouches[0].screenX - startX;
        var diffY = e.changedTouches[0].screenY - startY;
        var threshold = 50;

        if (Math.abs(diffX) <= threshold && Math.abs(diffY) <= threshold) return;

        if (Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX > 0) {
            toggleColorPanel();
            showToast("Colors 🎨");
          } else {
            toggleQuizPanel();
            showToast("Quiz 🎮");
          }
        } else if (diffY > 0) {
          toggleWizardVisibility(true);
          showToast("Wizard hidden 👋");
        }
      },
      { passive: true }
    );
  }

  function bindEvents() {
    el.wizard.addEventListener("click", handleWizardClick);
    el.wizard.addEventListener("dblclick", handleDoubleClick);
    el.wizard.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleWizardClick(e);
      }
    });

    el.gameModeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleQuizPanel();
    });
    el.colorBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleColorPanel();
    });
    el.muteBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleMute();
    });

    el.closeColorPanel.addEventListener("click", function () {
      toggleColorPanel(true);
    });
    el.closeQuiz.addEventListener("click", function () {
      toggleQuizPanel(true);
    });

    el.colorOptions.forEach(function (option) {
      option.addEventListener("click", function () {
        changeTheme(option.getAttribute("data-color"));
      });
    });

    el.startQuizBtn.addEventListener("click", startQuiz);
    el.retryQuizBtn.addEventListener("click", startQuiz);

    el.restore.addEventListener("click", function () {
      toggleWizardVisibility(false);
      setExpression("happy");
      showToast("The wizard returns ✨");
    });

    setupTouchGestures();

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleOutsideClick);

    // Pause speech when the tab is hidden (politeness)
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopVoice();
    });

    // Track first interaction so autoplay-policy-safe TTS can start
    ["pointerdown", "keydown", "touchstart"].forEach(function (evt) {
      document.addEventListener(
        evt,
        function () {
          state.userInteracted = true;
        },
        { once: true, passive: true }
      );
    });
  }

  /* ============================================
     INIT
     ============================================ */

  function init() {
    el.wizardName.textContent = wizard.name;
    document.body.setAttribute("data-wiz-theme", state.currentTheme);

    loadPreferences();
    bindEvents();

    // Prime TTS voice list
    if (ttsSupported) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Mobile gesture hint
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      window.setTimeout(function () {
        el.gestureHint.classList.add("show");
        window.setTimeout(function () {
          el.gestureHint.classList.remove("show");
        }, 5000);
      }, 2200);
    }

    // Welcome message
    window.setTimeout(showWelcomeMessage, 2800);

    startEyeTracking();
    startExpressionCycle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
