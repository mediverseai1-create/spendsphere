-- SpendSphere schema. Run in the Supabase SQL editor (or `supabase db push`).
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, created_at timestamptz default now()
);
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'starter' check (plan in ('starter','growth','enterprise')),
  plan_status text not null default 'active' check (plan_status in ('active','past_due','canceled')),
  payment_customer_id text,
  created_at timestamptz default now()
);
create table public.memberships (
  org_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'employee' check (role in ('admin','manager','employee')),
  created_at timestamptz default now(),
  primary key (org_id, user_id)
);
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null, role text not null default 'employee' check (role in ('admin','manager','employee')),
  created_at timestamptz default now(), unique (org_id, email)
);
create table public.policies (
  org_id uuid primary key references public.organizations(id) on delete cascade,
  max_single_cents bigint not null default 500000,
  receipt_over_cents bigint not null default 2500,
  approval_over_cents bigint not null default 100000,
  blocked_categories text[] not null default '{}'
);
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  holder_id uuid not null references auth.users(id),
  name text not null, last4 text not null,
  spend_limit_cents bigint not null check (spend_limit_cents > 0),
  limit_period text not null default 'monthly' check (limit_period in ('monthly','total')),
  allowed_categories text[] not null default '{}',
  status text not null default 'active' check (status in ('active','frozen','closed')),
  created_at timestamptz default now()
);
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  card_id uuid references public.cards(id) on delete set null,
  user_id uuid not null references auth.users(id),
  source text not null default 'card' check (source in ('card','reimbursement')),
  merchant text not null, category text not null,
  amount_cents bigint not null check (amount_cents > 0),
  occurred_on date not null default current_date,
  memo text, receipt_path text,
  status text not null default 'approved' check (status in ('approved','pending_approval','rejected')),
  flags text[] not null default '{}',
  reviewed_by uuid references auth.users(id),
  created_at timestamptz default now()
);
create index on public.transactions (org_id, occurred_on desc);
create table public.bills (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  vendor text not null, invoice_number text, amount_cents bigint not null check (amount_cents > 0),
  due_date date not null, notes text,
  status text not null default 'pending_approval' check (status in ('pending_approval','approved','scheduled','paid','rejected')),
  created_by uuid not null references auth.users(id), reviewed_by uuid references auth.users(id),
  paid_at timestamptz, created_at timestamptz default now()
);
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, category text not null,
  limit_cents bigint not null check (limit_cents > 0),
  created_at timestamptz default now()
);
create table public.ai_usage (
  org_id uuid references public.organizations(id) on delete cascade,
  month text not null, count int not null default 0,
  primary key (org_id, month)
);
create table public.payment_events (
  id text primary key, org_id uuid, plan text, received_at timestamptz default now()
);

