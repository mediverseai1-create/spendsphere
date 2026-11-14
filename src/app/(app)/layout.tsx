import Link from 'next/link';
import { getCtx, isManager } from '@/lib/auth';
import { Logo, Badge } from '@/components/ui';
import { NavLinks } from '@/components/NavLinks';
import { signOut } from '../(auth)/actions';
import { planFor } from '@/lib/plans';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const c = await getCtx();
  const mgr = isManager(c);
  const items = [
    ['Dashboard', '/dashboard'], ['Cards', '/cards'], ['Transactions', '/transactions'],
    ...(mgr ? [['Bills', '/bills'], ['Approvals', '/approvals']] : []), ['Budgets', '/budgets'], ['Insights', '/insights'],
    ['Team', '/team'], ['Billing', '/billing'], ['Settings', '/settings'],
  ];
  return (
    <div className="min-h-screen md:grid md:grid-cols-[230px_1fr]">
      <aside className="border-b border-ink-200 bg-white md:min-h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-4 md:block">
          <Link href="/dashboard" aria-label="Dashboard"><Logo /></Link>
          <div className="md:mt-4"><p className="max-w-[180px] truncate text-sm font-semibold">{c.orgName}</p><Badge tone={c.plan === 'starter' ? 'neutral' : 'ok'}>{planFor(c.plan).name}</Badge></div>
        </div>
        <NavLinks items={items as [string, string][]} />
        <div className="hidden border-t border-ink-100 p-4 text-xs md:block">
          <p className="truncate font-medium">{c.name}</p><p className="truncate text-ink-500">{c.email} · {c.role}</p>
          <form action={signOut}><button className="mt-2 font-semibold text-brand underline">Sign out</button></form>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
        {children}
        <form action={signOut} className="mt-10 md:hidden"><button className="btn-ghost w-full">Sign out</button></form>
      </main>
    </div>
  );
}
