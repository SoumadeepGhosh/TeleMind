export type BillingCycle = 'monthly' | 'yearly';

export interface PricingPlanConfig {
  id: 'starter' | 'growth' | 'pro-swarm';
  tag: string;
  name: string;
  audience: string;
  monthlyPriceInr: number;
  yearlyMonthlyEquivalentInr: number;
  yearlyTotalInr: number;
  popular?: boolean;
  accent: 'indigo' | 'purple' | 'cyan';
  features: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface EnterpriseConfig {
  tag: string;
  name: string;
  audience: string;
  priceLabel: string;
  description: string;
  capabilities: string[];
  ctaLabel: string;
  ctaHref: string;
}

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatInr(amount: number): string {
  return inrFormatter.format(amount);
}

export function calculateYearlySavingsPct(
  monthlyPrice: number,
  yearlyTotal: number
): number {
  const fullYear = monthlyPrice * 12;
  if (fullYear <= 0) return 0;
  return Math.round(((fullYear - yearlyTotal) / fullYear) * 100);
}

export const PRICING_PLANS: PricingPlanConfig[] = [
  {
    id: 'starter',
    tag: 'STARTER TIER',
    name: 'Starter',
    audience: 'For small businesses and individual business owners.',
    monthlyPriceInr: 299,
    yearlyMonthlyEquivalentInr: 239,
    yearlyTotalInr: 2868,
    accent: 'indigo',
    features: [
      '500 AI messages per month',
      '1 AI agent',
      '1 supported messaging channel',
      '1 human operator',
      'Basic support dashboard',
      'Basic analytics',
      'Tenant data isolation',
      'Email support',
    ],
    ctaLabel: 'Get Started',
    ctaHref: '/login?tab=register&plan=starter',
  },
  {
    id: 'growth',
    tag: 'GROWTH SCALING',
    name: 'Growth',
    audience: 'For growing businesses and startups scaling support.',
    monthlyPriceInr: 799,
    yearlyMonthlyEquivalentInr: 639,
    yearlyTotalInr: 7668,
    popular: true,
    accent: 'purple',
    features: [
      '2,000 AI messages per month',
      '3 AI agents',
      '2 supported messaging channels',
      '3 human operators',
      'Human operator intervention',
      'Standard analytics',
      'Multi-tenant data isolation',
      'Standard support',
    ],
    ctaLabel: 'Get Started',
    ctaHref: '/login?tab=register&plan=growth',
  },
  {
    id: 'pro-swarm',
    tag: 'HIGH THROUGHPUT',
    name: 'Pro Swarm',
    audience: 'For scaling businesses and dedicated support teams.',
    monthlyPriceInr: 1999,
    yearlyMonthlyEquivalentInr: 1599,
    yearlyTotalInr: 19188,
    accent: 'cyan',
    features: [
      '5,000 AI messages per month',
      '5 AI agents',
      '5 human operators',
      'Multiple supported messaging channels',
      'Advanced analytics',
      'Human operator intervention',
      'Multi-tenant data isolation',
      'Priority support',
    ],
    ctaLabel: 'Get Started',
    ctaHref: '/login?tab=register&plan=pro-swarm',
  },
];

export const ENTERPRISE_PLAN: EnterpriseConfig = {
  tag: 'ENTERPRISE',
  name: 'Enterprise',
  audience: 'For large organizations and high-volume teams.',
  priceLabel: 'Custom Pricing',
  description:
    'Tailored message quotas, dedicated agent allocation, and custom integrations built for enterprise scale.',
  capabilities: [
    'Custom message volume',
    'Custom agent allocation',
    'Custom integrations',
    'Enterprise support arrangements',
    'Scalable infrastructure',
  ],
  ctaLabel: 'Contact Sales',
  ctaHref: '/login?tab=register&plan=enterprise',
};
