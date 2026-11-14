import { getCtx } from '@/lib/auth';
import { PageHeader, Flash, Field, Badge } from '@/components/ui';
import { inviteMember, changeRole, removeMember } from '../actions';

export const metadata = { title: 'Team' };
export default async function Team({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string }> }) {
  const sp = await searchParams;
  const c = await getCtx();
  const admin = c.role === 'admin';
  const [{ data: members }, { data: invites }] = await Promise.all([
    c.supabase.from('memberships').select('user_id, role, profiles(full_name)').eq('org_id', c.orgId),
    admin ? c.supabase.from('invitations').select('email,role').eq('org_id', c.orgId) : Promise.resolve({ data: [] as any[] }),
  ]);
  return (
    <>
      <PageHeader title="Team" desc="Admins manage everything. Managers handle cards, bills and approvals. Employees see only their own cards and transactions." />
      <Flash e={sp.e} ok={sp.ok} />
      {admin && (
        <form action={inviteMember} className="card mb-6 grid gap-4 p-5 sm:grid-cols-[1fr_160px_auto] sm:items-end">
          <Field label="Invite by email"><input className="input" type="email" name="email" required /></Field>
          <Field label="Role"><select className="input" name="role" defaultValue="employee"><option value="employee">Employee</option><option value="manager">Manager</option><option value="admin">Admin</option></select></Field>
          <button className="btn-primary">Invite</button>
        </form>
      )}
      <div className="card divide-y divide-ink-100">
        {(members ?? []).map((m: any) => (
          <div key={m.user_id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <span className="font-medium">{m.profiles?.full_name ?? 'Member'}{m.user_id === c.userId && <span className="ml-2 text-xs text-ink-500">(you)</span>}</span>
            {admin && m.user_id !== c.userId ? (
              <span className="flex items-center gap-2">
                <form action={changeRole} className="flex gap-2"><input type="hidden" name="user_id" value={m.user_id} />
                  <select name="role" defaultValue={m.role} className="input !w-auto !py-1.5" aria-label="Role"><option value="employee">Employee</option><option value="manager">Manager</option><option value="admin">Admin</option></select>
                  <button className="btn-ghost btn-sm">Save</button></form>
                <form action={removeMember}><input type="hidden" name="user_id" value={m.user_id} /><button className="btn-ghost btn-sm">Remove</button></form>
              </span>
            ) : <Badge>{m.role}</Badge>}
          </div>))}
        {(invites ?? []).map((i: any) => <div key={i.email} className="flex justify-between p-4 text-sm"><span>{i.email}</span><Badge tone="warn">Invited · {i.role}</Badge></div>)}
      </div>
    </>
  );
}
