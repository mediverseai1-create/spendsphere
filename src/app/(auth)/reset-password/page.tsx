import { AuthCard } from '@/components/AuthCard';
import { Field } from '@/components/ui';
import { updatePassword } from '../actions';
export const metadata = { title: 'New password' };

export default async function Reset({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const sp = await searchParams;
  return (
    <AuthCard title="Choose a new password" e={sp.e}>
      <form action={updatePassword} className="space-y-4">
        <Field label="New password (8+ characters)"><input className="input" name="password" type="password" autoComplete="new-password" required minLength={8} /></Field>
        <button className="btn-primary w-full">Update password</button>
      </form>
    </AuthCard>
  );
}
