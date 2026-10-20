# CosmicSpirit0 — Neural Code Platform

Free, browser-based tools for brainwave entrainment, 3D spatial audio and attention training.
No install, no account, no paywall.

**Live:** https://narikparamala.github.io/neural-code-platform/

![Game Lab](docs/screenshot-game-lab.png)

## Labs

| Lab | What it does |
|---|---|
| **Rate Lab** | Binaural beats, isochronic tones and monaural tones from 1 Hz to 40 Hz, with a live oscilloscope |
| **Place Lab** | 3D spatial audio using HRTF processing, an interactive brain model and cochlear mapping |
| **Game Lab** | 60-second attention training — hit the active neural cluster, build a streak, beat your best |
| **Frequency Lab** | Multi-method entrainment, custom presets, layered background noise, session timer |
| **Connect** | Instagram, Telegram and YouTube |
| **Sponsor** | UPI/PhonePe QR and PayPal |

## Tech

- React 18 + TypeScript + Vite
- Tailwind CSS + Framer Motion
- three.js / @react-three/fiber (Place Lab, lazy-loaded)
- d3 (oscilloscope)
- Web Audio API — all audio is generated in the browser, nothing is uploaded

## Local development

```bash
npm install
npm run dev      # http://localhost:5173/neural-code-platform/
npm run build    # production build in dist/
```

The production base path is `/neural-code-platform/` (GitHub Pages). Set `GITHUB_PAGES=false`
to build for a root-domain host.

## Deploy

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes to
GitHub Pages.

## Safety

This is not a medical device. Use headphones at a comfortable volume. Do not use while driving.
If you have epilepsy, a pacemaker, or are pregnant, consult a doctor first. Stop if you feel
discomfort.

## License

MIT
