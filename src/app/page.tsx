import Link from 'next/link';
import { Shell } from '@/components/Site';
import { Bar, Badge } from '@/components/ui';

const modules = [
  ['Virtual cards', 'Issue cards per person, vendor or project with limits and category rules, and freeze them in one click.'],
  ['Spend policies', 'Set caps, receipt rules and approval thresholds once. Every transaction is checked automatically.'],
  ['Live budgets', 'Track each budget against real spend as it happens, not at month end.'],
  ['Bill pay', 'Capture invoices, route them for approval and track them through to paid.'],
  ['Approvals', 'One queue for out-of-policy transactions and bills, with a clear audit trail.'],
  ['AI insights', 'Plain-English explanations of where money went and what needs attention, built on calculated figures.'],
];
const demo: [string, number, number][] = [['Software', 8200, 10000], ['Travel', 4100, 12000], ['Advertising', 9400, 10000]];

export default function Home() {
  return (
    <Shell>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-16 md:grid-cols-2 md:pt-24">
        <div>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">Know where every dollar goes, before it goes.</h1>
          <p className="mt-6 max-w-md text-lg text-ink-500">SpendSphere gives finance teams cards, policies, budgets and bill approvals in one workspace, so spend stays fast for employees and controlled for you.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary">Start free</Link>
            <Link href="/product" className="btn-ghost">See how it works</Link>
          </div>
          <p className="mt-4 text-xs text-ink-500">Free Starter plan. No credit card required.</p>
        </div>
        <div className="card p-5 shadow-sm" aria-label="Example budget view">
          <div className="flex items-center justify-between"><p className="font-semibold">Budgets this month</p><Badge tone="warn">1 near limit</Badge></div>
          {demo.map(([n, s, l]) => (
            <div key={n} className="mt-5"><div className="mb-1 flex justify-between text-sm"><span>{n}</span><span className="tabular-nums text-ink-500">${s.toLocaleString()} / ${l.toLocaleString()}</span></div><Bar pct={(s / l) * 100} /></div>
          ))}
          <p className="mt-5 border-t border-ink-100 pt-3 text-xs text-ink-500">Illustrative example data.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="max-w-xl text-3xl font-semibold tracking-tight">Everything spend, one workspace.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(([t, d]) => <div key={t} className="card p-6"><h3 className="font-semibold">{t}</h3><p className="mt-2 text-sm text-ink-500">{d}</p></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-xl bg-ink p-10 text-white md:p-14">
          <h2 className="max-w-lg text-3xl font-semibold tracking-tight">Built for the stage you are at.</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[['Startups', 'Get cards and approvals running in an afternoon.'], ['Growing teams', 'Add budgets and policies as departments appear.'], ['Finance leaders', 'Keep a clean audit trail and AI-assisted review.']].map(([t, d]) => <div key={t}><p className="font-semibold">{t}</p><p className="mt-1 text-sm text-ink-300">{d}</p></div>)}
          </div>
          <Link href="/signup" className="btn-primary mt-8">Create your workspace</Link>
        </div>
      </section>
    </Shell>
  );
}
