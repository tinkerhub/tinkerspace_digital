-- Redundant with min/max: a screen either overrides makers_per_row or
-- falls back to the min, no separate "default" needed.
alter table settings drop column makers_per_row_default;
