import { createStripeService } from '@/lib/stripe'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { tenantId, returnUrl } = await req.json()

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    const stripeService = createStripeService()
    
    // Get subscription to find customer ID
    const subscription = await stripeService.getSubscription(tenantId)
    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found for this tenant' },
        { status: 404 }
      )
    }

    // Create customer portal session
    const stripe = stripeService.getStripeInstance()
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl || `${process.env.NEXTAUTH_URL}/dashboard`
    })

    return NextResponse.json({
      url: portalSession.url
    })
  } catch (error) {
    console.error('Error creating customer portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
      { status: 500 }
    )
  }
}
