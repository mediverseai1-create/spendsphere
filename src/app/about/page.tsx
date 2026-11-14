import { Shell } from '@/components/Site';
import Link from 'next/link';
export const metadata = { title: 'About' };
export default function About() {
  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Company spend should be fast for teams and fully visible to finance.</h1>
        <div className="mt-6 space-y-4 text-lg text-ink-500">
          <p>Most companies choose between slow approval chains and no control at all. SpendSphere removes the trade-off. Policy rules handle routine spend automatically, and people are involved only where judgement is needed.</p>
          <p>We hold one principle above the rest: arithmetic belongs in code. Totals, limits and flags are calculated exactly. The AI engine analyzes and explains those results, and never invents them.</p>
        </div>
        <Link href="/signup" className="btn-primary mt-8">Sign up</Link>
      </div>
    </Shell>
  );
}
