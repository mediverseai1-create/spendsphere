export type PlanId = 'starter' | 'growth' | 'enterprise';
export const PLANS: Record<PlanId, {
  name: string; price: string; blurb: string; cards: number; members: number; aiPerMonth: number;
  budgets: boolean; policies: boolean; features: string[];
}> = {
  starter: {
    name: 'Starter', price: '$0', blurb: 'For small teams getting spend under control.',
    cards: 5, members: 5, aiPerMonth: 5, budgets: false, policies: false,
    features: ['Up to 5 virtual cards', 'Up to 5 team members', 'Transactions and receipts', 'Bill pay approvals', '5 AI insights per month'],
  },
  growth: {
    name: 'Growth', price: '$12', blurb: 'Policies, live budgets and unlimited cards.',
    cards: Infinity, members: Infinity, aiPerMonth: 100, budgets: true, policies: true,
    features: ['Unlimited virtual cards and members', 'Spend policies and approval rules', 'Live budgets', '100 AI insights per month', 'Priority support'],
  },
  enterprise: {
    name: 'Enterprise', price: 'Custom', blurb: 'For multi-entity finance teams.',
    cards: Infinity, members: Infinity, aiPerMonth: 1000, budgets: true, policies: true,
    features: ['Everything in Growth', 'Named account manager', 'Custom onboarding', 'Security review and SLAs'],
  },
};
export const growthLink = () => process.env.NEXT_PUBLIC_PAYMENT_LINK_GROWTH || '';
export function planFor(id: string | null | undefined) { return PLANS[(id as PlanId) in PLANS ? (id as PlanId) : 'starter']; }
