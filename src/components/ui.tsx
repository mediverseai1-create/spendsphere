import Link from 'next/link';
import type { ReactNode } from 'react';

export function LogoMark({ size = 26, light = false }: { size?: number; light?: boolean }) {
  const ink = light ? '#FFFFFF' : '#15191E';
  const s = 'M16 5.2C16 2.6 13.4 1.6 10 1.6S4 3.1 4 5.4 6.6 8.7 10 8.4s6 .9 6 3.6S13.4 14.6 10 14.6 4 13.4 4 11';
  return (
    <svg width={size * 0.8} height={size} viewBox="0 0 20 28" fill="none" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
      <path d={s} stroke={ink} transform="translate(0 -.2)" />
      <path d={s} stroke="#D93A0B" transform="translate(0 12.4)" />
      <rect x="16.4" y="0.4" width="3.2" height="3.2" fill="#D93A0B" stroke="none" />
    </svg>
  );
}
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <LogoMark light={light} />
      <span className={light ? 'text-white' : 'text-ink'}>SpendSphere</span>
    </span>
  );
}
export function Flash({ e, ok }: { e?: string; ok?: string }) {
  if (!e && !ok) return null;
  return <div role={e ? 'alert' : 'status'} className={`mb-4 rounded border px-4 py-3 text-sm ${e ? 'border-bad/30 bg-red-50 text-bad' : 'border-ok/30 bg-green-50 text-ok'}`}>{e || ok}</div>;
}
export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1>{desc && <p className="mt-1 text-sm text-ink-500">{desc}</p>}</div>
      {action}
    </div>
  );
}
const tones: Record<string, string> = {
  ok: 'bg-green-50 text-ok', warn: 'bg-amber-50 text-warn', bad: 'bg-red-50 text-bad', neutral: 'bg-ink-100 text-ink-700',
};
export function Badge({ tone = 'neutral', children }: { tone?: 'ok' | 'warn' | 'bad' | 'neutral'; children: ReactNode }) {
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
export const statusTone = (s: string) => (['approved', 'active', 'paid'].includes(s) ? 'ok' : ['pending_approval', 'scheduled', 'frozen'].includes(s) ? 'warn' : ['rejected', 'closed'].includes(s) ? 'bad' : 'neutral') as 'ok' | 'warn' | 'bad' | 'neutral';
export const label = (s: string) => s.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
export function Field({ label: l, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="label">{l}</span>{children}</label>;
}
export function Empty({ title, desc, children }: { title: string; desc: string; children?: ReactNode }) {
  return <div className="card px-6 py-12 text-center"><p className="font-semibold">{title}</p><p className="mx-auto mt-1 max-w-md text-sm text-ink-500">{desc}</p>{children && <div className="mt-4">{children}</div>}</div>;
}
export function Stat({ label: l, value, sub }: { label: string; value: string; sub?: string }) {
  return <div className="card p-5"><p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{l}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>{sub && <p className="mt-1 text-xs text-ink-500">{sub}</p>}</div>;
}
export function Bar({ pct }: { pct: number }) {
  const p = Math.min(100, Math.max(0, pct));
  return <div className="h-2 w-full rounded-full bg-ink-100" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}><div className={`h-2 rounded-full ${pct > 100 ? 'bg-bad' : pct > 80 ? 'bg-warn' : 'bg-ok'}`} style={{ width: `${p}%` }} /></div>;
}
export function UpgradeNote({ feature, plan = 'Growth' }: { feature: string; plan?: string }) {
  return <Empty title={`${feature} is included in ${plan}`} desc="Upgrade the workspace to enable it for every team member."><Link href="/billing" className="btn-primary">Go to Billing</Link></Empty>;
}
