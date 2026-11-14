'use server';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { getCtx, requireManager } from '@/lib/auth';
import { run, fail } from '@/lib/action';
import { toCents, CATEGORIES, monthStart } from '@/lib/format';
import { evaluate, DEFAULT_POLICY, type Policy } from '@/lib/policy';
import { planFor } from '@/lib/plans';

const effPlan = (c: { plan: string; planStatus: string }) => planFor(c.planStatus === 'canceled' ? 'starter' : c.plan);
const cat = z.string().refine(v => CATEGORIES.includes(v), 'Choose a category');
const id = z.string().uuid();
const money = (v: FormDataEntryValue | null, label: string) => {
  const c = toCents(v);
  if (!Number.isFinite(c) || c <= 0) fail(`${label} must be greater than zero`);
  if (c > 100_000_000_00) fail(`${label} is too large`);
  return c;
};
const str = (fd: FormData, k: string, min = 1, max = 120) => {
  const v = String(fd.get(k) ?? '').trim();
  if (v.length < min || v.length > max) fail(`${k} must be ${min}-${max} characters`);
  return v;
};

/* ---------- Cards ---------- */
export async function createCard(fd: FormData) {
  await run('/cards', 'Card created', async () => {
    const c = await getCtx(); requireManager(c);
    const plan = effPlan(c);
    const { count } = await c.supabase.from('cards').select('id', { count: 'exact', head: true }).eq('org_id', c.orgId).neq('status', 'closed');
    if ((count ?? 0) >= plan.cards) fail(`Your ${plan.name} plan allows ${plan.cards} cards. Upgrade to add more.`);
    const holder = id.safeParse(fd.get('holder_id'));
    if (!holder.success) fail('Choose a card holder');
    const allowed = fd.getAll('allowed_categories').map(String).filter(v => CATEGORIES.includes(v));
    const { error } = await c.supabase.from('cards').insert({
      org_id: c.orgId, holder_id: holder.data!, name: str(fd, 'name', 2, 60), last4: String(Math.floor(1000 + Math.random() * 9000)),
      spend_limit_cents: money(fd.get('limit'), 'Limit'), limit_period: fd.get('period') === 'total' ? 'total' : 'monthly', allowed_categories: allowed,
    });
    if (error) fail(error.message);
  });
}
export async function setCardStatus(fd: FormData) {
  await run('/cards', 'Card updated', async () => {
    const c = await getCtx(); requireManager(c);
    const status = z.enum(['active', 'frozen', 'closed']).parse(fd.get('status'));
    const { error } = await c.supabase.from('cards').update({ status }).eq('id', id.parse(fd.get('id'))).eq('org_id', c.orgId);
    if (error) fail(error.message);
  });
}

