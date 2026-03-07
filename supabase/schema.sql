create table if not exists public.identitree_workspaces (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state_json jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.identitree_workspaces enable row level security;

create policy "users can read their workspace"
  on public.identitree_workspaces
  for select
  using (auth.uid() = user_id);

create policy "users can write their workspace"
  on public.identitree_workspaces
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
