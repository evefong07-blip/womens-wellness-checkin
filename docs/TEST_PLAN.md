# Test Plan

## Success Scenario (manual, mobile browser at 375px)
1. Open check-in URL — page loads with Step 1 visible, no login prompt
2. Enter name 'Test User', select age range '45–49' → tap Next
3. Select 3 concerns: Fatigue, Bloating, Sleep issues → tap Next
4. Select duration '3–6 months' → tap Next
5. Enter WhatsApp '+6591112222', type 'Tried vitamins and yoga' → tap Next
6. Select 'Yes, I'd love a free session' → tap Submit
7. **Check:** loading spinner appears, then summary screen renders
8. **Check:** summary screen shows 'Test User', lists 3 concerns, displays warm copy paragraph
9. **Check:** 'Message Evelyn on WhatsApp' button is tappable
10. **Check:** button opens `wa.me/[correct number]` with pre-filled text containing name + primary concern
11. **Check (Supabase):** row exists with all fields; `wants_session = true`; `summary_text` not null

## Empty / Validation Cases
- Submit Step 1 with blank name → inline error 'Please enter your name'; no navigation
- Submit Step 2 with no concerns selected → error 'Please select at least one concern'
- Submit Step 4 with invalid WhatsApp (< 8 digits) → error 'Please enter a valid WhatsApp number'

## Error Cases
- Supabase unreachable (disable in Supabase dashboard) → on submit: 'Something went wrong. Please try again.' No crash. Row NOT inserted (no partial/ghost rows).
- AI call fails (Sprint 4) → summary screen still renders with rule-based copy; no error shown to user; `summary_source = 'rule_based'` in DB

## Admin View (Sprint 2)
- Open `/admin` → 4 seed rows visible in table
- Click 'Sarah Tan' row → detail view shows all her fields including summary_text
- Toggle filter 'Wants session: Yes' → only rows with `wants_session = true` shown
- Empty state: if table is cleared → 'No submissions yet' message shown, no JS error

## Lock-Down (Sprint 3)
- Unauthenticated GET `/admin` → redirect to `/login`; no data exposed in network response
- Login with Evelyn's credentials → redirected to `/admin`; all rows visible
- Anon user posts to `checkin_submissions` → INSERT succeeds
- Anon user attempts SELECT all rows via Supabase JS client → returns only their own insert (empty if no session)
