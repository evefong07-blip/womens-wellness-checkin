# Product Requirements — Women's Wellness Check-In

## Problem
Women in Singapore aged 40+ experience fatigue, bloating, poor sleep, stress, and body changes but don't know where to start. They need a quick, safe way to articulate their concerns before committing to a 1-to-1 conversation with a wellness practitioner.

## Target User
Women aged 40–65, Singapore-based, experiencing one or more of: tiredness, bloating, feeling cold, stress, sleep problems, monthly discomfort, unexplained body changes. Not tech-averse but not technical.

## Core Objects
- **Check-in Submission** — one per woman; captures her concerns and produces a summary.

## MVP Must-Haves (v1)
- [ ] Multi-step check-in form: name, age range, WhatsApp number, main concerns (multi-select), duration, what they've tried, whether they want a free session
- [ ] On submit: row saved to database
- [ ] Personalised summary screen with gentle copy derived from their answers
- [ ] WhatsApp deep-link button: `wa.me/[Evelyn's number]?text=...` pre-filled with name + concern
- [ ] Form works on mobile (primary device)
- [ ] No login required for the woman filling it in

## Non-Goals (v1)
- Admin dashboard (Sprint 2)
- Login / auth (Sprint 3)
- AI-generated summary (Sprint 4)
- Payment, scheduling, or CRM integration
- Multi-practitioner or multi-tenant features

## Definition of Done
**Pass:** A tester on a mobile browser opens the check-in URL, completes all five steps, sees a personalised summary screen that names her top concern, taps the WhatsApp button, and lands in a WhatsApp chat with Evelyn's number pre-filled. The submission row exists in the database with all fields populated. **Fail:** Any step crashes, the WhatsApp button is dead, or the row is missing/incomplete.
