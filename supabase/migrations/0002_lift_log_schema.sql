create table if not exists public.lift_log_stores (
  user_id uuid primary key references auth.users(id) on delete cascade,
  store jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.lift_log_stores enable row level security;

create policy "Users manage own lift log store"
on public.lift_log_stores
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
