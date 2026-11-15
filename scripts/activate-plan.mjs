// Usage: node scripts/activate-plan.mjs <buyer-email> <growth|scale|starter>
// Run only after confirming the payment in Selar. Uses the service role key; never expose it.
const [email, plan] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || !email || !['growth', 'scale', 'starter'].includes(plan)) {
  console.error('Usage: node scripts/activate-plan.mjs <buyer-email> <growth|scale|starter> (needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}
const h = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
const users = await (await fetch(`${url}/auth/v1/admin/users?per_page=1000`, { headers: h })).json();
const user = users.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
if (!user) { console.error('No account with that email'); process.exit(1); }
const mem = await (await fetch(`${url}/rest/v1/memberships?user_id=eq.${user.id}&role=eq.admin&select=org_id`, { headers: h })).json();
if (!mem.length) { console.error('That user is not an admin of any workspace'); process.exit(1); }
const res = await fetch(`${url}/rest/v1/organizations?id=eq.${mem[0].org_id}`, { method: 'PATCH', headers: { ...h, Prefer: 'return=representation' }, body: JSON.stringify({ plan, plan_status: 'active' }) });
console.log(res.ok ? `Set workspace ${mem[0].org_id} to ${plan}` : `Failed: ${await res.text()}`);
