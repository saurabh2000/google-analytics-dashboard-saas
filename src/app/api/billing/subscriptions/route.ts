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

    const { priceId, successUrl, cancelUrl, tenantId } = await req.json()

    if (!priceId || !successUrl || !cancelUrl || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const stripeService = createStripeService()
    
    // Create or get existing customer
    const customer = await stripeService.getSubscription(tenantId)
    let customerId: string

    if (customer) {
      customerId = customer.stripeCustomerId
    } else {
      const newCustomer = await stripeService.createCustomer(
        tenantId,
        session.user.email,
        session.user.name || undefined
      )
      customerId = newCustomer.stripeCustomerId
    }

    // Create checkout session
    const checkoutSession = await stripeService.createCheckoutSession(
      customerId,
      priceId,
      successUrl,
      cancelUrl
    )

    return NextResponse.json({
      sessionId: checkoutSession.sessionId,
      checkoutUrl: checkoutSession.checkoutUrl
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    // Get subscription details
    const subscription = await stripeService.getSubscription(tenantId)

    if (!subscription) {
      return NextResponse.json({ subscription: null })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Error getting subscription:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    )
  }
}
