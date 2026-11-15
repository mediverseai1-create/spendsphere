export type PlanId = 'starter' | 'growth' | 'scale';
export const PLANS: Record<PlanId, {
  name: string; price: string; period: string; blurb: string; cards: number; members: number; aiPerMonth: number;
  budgets: boolean; policies: boolean; advanced: boolean; features: string[];
}> = {
  starter: {
    name: 'Starter', price: '$0', period: '', blurb: 'Spend control and AI analysis for early-stage teams.',
    cards: 5, members: 5, aiPerMonth: 5, budgets: false, policies: false, advanced: false,
    features: ['Up to 5 virtual cards', 'Up to 5 team members', 'Transactions and receipt capture', 'Bill approvals', '5 AI analyses per month'],
  },
  growth: {
    name: 'Growth', price: '$47', period: 'per workspace per month', blurb: 'Policy automation, live budgets and forecasting for scaling companies.',
    cards: Infinity, members: Infinity, aiPerMonth: 100, budgets: true, policies: true, advanced: false,
    features: ['Unlimited virtual cards and members', 'Spend policies and automated approvals', 'Live budgets and month-end forecast', '100 AI analyses per month'],
  },
  scale: {
    name: 'Scale', price: '$57', period: 'per workspace per month', blurb: 'Reporting, exports and higher AI capacity for finance-led organizations.',
    cards: Infinity, members: Infinity, aiPerMonth: 1000, budgets: true, policies: true, advanced: true,
    features: ['Everything in Growth', '1,000 AI analyses per month', 'CSV export of transactions and bills', 'Six-month spend trend reports', 'Priority support'],
  },
};
const DEFAULT_LINKS: Record<'growth' | 'scale', string> = {
  growth: 'https://selar.com/47plan?currency=USD',
  scale: 'https://selar.com/57plan?currency=USD',
};
export const checkoutLink = (p: 'growth' | 'scale') =>
  (p === 'growth' ? process.env.NEXT_PUBLIC_PAYMENT_LINK_GROWTH : process.env.NEXT_PUBLIC_PAYMENT_LINK_SCALE) || DEFAULT_LINKS[p];
export function planFor(id: string | null | undefined) { return PLANS[(id as PlanId) in PLANS ? (id as PlanId) : 'starter']; }
