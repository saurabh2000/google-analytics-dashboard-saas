// Client-safe Stripe types and configuration
// This file can be imported in client components without instantiating Stripe

export interface StripePlan {
  id: string
  name: string
  description: string
  priceId: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  limits: {
    maxUsers: number
    maxDashboards: number
    maxDataSources: number
  }
  popular?: boolean
}

export interface StripeCustomer {
  id: string
  tenantId: string
  stripeCustomerId: string
  email: string
  name?: string
  created: Date
}

export interface StripeSubscription {
  id: string
  tenantId: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  plan: StripePlan
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  created: Date
  updated: Date
}

// Available subscription plans - safe for client-side use
export const subscriptionPlans: StripePlan[] = [
  {
    id: 'unlimited',
    name: 'Unlimited Everything',
    description: 'Complete analytics platform with unlimited access to all features',
    priceId: 'price_unlimited_monthly', // Will be overridden by env vars on server
    price: 99,
    currency: 'USD',
    interval: 'month',
    popular: true,
    features: [
      '🚀 Unlimited Users & Dashboards',
      '📊 Advanced Analytics & Reporting',
      '🧪 A/B Testing & Experiments',
      '👥 Cohort Analysis & Segmentation',
      '🔗 Unlimited Data Sources',
      '🏢 Multi-Tenant Architecture',
      '🤖 AI-Powered Insights',
      '🛡️ Enterprise Security',
      '📞 Priority Support',
      '🎨 Custom Branding'
    ],
    limits: {
      maxUsers: -1, // Unlimited
      maxDashboards: -1, // Unlimited
      maxDataSources: -1 // Unlimited
    }
  }
]

export function getPlanById(planId: string): StripePlan | null {
  return subscriptionPlans.find(plan => plan.id === planId) || null
}

export function getPlanByPriceId(priceId: string): StripePlan | null {
  return subscriptionPlans.find(plan => plan.priceId === priceId) || null
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(price)
}

export function isFeatureIncluded(plan: StripePlan, feature: string): boolean {
  return plan.features.includes(feature)
}