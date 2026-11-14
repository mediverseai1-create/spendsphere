import Link from 'next/link';
import { Shell } from '@/components/Site';

const tiles = [
  ['Cards', 'Virtual cards per person, vendor or project, each with its own limit and category rules.'],
  ['Transactions', 'Every charge and reimbursement logged, categorised and checked against policy.'],
  ['Policies', 'Caps, receipt rules and approval thresholds that apply automatically.'],
  ['Budgets', 'Monthly limits per category, tracked as spend is recorded.'],
  ['Bill pay', 'Vendor invoices routed through approval to paid, with a record of who decided.'],
  ['Insights', 'Plain-English explanations of your numbers, grounded in calculated figures.'],
];
const stages = [
  ['Startups', 'Give every founder, contractor and tool its own capped card. Stay on the free plan until you need policies.'],
  ['Growing teams', 'Hand department heads budgets and let policy rules clear the routine so managers only see exceptions.'],
  ['Finance and operations', 'Work from one approval queue, trace every decision and ask for an explanation of any unusual month.'],
];
const rows: { title: string; body: string; points: string[]; href: string }[] = [
  { title: 'Cards with limits that actually hold.', body: 'Create a card in seconds, set how much it can spend and on what. Freeze it the moment something looks wrong. Anything beyond the limit or outside the allowed categories is blocked at entry, not discovered at month end.', points: ['Monthly or lifetime limits', 'Allowed categories per card', 'One-click freeze and close'], href: '/product' },
  { title: 'Policy that runs itself.', body: 'Set the rules once: maximum single purchase, when a receipt is required, which categories are off limits and the amount that needs sign-off. Routine spend clears automatically. Exceptions go to a person.', points: ['Missing receipts flagged', 'Duplicate charges flagged', 'Approval threshold by amount'], href: '/product' },
  { title: 'Budgets that update as you spend.', body: 'Give each category a monthly limit and watch utilisation move with every transaction. Over-budget categories are obvious at a glance, while there is still time to act.', points: ['Per-category monthly limits', 'Utilisation always current', 'Visible to the whole team'], href: '/product' },
  { title: 'Bills from invoice to paid.', body: 'Record a vendor invoice, send it for approval, schedule it and mark it paid. Each step records who made the decision and when, so the trail is there when you need it.', points: ['Approval before payment', 'Overdue bills highlighted', 'Full decision history'], href: '/product' },
  { title: 'Answers, not just totals.', body: 'Totals and limits are calculated in code so they are always exact. AI then explains what they mean and answers questions about your month, using only those figures.', points: ['Summaries in plain English', 'Ask questions about your data', 'Never invents numbers'], href: '/product' },
];
const steps = [
  ['Set up', 'Create your workspace and invite your team. Starter is free.'],
  ['Issue cards', 'Assign a card and a limit to each person, vendor or project.'],
  ['Spend', 'Transactions are checked against the card and your policy as they are recorded.'],
  ['Review', 'Approve exceptions, watch budgets and ask for insights.'],
];
const faqs = [
  ['Does SpendSphere issue real payment cards or hold money?', 'No. SpendSphere is the control and record layer for spend. It does not issue payment cards, hold funds or move money. Marking a bill paid records the payment you made elsewhere.'],
  ['How does the free plan work?', 'Starter is free with up to 5 cards and 5 team members. Growth adds unlimited cards and members, spend policies and live budgets.'],
  ['Who can see what?', 'Admins manage everything. Managers handle cards, bills, approvals and budgets. Employees see only their own cards and transactions. This is enforced in the database, not just the interface.'],
  ['Can AI change my numbers?', 'No. All totals, limits and flags are calculated by the application. AI only explains them and is told to use nothing else.'],
  ['How do I upgrade?', 'From Billing inside your workspace. Your plan changes only after your payment is confirmed.'],
];

