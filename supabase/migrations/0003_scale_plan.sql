-- Adds the Scale plan. Run in the Supabase SQL editor.
alter table public.organizations drop constraint if exists organizations_plan_check;
alter table public.organizations add constraint organizations_plan_check check (plan in ('starter','growth','scale','enterprise'));
