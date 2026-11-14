import { Shell } from '@/components/Site';
import Link from 'next/link';
export const metadata = { title: 'Solutions' };
const s = [
  ['Startups', 'Issue a capped card to every founder, contractor and tool from day one. Keep spend visible and bounded without adding finance headcount.', 'Cards, receipts, bill approvals'],
  ['Growing teams', 'Hand department heads budgets and let policy clear routine spend. Managers review exceptions only, and the forecast shows overruns early.', 'Policies, live budgets, forecast'],
  ['Finance and operations', 'Run every approval from one queue, trace each decision and ask the AI engine to explain any unusual month.', 'Approvals, audit trail, AI analysis'],
];
export default function Solutions() {
  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Spend control for every stage of growth.</h1>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {s.map(([t, d, m]) => <div key={t} className="card flex flex-col p-6"><h2 className="text-lg font-semibold">{t}</h2><p className="mt-2 flex-1 text-sm text-ink-500">{d}</p><p className="mt-4 text-xs font-semibold text-brand">{m}</p></div>)}
        </div>
        <Link href="/signup" className="btn-primary mt-10">Sign up</Link>
      </div>
    </Shell>
  );
}
