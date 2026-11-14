import Link from 'next/link';
import { getCtx, isManager } from '@/lib/auth';
import { money, monthStart, dateFmt } from '@/lib/format';
import { PageHeader, Stat, Flash, Empty, Badge, statusTone, label } from '@/components/ui';
import { loadSampleData } from '../actions';
import { planFor } from '@/lib/plans';

export const metadata = { title: 'Dashboard' };
export default async function Dashboard({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string }> }) {
  const sp = await searchParams;
  const c = await getCtx();
  const mgr = isManager(c);
  const [tx, cards, pendingTx, pendingBills, upcoming] = await Promise.all([
    c.supabase.from('transactions').select('id,merchant,category,amount_cents,occurred_on,status,flags').neq('status', 'rejected').gte('occurred_on', monthStart()).order('occurred_on', { ascending: false }),
    c.supabase.from('cards').select('id,status', { count: 'exact' }).neq('status', 'closed'),
    c.supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'pending_approval'),
    mgr ? c.supabase.from('bills').select('id', { count: 'exact', head: true }).eq('status', 'pending_approval') : Promise.resolve({ count: 0 }),
    mgr ? c.supabase.from('bills').select('amount_cents,due_date,vendor,status').in('status', ['approved', 'scheduled']).order('due_date').limit(5) : Promise.resolve({ data: [] as any[] }),
  ]);
  const rows = tx.data ?? [];
  const total = rows.reduce((s, r) => s + Number(r.amount_cents), 0);
  const flagged = rows.filter(r => r.flags?.length).length;
  const byCat = Object.entries(rows.reduce<Record<string, number>>((a, r) => ({ ...a, [r.category]: (a[r.category] ?? 0) + Number(r.amount_cents) }), {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const empty = !rows.length && !(cards.count);
  return (
    <>
      <PageHeader title={`Welcome, ${c.name.split(' ')[0]}`} desc={`${c.orgName} · ${planFor(c.plan).name} plan`} />
      <Flash e={sp.e} ok={sp.ok} />
      {empty ? (
        <Empty title="Your workspace is empty" desc="Create your first card to start tracking spend, or load a small set of sample data to explore.">
          <div className="flex flex-wrap justify-center gap-2">
            {mgr && <Link href="/cards" className="btn-primary">Create a card</Link>}
            {c.role === 'admin' && <form action={loadSampleData}><button className="btn-ghost">Load sample data</button></form>}
          </div>
        </Empty>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Spend this month" value={money(total)} sub={`${rows.length} transactions`} />
            <Stat label="Active cards" value={String(cards.count ?? 0)} />
            <Stat label="Awaiting approval" value={String((pendingTx.count ?? 0) + (pendingBills.count ?? 0))} sub={mgr ? 'Transactions and bills' : 'Your transactions'} />
            <Stat label="Flagged" value={String(flagged)} sub="Missing receipt or duplicate" />
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <section className="card p-5"><h2 className="font-semibold">Top categories</h2>
              {byCat.length ? <ul className="mt-3 divide-y divide-ink-100">{byCat.map(([k, v]) => <li key={k} className="flex justify-between py-2 text-sm"><span>{k}</span><span className="tabular-nums">{money(v)}</span></li>)}</ul> : <p className="mt-3 text-sm text-ink-500">No spend yet this month.</p>}
            </section>
            <section className="card p-5"><h2 className="font-semibold">Recent transactions</h2>
              {rows.length ? <ul className="mt-3 divide-y divide-ink-100">{rows.slice(0, 5).map(r => <li key={r.id} className="flex items-center justify-between gap-2 py-2 text-sm"><span className="min-w-0 truncate">{r.merchant}<span className="block text-xs text-ink-500">{dateFmt(r.occurred_on)}</span></span><span className="flex items-center gap-2"><Badge tone={statusTone(r.status)}>{label(r.status)}</Badge><span className="tabular-nums">{money(r.amount_cents)}</span></span></li>)}</ul> : <p className="mt-3 text-sm text-ink-500">Nothing recorded yet.</p>}
            </section>
            {mgr && <section className="card p-5 lg:col-span-2"><h2 className="font-semibold">Upcoming bills</h2>
              {(upcoming.data ?? []).length ? <ul className="mt-3 divide-y divide-ink-100">{(upcoming.data as any[]).map((b, i) => <li key={i} className="flex justify-between py-2 text-sm"><span>{b.vendor} <span className="text-ink-500">due {dateFmt(b.due_date)}</span></span><span className="tabular-nums">{money(b.amount_cents)}</span></li>)}</ul> : <p className="mt-3 text-sm text-ink-500">No approved bills waiting for payment.</p>}
            </section>}
          </div>
        </>
      )}
    </>
  );
}
