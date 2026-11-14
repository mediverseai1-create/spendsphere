import Link from 'next/link';
import { Shell } from '@/components/Site';
import { PLANS, type PlanId } from '@/lib/plans';
export const metadata = { title: 'Pricing' };
export default function Pricing() {
  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Pricing that scales with your headcount.</h1>
        <p className="mt-3 max-w-2xl text-ink-500">Start free. Move to Growth when you need policy automation and live budgets across the company.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {(Object.keys(PLANS) as PlanId[]).map(k => {
            const p = PLANS[k];
            return (
              <div key={k} className={`card flex flex-col p-6 ${k === 'growth' ? 'border-ink ring-1 ring-ink' : ''}`}>
                <h2 className="font-semibold">{p.name}</h2>
                <p className="mt-3 text-4xl font-semibold">{p.price}{k === 'growth' && <span className="text-sm font-normal text-ink-500"> per user per month</span>}</p>
                <p className="mt-2 text-sm text-ink-500">{p.blurb}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">{p.features.map(f => <li key={f} className="flex gap-2"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />{f}</li>)}</ul>
                <Link href="/signup" className={`mt-6 ${k === 'growth' ? 'btn-primary' : 'btn-ghost'}`}>Sign up</Link>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-xs text-ink-500">Paid plans activate after payment is confirmed. Admins upgrade from Billing inside the workspace.</p>
      </div>
    </Shell>
  );
}
