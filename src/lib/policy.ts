export type Policy = { max_single_cents: number; receipt_over_cents: number; approval_over_cents: number; blocked_categories: string[] };
export type TxInput = { amount_cents: number; category: string; merchant: string; occurred_on: string; hasReceipt: boolean };
export type Prior = { merchant: string; amount_cents: number; occurred_on: string };
export type Card = { spend_limit_cents: number; status: string; allowed_categories: string[] } | null;

export const DEFAULT_POLICY: Policy = { max_single_cents: 500000, receipt_over_cents: 2500, approval_over_cents: 100000, blocked_categories: [] };

/** Deterministic policy check. Returns hard `blocks` (reject at entry), soft `flags`, and the resulting status. */
export function evaluate(tx: TxInput, policy: Policy, card: Card, spentOnCardInPeriod: number, prior: Prior[]) {
  const blocks: string[] = [];
  const flags: string[] = [];
  if (card) {
    if (card.status !== 'active') blocks.push(`Card is ${card.status}`);
    if (card.allowed_categories.length && !card.allowed_categories.includes(tx.category)) blocks.push(`Category ${tx.category} not allowed on this card`);
    if (spentOnCardInPeriod + tx.amount_cents > card.spend_limit_cents) blocks.push('Exceeds card spend limit');
  }
  if (policy.blocked_categories.includes(tx.category)) blocks.push(`Category ${tx.category} is blocked by policy`);
  if (tx.amount_cents > policy.max_single_cents) blocks.push('Exceeds maximum single transaction');
  if (tx.amount_cents > policy.receipt_over_cents && !tx.hasReceipt) flags.push('Missing receipt');
  if (prior.some(p => p.merchant.toLowerCase() === tx.merchant.toLowerCase() && p.amount_cents === tx.amount_cents && p.occurred_on === tx.occurred_on)) flags.push('Possible duplicate');
  const needsApproval = tx.amount_cents > policy.approval_over_cents;
  if (needsApproval) flags.push('Requires approval');
  return { blocks, flags, status: needsApproval ? ('pending_approval' as const) : ('approved' as const) };
}
