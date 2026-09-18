-- Reverting the admin-configurable grid-density feature entirely — the
-- maker grid's column count goes back to being purely viewport-computed,
-- not admin-settable per screen or globally.
alter table screens drop column makers_per_row;
alter table settings drop column makers_per_row_min;
alter table settings drop column makers_per_row_max;