export default function Home() {
  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 md:pt-28">
        <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.035em] md:text-7xl">Spend control built for speed and clarity.</h1>
        <p className="mt-6 max-w-xl text-lg text-ink-500">Cards, policies, budgets and bill approvals in one workspace, so your team can spend quickly and finance can see everything.</p>
        <form action="/signup" className="mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="hero-email">Work email</label>
          <input id="hero-email" name="email" type="email" className="input" placeholder="Work email" />
          <button className="btn-primary whitespace-nowrap">Get started</button>
        </form>
        <p className="mt-3 text-xs text-ink-500">Free Starter plan. No credit card required.</p>
      </section>

      <section className="border-y border-ink-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm sm:grid-cols-3">
          {[['Totals calculated in code', 'Every figure is exact. AI only explains.'], ['Row-level security', 'Each team sees only its own data.'], ['Free to start', 'Upgrade only when you need more.']].map(([t, d]) => <div key={t}><p className="font-semibold">{t}</p><p className="mt-1 text-ink-500">{d}</p></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.03em]">The card is just the start.</h2>
        <p className="mt-3 max-w-xl text-ink-500">Six connected modules share one set of data, so a card, its transactions, its budget and its approvals always agree.</p>
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map(([t, d]) => (
            <Link key={t} href="/product" className="group bg-white p-7 transition-colors hover:bg-canvas">
              <h3 className="text-lg font-semibold">{t}</h3><p className="mt-2 text-sm text-ink-500">{d}</p>
              <span className="mt-6 inline-block text-sm font-semibold text-brand">Learn more →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.03em]">Solutions for every stage of growth.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {stages.map(([t, d]) => <div key={t} className="flex flex-col rounded-lg bg-canvas p-8"><h3 className="text-xl font-semibold">{t}</h3><p className="mt-3 flex-1 text-ink-500">{d}</p><Link href="/solutions" className="mt-8 text-sm font-semibold text-brand">Learn more →</Link></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.03em]">Run your spend operations with less effort.</h2>
        <div className="mt-14 space-y-20">
          {rows.map((r, i) => (
            <div key={r.title} className="grid items-center gap-10 md:grid-cols-2">
              <div className={i % 2 ? 'md:order-2' : ''}>
                <h3 className="text-3xl font-semibold leading-tight tracking-[-0.025em]">{r.title}</h3>
                <p className="mt-4 text-ink-500">{r.body}</p>
                <Link href={r.href} className="mt-6 inline-block text-sm font-semibold text-brand">Explore the product →</Link>
              </div>
              <ul className={`divide-y divide-ink-200 rounded-lg border border-ink-200 bg-white ${i % 2 ? 'md:order-1' : ''}`}>
                {r.points.map((p, n) => <li key={p} className="flex items-center gap-4 px-6 py-5"><span className="text-sm font-semibold text-brand tabular-nums">0{n + 1}</span><span className="font-medium">{p}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink py-24 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.03em]">Up and running in an afternoon.</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {steps.map(([t, d], i) => <div key={t} className="border-t border-white/20 pt-5"><p className="text-sm font-semibold text-brand-500">Step {i + 1}</p><h3 className="mt-2 text-xl font-semibold">{t}</h3><p className="mt-2 text-sm text-ink-300">{d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-24">
        <h2 className="text-4xl font-semibold tracking-[-0.03em]">Questions, answered.</h2>
        <div className="mt-10 divide-y divide-ink-200 border-y border-ink-200">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">{q}<span aria-hidden className="text-xl text-ink-500 group-open:rotate-45">+</span></summary><p className="mt-3 text-ink-500">{a}</p></details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="rounded-xl bg-brand p-10 text-white md:p-16">
          <h2 className="max-w-xl text-4xl font-semibold tracking-[-0.03em]">See what SpendSphere can do for your team.</h2>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/signup" className="btn bg-white text-ink hover:bg-ink-100">Get started</Link><Link href="/pricing" className="btn border border-white/60 text-white hover:bg-white/10">View pricing</Link></div>
        </div>
      </section>
    </Shell>
  );
}
