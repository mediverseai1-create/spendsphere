import { redirect } from 'next/navigation';
import { getCtx, isManager } from '@/lib/auth';
import { money, dateFmt } from '@/lib/format';
import { PageHeader, Flash, Empty, Badge } from '@/components/ui';
import { reviewItem } from '../actions';

export const metadata = { title: 'Approvals' };
function Decide({ kind, id }: { kind: string; id: string }) {
  return (
    <form action={reviewItem} className="flex gap-2"><input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={id} />
      <button name="decision" value="approve" className="btn-dark btn-sm">Approve</button>
      <button name="decision" value="reject" className="btn-ghost btn-sm">Reject</button>
    </form>
  );
}
export default async function Approvals({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string }> }) {
  const sp = await searchParams;
  const c = await getCtx();
  if (!isManager(c)) redirect('/dashboard');
  const [{ data: tx }, { data: bills }] = await Promise.all([
    c.supabase.from('transactions').select('id,merchant,category,amount_cents,occurred_on,flags,memo').eq('status', 'pending_approval').order('occurred_on'),
    c.supabase.from('bills').select('id,vendor,invoice_number,amount_cents,due_date').eq('status', 'pending_approval').order('due_date'),
  ]);
  const none = !tx?.length && !bills?.length;
  return (
    <>
      <PageHeader title="Approvals" desc="Everything waiting on a decision. Each decision records who made it." />
      <Flash e={sp.e} ok={sp.ok} />
      {none ? <Empty title="You are all caught up" desc="Transactions above your approval threshold and new bills will appear here." /> : (
        <div className="space-y-3">
          {tx?.map(t => (
            <div key={t.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div><p className="font-medium">{t.merchant} <span className="tabular-nums">{money(t.amount_cents)}</span></p><p className="text-xs text-ink-500">Transaction · {t.category} · {dateFmt(t.occurred_on)}{t.memo ? ` · ${t.memo}` : ''}</p>
                <div className="mt-1 flex gap-1">{t.flags?.map((f: string) => <Badge key={f} tone="warn">{f}</Badge>)}</div></div>
              <Decide kind="transaction" id={t.id} />
            </div>))}
          {bills?.map(b => (
            <div key={b.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div><p className="font-medium">{b.vendor} <span className="tabular-nums">{money(b.amount_cents)}</span></p><p className="text-xs text-ink-500">Bill {b.invoice_number ?? ''} · due {dateFmt(b.due_date)}</p></div>
              <Decide kind="bill" id={b.id} />
            </div>))}
        </div>
      )}
    </>
  );
}
