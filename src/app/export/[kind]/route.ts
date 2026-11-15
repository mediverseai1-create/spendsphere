import { NextResponse } from 'next/server';
import { getCtx, isManager } from '@/lib/auth';
import { planFor } from '@/lib/plans';

// Neutralise spreadsheet formula injection, then quote CSV fields.
const cell = (v: unknown) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = (head: string[], rows: unknown[][]) => [head, ...rows].map(r => r.map(cell).join(',')).join('\r\n') + '\r\n';

export async function GET(_: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const c = await getCtx();
  if (!isManager(c)) return new NextResponse('Forbidden', { status: 403 });
  if (!planFor(c.planStatus === 'canceled' ? 'starter' : c.plan).advanced) return new NextResponse('Exports are included in the Scale plan', { status: 403 });
  let body: string;
  if (kind === 'transactions') {
    const { data } = await c.supabase.from('transactions').select('occurred_on,merchant,category,amount_cents,source,status,flags,memo,cards(name)').order('occurred_on', { ascending: false }).limit(50000);
    body = csv(['Date', 'Merchant', 'Category', 'Amount (USD)', 'Type', 'Status', 'Card', 'Flags', 'Memo'],
      (data ?? []).map((r: any) => [r.occurred_on, r.merchant, r.category, (Number(r.amount_cents) / 100).toFixed(2), r.source, r.status, r.cards?.name ?? '', (r.flags ?? []).join('; '), r.memo]));
  } else if (kind === 'bills') {
    const { data } = await c.supabase.from('bills').select('vendor,invoice_number,amount_cents,due_date,status,paid_at').order('due_date', { ascending: false }).limit(50000);
    body = csv(['Vendor', 'Invoice', 'Amount (USD)', 'Due date', 'Status', 'Paid at'],
      (data ?? []).map(r => [r.vendor, r.invoice_number, (Number(r.amount_cents) / 100).toFixed(2), r.due_date, r.status, r.paid_at]));
  } else return new NextResponse('Not found', { status: 404 });
  return new NextResponse(body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="spendsphere-${kind}.csv"`, 'Cache-Control': 'no-store' } });
}
