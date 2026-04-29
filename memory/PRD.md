# Lakshmi Venkateswara Fast Foods · The Culinary Sanctuary

## Original Problem Statement
A luxury 5-star hotel-styled, single-page immersive web experience for "Lakshmi Venkateswara Fast Foods" (a South Indian fast-food house in Pulivendula, Andhra Pradesh). The site must feel like walking into a Taj/Aman/Oberoi lobby — minimalist, airy, brushed gold + charcoal + cream — with a hero "floating thali" centerpiece, a gallery menu, a tactile concierge map (with a glowing beacon at RTC Bus Stand), and a luxury reservation flow.

## Architecture
- **Frontend**: React 19, Tailwind, shadcn/ui, framer-motion, lucide-react. Cormorant Garamond + Manrope (+ Italiana display).
- **Backend**: FastAPI + Motor (Mongo) with `/api` prefix.
- **DB**: MongoDB collections — `reservations`, `status_checks`.

## What's Implemented (2026-02 — initial release)
- Luxury Hero with floating "Golden Plate" thali, breathing animation, scroll-triggered glide-off + soft-focus blur.
- Philosophy pillars (I/II/III) — handcrafted three-column gold-divided composition.
- Gallery menu (bento layout, brushed-gold frames, hover 3D tilt + bronze wash).
- Signature pull-quote section with parallax marble texture.
- Concierge Map (topographical image overlay + gold streets + pulsing safety-orange beacon at RTC Bus Stand).
- Luxury Reservation form (POST `/api/reservations`).
- Footer with House / Visit / Press columns.
- Backend endpoints: `GET /api/`, `GET /api/menu`, `POST/GET /api/reservations`, `POST/GET /api/status`.

## Personas
- A discerning local diner who values calm and craft over volume.
- A traveller passing through Pulivendula seeking a memorable South Indian meal.
- An out-of-town guest making a reservation ahead of arrival.

## Backlog (P0/P1)
- P1: Real Three.js 3D thali (currently photo-realistic AI render with motion).
- P1: Reservation admin dashboard.
- P1: Multilingual (Telugu) translations.
- P2: Online ordering / Razorpay integration.
- P2: Press / accolades carousel.

## Next Tasks
- Validate reservation flow end-to-end via testing agent.
- Add image preloading on the menu cards for smoother first paint.
