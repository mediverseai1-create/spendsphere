import Link from 'next/link';
import { AuthCard } from '@/components/AuthCard';
import { Field } from '@/components/ui';
import { requestReset } from '../actions';
export const metadata = { title: 'Reset password' };

export default async function Forgot({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string }> }) {
  const sp = await searchParams;
  return (
    <AuthCard title="Reset your password" sub="We will email you a reset link." e={sp.e} ok={sp.ok} footer={<Link className="font-semibold text-brand" href="/login">Back to sign in</Link>}>
      <form action={requestReset} className="space-y-4">
        <Field label="Email"><input className="input" name="email" type="email" required /></Field>
        <button className="btn-primary w-full">Send reset link</button>
      </form>
    </AuthCard>
  );
}
