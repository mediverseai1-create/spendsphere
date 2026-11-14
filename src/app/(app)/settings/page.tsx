import { getCtx } from '@/lib/auth';
import { CATEGORIES } from '@/lib/format';
import { PageHeader, Flash, Field, UpgradeNote } from '@/components/ui';
import { planFor } from '@/lib/plans';
import { DEFAULT_POLICY } from '@/lib/policy';
import { saveProfile, saveOrg, savePolicy } from '../actions';

export const metadata = { title: 'Settings' };
export default async function Settings({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string }> }) {
  const sp = await searchParams;
  const c = await getCtx();
  const admin = c.role === 'admin';
  const { data: pol } = await c.supabase.from('policies').select('*').eq('org_id', c.orgId).maybeSingle();
  const p = pol ?? { ...DEFAULT_POLICY };
  const d = (v: number | string) => (Number(v) / 100).toString();
  const canPolicy = planFor(c.planStatus === 'canceled' ? 'starter' : c.plan).policies;
  return (
    <>
      <PageHeader title="Settings" />
      <Flash e={sp.e} ok={sp.ok} />
      <div className="max-w-2xl space-y-6">
        <form action={saveProfile} className="card space-y-4 p-5"><h2 className="font-semibold">Your profile</h2>
          <Field label="Name"><input className="input" name="name" defaultValue={c.name} required minLength={2} /></Field>
          <p className="text-sm text-ink-500">Email: {c.email}</p><button className="btn-dark">Save profile</button></form>
        <form action={saveOrg} className="card space-y-4 p-5"><h2 className="font-semibold">Company</h2>
          <Field label="Company name"><input className="input" name="name" defaultValue={c.orgName} required minLength={2} disabled={!admin} /></Field>
          {admin ? <button className="btn-dark">Save company</button> : <p className="text-xs text-ink-500">Only admins can edit company settings.</p>}</form>
        {canPolicy ? (
          <form action={savePolicy} className="card space-y-4 p-5"><h2 className="font-semibold">Spend policy</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Max single transaction (USD)"><input className="input" name="max" defaultValue={d(p.max_single_cents)} disabled={!admin} /></Field>
              <Field label="Receipt required over (USD)"><input className="input" name="receipt" defaultValue={d(p.receipt_over_cents)} disabled={!admin} /></Field>
              <Field label="Approval required over (USD)"><input className="input" name="approval" defaultValue={d(p.approval_over_cents)} disabled={!admin} /></Field>
            </div>
            <fieldset><legend className="label">Blocked categories</legend><div className="flex flex-wrap gap-3 text-sm">{CATEGORIES.map(k => <label key={k} className="flex items-center gap-1.5"><input type="checkbox" name="blocked" value={k} defaultChecked={p.blocked_categories.includes(k)} disabled={!admin} />{k}</label>)}</div></fieldset>
            {admin && <button className="btn-dark">Save policy</button>}</form>
        ) : <UpgradeNote feature="Custom spend policies" />}
      </div>
    </>
  );
}
