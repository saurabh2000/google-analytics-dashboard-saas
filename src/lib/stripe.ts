import Stripe from 'stripe'
import { 
  StripePlan, 
  StripeCustomer, 
  StripeSubscription, 
  subscriptionPlans as basePlans,
  getPlanById as getBasePlanById,
  getPlanByPriceId as getBasePlanByPriceId
} from './stripe-client'

// Server-only Stripe configuration
export interface StripeConfig {
  publishableKey: string
  secretKey: string
  webhookSecret: string
}

// Get subscription plans with actual environment variable price IDs
function getSubscriptionPlans(): StripePlan[] {
  return basePlans.map(plan => ({
    ...plan,
    priceId: (() => {
      switch (plan.id) {
        case 'starter':
          return process.env.STRIPE_PRICE_STARTER_MONTHLY || plan.priceId
        case 'professional':
          return process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY || plan.priceId
        case 'enterprise':
          return process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || plan.priceId
        default:
          return plan.priceId
      }
    })()
  }))
}

// Stripe service class for handling billing operations
export class StripeService {
  private stripe: Stripe
  private stripeConfig: StripeConfig

  constructor(config: StripeConfig) {
    this.stripeConfig = config
    
    // Initialize Stripe with proper configuration
    if (!config.secretKey || config.secretKey === 'sk_test_mock') {
      throw new Error('Stripe secret key is required and must be a valid key')
    }
    
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2024-12-18.acacia',
      typescript: true
    })
  }

  async createCustomer(tenantId: string, email: string, name?: string): Promise<StripeCustomer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          tenantId
        }
      })

      return {
        id: customer.id,
        tenantId,
        stripeCustomerId: customer.id,
        email: customer.email!,
        name: customer.name || undefined,
        created: new Date(customer.created * 1000)
      }
    } catch (error) {
      console.error('Error creating Stripe customer:', error)
      throw new Error(`Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async createCheckoutSession(
    customerId: string, 
    priceId: string, 
    successUrl: string, 
    cancelUrl: string
  ): Promise<{ sessionId: string; checkoutUrl: string }> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        customer_update: {
          address: 'auto',
          name: 'auto'
        }
      })

      return {
        sessionId: session.id,
        checkoutUrl: session.url!
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getSubscription(tenantId: string): Promise<StripeSubscription | null> {
    try {
      // First find the customer for this tenant
      const customers = await this.stripe.customers.list({
        limit: 100,
        metadata: { tenantId }
      })

      if (customers.data.length === 0) {
        return null
      }

      const customer = customers.data[0]
      
      // Get active subscriptions for this customer
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customer.id,
        status: 'all',
        limit: 1
      })

      if (subscriptions.data.length === 0) {
        return null
      }

      const subscription = subscriptions.data[0]
      const plan = this.getPlanByPriceId(subscription.items.data[0].price.id)

      if (!plan) {
        throw new Error(`Unknown price ID: ${subscription.items.data[0].price.id}`)
      }

      return {
        id: subscription.id,
        tenantId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customer.id,
        plan,
        status: subscription.status as any,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        created: new Date(subscription.created * 1000),
        updated: new Date(subscription.updated * 1000)
      }
    } catch (error) {
      console.error('Error getting subscription:', error)
      return null
    }
  }

  async updateSubscription(subscriptionId: string, newPriceId: string): Promise<StripeSubscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId)
      const newPlan = this.getPlanByPriceId(newPriceId)

      if (!newPlan) {
        throw new Error(`Unknown price ID: ${newPriceId}`)
      }

      // Update the subscription with the new price
      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId
          }
        ],
        proration_behavior: 'create_prorations'
      })

      return {
        id: updatedSubscription.id,
        tenantId: subscription.metadata.tenantId || '',
        stripeSubscriptionId: updatedSubscription.id,
        stripeCustomerId: updatedSubscription.customer as string,
        plan: newPlan,
        status: updatedSubscription.status as any,
        currentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
        created: new Date(updatedSubscription.created * 1000),
        updated: new Date(updatedSubscription.updated * 1000)
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      throw new Error(`Failed to update subscription: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<StripeSubscription> {
    try {
      let updatedSubscription: Stripe.Subscription

      if (cancelAtPeriodEnd) {
        updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        })
      } else {
        updatedSubscription = await this.stripe.subscriptions.cancel(subscriptionId)
      }

      const plan = this.getPlanByPriceId(updatedSubscription.items.data[0].price.id)

      if (!plan) {
        throw new Error(`Unknown price ID: ${updatedSubscription.items.data[0].price.id}`)
      }

      return {
        id: updatedSubscription.id,
        tenantId: updatedSubscription.metadata.tenantId || '',
        stripeSubscriptionId: updatedSubscription.id,
        stripeCustomerId: updatedSubscription.customer as string,
        plan,
        status: updatedSubscription.status as any,
        currentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
        created: new Date(updatedSubscription.created * 1000),
        updated: new Date(updatedSubscription.updated * 1000)
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw new Error(`Failed to cancel subscription: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription)
          break
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice)
          break
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice)
          break
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }
    } catch (error) {
      console.error('Error handling webhook:', error)
      throw error
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    console.log('Subscription created:', subscription.id)
    // TODO: Update tenant subscription status in database
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    console.log('Subscription updated:', subscription.id)
    // TODO: Update tenant subscription status in database
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    console.log('Subscription deleted:', subscription.id)
    // TODO: Update tenant subscription status in database
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    console.log('Payment succeeded for invoice:', invoice.id)
    // TODO: Update tenant billing status in database
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log('Payment failed for invoice:', invoice.id)
    // TODO: Update tenant billing status and send notification
  }

  async getUsageStats(tenantId: string): Promise<{
    users: number
    dashboards: number
    dataSources: number
    apiCalls: number
  }> {
    // TODO: Implement actual usage tracking from database
    return {
      users: 0,
      dashboards: 0,
      dataSources: 0,
      apiCalls: 0
    }
  }

  calculateProratedAmount(
    currentPlan: StripePlan, 
    newPlan: StripePlan, 
    daysRemaining: number
  ): number {
    const currentDailyRate = currentPlan.price / 30 // Assuming monthly billing
    const newDailyRate = newPlan.price / 30
    const dailyDifference = newDailyRate - currentDailyRate
    
    return Math.round(dailyDifference * daysRemaining * 100) / 100
  }

  // Get Stripe instance for direct API calls
  getStripeInstance(): Stripe {
    return this.stripe
  }

  // Instance methods for plan lookup
  getPlanById(planId: string): StripePlan | null {
    return getSubscriptionPlans().find(plan => plan.id === planId) || null
  }

  getPlanByPriceId(priceId: string): StripePlan | null {
    return getSubscriptionPlans().find(plan => plan.priceId === priceId) || null
  }

  getSubscriptionPlans(): StripePlan[] {
    return getSubscriptionPlans()
  }
}

// Utility function to create Stripe service instance (server-side only)
export function createStripeService(): StripeService {
  if (typeof window !== 'undefined') {
    throw new Error('StripeService should only be used on the server side')
  }

  const config: StripeConfig = {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
  }

  if (!config.secretKey || config.secretKey === 'sk_test_mock') {
    throw new Error('Stripe secret key is required and must be a valid key')
  }

  return new StripeService(config)
}

// Export types for use in other files
export type { StripePlan, StripeCustomer, StripeSubscription }