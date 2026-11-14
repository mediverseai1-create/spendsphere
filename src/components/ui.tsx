import Link from 'next/link';
import type { ReactNode } from 'react';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 0A12 12 0 0 0 0 12h12z" fill={light ? '#fff' : '#15191E'} />
        <path d="M12 24a12 12 0 0 0 12-12H12z" fill="#D93A0B" />
        <path d="M12 0v12h12A12 12 0 0 0 12 0z" fill={light ? '#fff' : '#15191E'} opacity=".18" />
        <path d="M0 12h12v12A12 12 0 0 1 0 12z" fill={light ? '#fff' : '#15191E'} opacity=".18" />
      </svg>
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
export function UpgradeNote({ feature }: { feature: string }) {
  return <Empty title={`${feature} is part of the Growth plan`} desc="Upgrade to unlock it for your whole team."><Link href="/billing" className="btn-primary">View plans</Link></Empty>;
}
