export type PlanId = 'starter' | 'growth' | 'enterprise';
export const PLANS: Record<PlanId, {
  name: string; price: string; blurb: string; cards: number; members: number; aiPerMonth: number;
  budgets: boolean; policies: boolean; features: string[];
}> = {
  starter: {
    name: 'Starter', price: '$0', blurb: 'Spend control and AI analysis for early-stage teams.',
    cards: 5, members: 5, aiPerMonth: 5, budgets: false, policies: false,
    features: ['Up to 5 virtual cards', 'Up to 5 team members', 'Transactions and receipt capture', 'Bill approvals', '5 AI analyses per month'],
  },
  growth: {
    name: 'Growth', price: '$12', blurb: 'Policy automation, live budgets and forecasting for scaling companies.',
    cards: Infinity, members: Infinity, aiPerMonth: 100, budgets: true, policies: true,
    features: ['Unlimited virtual cards and members', 'Spend policies and automated approvals', 'Live budgets and month-end forecast', '100 AI analyses per month', 'Priority support'],
  },
  enterprise: {
    name: 'Enterprise', price: 'Custom', blurb: 'Custom terms for multi-entity finance organizations.',
    cards: Infinity, members: Infinity, aiPerMonth: 1000, budgets: true, policies: true,
    features: ['Everything in Growth', 'Named account manager', 'Custom onboarding', 'Security review and service levels', '1,000 AI analyses per month'],
  },
};
export const growthLink = () => process.env.NEXT_PUBLIC_PAYMENT_LINK_GROWTH || '';
export function planFor(id: string | null | undefined) { return PLANS[(id as PlanId) in PLANS ? (id as PlanId) : 'starter']; }
