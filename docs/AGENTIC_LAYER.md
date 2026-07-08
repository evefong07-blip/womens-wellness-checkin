# Agentic Layer

## Risk Classification

### Low — auto-execute (no approval needed)
- Generate rule-based summary text from concern + duration fields
- Compute readiness score from form answers
- Tag primary concern from concerns array

### Medium — show draft, Evelyn approves
- Draft a personalised WhatsApp follow-up message for a specific submission
- Suggest a reply to a woman who messaged Evelyn

### High — always requires Evelyn's explicit approval
- Send any WhatsApp message (even pre-drafted)
- Update a submission's review status to 'reviewed'

### Critical — human only, no agent involvement
- Delete a submission
- Export all WhatsApp numbers
- Any action touching personal health data in bulk

## Named Tools (v1 — Sprint 4)
- `generate_summary(submission_id)` — calls OpenAI, writes summary_text + metadata to row
- `compute_readiness_score(submission_id)` — pure rule-based, no external call

## Audit Log Fields (every meaningful action)
- `action` text
- `submission_id` uuid
- `actor` text ('system' / 'evelyn')
- `before_state` jsonb
- `after_state` jsonb
- `created_at` timestamptz

## v1 vs Later
- **v1:** only low-risk auto actions (score + rule-based summary)
- **Later:** medium-risk draft WhatsApp messages with approval UI
