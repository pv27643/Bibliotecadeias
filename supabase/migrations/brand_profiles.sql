-- Brand Style Profiles
create table if not exists brand_profiles (
  id          uuid primary key default gen_random_uuid(),
  brand_name  text not null,
  source      jsonb not null default '{"type":"manual"}'::jsonb,
  palette     jsonb not null default '{}'::jsonb,
  typography  jsonb not null default '{}'::jsonb,
  logo        jsonb not null default '{}'::jsonb,
  tone_of_voice   jsonb not null default '{}'::jsonb,
  imagery_style   jsonb not null default '{}'::jsonb,
  layout_patterns jsonb not null default '{}'::jsonb,
  platforms   jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Generations (history of workflow outputs per brand)
create table if not exists generations (
  id            uuid primary key default gen_random_uuid(),
  brand_id      uuid references brand_profiles(id) on delete cascade,
  workflow_id   text not null,
  workflow_name text not null,
  inputs        jsonb not null default '{}'::jsonb,
  outputs       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

-- Auto-update updated_at on brand_profiles
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists brand_profiles_updated_at on brand_profiles;
create trigger brand_profiles_updated_at
  before update on brand_profiles
  for each row execute function update_updated_at();
