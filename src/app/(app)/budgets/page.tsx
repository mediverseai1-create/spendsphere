import { getCtx, isManager } from '@/lib/auth';
import { money, CATEGORIES, monthStart } from '@/lib/format';
import { PageHeader, Flash, Empty, Field, Bar, UpgradeNote } from '@/components/ui';
import { createBudget, deleteBudget } from '../actions';
import { planFor } from '@/lib/plans';

export const metadata = { title: 'Budgets' };
export default async function Budgets({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string }> }) {
  const sp = await searchParams;
  const c = await getCtx();
  if (!planFor(c.planStatus === 'canceled' ? 'starter' : c.plan).budgets) return <><PageHeader title="Budgets" /><UpgradeNote feature="Live budgets" /></>;
  const mgr = isManager(c);
  const [{ data: budgets }, { data: tx }] = await Promise.all([
    c.supabase.from('budgets').select('*').order('created_at'),
    c.supabase.from('transactions').select('category,amount_cents').neq('status', 'rejected').gte('occurred_on', monthStart()),
  ]);
  const spent = (cat: string) => (tx ?? []).filter(t => t.category === cat).reduce((s, t) => s + Number(t.amount_cents), 0);
  return (
    <>
      <PageHeader title="Budgets" desc="Monthly limits per category, updated as transactions are recorded. Employees see only their own transactions, so figures for them cover what they can access." />
      <Flash e={sp.e} ok={sp.ok} />
      {mgr && (
        <form action={createBudget} className="card mb-6 grid gap-4 p-5 sm:grid-cols-4 sm:items-end">
          <Field label="Name"><input className="input" name="name" required minLength={2} maxLength={60} /></Field>
          <Field label="Category"><select className="input" name="category">{CATEGORIES.map(k => <option key={k}>{k}</option>)}</select></Field>
          <Field label="Monthly limit (USD)"><input className="input" name="limit" inputMode="decimal" required /></Field>
          <button className="btn-primary">Add budget</button>
        </form>
      )}
      {!budgets?.length ? <Empty title="No budgets yet" desc="Create a budget to track a category against a monthly limit." /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {budgets.map(b => { const s = spent(b.category); const pct = (s / Number(b.limit_cents)) * 100; return (
            <div key={b.id} className="card p-5">
              <div className="flex justify-between"><div><p className="font-semibold">{b.name}</p><p className="text-xs text-ink-500">{b.category}</p></div>
                {mgr && <form action={deleteBudget}><input type="hidden" name="id" value={b.id} /><button className="text-xs text-ink-500 underline">Remove</button></form>}</div>
              <p className="mt-4 text-sm"><span className="font-semibold tabular-nums">{money(s)}</span> <span className="text-ink-500">of {money(b.limit_cents)} · {Math.round(pct)}%</span></p>
              <div className="mt-2"><Bar pct={pct} /></div>
              {pct > 100 && <p className="mt-2 text-xs font-medium text-bad">Over budget by {money(s - Number(b.limit_cents))}</p>}
            </div>); })}
        </div>
      )}
    </>
  );
}
