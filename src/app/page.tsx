import Link from 'next/link';
import { Shell } from '@/components/Site';

const engine = [
  ['Analyze', 'The AI engine reads every transaction, category and merchant in your workspace and surfaces what changed and why.'],
  ['Forecast', 'Month-end spend is projected from the current run rate and compared with each budget while there is still time to act.'],
  ['Decide', 'Policy rules approve routine spend, block violations and route exceptions to the right approver, with a record of every decision.'],
  ['Automate', 'Receipt checks, duplicate detection and approval routing run on every entry, so finance reviews exceptions, not every line.'],
];
const stages = [
  ['Startups', 'Issue a capped card to every founder, contractor and tool. Control spend from the first dollar, on a free plan.'],
  ['Growing teams', 'Give department heads budgets and let policy clear the routine. Managers see only the exceptions.'],
  ['Finance and operations', 'Work from a single approval queue, trace every decision and get an AI explanation of any unusual month.'],
];
const rows: { title: string; body: string; points: string[] }[] = [
  { title: 'Stop overspend before it posts.', body: 'Every card carries a limit and optional category rules. A charge beyond the limit, or outside the allowed categories, is rejected at entry. Cards freeze in one action when something looks wrong.', points: ['Monthly or lifetime limits per card', 'Allowed categories per card', 'Instant freeze and close'] },
  { title: 'Replace manual review with policy that runs itself.', body: 'Set the maximum purchase, the receipt threshold, blocked categories and the amount that needs sign-off. Compliant spend clears automatically. Missing receipts and duplicate charges are flagged on entry.', points: ['Automatic approval of in-policy spend', 'Receipt and duplicate detection', 'Approval routing by amount'] },
  { title: 'See budget risk before the month closes.', body: 'Budgets track utilisation against every transaction as it is recorded. The forecast shows where run rate will land by month end, so you correct course early.', points: ['Per-category monthly budgets', 'Utilisation updated on every entry', 'Projected month-end spend'] },
  { title: 'Control payables with a complete decision trail.', body: 'Capture vendor invoices, route them for approval, schedule them and record payment. Each step stores who decided and when, so audits take minutes.', points: ['Approval before payment', 'Overdue bills flagged', 'Full decision history'] },
  { title: 'Get answers from the AI engine, not another report.', body: 'Totals and limits are calculated in code, so they are always exact. The AI engine then explains the drivers, flags risk and answers questions, using only those figures.', points: ['Executive summaries on demand', 'Natural-language questions on live data', 'No invented numbers'] },
];
const steps = [
  ['Create your workspace', 'Sign up and invite your team. Starter is free.'],
  ['Issue cards and set policy', 'Assign limits and rules by person, vendor or project.'],
  ['Record spend', 'Every transaction is checked against the card and policy on entry.'],
  ['Act on insight', 'Approve exceptions, review the forecast and query the AI engine.'],
];
const faqs = [
  ['Does SpendSphere issue payment cards or hold funds?', 'No. SpendSphere is the control and record layer for business spend. It does not issue payment cards, hold funds or move money. Marking a bill paid records a payment made through your own bank.'],
  ['What does the AI engine actually do?', 'It analyzes your transactions, budgets and bills, explains the drivers behind your spend and answers questions in plain language. Calculations, limits and approvals are deterministic, so figures are never estimated by a model.'],
  ['Who can see what?', 'Admins manage the workspace. Managers run cards, bills, approvals and budgets. Employees see only their own cards and transactions. Access is enforced in the database through row-level security.'],
  ['What does the free plan include?', 'Starter includes up to 5 cards, 5 team members, receipts, bill approvals and 5 AI analyses per month. Growth ($47 per workspace per month) adds unlimited cards and members, spend policies and live budgets. Scale ($57) raises AI capacity to 1,000 analyses per month and adds priority support.'],
  ['How does upgrading work?', 'Admins upgrade from Billing. A plan is activated only after payment is confirmed, never just because someone returns from checkout.'],
];

