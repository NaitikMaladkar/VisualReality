# Visual Reality — Tech for Tomorrow

**Science · Innovation · Sustainability** — an interactive green-tech experience built entirely with plain **HTML, CSS and JavaScript** (zero frameworks, zero external APIs, zero build steps for the site itself).

> Tech for tomorrow — without costing the Earth.

## What's inside

| Experience | Route | What it does |
|---|---|---|
| 🏙 Future City Simulator | `/city` | Fast-forward a living city from 2026 → 2060; fund upgrades, watch the smog gauge |
| 📜 Innovation Timeline | `/timeline` | 70 years of sustainable-tech milestones, 1954 → fusion's net-energy gain |
| 🧮 Carbon Footprint Calculator | `/carbon` | 12 honest questions → live emissions dashboard + ranked game plan |
| 🖼 Green Tech Museum | `/museum` | Walkable 3D gallery in pure CSS — solar, wind, hydro & AI halls |
| 🌍 Impact Simulator | `/impact` | Country-level climate what-ifs with real Ember/IEA/OWID data |
| 🎯 Eco Challenge | `/challenge` | Daily eco-habit quests, streaks, badges & confetti |
| ⚖️ Tech vs Nature | `/balance` | A 10-round drag-and-drop balancing game with live feedback meters |
| ✦ TerraSense AI | every page | On-device science copilot — answers site + green-tech questions, deflects code questions, credits the maker |

Plus: a cinematic brand intro, Ecoverius the eco-wizard (text-to-speech, Web Speech API), a scrolling science ticker, and a site-wide motion layer (ripples, 3D tilt, draw-in icons) — all `prefers-reduced-motion` aware.

## Running locally

The site is static — open `public/index.html` directly, or serve the repo with any web server. A Next.js config is included for pretty URLs:

```bash
bun install        # or npm install
bun run dev        # serves http://localhost:3000
```

Routes like `/city`, `/impact`… are rewrites to the static HTML in `public/`.

## Privacy by design

- No accounts, no tracking, no external APIs
- TerraSense AI computes every answer locally in your browser
- Chat history is session-only and clears on refresh
- Game/quest progress lives in `localStorage` on your device

## Credits

Every page, game, simulation and animation was designed and built by **Naitik Maladkar**.
