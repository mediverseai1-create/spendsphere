import Link from 'next/link';
import { AuthCard } from '@/components/AuthCard';
import { Field } from '@/components/ui';
import { signUp } from '../actions';
export const metadata = { title: 'Create account' };

export default async function Signup({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const sp = await searchParams;
  return (
    <AuthCard title="Create your workspace" sub="Free to start. Invited by a teammate? Use the email they invited." e={sp.e} footer={<>Already have an account? <Link className="font-semibold text-brand" href="/login">Sign in</Link></>}>
      <form action={signUp} className="space-y-4">
        <Field label="Your name"><input className="input" name="name" autoComplete="name" required minLength={2} /></Field>
        <Field label="Company"><input className="input" name="company" autoComplete="organization" required minLength={2} /></Field>
        <Field label="Work email"><input className="input" name="email" type="email" autoComplete="email" required /></Field>
        <Field label="Password (8+ characters)"><input className="input" name="password" type="password" autoComplete="new-password" required minLength={8} /></Field>
        <button className="btn-primary w-full">Create account</button>
      </form>
    </AuthCard>
  );
}
