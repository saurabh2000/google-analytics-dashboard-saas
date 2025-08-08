// Stripe billing integration for subscription management
export interface StripeConfig {
  publishableKey: string
  secretKey: string
  webhookSecret: string
}

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

// Available subscription plans
export const subscriptionPlans: StripePlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams getting started with analytics',
    priceId: 'price_starter_monthly', // Replace with actual Stripe price ID
    price: 29,
    currency: 'USD',
    interval: 'month',
    features: [
      'Basic Analytics Dashboard',
      'Up to 5 users',
      'Up to 3 dashboards',
      'Email support',
      'Data export (CSV)',
      'Basic A/B testing'
    ],
    limits: {
      maxUsers: 5,
      maxDashboards: 3,
      maxDataSources: 2
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced features for growing businesses',
    priceId: 'price_professional_monthly',
    price: 99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Starter',
      'Up to 25 users',
      'Up to 10 dashboards',
      'Advanced cohort analysis',
      'User segmentation',
      'Custom alerts & notifications',
      'API access',
      'Priority support',
      'Advanced A/B testing with statistical significance'
    ],
    limits: {
      maxUsers: 25,
      maxDashboards: 10,
      maxDataSources: 5
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Complete solution for large organizations',
    priceId: 'price_enterprise_monthly',
    price: 299,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Professional',
      'Unlimited users',
      'Unlimited dashboards',
      'White-label branding',
      'Custom integrations',
      'Advanced analytics & reporting',
      'Real-time collaboration',
      'Dedicated account manager',
      'Custom training & onboarding',
      'SLA guarantee'
    ],
    limits: {
      maxUsers: -1, // Unlimited
      maxDashboards: -1,
      maxDataSources: -1
    }
  }
]

// Stripe service class for handling billing operations
export class StripeService {
  private stripeConfig: StripeConfig

  constructor(config: StripeConfig) {
    this.stripeConfig = config
  }

  // Create a new customer
  async createCustomer(tenantId: string, email: string, name?: string): Promise<StripeCustomer> {
    // In a real implementation, this would call Stripe API
    const mockCustomer: StripeCustomer = {
      id: `customer_${Date.now()}`,
      tenantId,
      stripeCustomerId: `cus_mock_${Date.now()}`,
      email,
      name,
      created: new Date()
    }

    // Store customer in database
    // await this.storeCustomer(mockCustomer)

    return mockCustomer
  }

  // Create a subscription checkout session
  async createCheckoutSession(
    customerId: string, 
    priceId: string, 
    successUrl: string, 
    cancelUrl: string
  ): Promise<{ sessionId: string; checkoutUrl: string }> {
    // Mock checkout session for demo
    const sessionId = `cs_mock_${Date.now()}`
    const checkoutUrl = `/billing/checkout-demo?session=${sessionId}&price=${priceId}`

    return {
      sessionId,
      checkoutUrl
    }
  }

  // Get subscription by tenant ID
  async getSubscription(tenantId: string): Promise<StripeSubscription | null> {
    // Special handling for demo organization - Enterprise plan
    const planId = tenantId === 'demo' || tenantId === 'demo-org' ? 'enterprise' : 'professional'
    const plan = subscriptionPlans.find(p => p.id === planId)
    if (!plan) return null

    const mockSubscription: StripeSubscription = {
      id: `sub_${Date.now()}`,
      tenantId,
      stripeSubscriptionId: `sub_mock_${Date.now()}`,
      stripeCustomerId: `cus_mock_${Date.now()}`,
      plan,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + (tenantId === 'demo' || tenantId === 'demo-org' ? 365 : 30) * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      created: new Date(),
      updated: new Date()
    }

    return mockSubscription
  }

  // Update subscription (upgrade/downgrade)
  async updateSubscription(subscriptionId: string, newPriceId: string): Promise<StripeSubscription> {
    // Mock subscription update
    const plan = subscriptionPlans.find(p => p.priceId === newPriceId)
    if (!plan) {
      throw new Error('Invalid price ID')
    }

    const mockSubscription: StripeSubscription = {
      id: subscriptionId,
      tenantId: 'mock-tenant',
      stripeSubscriptionId: `sub_mock_${Date.now()}`,
      stripeCustomerId: `cus_mock_${Date.now()}`,
      plan,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      created: new Date(),
      updated: new Date()
    }

    return mockSubscription
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<StripeSubscription> {
    // Mock cancellation
    const subscription = await this.getSubscription('mock-tenant')
    if (!subscription) {
      throw new Error('Subscription not found')
    }

    return {
      ...subscription,
      status: cancelAtPeriodEnd ? 'active' : 'canceled',
      cancelAtPeriodEnd,
      updated: new Date()
    }
  }

  // Handle webhook events
  async handleWebhook(event: any): Promise<void> { // eslint-disable-line @typescript-eslint/no-explicit-any
    switch (event.type) {
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object)
        break
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object)
        break
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object)
        break
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object)
        break
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  }

  private async handleSubscriptionCreated(subscription: any): Promise<void> { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.log('Subscription created:', subscription.id)
    // Update tenant subscription status in database
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.log('Subscription updated:', subscription.id)
    // Update tenant subscription details in database
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.log('Subscription deleted:', subscription.id)
    // Handle subscription cancellation
  }

  private async handlePaymentSucceeded(invoice: any): Promise<void> { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.log('Payment succeeded:', invoice.id)
    // Update payment status, extend subscription
  }

  private async handlePaymentFailed(invoice: any): Promise<void> { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.log('Payment failed:', invoice.id)
    // Handle failed payment, send notifications
  }

  // Get usage statistics for billing
  async getUsageStats(tenantId: string): Promise<{
    users: number
    dashboards: number
    dataSources: number
    apiCalls: number
  }> {
    // Mock usage stats
    return {
      users: 12,
      dashboards: 5,
      dataSources: 3,
      apiCalls: 1250
    }
  }

  // Calculate prorated amount for plan changes
  calculateProratedAmount(
    currentPlan: StripePlan, 
    newPlan: StripePlan, 
    daysRemaining: number
  ): number {
    const currentDailyRate = currentPlan.price / 30
    const newDailyRate = newPlan.price / 30
    const difference = (newDailyRate - currentDailyRate) * daysRemaining
    
    return Math.max(0, difference)
  }
}

// Utility functions
export function getPlanById(planId: string): StripePlan | null {
  return subscriptionPlans.find(plan => plan.id === planId) || null
}

export function getPlanByPriceId(priceId: string): StripePlan | null {
  return subscriptionPlans.find(plan => plan.priceId === priceId) || null
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price)
}

export function isFeatureIncluded(plan: StripePlan, feature: string): boolean {
  return plan.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
}

// Default Stripe service instance (mock for demo)
export const stripeService = new StripeService({
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock',
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_mock',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock'
})