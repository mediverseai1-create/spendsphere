import { redirect } from 'next/navigation';
import { getCtx, isManager } from '@/lib/auth';
import { money } from '@/lib/format';
import { PageHeader, UpgradeNote, Empty, Bar } from '@/components/ui';
import { planFor } from '@/lib/plans';

export const metadata = { title: 'Reports' };
export default async function Reports() {
  const c = await getCtx();
  if (!isManager(c)) redirect('/dashboard');
  if (!planFor(c.planStatus === 'canceled' ? 'starter' : c.plan).advanced) return <><PageHeader title="Reports" /><UpgradeNote feature="Spend trend reports" plan="Scale" /></>;
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + i, 1)).toISOString().slice(0, 7));
  const { data } = await c.supabase.from('transactions').select('occurred_on,category,amount_cents').neq('status', 'rejected').gte('occurred_on', months[0] + '-01');
  const totals: Record<string, number> = Object.fromEntries(months.map(m => [m, 0]));
  const cats: Record<string, Record<string, number>> = {};
  (data ?? []).forEach(t => {
    const m = t.occurred_on.slice(0, 7);
    if (!(m in totals)) return;
    totals[m] += Number(t.amount_cents);
    cats[t.category] ??= Object.fromEntries(months.map(x => [x, 0]));
    cats[t.category][m] += Number(t.amount_cents);
  });
  const max = Math.max(...Object.values(totals), 1);
  const label = (m: string) => new Date(m + '-01T00:00:00Z').toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  const sum = (o: Record<string, number>) => Object.values(o).reduce((x, y) => x + y, 0);
  const catRows = Object.entries(cats).sort((a, b) => sum(b[1]) - sum(a[1]));
  return (
    <>
      <PageHeader title="Reports" desc="Six months of spend, calculated from recorded transactions."
        action={<span className="flex gap-2"><a className="btn-ghost btn-sm" href="/export/transactions">Export transactions CSV</a><a className="btn-ghost btn-sm" href="/export/bills">Export bills CSV</a></span>} />
      {!data?.length ? <Empty title="No spend in the last six months" desc="Reports appear once transactions are recorded." /> : (
        <>
          <section className="card p-5"><h2 className="font-semibold">Monthly spend</h2>
            <ul className="mt-4 space-y-3">{months.map(m => <li key={m}><div className="mb-1 flex justify-between text-sm"><span>{label(m)}</span><span className="tabular-nums">{money(totals[m])}</span></div><Bar pct={(totals[m] / max) * 100} /></li>)}</ul></section>
          <section className="card mt-6 overflow-x-auto"><table className="w-full min-w-[640px]"><thead className="border-b border-ink-200"><tr><th className="th">Category</th>{months.map(m => <th key={m} className="th text-right">{label(m)}</th>)}</tr></thead>
            <tbody className="divide-y divide-ink-100">{catRows.map(([k, v]) => <tr key={k}><td className="td font-medium">{k}</td>{months.map(m => <td key={m} className="td text-right tabular-nums">{v[m] ? money(v[m]) : '-'}</td>)}</tr>)}</tbody></table></section>
        </>
      )}
    </>
  );
}
