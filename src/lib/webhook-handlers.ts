import { Stripe } from 'stripe'
import { prisma } from './prisma'
import { stripeService } from './stripe'

export interface WebhookEventData {
  id: string
  type: string
  timestamp: number
  data: any
  metadata?: Record<string, string>
}

export class WebhookHandlerService {
  /**
   * Main webhook event handler that routes events to appropriate handlers
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      console.log(`Processing webhook event: ${event.type} (ID: ${event.id})`)

      switch (event.type) {
        // Subscription lifecycle events
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription)
          break
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break
        case 'customer.subscription.trial_will_end':
          await this.handleSubscriptionTrialWillEnd(event.data.object as Stripe.Subscription)
          break

        // Payment events
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
          break
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
          break
        case 'invoice.payment_action_required':
          await this.handleInvoicePaymentActionRequired(event.data.object as Stripe.Invoice)
          break

        // Customer events
        case 'customer.created':
          await this.handleCustomerCreated(event.data.object as Stripe.Customer)
          break
        case 'customer.updated':
          await this.handleCustomerUpdated(event.data.object as Stripe.Customer)
          break
        case 'customer.deleted':
          await this.handleCustomerDeleted(event.data.object as Stripe.Customer)
          break

        // Payment method events
        case 'payment_method.attached':
          await this.handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod)
          break
        case 'payment_method.detached':
          await this.handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod)
          break

        // Default case for unhandled events
        default:
          console.log(`Unhandled webhook event type: ${event.type}`)
          await this.handleUnhandledEvent(event)
      }

      console.log(`Successfully processed webhook event: ${event.type}`)
    } catch (error) {
      console.error(`Error processing webhook event ${event.type}:`, error)
      throw error
    }
  }

  /**
   * Handle subscription creation
   */
  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    try {
      const customer = await this.getCustomerByStripeId(subscription.customer as string)
      if (!customer) {
        console.error(`Customer not found for subscription: ${subscription.id}`)
        return
      }

      // Create or update subscription record
      await prisma.subscription.upsert({
        where: { stripeSubscriptionId: subscription.id },
        update: {
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          updatedAt: new Date()
        },
        create: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          tenantId: customer.tenantId,
          planId: this.getPlanIdFromPriceId(subscription.items.data[0].price.id),
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Update customer subscription status
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          updatedAt: new Date()
        }
      })

