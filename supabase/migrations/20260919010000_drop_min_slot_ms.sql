-- Removed content-weighted rotation timing (computeSlot) — top-level dwell
-- time is now just the resolved duration times page count, no minSlot floor.
alter table settings drop column min_slot_ms;
