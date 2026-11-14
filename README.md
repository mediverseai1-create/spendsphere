# SpendSphere

Spend control for growing teams: virtual-card limits, spend policies, live budgets, bill approvals and AI explanations. Next.js 15, React 19, TypeScript, Tailwind, Supabase.

SpendSphere is a control and ledger layer. It does **not** issue payment cards, hold funds or move money. "Mark paid" records a payment; it does not send one.

Reference audit and design notes: [docs/AUDIT.md](docs/AUDIT.md).

## Setup
1. `npm install`
2. Create a Supabase project, then run `supabase/migrations/0001_init.sql` in the SQL editor.
3. Copy `.env.example` to `.env.local` and fill it in.
4. In Supabase Auth settings add `http://localhost:3000/auth/callback` and your production URL to the redirect URLs.
5. `npm run dev`

## Environment variables
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client (required) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only. Used by the payment webhook to change plans |
| `NEXT_PUBLIC_SITE_URL` | Public URL used in auth emails |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | AI insights (optional) |
| `NEXT_PUBLIC_PAYMENT_LINK_GROWTH` | Your Stripe Payment Link for Growth |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the webhook endpoint |
| `STRIPE_PAYMENT_LINK_ID_GROWTH` | The `plink_...` ID, so the webhook can map a payment to the Growth plan |
| `CONTACT_EMAIL` | Shown on the contact page |

## Payments
The billing page appends `client_reference_id=<org id>` to your payment link. Point a Stripe webhook at `/api/webhooks/payments` for `checkout.session.completed`, `customer.subscription.deleted` and `invoice.payment_failed`. Plans change only after the signature is verified and payment is confirmed. Returning from checkout never activates a plan. `plan` and `plan_status` columns cannot be written by signed-in users (column grants plus a trigger, migration 0002).

## Deploy to Vercel
Import the repo, add the variables above, deploy, then register the webhook URL `https://<domain>/api/webhooks/payments` and the Supabase redirect URL.

## Tests
`npm test` runs the policy engine and webhook signature tests. `npm run typecheck` and `npm run build` must pass.

## Roles
admin (everything), manager (cards, bills, approvals, budgets), employee (own cards and transactions). Enforced by Postgres Row Level Security, not only the UI.
