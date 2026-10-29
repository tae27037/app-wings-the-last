# Maison Wigs

Mobile-first web app (React + Vite + CSS Modules) for wig lovers. **No e-shop** — the app is built around:

| # | Feature | Screen |
|---|---------|--------|
| 1 | Virtual try-on through the phone camera, instant hair-colour change, photo + share to friends | `src/screens/TryOn.jsx` |
| 2 | AI stylist: 4-question quiz → 3–5 matching wigs | `src/screens/Stylist.jsx` |
| 3 | Care tracker: wash progress, push reminders, step-by-step guides | `src/screens/Care.jsx` |
| 4 | Community feed with before/after slider, +50 points per photo | `src/screens/Community.jsx` |
| 5 | Stylist consultations: book a 10-minute video call or chat with photos | `src/screens/Consult.jsx` |
| 6 | Loyalty club: points, levels, rewards, daily check-in, early access | `src/screens/Club.jsx` |

Two languages (Czech / English) and two themes (light / dark) are switched from the header; both choices are remembered.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

The camera needs HTTPS or `localhost`. To test on a phone, deploy to Vercel (HTTPS by default).

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project → import the repo**.
3. Vercel detects **Vite** automatically (build `npm run build`, output `dist`). Click **Deploy**.

No server config is needed: routing uses the URL hash (`#/care`), so every link works on refresh.

On a phone, open the deployed URL and choose **Add to Home Screen** — `public/manifest.webmanifest` makes it open like an app.

## Project structure

```
src/
  App.jsx / App.module.css       layout, routing, toast
  components/                    Header, TabBar, Button, Sheet, Wig (SVG art), Icon, ScreenHead
  screens/                       one .jsx + one .module.css per screen
  i18n/                          index.jsx (provider, t()), cs.js, en.js
  theme/ThemeContext.jsx         light / dark
  state/AppState.jsx             points, wigs, bookings, likes … saved in localStorage
  data/wigs.js                   styles catalogue, quiz scoring, rewards, levels
  styles/global.css              theme colour variables (--accent, --surface, …)
```

### Add a language
Copy `src/i18n/en.js` to e.g. `de.js`, translate it, then register it in `src/i18n/index.jsx` (`dictionaries` + `LANGUAGES`).

### Change colours
Edit the two blocks `:root[data-theme='light']` / `[data-theme='dark']` in `src/styles/global.css`.

## What is a demo and what needs a real service

The UI and logic work out of the box, but a few things are placeholders you will replace when the product grows:

- **Try-on** overlays an illustrated wig that the user places over their face (drag + size slider). Automatic face tracking needs an AR SDK (e.g. MediaPipe Face Landmarker, Banuba, DeepAR) and real wig images/3D models.
- **Wig art** is SVG drawn in `Wig.jsx`. Replace it with your own product photos (transparent PNG/WebP) in `data/wigs.js`.
- **AI stylist** scores answers locally (`scoreStyle`). Photo-based face-shape scanning would need a vision API.
- **Push reminders** use the browser Notification API (works while the app is open). Real background push needs a service worker + a push service (Firebase Cloud Messaging, OneSignal) and a backend.
- **Community, bookings, chat, points** are stored in the browser (`localStorage`). For shared data across users add a backend (Supabase / Firebase) and login.
- **Video calls** — connect a provider (Daily, Twilio, Whereby) in `Consult.jsx` at the “Join call” button.
- **Guides** are text steps; add a `video` URL per guide in `i18n/*.js` when you have the clips.
- Stylist names and community posts are sample content.
