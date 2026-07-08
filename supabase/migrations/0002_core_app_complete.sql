create extension if not exists pgcrypto;

alter table checkin_submissions add column if not exists readiness_score numeric;
alter table checkin_submissions add column if not exists user_id uuid references auth.users(id);
alter table checkin_submissions alter column summary_review_status set default 'unreviewed';
update checkin_submissions set summary_review_status = 'unreviewed' where summary_review_status is null;
alter table checkin_submissions alter column summary_review_status set not null;

alter table checkin_submissions enable row level security;

drop policy if exists "checkin_submissions_v1_read" on checkin_submissions;
drop policy if exists "checkin_submissions_v1_write" on checkin_submissions;
drop policy if exists "anon_can_insert_checkins" on checkin_submissions;
drop policy if exists "authenticated_can_read_checkins" on checkin_submissions;
drop policy if exists "authenticated_can_update_review_status" on checkin_submissions;

create policy "anon_can_insert_checkins"
on checkin_submissions
for insert
to anon
with check (true);

create policy "authenticated_can_read_checkins"
on checkin_submissions
for select
to authenticated
using (true);

create policy "authenticated_can_update_review_status"
on checkin_submissions
for update
to authenticated
using (true)
with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  submission_id uuid references checkin_submissions(id),
  actor text not null,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

alter table audit_logs enable row level security;

drop policy if exists "authenticated_can_read_audit_logs" on audit_logs;
create policy "authenticated_can_read_audit_logs"
on audit_logs
for select
to authenticated
using (true);

insert into checkin_submissions
  (id, name, age_range, whatsapp, concerns, duration, already_tried, wants_session, summary_text, summary_source, summary_review_status, readiness_score)
values
  ('00000000-0000-4000-8000-000000000001', 'Sarah Tan', '45-49', '+6591234567', ARRAY['Fatigue', 'Sleep issues', 'Bloating'], 'More than 6 months', 'Tried different diets, taking melatonin', true, 'Sarah, your body is clearly telling you it needs attention. Persistent fatigue, disrupted sleep and bloating together often signal that your hormones and gut need support, not more willpower.', 'rule_based', 'reviewed', 1.0),
  ('00000000-0000-4000-8000-000000000002', 'Linda Ng', '50-54', '+6598765432', ARRAY['Feeling cold', 'Body has changed', 'Monthly discomfort'], '3-6 months', 'Warm baths, herbal teas', true, 'Linda, feeling constantly cold alongside monthly discomfort and body changes is a pattern worth exploring together. These are signals, not random events.', 'rule_based', 'reviewed', 0.7),
  ('00000000-0000-4000-8000-000000000003', 'Michelle Lim', '40-44', '+6581122334', ARRAY['Stress', 'Bloating', 'Sleep issues'], '1-3 months', 'Yoga, reducing caffeine', false, 'Michelle, stress and bloating together can quietly drain your energy and sleep. Small targeted shifts can make a real difference.', 'rule_based', 'unreviewed', 0.3),
  ('00000000-0000-4000-8000-000000000004', 'Grace Wong', '55-59', '+6592233445', ARRAY['Sleep issues', 'Fatigue', 'Feeling cold'], 'More than 6 months', 'Supplements, cutting sugar', true, 'Grace, your combination of sleep disruption, fatigue and feeling cold suggests your body may be running on empty. You deserve to feel well again.', 'rule_based', 'reviewed', 1.0)
on conflict (id) do update set
  name = excluded.name,
  age_range = excluded.age_range,
  whatsapp = excluded.whatsapp,
  concerns = excluded.concerns,
  duration = excluded.duration,
  already_tried = excluded.already_tried,
  wants_session = excluded.wants_session,
  summary_text = excluded.summary_text,
  summary_source = excluded.summary_source,
  summary_review_status = excluded.summary_review_status,
  readiness_score = excluded.readiness_score;