/* ---------- Transactions ---------- */
const MAX_RECEIPT = 5 * 1024 * 1024;
const RECEIPT_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
export async function createTransaction(fd: FormData) {
  await run('/transactions', 'Transaction recorded', async () => {
    const c = await getCtx();
    const amount = money(fd.get('amount'), 'Amount');
    const merchant = str(fd, 'merchant', 2, 80);
    const category = cat.parse(fd.get('category'));
    const occurred = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date').parse(fd.get('date'));
    if (new Date(occurred) > new Date(Date.now() + 86400000)) fail('Date cannot be in the future');
    const source = fd.get('source') === 'reimbursement' ? 'reimbursement' : 'card';
    const file = fd.get('receipt');
    const hasFile = file instanceof File && file.size > 0;
    if (hasFile) {
      if (!RECEIPT_TYPES.includes(file.type)) fail('Receipt must be a PNG, JPG, WebP or PDF');
      if (file.size > MAX_RECEIPT) fail('Receipt must be under 5 MB');
    }
    let card = null as null | { id: string; spend_limit_cents: number; status: string; allowed_categories: string[]; limit_period: string };
    let spent = 0;
    if (source === 'card') {
      const cardId = id.safeParse(fd.get('card_id'));
      if (!cardId.success) fail('Choose a card');
      const { data } = await c.supabase.from('cards').select('id,spend_limit_cents,status,allowed_categories,limit_period').eq('id', cardId.data!).eq('org_id', c.orgId).maybeSingle();
      if (!data) fail('Card not found or not assigned to you');
      card = data;
      let q = c.supabase.from('transactions').select('amount_cents').eq('card_id', card!.id).neq('status', 'rejected');
      if (card!.limit_period === 'monthly') q = q.gte('occurred_on', monthStart());
      const { data: rows } = await q;
      spent = (rows ?? []).reduce((s, r) => s + Number(r.amount_cents), 0);
    }
    const { data: pol } = await c.supabase.from('policies').select('*').eq('org_id', c.orgId).maybeSingle();
    const policy: Policy = effPlan(c).policies && pol ? { max_single_cents: Number(pol.max_single_cents), receipt_over_cents: Number(pol.receipt_over_cents), approval_over_cents: Number(pol.approval_over_cents), blocked_categories: pol.blocked_categories } : DEFAULT_POLICY;
    const { data: prior } = await c.supabase.from('transactions').select('merchant,amount_cents,occurred_on').eq('org_id', c.orgId).eq('occurred_on', occurred);
    const res = evaluate({ amount_cents: amount, category, merchant, occurred_on: occurred, hasReceipt: hasFile }, policy, card, spent, (prior ?? []).map(p => ({ ...p, amount_cents: Number(p.amount_cents) })));
    if (res.blocks.length) fail('Blocked by policy: ' + res.blocks.join('; '));

    let receipt_path: string | null = null;
    if (hasFile) {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-60);
      receipt_path = `${c.orgId}/${randomUUID()}-${safe}`;
      const { error: upErr } = await c.supabase.storage.from('receipts').upload(receipt_path, file, { contentType: file.type });
      if (upErr) fail('Receipt upload failed: ' + upErr.message);
    }
    const { error } = await c.supabase.from('transactions').insert({
      org_id: c.orgId, card_id: card?.id ?? null, user_id: c.userId, source, merchant, category, amount_cents: amount, occurred_on: occurred,
      memo: String(fd.get('memo') ?? '').slice(0, 300) || null, receipt_path, status: res.status, flags: res.flags,
    });
    if (error) fail(error.message);
  });
}

/* ---------- Approvals ---------- */
export async function reviewItem(fd: FormData) {
  await run('/approvals', 'Decision recorded', async () => {
    const c = await getCtx(); requireManager(c);
    const kind = z.enum(['transaction', 'bill']).parse(fd.get('kind'));
    const approve = fd.get('decision') === 'approve';
    const table = kind === 'bill' ? 'bills' : 'transactions';
    const { data, error } = await c.supabase.from(table).update({ status: approve ? 'approved' : 'rejected', reviewed_by: c.userId })
      .eq('id', id.parse(fd.get('id'))).eq('org_id', c.orgId).eq('status', 'pending_approval').select('id');
    if (error) fail(error.message);
    if (!data?.length) fail('Item is no longer awaiting approval');
  });
}

