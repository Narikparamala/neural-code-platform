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
| **Connect** | Community stories, Instagram, Telegram, YouTube and TikTok |
| **About** | Vision, mission, goals, principles and roadmap |
| **Research & evidence** | Monroe / Hemi-Sync, Silva Method, the 1983 Army “Gateway Process” document, with sources |
| **Transparency** | Live counts, safety, privacy, moderation and funding |
| **Sponsor** | Support tiers, sponsor packages, lead form and a printable one-page deck |

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
| `subscribers` | insert (legacy fallback) | read / delete / export |
| `newsletter_sends` | nothing | read the send log |
| `stories` | insert + read `published = true` | publish, unpublish, delete |
| `reviews` | insert + read `approved = true` | approve, hide, delete |
| `suggestions` | insert + read all | change status, delete |
| `site_settings` | read the single row | update logo + social links |
| `sponsor_leads` | insert (sponsor form) | read / status / delete / CSV export |

Row Level Security allows anonymous inserts only; reads are limited to approved/published rows.
Admin policies match the owner's email in the JWT, so a normal signup can never read submissions.
`site_stats()` is a read-only SQL function used by the Transparency page to publish real counts.

Admin console: **/admin.html** (email + password, same as the Supabase Auth user). The
**Site settings** tab edits the logo and the Instagram, Telegram, YouTube, TikTok and support URLs
without touching code. The **Sponsor leads** tab holds private enquiries with a status
(new / contacted / won / closed) and CSV export.

Sponsor enquiries are never published or added to the newsletter. Support buttons use preset
`paypal.me` amounts and are labelled one-time; recurring invoices are arranged manually until a
payment provider is connected.

## Newsletter (double opt-in)

The newsletter is driven by three Vercel Functions in `api/` and two server keys:

1. `POST /api/subscribe` — validates the address, stores it as `pending`, and emails a
   confirmation link. A repeat signup is throttled to one email a minute.
2. `POST /api/confirm` — the visitor clicks **Confirm subscription** on the site; only then does
   the row become `confirmed`. A bare GET never confirms, so inbox link scanners cannot opt
   people in by accident.
3. `POST /api/newsletter` — admin-only (verified Supabase JWT + owner email). Sends plain text as
   branded HTML, adds a per-recipient unsubscribe link, logs the result in `newsletter_sends`, and
   refuses to send above the daily provider cap.

Email delivery supports two providers, selected by env vars:

- **Brevo** — set `BREVO_API_KEY` plus `BREVO_SENDER_EMAIL`. Best deliverability; the free plan is
  300 emails/day. Brevo blocks API-key creation until the account phone is verified.
- **Google Apps Script relay** — set `EMAIL_WEBHOOK_URL` and `EMAIL_WEBHOOK_SECRET`. Free, sends as
  the project Gmail account, about 100 emails/day. The relay code lives in the Apps Script project
  and rejects any request without the shared secret. See `.env.example` for the full list.

The admin **Newsletter** tab shows confirmed / pending / unsubscribed counts, the active provider,
the per-send cap, a test send, and the recent send log. Only confirmed addresses are ever mailed.
Every email includes a one-click unsubscribe link and the postal address in `POSTAL_ADDRESS`.

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
