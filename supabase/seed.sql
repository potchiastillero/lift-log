insert into public.tiers (slug, label, level_min, level_max, summary)
values
  ('ember', 'Ember Tier', 1, 4, 'Early momentum with visible structure and control.'),
  ('vanguard', 'Vanguard Tier', 5, 9, 'Execution becomes dependable and measured.'),
  ('aether', 'Aether Tier', 10, 14, 'Your system compounds with precision and range.'),
  ('sovereign', 'Sovereign Tier', 15, 19, 'High agency, high consistency, low wasted motion.'),
  ('paragon', 'Paragon Tier', 20, 99, 'Elite clarity with durable, long-horizon growth.')
on conflict (slug) do update set
  label = excluded.label,
  level_min = excluded.level_min,
  level_max = excluded.level_max,
  summary = excluded.summary;

insert into public.achievements (key, category, name, description, icon, condition_type, condition_value)
values
  ('first-step', 'completion', 'First Step', 'Finish your first mandate.', 'Spark', 'task_count', 1),
  ('streak-3', 'streak', 'Three-Day Rhythm', 'Hold a three-day completion streak.', 'Flame', 'streak', 3),
  ('streak-7', 'streak', 'Seven-Day Tempo', 'Maintain seven days of steady output.', 'Orbit', 'streak', 7),
  ('streak-30', 'streak', 'Iron Routine', 'Maintain a thirty-day streak.', 'Shield', 'streak', 30),
  ('level-5', 'level', 'Tier Break', 'Reach level five and unlock Vanguard Tier.', 'Crown', 'level', 5),
  ('level-10', 'level', 'Aether Threshold', 'Reach level ten.', 'Hexagon', 'level', 10),
  ('tasks-100', 'completion', 'Centurion', 'Complete one hundred tasks.', 'CheckCircle2', 'task_count', 100),
  ('stat-80', 'mastery', 'Stat Ascendant', 'Push any stat to eighty.', 'TrendingUp', 'stat_value', 80),
  ('perfect-day', 'consistency', 'Perfect Day', 'Finish every daily mandate in a single day.', 'Sunrise', 'daily_clear', 1),
  ('perfect-week', 'focus', 'Perfect Week', 'Complete every weekly objective in one week.', 'CalendarRange', 'weekly_clear', 1)
on conflict (key) do update set
  category = excluded.category,
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  condition_type = excluded.condition_type,
  condition_value = excluded.condition_value;

-- Example bootstrap sequence for a newly created user:
-- 1. Insert the profile row from the auth callback.
-- 2. Insert six stats, six daily mandates, three weekly objectives, starter goals, streak rows, and a few activity items.
-- This is usually best handled in an Edge Function, SQL function, or application-side onboarding script.
