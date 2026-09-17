-- RLS policies filter rows but don't substitute for base table grants;
-- these were missing, causing 42501 "permission denied" on every query.
grant usage on schema public to anon, authenticated;

grant select on public.spaces to anon, authenticated;
grant insert, update, delete on public.spaces to authenticated;

grant select on public.settings to anon, authenticated;
grant update on public.settings to authenticated;

grant select, insert on public.screens to anon;
grant select, insert, update, delete on public.screens to authenticated;
