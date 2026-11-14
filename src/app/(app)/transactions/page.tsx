import { getCtx } from '@/lib/auth';
import { money, dateFmt, CATEGORIES } from '@/lib/format';
import { PageHeader, Flash, Empty, Badge, statusTone, label, Field } from '@/components/ui';
import { createTransaction } from '../actions';

export const metadata = { title: 'Transactions' };
export default async function Transactions({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string; q?: string; status?: string }> }) {
  const sp = await searchParams;
  const c = await getCtx();
  let q = c.supabase.from('transactions').select('*, cards(name,last4)').order('occurred_on', { ascending: false }).limit(200);
  if (sp.status && ['approved', 'pending_approval', 'rejected'].includes(sp.status)) q = q.eq('status', sp.status);
  if (sp.q) q = q.ilike('merchant', `%${sp.q.replace(/[%_,]/g, '')}%`);
  const [{ data: rows }, { data: cards }] = await Promise.all([q, c.supabase.from('cards').select('id,name,last4').eq('status', 'active')]);
  const signed = new Map<string, string>();
  const paths = (rows ?? []).map(r => r.receipt_path).filter(Boolean) as string[];
  if (paths.length) {
    const { data } = await c.supabase.storage.from('receipts').createSignedUrls(paths, 600);
    data?.forEach(d => { if (d.path && d.signedUrl) signed.set(d.path, d.signedUrl); });
  }
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <PageHeader title="Transactions" desc="Every card charge and reimbursement, checked against your policy." />
      <Flash e={sp.e} ok={sp.ok} />
      <details className="card mb-6 p-5">
        <summary className="cursor-pointer font-semibold">Record a transaction</summary>
        <form action={createTransaction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Type"><select className="input" name="source"><option value="card">Card charge</option><option value="reimbursement">Reimbursement</option></select></Field>
          <Field label="Card (card charges)"><select className="input" name="card_id" defaultValue=""><option value="" disabled>Select card</option>{(cards ?? []).map(k => <option key={k.id} value={k.id}>{k.name} ending {k.last4}</option>)}</select></Field>
          <Field label="Merchant"><input className="input" name="merchant" required minLength={2} maxLength={80} /></Field>
          <Field label="Amount (USD)"><input className="input" name="amount" inputMode="decimal" required placeholder="49.00" /></Field>
          <Field label="Category"><select className="input" name="category" required>{CATEGORIES.map(k => <option key={k}>{k}</option>)}</select></Field>
          <Field label="Date"><input className="input" type="date" name="date" defaultValue={today} max={today} required /></Field>
          <Field label="Memo"><input className="input" name="memo" maxLength={300} /></Field>
          <Field label="Receipt (PNG, JPG, WebP, PDF, 5 MB max)"><input className="input" type="file" name="receipt" accept="image/png,image/jpeg,image/webp,application/pdf" /></Field>
          <div className="sm:col-span-2"><button className="btn-primary">Save transaction</button></div>
        </form>
      </details>
      <form className="mb-4 flex flex-wrap gap-2" role="search">
        <input className="input max-w-xs" name="q" placeholder="Search merchant" defaultValue={sp.q} aria-label="Search merchant" />
        <select className="input max-w-[200px]" name="status" defaultValue={sp.status ?? ''} aria-label="Status"><option value="">All statuses</option><option value="approved">Approved</option><option value="pending_approval">Pending approval</option><option value="rejected">Rejected</option></select>
        <button className="btn-ghost">Filter</button>
      </form>
      {!rows?.length ? <Empty title="No transactions found" desc="Record a transaction above, or adjust the filters." /> : (
        <div className="card overflow-x-auto"><table className="w-full min-w-[720px]"><thead className="border-b border-ink-200"><tr><th className="th">Date</th><th className="th">Merchant</th><th className="th">Card</th><th className="th">Category</th><th className="th">Status</th><th className="th text-right">Amount</th></tr></thead>
          <tbody className="divide-y divide-ink-100">{rows.map((r: any) => (
            <tr key={r.id}>
              <td className="td whitespace-nowrap">{dateFmt(r.occurred_on)}</td>
              <td className="td"><p className="font-medium">{r.merchant}</p>
                <p className="text-xs text-ink-500">{r.source === 'reimbursement' ? 'Reimbursement' : ''}{r.memo ? ` ${r.memo}` : ''}{r.receipt_path && signed.get(r.receipt_path) && <> · <a className="text-brand underline" href={signed.get(r.receipt_path)} target="_blank" rel="noreferrer">Receipt</a></>}</p>
                {r.flags?.length > 0 && <div className="mt-1 flex flex-wrap gap-1">{r.flags.map((f: string) => <Badge key={f} tone="warn">{f}</Badge>)}</div>}</td>
              <td className="td">{r.cards ? `${r.cards.name} (${r.cards.last4})` : '-'}</td>
              <td className="td">{r.category}</td>
              <td className="td"><Badge tone={statusTone(r.status)}>{label(r.status)}</Badge></td>
              <td className="td text-right tabular-nums">{money(r.amount_cents)}</td>
            </tr>))}</tbody></table></div>
      )}
    </>
  );
}
