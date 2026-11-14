import { getCtx } from '@/lib/auth';
import { money, monthStart } from '@/lib/format';
import { PageHeader, Flash, Stat, Field } from '@/components/ui';
import { planFor } from '@/lib/plans';
import { explain, aiConfigured, type Insight } from '@/lib/ai';
import { fail } from '@/lib/action';

export const metadata = { title: 'Insights' };

async function facts(c: Awaited<ReturnType<typeof getCtx>>) {
  const [{ data: tx }, { data: budgets }, { data: bills }] = await Promise.all([
    c.supabase.from('transactions').select('merchant,category,amount_cents,occurred_on,status,flags').neq('status', 'rejected').gte('occurred_on', monthStart()),
    c.supabase.from('budgets').select('name,category,limit_cents'),
    c.role === 'employee' ? Promise.resolve({ data: [] as any[] }) : c.supabase.from('bills').select('vendor,amount_cents,due_date,status').in('status', ['pending_approval', 'approved', 'scheduled']),
  ]);
  const rows = tx ?? [];
  const sum = (a: any[]) => a.reduce((s, r) => s + Number(r.amount_cents), 0);
  const cats: Record<string, number> = {};
  rows.forEach(r => { cats[r.category] = (cats[r.category] ?? 0) + Number(r.amount_cents); });
  const merchants: Record<string, number> = {};
  rows.forEach(r => { merchants[r.merchant] = (merchants[r.merchant] ?? 0) + Number(r.amount_cents); });
  const now = new Date();
  const day = now.getUTCDate();
  const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  const project = (v: number) => Math.round((v / day) * daysInMonth);
  return {
    month_start: monthStart(), day_of_month: day, days_in_month: daysInMonth, projected_month_end_cents: project(sum(rows)), projection_method: 'current run rate (spend to date / days elapsed * days in month)', currency: 'USD', total_spend_cents: sum(rows), transaction_count: rows.length,
    by_category_cents: cats,
    top_merchants_cents: Object.entries(merchants).sort((a, b) => b[1] - a[1]).slice(0, 5),
    flagged_transactions: rows.filter(r => r.flags?.length).map(r => ({ merchant: r.merchant, amount_cents: r.amount_cents, flags: r.flags })),
    pending_approval_count: rows.filter(r => r.status === 'pending_approval').length,
    budgets: (budgets ?? []).map(b => ({ name: b.name, limit_cents: b.limit_cents, spent_cents: cats[b.category] ?? 0, percent_used: Math.round(((cats[b.category] ?? 0) / Number(b.limit_cents)) * 100), projected_spend_cents: project(cats[b.category] ?? 0), projected_to_exceed: project(cats[b.category] ?? 0) > Number(b.limit_cents) })),
    open_bills: (bills ?? []).map((b: any) => ({ vendor: b.vendor, amount_cents: b.amount_cents, due: b.due_date, status: b.status })),
  };
}

export default async function Insights({ searchParams }: { searchParams: Promise<{ q?: string; go?: string }> }) {
  const sp = await searchParams;
  const c = await getCtx();
  const plan = planFor(c.planStatus === 'canceled' ? 'starter' : c.plan);
  const month = new Date().toISOString().slice(0, 7);
  const f = await facts(c);
  const { data: u } = await c.supabase.from('ai_usage').select('count').eq('org_id', c.orgId).eq('month', month).maybeSingle();
  let used = u?.count ?? 0;
  let insight: Insight | null = null; let err = '';
  if (sp.go) {
    try {
      if (!aiConfigured()) fail('AI analysis is temporarily unavailable. Try again shortly.');
      if (used >= plan.aiPerMonth) fail(`You have used all ${plan.aiPerMonth} AI analyses for this month on the ${plan.name} plan.`);
      if (f.transaction_count === 0) fail('There is no spend this month to analyse yet.');
      insight = await explain(f, sp.q);
      const { data: n } = await c.supabase.rpc('bump_ai_usage', { o: c.orgId, m: month });
      used = typeof n === 'number' ? n : used + 1;
    } catch (e) { err = e instanceof Error ? e.message : 'Something went wrong'; }
  }
  const top = Object.entries(f.by_category_cents).sort((a, b) => b[1] - a[1]);
  return (
    <>
      <PageHeader title="Insights" desc="Totals and forecasts are calculated by SpendSphere. The AI engine analyzes and explains them." />
      <Flash e={err} />
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Spend this month" value={money(f.total_spend_cents)} />
        <Stat label="Projected month end" value={money(f.projected_month_end_cents)} sub="At current run rate" />
        <Stat label="Top category" value={top[0]?.[0] ?? '-'} sub={top[0] ? money(top[0][1]) : undefined} />
        <Stat label="AI analyses used" value={`${used} / ${plan.aiPerMonth}`} sub="This month" />
      </div>
      <form className="card mt-6 grid gap-4 p-5">
        <input type="hidden" name="go" value="1" />
        <Field label="Ask the AI engine a question about this month (optional)"><input className="input" name="q" maxLength={300} defaultValue={sp.q} placeholder="Why is Software spend high?" /></Field>
        <div><button className="btn-primary">Run AI analysis</button></div>
      </form>
      {insight && (
        <section className="card mt-6 space-y-4 p-6" aria-live="polite">
          <p>{insight.summary}</p>
          {insight.answer && <p className="rounded bg-canvas p-3 text-sm"><strong>Answer:</strong> {insight.answer}</p>}
          {insight.highlights.length > 0 && <div><h2 className="font-semibold">Highlights</h2><ul className="mt-1 list-disc pl-5 text-sm text-ink-700">{insight.highlights.map(h => <li key={h}>{h}</li>)}</ul></div>}
          {insight.actions.length > 0 && <div><h2 className="font-semibold">Suggested actions</h2><ul className="mt-1 list-disc pl-5 text-sm text-ink-700">{insight.actions.map(h => <li key={h}>{h}</li>)}</ul></div>}
          <p className="text-xs text-ink-500">AI-generated analysis of the calculated figures above. Review before acting.</p>
        </section>
      )}
    </>
  );
}