-- helpers
create or replace function public.org_role(o uuid) returns text language sql stable security definer set search_path = public as
$$ select role from public.memberships where org_id = o and user_id = auth.uid() $$;
create or replace function public.is_member(o uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists(select 1 from public.memberships where org_id = o and user_id = auth.uid()) $$;
create or replace function public.is_manager(o uuid) returns boolean language sql stable security definer set search_path = public as
$$ select coalesce(public.org_role(o) in ('admin','manager'), false) $$;
create or replace function public.is_admin(o uuid) returns boolean language sql stable security definer set search_path = public as
$$ select coalesce(public.org_role(o) = 'admin', false) $$;

-- new user: join invited org, otherwise create one
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare inv record; new_org uuid; nm text;
begin
  nm := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1));
  insert into public.profiles(id, full_name) values (new.id, nm);
  select * into inv from public.invitations where lower(email) = lower(new.email) order by created_at limit 1;
  if found then
    insert into public.memberships(org_id,user_id,role) values (inv.org_id,new.id,inv.role);
    delete from public.invitations where email ilike new.email;
  else
    insert into public.organizations(name) values (coalesce(new.raw_user_meta_data->>'company', nm || '''s company')) returning id into new_org;
    insert into public.memberships(org_id,user_id,role) values (new_org,new.id,'admin');
    insert into public.policies(org_id) values (new_org);
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.policies enable row level security;
alter table public.cards enable row level security;
alter table public.transactions enable row level security;
alter table public.bills enable row level security;
alter table public.budgets enable row level security;
alter table public.ai_usage enable row level security;
alter table public.payment_events enable row level security;  -- no policies: service role only

create policy profiles_read on public.profiles for select using (
  id = auth.uid() or exists (select 1 from public.memberships a join public.memberships b on a.org_id=b.org_id where a.user_id=auth.uid() and b.user_id=profiles.id));
create policy profiles_update on public.profiles for update using (id = auth.uid());

create policy org_read on public.organizations for select using (public.is_member(id));
create policy org_update on public.organizations for update using (public.is_admin(id)) with check (public.is_admin(id));
-- plan/plan_status are changed only by the service role (verified payment webhook)
revoke update (plan, plan_status, payment_customer_id) on public.organizations from authenticated;

create policy mem_read on public.memberships for select using (public.is_member(org_id));
create policy mem_admin_write on public.memberships for update using (public.is_admin(org_id)) with check (public.is_admin(org_id));
create policy mem_admin_delete on public.memberships for delete using (public.is_admin(org_id) and user_id <> auth.uid());
create policy mem_bootstrap on public.memberships for insert with check (public.is_admin(org_id));

create policy inv_all on public.invitations for all using (public.is_admin(org_id)) with check (public.is_admin(org_id));

create policy pol_read on public.policies for select using (public.is_member(org_id));
create policy pol_write on public.policies for all using (public.is_admin(org_id)) with check (public.is_admin(org_id));

create policy cards_read on public.cards for select using (public.is_manager(org_id) or (public.is_member(org_id) and holder_id = auth.uid()));
create policy cards_write on public.cards for all using (public.is_manager(org_id)) with check (public.is_manager(org_id));

create policy tx_read on public.transactions for select using (public.is_manager(org_id) or (public.is_member(org_id) and user_id = auth.uid()));
create policy tx_insert on public.transactions for insert with check (public.is_member(org_id) and (user_id = auth.uid() or public.is_manager(org_id)));
create policy tx_update on public.transactions for update using (public.is_manager(org_id)) with check (public.is_manager(org_id));
create policy tx_delete on public.transactions for delete using (public.is_admin(org_id));

create policy bills_read on public.bills for select using (public.is_manager(org_id));
create policy bills_insert on public.bills for insert with check (public.is_manager(org_id) and created_by = auth.uid());
create policy bills_update on public.bills for update using (public.is_manager(org_id)) with check (public.is_manager(org_id));
create policy bills_delete on public.bills for delete using (public.is_admin(org_id));

create policy budgets_read on public.budgets for select using (public.is_member(org_id));
create policy budgets_write on public.budgets for all using (public.is_manager(org_id)) with check (public.is_manager(org_id));

create policy ai_read on public.ai_usage for select using (public.is_member(org_id));

-- AI usage counter (atomic, member-only)
create or replace function public.bump_ai_usage(o uuid, m text) returns int language plpgsql security definer set search_path = public as $$
declare c int;
begin
  if not public.is_member(o) then raise exception 'forbidden'; end if;
  insert into public.ai_usage(org_id, month, count) values (o, m, 1)
  on conflict (org_id, month) do update set count = public.ai_usage.count + 1 returning count into c;
  return c;
end $$;

-- Receipts storage: path = <org_id>/<file>
insert into storage.buckets (id, name, public) values ('receipts','receipts', false) on conflict do nothing;
create policy receipts_read on storage.objects for select using (bucket_id='receipts' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy receipts_insert on storage.objects for insert with check (bucket_id='receipts' and public.is_member(((storage.foldername(name))[1])::uuid));