export default function Home() {
  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 md:pt-28">
        <p className="mb-5 text-sm font-semibold uppercase tracking-wide text-brand">AI-native spend management</p>
        <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.035em] md:text-7xl">The AI engine that controls company spend.</h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-500">SpendSphere analyzes every transaction, forecasts month-end spend against budget and automates approvals through policy. Finance leaders catch overspend before it closes the books.</p>
        <form action="/signup" className="mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="hero-email">Work email</label>
          <input id="hero-email" name="email" type="email" className="input" placeholder="Work email" />
          <button className="btn-primary whitespace-nowrap">Sign up</button>
        </form>
        <p className="mt-3 text-xs text-ink-500">Free Starter plan. No credit card required.</p>
      </section>

      <section className="border-y border-ink-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm sm:grid-cols-3">
          {[['Exact by design', 'Every total and limit is calculated in code. AI explains, it never estimates.'], ['Isolated by default', 'Row-level security separates every company workspace.'], ['Live in minutes', 'Create a workspace and issue your first card on the free plan.']].map(([t, d]) => <div key={t}><p className="font-semibold">{t}</p><p className="mt-1 text-ink-500">{d}</p></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24">
        <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.03em]">One engine for every spend decision.</h2>
        <p className="mt-3 max-w-2xl text-ink-500">Cards, transactions, budgets and bills run on a single data model. The engine works across all of it, so decisions are made on the full picture.</p>
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-ink-200 bg-ink-200 sm:grid-cols-2">
          {engine.map(([t, d], i) => (
            <div key={t} className="bg-white p-8"><p className="text-sm font-semibold tabular-nums text-brand">0{i + 1}</p><h3 className="mt-3 text-2xl font-semibold tracking-tight">{t}</h3><p className="mt-2 text-ink-500">{d}</p></div>
          ))}
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.03em]">Built for every stage of company growth.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {stages.map(([t, d]) => <div key={t} className="rounded-lg bg-canvas p-8"><h3 className="text-xl font-semibold">{t}</h3><p className="mt-3 text-ink-500">{d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24">
        <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.03em]">Cut review time and control risk across the whole spend lifecycle.</h2>
        <div className="mt-14 space-y-20">
          {rows.map((r, i) => (
            <div key={r.title} className="grid items-center gap-10 md:grid-cols-2">
              <div className={i % 2 ? 'md:order-2' : ''}>
                <h3 className="text-3xl font-semibold leading-tight tracking-[-0.025em]">{r.title}</h3>
                <p className="mt-4 text-ink-500">{r.body}</p>
              </div>
              <ul className={`divide-y divide-ink-200 rounded-lg border border-ink-200 bg-white ${i % 2 ? 'md:order-1' : ''}`}>
                {r.points.map((p, n) => <li key={p} className="flex items-center gap-4 px-6 py-5"><span className="text-sm font-semibold tabular-nums text-brand">0{n + 1}</span><span className="font-medium">{p}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink py-24 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.03em]">From sign-up to full spend control in four steps.</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {steps.map(([t, d], i) => <div key={t} className="border-t border-white/20 pt-5"><p className="text-sm font-semibold text-brand-500">Step {i + 1}</p><h3 className="mt-2 text-xl font-semibold">{t}</h3><p className="mt-2 text-sm text-ink-300">{d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-24">
        <h2 className="text-4xl font-semibold tracking-[-0.03em]">Frequently asked questions</h2>
        <div className="mt-10 divide-y divide-ink-200 border-y border-ink-200">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">{q}<span aria-hidden className="text-xl text-ink-500 group-open:rotate-45">+</span></summary><p className="mt-3 text-ink-500">{a}</p></details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="rounded-xl bg-brand p-10 text-white md:p-16">
          <h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.03em]">Put an AI engine behind every spend decision.</h2>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/signup" className="btn bg-white text-ink hover:bg-ink-100">Sign up</Link><Link href="/login" className="btn border border-white/60 text-white hover:bg-white/10">Sign in</Link></div>
        </div>
      </section>
    </Shell>
  );
}