/* ---------- Bills ---------- */
export async function createBill(fd: FormData) {
  await run('/bills', 'Bill added and sent for approval', async () => {
    const c = await getCtx(); requireManager(c);
    const due = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid due date').parse(fd.get('due'));
    const { error } = await c.supabase.from('bills').insert({
      org_id: c.orgId, vendor: str(fd, 'vendor', 2, 80), invoice_number: String(fd.get('invoice') ?? '').slice(0, 60) || null,
      amount_cents: money(fd.get('amount'), 'Amount'), due_date: due, notes: String(fd.get('notes') ?? '').slice(0, 300) || null, created_by: c.userId,
    });
    if (error) fail(error.message);
  });
}
export async function advanceBill(fd: FormData) {
  await run('/bills', 'Bill updated', async () => {
    const c = await getCtx(); requireManager(c);
    const to = z.enum(['scheduled', 'paid']).parse(fd.get('to'));
    const from = to === 'scheduled' ? ['approved'] : ['approved', 'scheduled'];
    const { data, error } = await c.supabase.from('bills').update({ status: to, ...(to === 'paid' ? { paid_at: new Date().toISOString() } : {}) })
      .eq('id', id.parse(fd.get('id'))).eq('org_id', c.orgId).in('status', from).select('id');
    if (error) fail(error.message);
    if (!data?.length) fail('Bill is not in a state that allows this');
  });
}

/* ---------- Budgets ---------- */
export async function createBudget(fd: FormData) {
  await run('/budgets', 'Budget created', async () => {
    const c = await getCtx(); requireManager(c);
    if (!effPlan(c).budgets) fail('Live budgets are part of the Growth plan');
    const { error } = await c.supabase.from('budgets').insert({ org_id: c.orgId, name: str(fd, 'name', 2, 60), category: cat.parse(fd.get('category')), limit_cents: money(fd.get('limit'), 'Limit') });
    if (error) fail(error.message);
  });
}
export async function deleteBudget(fd: FormData) {
  await run('/budgets', 'Budget removed', async () => {
    const c = await getCtx(); requireManager(c);
    const { error } = await c.supabase.from('budgets').delete().eq('id', id.parse(fd.get('id'))).eq('org_id', c.orgId);
    if (error) fail(error.message);
  });
}

/* ---------- Team ---------- */
export async function inviteMember(fd: FormData) {
  await run('/team', 'Invitation saved. They join automatically when they sign up with that email.', async () => {
    const c = await getCtx(); if (c.role !== 'admin') fail('Only admins can invite');
    const plan = effPlan(c);
    const { count } = await c.supabase.from('memberships').select('user_id', { count: 'exact', head: true }).eq('org_id', c.orgId);
    if ((count ?? 0) >= plan.members) fail(`Your ${plan.name} plan allows ${plan.members} members. Upgrade to add more.`);
    const email = z.string().trim().toLowerCase().email('Enter a valid email').parse(fd.get('email'));
    const role = z.enum(['admin', 'manager', 'employee']).parse(fd.get('role'));
    const { error } = await c.supabase.from('invitations').upsert({ org_id: c.orgId, email, role }, { onConflict: 'org_id,email' });
    if (error) fail(error.message);
  });
}
export async function changeRole(fd: FormData) {
  await run('/team', 'Role updated', async () => {
    const c = await getCtx(); if (c.role !== 'admin') fail('Only admins can change roles');
    const uid = id.parse(fd.get('user_id')); if (uid === c.userId) fail('You cannot change your own role');
    const { error } = await c.supabase.from('memberships').update({ role: z.enum(['admin', 'manager', 'employee']).parse(fd.get('role')) }).eq('org_id', c.orgId).eq('user_id', uid);
    if (error) fail(error.message);
  });
}
export async function removeMember(fd: FormData) {
  await run('/team', 'Member removed', async () => {
    const c = await getCtx(); if (c.role !== 'admin') fail('Only admins can remove members');
    const { error } = await c.supabase.from('memberships').delete().eq('org_id', c.orgId).eq('user_id', id.parse(fd.get('user_id')));
    if (error) fail(error.message);
  });
}

