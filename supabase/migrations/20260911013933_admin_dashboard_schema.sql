create table spaces (
  id bigint generated always as identity primary key,
  name text not null,
  created_at timestamptz not null default now()
);
insert into spaces (name) values ('Kochi'), ('Kozhikode'); -- seeds ids 1, 2

create table screens (
  id text primary key,               -- client-generated random id
  name text,
  space_id bigint references spaces(id),
  status text not null default 'unclaimed', -- 'unclaimed' | 'claimed'
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  expires_at timestamptz              -- only meaningful while unclaimed
);

create table settings (
  id boolean primary key default true check (id), -- forces exactly one row
  calendar_duration_ms integer not null default 10000,
  maker_duration_ms integer not null default 20000
);
insert into settings (id) values (true);

alter table spaces enable row level security;
alter table screens enable row level security;
alter table settings enable row level security;

-- anyone (anon kiosk) can read spaces/settings, and read/insert screens
-- (self-registration); only logged-in admins can write spaces/settings
-- or update/delete screens (claiming, renaming, reassigning).
create policy "anon read spaces" on spaces for select using (true);
create policy "admin write spaces" on spaces for all using (auth.role() = 'authenticated');

create policy "anon read settings" on settings for select using (true);
create policy "admin write settings" on settings for update using (auth.role() = 'authenticated');

create policy "anon read screens" on screens for select using (true);
create policy "anon register screens" on screens for insert with check (true);
create policy "admin update screens" on screens for update using (auth.role() = 'authenticated');
create policy "admin delete screens" on screens for delete using (auth.role() = 'authenticated');

-- realtime: let clients subscribe to changes on screens/settings
alter publication supabase_realtime add table screens;
alter publication supabase_realtime add table settings;
