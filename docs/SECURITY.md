# Security

## Secret Handling
- `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` — server-side only, in Vercel environment variables, never imported into any client component
- Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are exposed to the browser (anon key is safe with correct RLS)
- Audit: run `grep -r 'SERVICE_ROLE\|OPENAI_API_KEY' ./src` before every deploy; must return zero results

## Permission Model
| Actor | Permitted actions |
|---|---|
| Anonymous visitor | INSERT a new submission; read own summary (by returned row only) |
| Authenticated Evelyn | SELECT all submissions; UPDATE review_status; no DELETE in v1 |
| System / agent | Low-risk auto actions only; always writes audit record |

## Approved Tools Rule
Agents may only call named functions (`generate_summary`, `compute_readiness_score`). No `run_any`, `eval`, or raw SQL execution from agent context.

## Audit Principle
Every write to `checkin_submissions` and every agent action logs actor + before/after state. Logs are append-only. Do not expose audit logs in any public-facing UI.

## Sprint 3 Checklist (before real data)
- [ ] Replace open v1 RLS policies with owner-scoped policies
- [ ] Gate /admin behind `supabase.auth.getSession()`
- [ ] Confirm no secrets in client bundle (Vercel build log check)
- [ ] If in doubt about any security decision: stop and consult a human
