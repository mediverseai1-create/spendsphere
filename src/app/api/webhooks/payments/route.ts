import { NextResponse } from 'next/server';
import { verifySignature } from '@/lib/payments';
import { createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: 'not configured' }, { status: 503 });
  const body = await req.text();
  if (!verifySignature(body, req.headers.get('stripe-signature'), secret)) return NextResponse.json({ error: 'bad signature' }, { status: 400 });

  const event = JSON.parse(body);
  const admin = createServiceClient();
  if (event.type === 'checkout.session.completed') {
    const s = event.data?.object ?? {};
    const orgId = s.client_reference_id as string | undefined;
    const paid = s.payment_status === 'paid' || s.payment_status === 'no_payment_required';
    const plan = s.payment_link && s.payment_link === process.env.STRIPE_PAYMENT_LINK_ID_GROWTH ? 'growth' : null;
    if (orgId && paid && plan) {
      const { error: dup } = await admin.from('payment_events').insert({ id: event.id, org_id: orgId, plan });
      if (!dup) await admin.from('organizations').update({ plan, plan_status: 'active', payment_customer_id: s.customer ?? null }).eq('id', orgId);
    }
  } else if (event.type === 'customer.subscription.deleted') {
    const cust = event.data?.object?.customer;
    if (cust) await admin.from('organizations').update({ plan_status: 'canceled' }).eq('payment_customer_id', cust);
  } else if (event.type === 'invoice.payment_failed') {
    const cust = event.data?.object?.customer;
    if (cust) await admin.from('organizations').update({ plan_status: 'past_due' }).eq('payment_customer_id', cust);
  }
  return NextResponse.json({ received: true });
}
