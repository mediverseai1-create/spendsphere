import Link from 'next/link';
import { Logo } from './ui';

const nav = [['Product', '/product'], ['Solutions', '/solutions'], ['Pricing', '/pricing'], ['About', '/about'], ['Contact', '/contact']];
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/70 bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label="SpendSphere home"><Logo /></Link>
        <nav className="hidden gap-7 text-sm font-medium md:flex" aria-label="Main">
          {nav.map(([n, h]) => <Link key={h} href={h} className="text-ink-700 hover:text-ink">{n}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden px-3 py-2 text-sm font-medium sm:block">Sign in</Link>
          <Link href="/signup" className="btn-primary">Get started</Link>
        </div>
      </div>
      <nav className="flex justify-center gap-5 border-t border-ink-200/70 py-2 text-xs font-medium md:hidden" aria-label="Mobile">
        {nav.map(([n, h]) => <Link key={h} href={h}>{n}</Link>)}
      </nav>
    </header>
  );
}
export function SiteFooter() {
  const cols: [string, string[][]][] = [
    ['Product', [['Cards', '/product'], ['Budgets', '/product'], ['Bill pay', '/product']]],
    ['Company', [['About', '/about'], ['Contact', '/contact'], ['Pricing', '/pricing']]],
    ['Get started', [['Create account', '/signup'], ['Sign in', '/login']]],
  ];
  return (
    <footer className="mt-24 bg-ink py-12 text-sm text-ink-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-4">
        <div><Logo light /><p className="mt-3 max-w-xs">Spend control for teams that move fast. SpendSphere is a spend management and ledger tool. It does not hold funds or issue payment cards.</p></div>
        {cols.map(([t, links]) => (
          <div key={t}><p className="mb-3 font-semibold text-white">{t}</p><ul className="space-y-2">{links.map(([n, h]) => <li key={n}><Link href={h} className="hover:text-white">{n}</Link></li>)}</ul></div>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-6xl px-4 text-xs">© {new Date().getFullYear()} SpendSphere. All rights reserved.</p>
    </footer>
  );
}
export function Shell({ children }: { children: React.ReactNode }) {
  return <><SiteHeader />{children}<SiteFooter /></>;
}
