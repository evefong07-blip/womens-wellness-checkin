# Data Model

## checkin_submissions

| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid | nullable; for future owner-scoping |
| created_at | timestamptz | default now() |
| name | text | required |
| age_range | text | e.g. '45–49'; required |
| whatsapp | text | Singapore mobile; required |
| concerns | text[] | multi-select values e.g. ['Fatigue','Bloating'] |
| duration | text | e.g. '3–6 months'; required |
| already_tried | text | free text; nullable |
| wants_session | boolean | default false |
| summary_text | text | AI or rule-based; nullable |
| summary_source | text | 'rule_based' or 'openai_gpt4o' |
| summary_confidence | numeric | 0–1; null if rule-based |
| summary_review_status | text | 'unreviewed' / 'reviewed' / 'edited'; default 'unreviewed' |

## Relationships
Single table for v1. No foreign keys until auth is added in Sprint 3, at which point `user_id` references `auth.users`.

## RLS
- **v1 (Sprints 1–2):** open read + write policies so demo works without login.
- **Sprint 3:** anonymous users → INSERT only; authenticated Evelyn → SELECT all; no public reads of other women's data.

## Constraints enforced at DB level
- `name`, `age_range`, `whatsapp`, `concerns`, `duration`, `wants_session` — NOT NULL
- `summary_review_status` defaults to `'unreviewed'`
