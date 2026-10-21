# CosmicSpirit0 — Neural Code Platform

Free, browser-based tools for brainwave entrainment, 3D spatial audio and attention training.
No install, no account, no paywall.

**Live:** https://neural-code-platform.vercel.app/

![Game Lab](docs/screenshot-game-lab.png)

## Labs

| Lab | What it does |
|---|---|
| **Rate Lab** | Binaural beats, isochronic tones and monaural tones from 1 Hz to 40 Hz, with a live oscilloscope |
| **Place Lab** | 3D spatial audio using HRTF processing, an interactive brain model and cochlear mapping |
| **Game Lab** | 60-second attention training — hit the active neural cluster, build a streak, beat your best |
| **Frequency Lab** | Multi-method entrainment, custom presets, layered background noise, session timer |
| **Feedback** | Star reviews (moderated) and a public suggestions board |
| **Connect** | Community stories, Instagram, Telegram and YouTube |
| **Sponsor** | UPI/PhonePe QR and PayPal |

## Tech

- React 18 + TypeScript + Vite
- Tailwind CSS + Framer Motion
- three.js / @react-three/fiber (Place Lab, lazy-loaded)
- d3 (oscilloscope)
- Supabase (Postgres + Row Level Security) for the newsletter, stories, reviews and suggestions
- Web Audio API — all audio is generated in the browser, nothing is uploaded

## Backend

Supabase project `cosmicspirit0` (`jdwiggwqsyeopcgrovjm`), tables:

| Table | Public can | Admin can |
|---|---|---|
| `subscribers` | insert (newsletter) | read / delete / export |
| `stories` | insert + read `published = true` | publish, unpublish, delete |
| `reviews` | insert + read `approved = true` | approve, hide, delete |
| `suggestions` | insert + read all | change status, delete |
| `site_settings` | read the single row | update logo + social links |

Row Level Security allows anonymous inserts only; reads are limited to approved/published rows.
Admin policies match the owner's email in the JWT, so a normal signup can never read submissions.
`site_stats()` is a read-only SQL function used by the Transparency page to publish real counts.

Admin console: **/admin.html** (email + password, same as the Supabase Auth user). The
**Site settings** tab edits the logo and the Instagram, Telegram, YouTube, TikTok and support URLs
without touching code.

## Deploy

- **Primary:** https://neural-code-platform.vercel.app/ — every push to `main` runs
  `.github/workflows/vercel.yml` (prebuilt Vercel deploy).
- **Mirror:** https://narikparamala.github.io/neural-code-platform/ — `.github/workflows/deploy.yml`
  publishes the same build to GitHub Pages.

Vercel builds from the repository root, so the base path is `/`; GitHub Pages uses
`/neural-code-platform/`. `vite.config.ts` detects `VERCEL` automatically. Set `GITHUB_PAGES=false`
to force a root-domain build locally.

## Safety

This is not a medical device. Use headphones at a comfortable volume. Do not use while driving.
If you have epilepsy, a pacemaker, or are pregnant, consult a doctor first. Stop if you feel
discomfort.

## License

MIT
