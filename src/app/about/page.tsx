import { Shell } from '@/components/Site';
export const metadata = { title: 'About' };
export default function About() {
  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Spend should be fast for people and clear for finance.</h1>
        <div className="mt-6 space-y-4 text-lg text-ink-500">
          <p>Most teams choose between slow approval processes and no control at all. SpendSphere aims for a third option: simple rules applied automatically, with people involved only when something needs judgement.</p>
          <p>We keep arithmetic in code so totals and limits are always exact, and we use AI only to explain results and answer questions.</p>
        </div>
      </div>
    </Shell>
  );
}
