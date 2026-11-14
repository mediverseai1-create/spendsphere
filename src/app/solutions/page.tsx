import { Shell } from '@/components/Site';
import Link from 'next/link';
export const metadata = { title: 'Solutions' };
const s = [
  ['Startups', 'Give every founder, contractor and tool its own capped card. Stay on the free plan until you need policies.', 'Cards, receipts, bill approvals'],
  ['Growing teams', 'Hand department heads budgets and let policy rules approve the routine so managers only see exceptions.', 'Policies, live budgets, approvals'],
  ['Finance and operations', 'Review a single queue, trace every approval, and ask AI to explain unusual months.', 'Approvals, audit trail, insights'],
];
export default function Solutions() {
  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Solutions for every stage.</h1>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {s.map(([t, d, m]) => <div key={t} className="card flex flex-col p-6"><h2 className="text-lg font-semibold">{t}</h2><p className="mt-2 flex-1 text-sm text-ink-500">{d}</p><p className="mt-4 text-xs font-semibold text-brand">{m}</p></div>)}
        </div>
        <Link href="/signup" className="btn-primary mt-10">Get started</Link>
      </div>
    </Shell>
  );
}
