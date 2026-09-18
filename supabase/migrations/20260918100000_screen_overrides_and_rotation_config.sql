alter table screens
  add column calendar_enabled boolean,
  add column makers_enabled boolean,
  add column calendar_duration_ms integer,
  add column makers_duration_ms integer,
  add column makers_per_row integer;

alter table settings
  add column makers_per_row_min integer not null default 2,
  add column makers_per_row_max integer not null default 6,
  add column makers_per_row_default integer not null default 4,
  add column min_slot_ms integer not null default 5000;
