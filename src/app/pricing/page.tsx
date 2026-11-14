import Link from 'next/link';
import { Shell } from '@/components/Site';
import { PLANS, type PlanId } from '@/lib/plans';
export const metadata = { title: 'Pricing' };
export default function Pricing() {
  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Simple pricing that scales with your team.</h1>
        <p className="mt-3 text-ink-500">Start free. Upgrade when you need policies and live budgets.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {(Object.keys(PLANS) as PlanId[]).map(k => {
            const p = PLANS[k];
            return (
              <div key={k} className={`card flex flex-col p-6 ${k === 'growth' ? 'border-ink ring-1 ring-ink' : ''}`}>
                <h2 className="font-semibold">{p.name}</h2>
                <p className="mt-3 text-4xl font-semibold">{p.price}{k === 'growth' && <span className="text-sm font-normal text-ink-500"> / user / month</span>}</p>
                <p className="mt-2 text-sm text-ink-500">{p.blurb}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">{p.features.map(f => <li key={f}>✓ {f}</li>)}</ul>
                {k === 'starter' && <Link href="/signup" className="btn-ghost mt-6">Start free</Link>}
                {k === 'growth' && <Link href="/signup" className="btn-primary mt-6">Start, upgrade anytime</Link>}
                {k === 'enterprise' && <Link href="/contact" className="btn-ghost mt-6">Contact us</Link>}
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-xs text-ink-500">Paid plans are activated after your payment is confirmed. Upgrade from Billing inside your workspace.</p>
      </div>
    </Shell>
  );
}
