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
| `NEXT_PUBLIC_PAYMENT_LINK_GROWTH`, `NEXT_PUBLIC_PAYMENT_LINK_SCALE` | Selar checkout links (default to the $47 and $57 links) |

## Payments
Growth ($47) and Scale ($57) are per workspace per month and are paid through Selar links from the Billing page. Nothing activates automatically from a payment page return. After you confirm a payment in Selar, activate the plan:

```
node scripts/activate-plan.mjs buyer@company.com growth
```

The script needs `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the environment, and finds the workspace by the buyer's sign-in email. Run migration `0003_scale_plan.sql` first. `plan` and `plan_status` cannot be edited by signed-in users (migration 0002). Automatic activation needs Selar's webhook details, which are not implemented.

## Deploy to Vercel
Import the repo, add the variables above, deploy, then set the Supabase Site URL and redirect URL to your domain.

## Tests
`npm test` runs the policy engine tests. `npm run typecheck` and `npm run build` must pass.

## Roles
admin (everything), manager (cards, bills, approvals, budgets), employee (own cards and transactions). Enforced by Postgres Row Level Security, not only the UI.
