-- Security fix: column-level REVOKE does not override a table-level UPDATE grant, so signed-in users could
-- change their own plan. Restrict updates to safe columns and add a trigger as defence in depth.
revoke update on public.organizations from authenticated, anon;
grant update (name) on public.organizations to authenticated;

create or replace function public.guard_org_billing() returns trigger language plpgsql as $$
begin
  if (new.plan is distinct from old.plan or new.plan_status is distinct from old.plan_status
      or new.payment_customer_id is distinct from old.payment_customer_id)
     and coalesce(auth.role(), '') <> 'service_role' and current_user not in ('postgres','service_role','supabase_admin') then
    raise exception 'plan fields can only be changed by the payment webhook';
  end if;
  return new;
end $$;
drop trigger if exists guard_org_billing on public.organizations;
create trigger guard_org_billing before update on public.organizations for each row execute function public.guard_org_billing();
