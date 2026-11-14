import Link from 'next/link';
import { AuthCard } from '@/components/AuthCard';
import { Field } from '@/components/ui';
import { signIn } from '../actions';
export const metadata = { title: 'Sign in' };

export default async function Login({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string; next?: string }> }) {
  const sp = await searchParams;
  return (
    <AuthCard title="Sign in" e={sp.e} ok={sp.ok} footer={<>New to SpendSphere? <Link className="font-semibold text-brand" href="/signup">Create an account</Link></>}>
      <form action={signIn} className="space-y-4">
        <input type="hidden" name="next" value={sp.next ?? ''} />
        <Field label="Work email"><input className="input" name="email" type="email" autoComplete="email" required /></Field>
        <Field label="Password"><input className="input" name="password" type="password" autoComplete="current-password" required /></Field>
        <button className="btn-primary w-full">Sign in</button>
        <Link href="/forgot-password" className="block text-center text-sm text-ink-500 underline">Forgot password?</Link>
      </form>
    </AuthCard>
  );
}
