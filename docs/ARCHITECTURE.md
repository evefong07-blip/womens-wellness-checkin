# Architecture

## Stack
- **Frontend:** Next.js (App Router) — hosted on Vercel
- **Database:** Supabase (Postgres + RLS)
- **Auth (Sprint 3):** Supabase Auth — email login for Evelyn only
- **AI (Sprint 4):** OpenAI via server-side API route only

## Now vs Later
**Now:** check-in form → summary screen → WhatsApp button + admin list view 
**Later:** AI summary generation, auth-gated admin, WhatsApp nudge drafts

## Key User Action — Step by Step
1. Woman opens check-in URL on her phone
2. Completes 5 form steps (client-side state, no DB writes until submit)
3. On final submit: Next.js API route writes one row to `checkin_submissions`
4. Success → client renders summary screen using the returned row data
5. Woman taps WhatsApp button → opens `wa.me` deep-link with pre-filled message
6. Evelyn receives the WhatsApp message and sees the submission in the admin view

## Layer Plan
1. **Data first** — table + RLS policies + seed rows (Sprint 1)
2. **Form + summary** — core engine working end-to-end (Sprint 1)
3. **Admin read view** — Evelyn can see submissions (Sprint 2)
4. **Auth** — lock admin behind login (Sprint 3)
5. **Smart summary** — AI on top, with rule-based fallback (Sprint 4)

## Core Without AI
The rule-based summary template (concern list + fixed gentle copy blocks) runs entirely without an AI call. AI is an enhancement added in Sprint 4 — removing it leaves the product fully functional.