      console.log(`Subscription created: ${subscription.id} for customer: ${customer.id}`)
    } catch (error) {
      console.error('Error handling subscription created:', error)
      throw error
    }
  }

  /**
   * Handle subscription updates
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    try {
      // Update subscription record
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          updatedAt: new Date()
        }
      })

      // Update customer subscription status
      await prisma.customer.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          subscriptionStatus: subscription.status,
          updatedAt: new Date()
        }
      })

      console.log(`Subscription updated: ${subscription.id}`)
    } catch (error) {
      console.error('Error handling subscription updated:', error)
      throw error
    }
  }

  /**
   * Handle subscription deletion
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    try {
      // Update subscription status to cancelled
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: 'canceled',
          updatedAt: new Date()
        }
      })

      // Update customer subscription status
      await prisma.customer.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          subscriptionStatus: 'canceled',
          updatedAt: new Date()
        }
      })

      console.log(`Subscription cancelled: ${subscription.id}`)
    } catch (error) {
      console.error('Error handling subscription deleted:', error)
      throw error
    }
  }

  /**
   * Handle trial ending soon
   */
  private async handleSubscriptionTrialWillEnd(subscription: Stripe.Subscription): Promise<void> {
    try {
      const customer = await this.getCustomerByStripeId(subscription.customer as string)
      if (!customer) return

      // Send notification about trial ending
      await this.sendTrialEndingNotification(customer.email, subscription.id)

      console.log(`Trial ending notification sent for subscription: ${subscription.id}`)
    } catch (error) {
      console.error('Error handling trial will end:', error)
      throw error
    }
  }

  /**
   * Handle successful payment
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    try {
      if (!invoice.subscription) return

      // Update subscription status
      await prisma.subscription.update({
        where: { stripeSubscriptionId: invoice.subscription as string },
        data: {
          status: 'active',
          updatedAt: new Date()
        }
      })

      // Create payment record
      await prisma.payment.create({
        data: {
          stripeInvoiceId: invoice.id,
          stripeSubscriptionId: invoice.subscription as string,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: 'succeeded',
          paidAt: new Date(),
          createdAt: new Date()
        }
      })

      console.log(`Payment succeeded for invoice: ${invoice.id}`)
    } catch (error) {
      console.error('Error handling payment succeeded:', error)
      throw error
    }
  }

  /**
   * Handle failed payment
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    try {
      if (!invoice.subscription) return

      const customer = await this.getCustomerByStripeId(invoice.customer as string)
      if (!customer) return

      // Update subscription status
      await prisma.subscription.update({
        where: { stripeSubscriptionId: invoice.subscription as string },
        data: {
          status: 'past_due',
          updatedAt: new Date()
        }
      })

      // Create payment record
      await prisma.payment.create({
        data: {
          stripeInvoiceId: invoice.id,
          stripeSubscriptionId: invoice.subscription as string,
          amount: invoice.amount_due,
          currency: invoice.currency,
          status: 'failed',
          failureReason: invoice.last_payment_error?.message || 'Payment failed',
          failedAt: new Date(),
          createdAt: new Date()
        }
      })

      // Send payment failure notification
      await this.sendPaymentFailureNotification(customer.email, invoice.id, invoice.last_payment_error?.message)

      console.log(`Payment failed for invoice: ${invoice.id}`)
    } catch (error) {
      console.error('Error handling payment failed:', error)
      throw error
    }
  }

  /**
   * Handle payment action required
   */
  private async handleInvoicePaymentActionRequired(invoice: Stripe.Invoice): Promise<void> {
    try {
      if (!invoice.subscription) return

      const customer = await this.getCustomerByStripeId(invoice.customer as string)
      if (!customer) return

      // Send notification about payment action required
      await this.sendPaymentActionRequiredNotification(customer.email, invoice.id)

      console.log(`Payment action required for invoice: ${invoice.id}`)
    } catch (error) {
      console.error('Error handling payment action required:', error)
      throw error
    }
  }

  /**
   * Handle customer creation
   */
  private async handleCustomerCreated(customer: Stripe.Customer): Promise<void> {
    try {
      const tenantId = customer.metadata?.tenantId
      if (!tenantId) {
        console.error(`No tenant ID found for customer: ${customer.id}`)
        return
      }

      // Create customer record
      await prisma.customer.create({
        data: {
          stripeCustomerId: customer.id,
          tenantId,
          email: customer.email!,
          name: customer.name || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      console.log(`Customer created: ${customer.id} for tenant: ${tenantId}`)
    } catch (error) {
      console.error('Error handling customer created:', error)
      throw error
    }
  }

  /**
   * Handle customer updates
   */
  private async handleCustomerUpdated(customer: Stripe.Customer): Promise<void> {
    try {
      await prisma.customer.update({
        where: { stripeCustomerId: customer.id },
        data: {
          email: customer.email!,
          name: customer.name || null,
          updatedAt: new Date()
        }
      })

      console.log(`Customer updated: ${customer.id}`)
    } catch (error) {
      console.error('Error handling customer updated:', error)
      throw error
    }
  }

  /**
   * Handle customer deletion
   */
  private async handleCustomerDeleted(customer: Stripe.Customer): Promise<void> {
    try {
      await prisma.customer.update({
        where: { stripeCustomerId: customer.id },
        data: {
          deletedAt: new Date(),
          updatedAt: new Date()
        }
      })

      console.log(`Customer deleted: ${customer.id}`)
    } catch (error) {
      console.error('Error handling customer deleted:', error)
      throw error
    }
  }

  /**
   * Handle payment method attachment
   */
  private async handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
    try {
      // Update customer with new payment method
      await prisma.customer.update({
        where: { stripeCustomerId: paymentMethod.customer as string },
        data: {
          paymentMethodId: paymentMethod.id,
          updatedAt: new Date()
        }
      })

      console.log(`Payment method attached: ${paymentMethod.id}`)
    } catch (error) {
      console.error('Error handling payment method attached:', error)
      throw error
    }
  }

  /**
   * Handle payment method detachment
   */
  private async handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
    try {
      // Remove payment method from customer
      await prisma.customer.update({
        where: { paymentMethodId: paymentMethod.id },
        data: {
          paymentMethodId: null,
          updatedAt: new Date()
        }
      })

      console.log(`Payment method detached: ${paymentMethod.id}`)
    } catch (error) {
      console.error('Error handling payment method detached:', error)
      throw error
    }
  }

  /**
   * Handle unhandled events
   */
  private async handleUnhandledEvent(event: Stripe.Event): Promise<void> {
    console.log(`Unhandled webhook event type: ${event.type}`, {
      eventId: event.id,
      eventType: event.type,
      timestamp: new Date(event.created * 1000).toISOString()
    })
  }

  /**
   * Helper method to get customer by Stripe ID
   */
  private async getCustomerByStripeId(stripeCustomerId: string) {
    return await prisma.customer.findUnique({
      where: { stripeCustomerId }
    })
  }

  /**
   * Helper method to get plan ID from Stripe price ID
   */
  private getPlanIdFromPriceId(priceId: string): string {
    // This would map Stripe price IDs to your internal plan IDs
    // You might want to store this mapping in your database
    const priceToPlanMap: Record<string, string> = {
      'price_starter_monthly': 'starter',
      'price_professional_monthly': 'professional',
      'price_enterprise_monthly': 'enterprise'
    }
    return priceToPlanMap[priceId] || 'starter'
  }

  /**
   * Send trial ending notification
   */
  private async sendTrialEndingNotification(email: string, subscriptionId: string): Promise<void> {
    // Implement email notification logic
    console.log(`Trial ending notification sent to: ${email} for subscription: ${subscriptionId}`)
  }

  /**
   * Send payment failure notification
   */
  private async sendPaymentFailureNotification(email: string, invoiceId: string, reason?: string): Promise<void> {
    // Implement email notification logic
    console.log(`Payment failure notification sent to: ${email} for invoice: ${invoiceId}`)
  }

  /**
   * Send payment action required notification
   */
  private async sendPaymentActionRequiredNotification(email: string, invoiceId: string): Promise<void> {
    // Implement email notification logic
    console.log(`Payment action required notification sent to: ${email} for invoice: ${invoiceId}`)
  }
}

// Export singleton instance
export const webhookHandler = new WebhookHandlerService()
