import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Role = 'admin' | 'manager' | 'employee';
export type Ctx = { supabase: Awaited<ReturnType<typeof createClient>>; userId: string; email: string; name: string; orgId: string; orgName: string; role: Role; plan: string; planStatus: string };

/** Resolve the signed-in user's organisation. Redirects to /login when unauthenticated. */
export async function getCtx(): Promise<Ctx> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: m } = await supabase.from('memberships').select('role, organizations(id,name,plan,plan_status)').eq('user_id', user.id).limit(1).maybeSingle();
  const org = (m as any)?.organizations;
  if (!m || !org) redirect('/login?e=No+organisation+found+for+this+account');
  const { data: p } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
  return { supabase, userId: user.id, email: user.email ?? '', name: p?.full_name ?? user.email ?? '', orgId: org.id, orgName: org.name, role: m.role as Role, plan: org.plan, planStatus: org.plan_status };
}
export const isManager = (c: Ctx) => c.role === 'admin' || c.role === 'manager';
export function requireManager(c: Ctx) { if (!isManager(c)) throw new Error('Only managers and admins can do that'); }
