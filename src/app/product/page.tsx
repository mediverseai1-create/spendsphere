import { Shell } from '@/components/Site';
import Link from 'next/link';
export const metadata = { title: 'Product' };
const sections = [
  ['Cards', 'Create virtual cards for people, vendors or projects. Each card has a spend limit, optional category restrictions and a status you can freeze at any time. Transactions logged against a card are checked against its limit.'],
  ['Transactions and receipts', 'Log card and out-of-pocket spend, attach receipts to private storage, and categorise everything. Duplicates and missing receipts are flagged automatically.'],
  ['Policies and approvals', 'Define maximum amounts, receipt requirements, blocked categories and the amount above which approval is needed. Out-of-policy spend lands in the approvals queue.'],
  ['Live budgets', 'Set a budget per category and watch utilisation update as transactions arrive.'],
  ['Bill pay', 'Record vendor invoices, approve them, schedule them and mark them paid, with a record of who approved each step.'],
  ['AI insights', 'Spend totals, budget status and anomalies are calculated in code. AI then explains them in plain language and answers questions about your data.'],
];
export default function Product() {
  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">One platform for controlled spend.</h1>
        <p className="mt-4 max-w-xl text-lg text-ink-500">Six connected modules share one set of data, so a card, its transactions, its budget and its approvals always agree.</p>
        <div className="mt-12 divide-y divide-ink-200">
          {sections.map(([t, d]) => <div key={t} className="grid gap-2 py-7 md:grid-cols-[220px_1fr]"><h2 className="font-semibold">{t}</h2><p className="text-ink-500">{d}</p></div>)}
        </div>
        <div className="card mt-8 p-6 text-sm text-ink-700"><strong>What SpendSphere is not:</strong> it does not issue payment cards, hold funds or move money. It is the control and record layer for your spend.</div>
        <Link href="/signup" className="btn-primary mt-8">Start free</Link>
      </div>
    </Shell>
  );
}
