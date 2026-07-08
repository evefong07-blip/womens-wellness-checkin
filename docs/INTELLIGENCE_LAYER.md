# Intelligence Layer

## Messy Input → Structured Data
Women type free text into `already_tried`. The form also collects structured multi-select concerns. Together these are the raw material.

## Auto-Structure Schema (applied at summary generation)
```json
{
  "primary_concern": "Fatigue",
  "secondary_concerns": ["Sleep issues", "Bloating"],
  "duration_band": "long" ,
  "effort_level": "moderate",
  "readiness_score": 0.82,
  "summary_text": "Sarah, your body is signalling...",
  "summary_source": "openai_gpt4o",
  "summary_confidence": 0.91,
  "summary_review_status": "unreviewed"
}
```

## Events to Track
- Form step completed (1–5)
- Form abandoned (which step)
- Summary viewed
- WhatsApp button tapped
- Submission created

## Scoring Rules (v1 — rule-based)
| Signal | Score boost |
|---|---|
| wants_session = true | +0.4 |
| duration > 6 months | +0.3 |
| 3+ concerns selected | +0.2 |
| already_tried has content | +0.1 |

Readiness score 0–1; threshold ≥ 0.7 = high priority for Evelyn to follow up.

## v1 vs Later
- **v1:** rule-based summary copy blocks selected by primary concern; readiness score computed server-side
- **Later:** LLM generates warm personalised paragraph; confidence stored; Evelyn reviews before anything is sent
