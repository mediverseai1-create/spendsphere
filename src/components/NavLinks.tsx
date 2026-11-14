'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavLinks({ items }: { items: [string, string][] }) {
  const path = usePathname();
  return (
    <nav aria-label="App" className="flex gap-1 overflow-x-auto px-2 pb-2 md:block md:space-y-0.5 md:pb-0">
      {items.map(([n, h]) => {
        const active = path === h || path.startsWith(h + '/');
        return <Link key={h} href={h} aria-current={active ? 'page' : undefined} className={`block whitespace-nowrap rounded px-3 py-2 text-sm font-medium ${active ? 'bg-ink text-white' : 'text-ink-700 hover:bg-ink-100'}`}>{n}</Link>;
      })}
    </nav>
  );
}
