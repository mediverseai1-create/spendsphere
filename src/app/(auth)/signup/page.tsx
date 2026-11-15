import Link from 'next/link';
import { AuthCard } from '@/components/AuthCard';
import { Field } from '@/components/ui';
import { signUp } from '../actions';
export const metadata = { title: 'Create account' };

export default async function Signup({ searchParams }: { searchParams: Promise<{ e?: string; email?: string; plan?: string }> }) {
  const sp = await searchParams;
  return (
    <AuthCard title="Create your workspace" sub="Free Starter plan. If your company has invited you, sign up with the invited email to join its workspace." e={sp.e} footer={<>Already have an account? <Link className="font-semibold text-brand" href="/login">Sign in</Link></>}>
      <form action={signUp} className="space-y-4">
        <input type="hidden" name="plan" value={sp.plan ?? ''} />
        <Field label="Your name"><input className="input" name="name" autoComplete="name" required minLength={2} /></Field>
        <Field label="Company"><input className="input" name="company" autoComplete="organization" required minLength={2} /></Field>
        <Field label="Work email"><input className="input" name="email" type="email" autoComplete="email" defaultValue={sp.email} required /></Field>
        <Field label="Password (8+ characters)"><input className="input" name="password" type="password" autoComplete="new-password" required minLength={8} /></Field>
        <button className="btn-primary w-full">Create account</button>
      </form>
    </AuthCard>
  );
}
