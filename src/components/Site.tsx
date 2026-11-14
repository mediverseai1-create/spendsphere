import Link from 'next/link';
import { Logo } from './ui';

const nav = [['Product', '/product'], ['Solutions', '/solutions'], ['Pricing', '/pricing'], ['About', '/about']];
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/70 bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label="SpendSphere home"><Logo /></Link>
        <nav className="hidden gap-7 text-sm font-medium md:flex" aria-label="Main">
          {nav.map(([n, h]) => <Link key={h} href={h} className="text-ink-700 hover:text-ink">{n}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="px-3 py-2 text-sm font-medium">Sign in</Link>
          <Link href="/signup" className="btn-primary">Sign up</Link>
        </div>
      </div>
      <nav className="flex justify-center gap-6 border-t border-ink-200/70 py-2 text-xs font-medium md:hidden" aria-label="Mobile">
        {nav.map(([n, h]) => <Link key={h} href={h}>{n}</Link>)}
      </nav>
    </header>
  );
}
export function SiteFooter() {
  const links = [...nav, ['Sign in', '/login'], ['Sign up', '/signup']];
  return (
    <footer className="mt-24 bg-ink py-12 text-sm text-ink-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm"><Logo light /><p className="mt-3">The AI-native spend platform for finance teams. SpendSphere is a spend control and record layer. It does not hold funds or issue payment cards.</p></div>
        <ul className="flex flex-wrap gap-x-8 gap-y-3 md:max-w-xs md:justify-end">
          {links.map(([n, h]) => <li key={h}><Link href={h} className="hover:text-white">{n}</Link></li>)}
        </ul>
      </div>
      <p className="mx-auto mt-10 max-w-6xl px-4 text-xs">&copy; {new Date().getFullYear()} SpendSphere. All rights reserved.</p>
    </footer>
  );
}
export function Shell({ children }: { children: React.ReactNode }) {
  return <><SiteHeader />{children}<SiteFooter /></>;
}