/* ---------- Settings ---------- */
export async function saveProfile(fd: FormData) {
  await run('/settings', 'Profile saved', async () => {
    const c = await getCtx();
    const { error } = await c.supabase.from('profiles').update({ full_name: str(fd, 'name', 2, 80) }).eq('id', c.userId);
    if (error) fail(error.message);
  });
}
export async function saveOrg(fd: FormData) {
  await run('/settings', 'Company saved', async () => {
    const c = await getCtx(); if (c.role !== 'admin') fail('Only admins can change company settings');
    const { error } = await c.supabase.from('organizations').update({ name: str(fd, 'name', 2, 80) }).eq('id', c.orgId);
    if (error) fail(error.message);
  });
}
export async function savePolicy(fd: FormData) {
  await run('/settings', 'Policy saved', async () => {
    const c = await getCtx(); if (c.role !== 'admin') fail('Only admins can change policies');
    if (!effPlan(c).policies) fail('Spend policies are part of the Growth plan');
    const blocked = fd.getAll('blocked').map(String).filter(v => CATEGORIES.includes(v));
    const { error } = await c.supabase.from('policies').upsert({
      org_id: c.orgId, max_single_cents: money(fd.get('max'), 'Maximum'), receipt_over_cents: toCents(fd.get('receipt')) >= 0 ? toCents(fd.get('receipt')) : fail('Receipt threshold invalid'),
      approval_over_cents: money(fd.get('approval'), 'Approval threshold'), blocked_categories: blocked,
    });
    if (error) fail(error.message);
  });
}

/* ---------- Sample data ---------- */
export async function loadSampleData() {
  await run('/dashboard', 'Sample data loaded', async () => {
    const c = await getCtx(); if (c.role !== 'admin') fail('Only admins can load sample data');
    const { count } = await c.supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('org_id', c.orgId);
    if (count) fail('Sample data can only be loaded into an empty workspace');
    const mk = (name: string, limit: number, allowed: string[] = []) => ({ org_id: c.orgId, holder_id: c.userId, name, last4: String(1000 + Math.floor(Math.random() * 9000)), spend_limit_cents: limit, allowed_categories: allowed });
    const { data: cards, error } = await c.supabase.from('cards').insert([mk('Marketing team', 800000, ['Advertising', 'Software']), mk('Software subscriptions', 300000, ['Software']), mk('Travel', 500000, ['Travel', 'Meals'])]).select('id,name');
    if (error) fail(error.message);
    const by = (n: string) => cards!.find(x => x.name === n)!.id;
    const day = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
    const t = (card: string, merchant: string, category: string, dollars: number, ago: number, receipt = false) => ({ org_id: c.orgId, user_id: c.userId, card_id: by(card), merchant, category, amount_cents: dollars * 100, occurred_on: day(ago), status: 'approved', flags: dollars > 25 && !receipt ? ['Missing receipt'] : [] });
    const { error: e2 } = await c.supabase.from('transactions').insert([
      t('Marketing team', 'Google Ads', 'Advertising', 1840, 2), t('Marketing team', 'LinkedIn Ads', 'Advertising', 920, 5), t('Software subscriptions', 'Figma', 'Software', 180, 3),
      t('Software subscriptions', 'Notion', 'Software', 96, 6), t('Software subscriptions', 'Slack', 'Software', 215, 8), t('Travel', 'United Airlines', 'Travel', 642, 4), t('Travel', 'Hotel Marriott', 'Travel', 410, 4), t('Travel', 'Client dinner', 'Meals', 138, 7),
    ]);
    if (e2) fail(e2.message);
    await c.supabase.from('bills').insert([
      { org_id: c.orgId, vendor: 'Acme Design Studio', invoice_number: 'INV-1042', amount_cents: 480000, due_date: day(-9), created_by: c.userId },
      { org_id: c.orgId, vendor: 'CloudHost Inc.', invoice_number: 'CH-8831', amount_cents: 125000, due_date: day(-3), created_by: c.userId },
    ]);
    if (effPlan(c).budgets) await c.supabase.from('budgets').insert([{ org_id: c.orgId, name: 'Marketing', category: 'Advertising', limit_cents: 400000 }, { org_id: c.orgId, name: 'Software', category: 'Software', limit_cents: 60000 }]);
    revalidatePath('/', 'layout');
  });
}
