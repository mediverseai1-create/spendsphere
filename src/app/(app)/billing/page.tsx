import { getCtx } from '@/lib/auth';
import { PageHeader, Badge, Stat } from '@/components/ui';
import { PLANS, planFor, checkoutLink, type PlanId } from '@/lib/plans';

export const metadata = { title: 'Billing' };
export default async function Billing({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const sp = await searchParams;
  const c = await getCtx();
  const month = new Date().toISOString().slice(0, 7);
  const [{ count: cards }, { count: members }, { data: u }] = await Promise.all([
    c.supabase.from('cards').select('id', { count: 'exact', head: true }).neq('status', 'closed'),
    c.supabase.from('memberships').select('user_id', { count: 'exact', head: true }),
    c.supabase.from('ai_usage').select('count').eq('month', month).maybeSingle(),
  ]);
  const current = (c.planStatus === 'canceled' ? 'starter' : c.plan) as PlanId;
  const plan = planFor(current);
  const order: PlanId[] = ['starter', 'growth', 'scale'];
  const cap = (n: number) => (n === Infinity ? 'Unlimited' : String(n));
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
        {order.map(k => {
          const p = PLANS[k];
          const canBuy = k !== 'starter' && c.role === 'admin' && order.indexOf(k) > order.indexOf(current);
          return (
            <div key={k} className={`card flex flex-col p-5 ${k === current ? 'border-ink ring-1 ring-ink' : sp.plan === k ? 'border-brand ring-1 ring-brand' : ''}`}>
              <p className="font-semibold">{p.name} {k === current && <Badge tone="ok">Current</Badge>}</p>
              <p className="mt-2 text-2xl font-semibold">{p.price}{p.period && <span className="block text-xs font-normal text-ink-500">{p.period}</span>}</p>
              <ul className="mt-3 flex-1 space-y-1 text-sm text-ink-700">{p.features.map(f => <li key={f} className="flex gap-2"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />{f}</li>)}</ul>
              {canBuy && <a href={checkoutLink(k as 'growth' | 'scale')} target="_blank" rel="noreferrer" className="btn-primary mt-4">Upgrade to {p.name}</a>}
            </div>
          );
        })}
      </div>
      {c.role === 'admin' && current !== 'scale' && <p className="mt-6 max-w-2xl text-sm text-ink-700">At checkout, use the email you sign in with, <strong>{c.email}</strong>, so the payment can be matched to this workspace. The plan is activated once the payment is confirmed.</p>}
      {c.role !== 'admin' && <p className="mt-6 text-sm text-ink-500">Only workspace admins can change the plan.</p>}
    </>
  );
}
