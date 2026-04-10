create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_seed text default 'ascend',
  title text default 'Operator',
  current_level integer not null default 1,
  total_experience integer not null default 0,
  momentum integer not null default 60,
  current_tier text not null default 'ember',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  focus_areas text[] not null default '{}',
  dark_mode boolean not null default true,
  reduced_motion boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tiers (
  slug text primary key,
  label text not null,
  level_min integer not null,
  level_max integer not null,
  summary text not null
);

create table if not exists public.stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  key text not null,
  label text not null,
  value integer not null default 0,
  experience integer not null default 0,
  trend integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  unique(user_id, key)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  progress integer not null default 0,
  target integer not null,
  stat_key text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  difficulty text not null check (difficulty in ('initiate', 'steady', 'intense')),
  recurrence text not null check (recurrence in ('daily', 'weekly', 'once')),
  experience_reward integer not null default 25,
  stat_keys text[] not null default '{}',
  due_date date,
  penalty integer default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  completed_at timestamptz not null default timezone('utc', now()),
  experience_awarded integer not null,
  stat_gains jsonb not null default '{}'::jsonb
);

create table if not exists public.streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  key text not null,
  label text not null,
  current_count integer not null default 0,
  best_count integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  unique(user_id, key)
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  category text not null,
  name text not null,
  description text not null,
  icon text not null,
  condition_type text not null,
  condition_value integer default 0
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default timezone('utc', now()),
  unique(user_id, achievement_id)
);

create table if not exists public.progression_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  snapshot_date date not null,
  total_experience integer not null,
  completions integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  unique(user_id, snapshot_date)
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  detail text not null,
  occurred_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.tiers enable row level security;
alter table public.stats enable row level security;
alter table public.goals enable row level security;
alter table public.tasks enable row level security;
alter table public.task_completions enable row level security;
alter table public.streaks enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.progression_snapshots enable row level security;
alter table public.activity_log enable row level security;

create policy "Public tiers are readable" on public.tiers for select using (true);
create policy "Public achievements are readable" on public.achievements for select using (true);

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users manage own settings" on public.user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own stats" on public.stats for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own goals" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own tasks" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own task completions" on public.task_completions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own streaks" on public.streaks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own unlocked achievements" on public.user_achievements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own progression snapshots" on public.progression_snapshots for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own activity log" on public.activity_log for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
