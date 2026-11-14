import { Shell } from '@/components/Site';
import Link from 'next/link';
export const metadata = { title: 'Product' };
const sections = [
  ['Cards', 'Issue virtual cards by person, vendor or project. Each carries a spend limit, optional category restrictions and a status that finance can freeze instantly. Charges are checked against the limit on entry.'],
  ['Transactions and receipts', 'Record card spend and reimbursements, attach receipts to private storage and categorize every line. Duplicates and missing receipts are flagged automatically.'],
  ['Policies and approvals', 'Define the maximum purchase, receipt threshold, blocked categories and approval amount. Compliant spend clears on its own. Exceptions route to a manager with a recorded decision.'],
  ['Live budgets and forecast', 'Set monthly budgets by category. Utilisation updates with every transaction, and the forecast projects month-end spend from the current run rate.'],
  ['Bill pay', 'Capture vendor invoices, approve them, schedule them and record payment, with a decision history for every bill.'],
  ['AI engine', 'Totals, limits and flags are calculated in code. The AI engine analyzes them, explains the drivers behind spend and answers questions on your live data, using only those figures.'],
];
export default function Product() {
  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">One platform. One engine. Every spend decision.</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-500">Six connected modules share one data model, so a card, its transactions, its budget and its approvals always agree, and the AI engine sees all of it.</p>
        <div className="mt-12 divide-y divide-ink-200">
          {sections.map(([t, d]) => <div key={t} className="grid gap-2 py-7 md:grid-cols-[220px_1fr]"><h2 className="font-semibold">{t}</h2><p className="text-ink-500">{d}</p></div>)}
        </div>
        <div className="card mt-8 p-6 text-sm text-ink-700"><strong>Scope:</strong> SpendSphere is the control and record layer for business spend. It does not issue payment cards, hold funds or move money.</div>
        <Link href="/signup" className="btn-primary mt-8">Sign up</Link>
      </div>
    </Shell>
  );
}
