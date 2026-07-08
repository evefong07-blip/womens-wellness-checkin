create table if not exists checkin_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  name text not null,
  age_range text not null,
  whatsapp text not null,
  concerns text[] not null,
  duration text not null,
  already_tried text,
  wants_session boolean not null default false,
  summary_text text,
  summary_source text,
  summary_confidence numeric,
  summary_review_status text default 'unreviewed'
);

alter table checkin_submissions enable row level security;

drop policy if exists "checkin_submissions_v1_read" on checkin_submissions;
create policy "checkin_submissions_v1_read" on checkin_submissions for select using (true);

drop policy if exists "checkin_submissions_v1_write" on checkin_submissions;
create policy "checkin_submissions_v1_write" on checkin_submissions for all using (true) with check (true);

insert into checkin_submissions (name, age_range, whatsapp, concerns, duration, already_tried, wants_session, summary_text, summary_source, summary_review_status) values
('Sarah Tan', '45–49', '+6591234567', ARRAY['Fatigue', 'Sleep issues', 'Bloating'], 'More than 6 months', 'Tried different diets, taking melatonin', true, 'Sarah, your body is clearly telling you it needs attention. Persistent fatigue, disrupted sleep and bloating together often signal that your hormones and gut need support — not more willpower.', 'rule_based', 'reviewed'),
('Linda Ng', '50–54', '+6598765432', ARRAY['Feeling cold all the time', 'Weight gain', 'Monthly discomfort'], '3–6 months', 'Warm baths, herbal teas', true, 'Linda, feeling constantly cold alongside monthly discomfort and weight changes is a pattern worth exploring together. These are signals, not random events.', 'rule_based', 'reviewed'),
('Michelle Lim', '40–44', '+6581122334', ARRAY['Stress', 'Bloating', 'Low mood'], '1–3 months', 'Yoga, reducing caffeine', false, 'Michelle, stress and bloating together can quietly drain your energy and mood. Small targeted shifts can make a real difference.', 'rule_based', 'unreviewed'),
('Grace Wong', '55–59', '+6592233445', ARRAY['Sleep issues', 'Fatigue', 'Feeling cold all the time'], 'More than 6 months', 'Supplements, cutting sugar', true, 'Grace, your combination of sleep disruption, fatigue and feeling cold suggests your body may be running on empty. You deserve to feel well again.', 'rule_based', 'reviewed');