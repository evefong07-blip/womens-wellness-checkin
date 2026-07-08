# Tasks & Sprints

## Sprint 1 — Database + Check-in Form + Summary Screen
**Goal:** The core engine works end-to-end. A woman completes the form, the row is saved, she sees her personalised summary, and can tap to WhatsApp Evelyn.

- [ ] Run migration SQL; confirm 4 seed rows appear in Supabase table viewer
- [ ] Build Step 1: name + age range (dropdown: 40–44, 45–49, 50–54, 55–59, 60+)
- [ ] Build Step 2: main concerns (multi-select checkboxes: Fatigue, Bloating, Feeling cold, Stress, Sleep issues, Monthly discomfort, Body has changed, Other)
- [ ] Build Step 3: how long (radio: Less than 1 month, 1–3 months, 3–6 months, More than 6 months)
- [ ] Build Step 4: WhatsApp number + what have you already tried (text)
- [ ] Build Step 5: 'Would you like a free Body Clarity Session?' (Yes / Not yet)
- [ ] On submit: POST to `/api/checkin` → write row to Supabase → return row id + summary fields
- [ ] Summary screen: renders name, concern list, 2–3 sentences of warm copy matched to primary concern, readiness score (internal, not shown to user)
- [ ] WhatsApp button: `https://wa.me/[EVELYN_NUMBER]?text=Hi+Evelyn,+I+just+completed+the+wellness+check-in.+My+name+is+{name}+and+my+main+concern+is+{primary_concern}.`
- [ ] All five screen states handled: loading spinner, empty (no concerns selected → validation), error (API fail → friendly message), partial (step 1–4 in progress), ready (summary)
- [ ] Mobile-first layout; test on 375px viewport
- [ ] No secrets in client bundle

**Definition of Done:** Tester completes all 5 steps on mobile → row appears in Supabase with all fields populated → summary screen shows name + primary concern → WhatsApp button opens correct chat. Zero dead buttons.

---

## Sprint 2 — Admin View for Evelyn *(v1 functional milestone)*
**Goal:** Evelyn can open `/admin` and see all submissions without logging in (URL kept private).

- [ ] `/admin` page: table of submissions (name, age range, top concern, date, wants session Y/N)
- [ ] Click row → full detail view (all fields + summary text)
- [ ] Filter: 'Show only: wants session = Yes'
- [ ] Empty state: 'No submissions yet — share your check-in link to get started'
- [ ] Loading skeleton while fetching
- [ ] Seed rows visible on first load

**Definition of Done:** Evelyn opens `/admin` → sees at least the 4 seed submissions → clicks a row → sees all fields including summary text → filter works correctly.

---

## Sprint 3 — Lock It Down (Auth + RLS)
**Goal:** Admin is protected; anonymous women can only submit.

- [ ] Enable Supabase Auth; create account for Evelyn
- [ ] Replace open RLS policies: anon → INSERT only; authenticated → SELECT all
- [ ] `/admin` redirects to `/login` if no session
- [ ] Login page: email + password; no self-signup (Evelyn's account created manually)
- [ ] Check-in form remains fully public (no login)
- [ ] Confirm zero secrets exposed in client bundle
- [ ] Test: unauthenticated GET to `/admin` redirects; authenticated session shows all rows

**Definition of Done:** Unauthenticated browser at `/admin` sees login page, not data. After login, all submissions visible. Anonymous user can still complete check-in.

---

## Sprint 4 — AI Summary Layer
**Goal:** Submissions get a warm AI-written personalised summary; rule-based fallback always works.

- [ ] Server-side `/api/generate-summary` route calls OpenAI with concern + duration + tried
- [ ] Writes `summary_text`, `summary_source`, `summary_confidence`, `summary_review_status` to row
- [ ] If OpenAI call fails → fall back to rule-based template (no user-visible error)
- [ ] Admin detail view shows `summary_review_status`; Evelyn can click 'Mark reviewed'
- [ ] `compute_readiness_score` server function; score visible in admin detail view
- [ ] Audit log table: log every `generate_summary` call with before/after state

**Definition of Done:** New submission triggers AI summary; summary_text appears in admin detail. Kill the OpenAI key → rule-based summary still renders. Evelyn marks a summary reviewed → status updates in DB.

---

## Gantt (sprint → feature)
```
Sprint 1 │ DB schema · Check-in form · Summary screen · WhatsApp button
Sprint 2 │ Admin list view · Detail view · Filter                         ← v1 functional
Sprint 3 │ Auth login · RLS lockdown · Route protection
Sprint 4 │ AI summary · Readiness score · Audit log · Review status
```
