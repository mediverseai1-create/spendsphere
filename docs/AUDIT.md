# Reference audit (public pages only) and SpendSphere adaptation

Source: public pages of brex.com read on 2026-11-14 (home, corporate card, spend management, expense management, travel, bill pay, pricing). Authenticated app screens were **not** inspected, so the dashboard design is original and based on the described workflows.

## Product concept
A finance platform for startups → enterprises combining corporate cards, banking, expense management, bill pay, travel and accounting automation, with policy controls, live budgets and AI assistance.

## Reference feature set → SpendSphere implementation
| Reference capability | SpendSphere module |
|---|---|
| Virtual/physical cards, per-card limits, freeze, category controls | **Cards** (ledger-level virtual cards: limits, freeze, allowed categories) |
| Transactions, receipt capture, memos, GL coding | **Transactions** (entry, receipt upload to Supabase Storage, categories) |
| Pre-set policy rules, auto-approve/decline, duplicate detection | **Policies** + deterministic policy engine (`src/lib/policy.ts`) |
| Approval flows | **Approvals** queue for transactions and bills |
| Live Budgets | **Budgets** with real-time utilisation |
| Bill pay, invoice approval, scheduling | **Bills** (draft → approval → scheduled → paid) |
| Reimbursements | Transactions with source = reimbursement |
| AI anomaly flags / insights | **Insights** (Gemini explains deterministic numbers) |
| Plans: Essentials $0, Premium $12/user, Enterprise, Smart Card | Starter $0, Growth $12/user/mo, Enterprise (contact) |
| Team roles | **Team** (admin / manager / employee, email invitations) |

Out of scope (needs regulated partners): real card issuing, bank accounts, money movement, travel booking, ERP sync. SpendSphere is a spend-control and ledger product; it never moves money.

## Design system (observed → adapted)
Reference: Inter, 600-weight tight headlines (~72px hero), near-black ink `#15191E`, warm off-white/grey canvas, single vivid orange-red CTA, 6px radii, product imagery in the hero.
SpendSphere: Inter, ink `#15191E`, canvas `#F6F5F3`, brand `#D93A0B` (darkened for AA contrast), 6px radius, no gradients, product UI shown as real components rather than stock imagery.
