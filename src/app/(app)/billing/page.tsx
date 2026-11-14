import { getCtx } from '@/lib/auth';
import { PageHeader, Badge, Stat } from '@/components/ui';
import { PLANS, planFor, type PlanId } from '@/lib/plans';

export const metadata = { title: 'Billing' };
export default async function Billing() {
  const c = await getCtx();
  const link = process.env.NEXT_PUBLIC_PAYMENT_LINK_GROWTH;
  const month = new Date().toISOString().slice(0, 7);
  const [{ count: cards }, { count: members }, { data: u }] = await Promise.all([
    c.supabase.from('cards').select('id', { count: 'exact', head: true }).neq('status', 'closed'),
    c.supabase.from('memberships').select('user_id', { count: 'exact', head: true }),
    c.supabase.from('ai_usage').select('count').eq('month', month).maybeSingle(),
  ]);
  const plan = planFor(c.planStatus === 'canceled' ? 'starter' : c.plan);
  const cap = (n: number) => (n === Infinity ? 'Unlimited' : String(n));
  const href = link ? `${link}${link.includes('?') ? '&' : '?'}client_reference_id=${c.orgId}` : '';
  return (
    <>
      <PageHeader title="Billing" desc="Plan, limits and usage for this workspace." action={<Badge tone={c.planStatus === 'active' ? 'ok' : 'bad'}>{c.planStatus}</Badge>} />
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Current plan" value={plan.name} />
        <Stat label="Cards" value={`${cards ?? 0} / ${cap(plan.cards)}`} />
        <Stat label="Members" value={`${members ?? 0} / ${cap(plan.members)}`} />
        <Stat label="AI analyses" value={`${u?.count ?? 0} / ${plan.aiPerMonth}`} sub="This month" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {(Object.keys(PLANS) as PlanId[]).map(k => (
          <div key={k} className={`card flex flex-col p-5 ${k === c.plan ? 'border-ink ring-1 ring-ink' : ''}`}>
            <p className="font-semibold">{PLANS[k].name} {k === c.plan && <Badge tone="ok">Current</Badge>}</p>
            <p className="mt-2 text-2xl font-semibold">{PLANS[k].price}{k === 'growth' && <span className="text-sm font-normal text-ink-500"> / user / mo</span>}</p>
            <ul className="mt-3 flex-1 space-y-1 text-sm text-ink-700">{PLANS[k].features.map(f => <li key={f} className="flex gap-2"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />{f}</li>)}</ul>
            {k === 'growth' && c.plan === 'starter' && c.role === 'admin' && href && <a href={href} className="btn-primary mt-4">Upgrade</a>}
                      </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-ink-500">Plans change only after the payment provider confirms payment. After checkout, the new plan appears within a minute.</p>
    </>
  );
}
