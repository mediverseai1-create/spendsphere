import { getCtx, isManager } from '@/lib/auth';
import { money, CATEGORIES, monthStart } from '@/lib/format';
import { PageHeader, Flash, Empty, Badge, statusTone, label, Field, Bar } from '@/components/ui';
import { createCard, setCardStatus } from '../actions';
import { planFor } from '@/lib/plans';

export const metadata = { title: 'Cards' };
export default async function Cards({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string }> }) {
  const sp = await searchParams;
  const c = await getCtx();
  const mgr = isManager(c);
  const [{ data: cards }, { data: members }, { data: tx }] = await Promise.all([
    c.supabase.from('cards').select('*').order('created_at', { ascending: false }),
    c.supabase.from('memberships').select('user_id, role, profiles(full_name)').eq('org_id', c.orgId),
    c.supabase.from('transactions').select('card_id,amount_cents,occurred_on').neq('status', 'rejected').not('card_id', 'is', null),
  ]);
  const names = new Map((members ?? []).map((m: any) => [m.user_id, m.profiles?.full_name ?? 'Member']));
  const spent = (id: string, period: string) => (tx ?? []).filter(t => t.card_id === id && (period === 'total' || t.occurred_on >= monthStart())).reduce((s, t) => s + Number(t.amount_cents), 0);
  const limit = planFor(c.plan).cards;
  return (
    <>
      <PageHeader title="Cards" desc="Virtual cards with spend limits and category controls. SpendSphere tracks and enforces spend per card. It does not issue payment cards." />
      <Flash e={sp.e} ok={sp.ok} />
      {mgr && (
        <details className="card mb-6 p-5">
          <summary className="cursor-pointer font-semibold">New card{limit !== Infinity && <span className="ml-2 text-xs font-normal text-ink-500">Plan allows {limit}</span>}</summary>
          <form action={createCard} className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Card name"><input className="input" name="name" required minLength={2} maxLength={60} placeholder="Marketing ads" /></Field>
            <Field label="Holder"><select className="input" name="holder_id" required>{(members ?? []).map((m: any) => <option key={m.user_id} value={m.user_id}>{names.get(m.user_id)}</option>)}</select></Field>
            <Field label="Spend limit (USD)"><input className="input" name="limit" inputMode="decimal" required placeholder="5000" /></Field>
            <Field label="Limit period"><select className="input" name="period"><option value="monthly">Per month</option><option value="total">Total</option></select></Field>
            <fieldset className="sm:col-span-2"><legend className="label">Allowed categories (none selected = all)</legend>
              <div className="flex flex-wrap gap-3 text-sm">{CATEGORIES.map(k => <label key={k} className="flex items-center gap-1.5"><input type="checkbox" name="allowed_categories" value={k} />{k}</label>)}</div>
            </fieldset>
            <div className="sm:col-span-2"><button className="btn-primary">Create card</button></div>
          </form>
        </details>
      )}
      {!cards?.length ? <Empty title="No cards yet" desc={mgr ? 'Create a card to start assigning spend limits.' : 'No cards have been assigned to you yet.'} /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map(k => {
            const s = spent(k.id, k.limit_period); const pct = (s / Number(k.spend_limit_cents)) * 100;
            return (
              <div key={k.id} className="card p-5">
                <div className="flex items-start justify-between"><div><p className="font-semibold">{k.name}</p><p className="text-xs text-ink-500">Card ending {k.last4} · {names.get(k.holder_id) ?? 'Member'}</p></div><Badge tone={statusTone(k.status)}>{label(k.status)}</Badge></div>
                <div className="mt-4 flex justify-between text-sm"><span>{money(s)} spent</span><span className="text-ink-500">of {money(k.spend_limit_cents)} {k.limit_period === 'monthly' ? '/ month' : 'total'}</span></div>
                <div className="mt-2"><Bar pct={pct} /></div>
                {k.allowed_categories.length > 0 && <p className="mt-3 text-xs text-ink-500">Allowed: {k.allowed_categories.join(', ')}</p>}
                {mgr && k.status !== 'closed' && (
                  <form action={setCardStatus} className="mt-4 flex gap-2"><input type="hidden" name="id" value={k.id} />
                    <button name="status" value={k.status === 'active' ? 'frozen' : 'active'} className="btn-ghost btn-sm">{k.status === 'active' ? 'Freeze' : 'Unfreeze'}</button>
                    <button name="status" value="closed" className="btn-ghost btn-sm">Close</button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
