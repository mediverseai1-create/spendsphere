import Link from 'next/link';
import { Logo, Flash } from './ui';

export function AuthCard({ title, sub, e, ok, children, footer }: { title: string; sub?: string; e?: string; ok?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block" aria-label="SpendSphere home"><Logo /></Link>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-ink-500">{sub}</p>}
        <div className="mt-6"><Flash e={e} ok={ok} />{children}</div>
        {footer && <p className="mt-6 text-sm text-ink-500">{footer}</p>}
      </div>
    </main>
  );
}
