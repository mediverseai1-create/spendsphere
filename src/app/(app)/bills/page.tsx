import { redirect } from 'next/navigation';
import { getCtx, isManager } from '@/lib/auth';
import { money, dateFmt } from '@/lib/format';
import { PageHeader, Flash, Empty, Badge, statusTone, label, Field } from '@/components/ui';
import { createBill, advanceBill } from '../actions';

export const metadata = { title: 'Bills' };
export default async function Bills({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string }> }) {
  const sp = await searchParams;
  const c = await getCtx();
  if (!isManager(c)) redirect('/dashboard');
  const { data: bills } = await c.supabase.from('bills').select('*').order('due_date');
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <PageHeader title="Bills" desc="Track vendor invoices from approval to paid. Marking a bill paid records it here; SpendSphere does not send the payment." />
      <Flash e={sp.e} ok={sp.ok} />
      <details className="card mb-6 p-5">
        <summary className="cursor-pointer font-semibold">Add a bill</summary>
        <form action={createBill} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Vendor"><input className="input" name="vendor" required minLength={2} maxLength={80} /></Field>
          <Field label="Invoice number"><input className="input" name="invoice" maxLength={60} /></Field>
          <Field label="Amount (USD)"><input className="input" name="amount" inputMode="decimal" required /></Field>
          <Field label="Due date"><input className="input" type="date" name="due" required defaultValue={today} /></Field>
          <div className="sm:col-span-2"><Field label="Notes"><input className="input" name="notes" maxLength={300} /></Field></div>
          <div className="sm:col-span-2"><button className="btn-primary">Submit for approval</button></div>
        </form>
      </details>
      {!bills?.length ? <Empty title="No bills yet" desc="Add a vendor invoice to route it through approval." /> : (
        <div className="card overflow-x-auto"><table className="w-full min-w-[680px]"><thead className="border-b border-ink-200"><tr><th className="th">Vendor</th><th className="th">Due</th><th className="th">Status</th><th className="th text-right">Amount</th><th className="th" /></tr></thead>
          <tbody className="divide-y divide-ink-100">{bills.map(b => (
            <tr key={b.id}>
              <td className="td"><p className="font-medium">{b.vendor}</p><p className="text-xs text-ink-500">{b.invoice_number}</p></td>
              <td className="td whitespace-nowrap">{dateFmt(b.due_date)}{b.status !== 'paid' && b.due_date < today && <span className="ml-2"><Badge tone="bad">Overdue</Badge></span>}</td>
              <td className="td"><Badge tone={statusTone(b.status)}>{label(b.status)}</Badge></td>
              <td className="td text-right tabular-nums">{money(b.amount_cents)}</td>
              <td className="td text-right"><form action={advanceBill} className="flex justify-end gap-2"><input type="hidden" name="id" value={b.id} />
                {b.status === 'approved' && <button name="to" value="scheduled" className="btn-ghost btn-sm">Schedule</button>}
                {(b.status === 'approved' || b.status === 'scheduled') && <button name="to" value="paid" className="btn-dark btn-sm">Mark paid</button>}
              </form></td>
            </tr>))}</tbody></table></div>
      )}
    </>
  );
}
