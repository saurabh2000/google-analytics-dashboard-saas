import { createStripeService } from '@/lib/stripe'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params()
    const { newPriceId } = await req.json()

    if (!newPriceId) {
      return NextResponse.json(
        { error: 'New price ID is required' },
        { status: 400 }
      )
    }

    const stripeService = createStripeService()
    
    // Update subscription
    const updatedSubscription = await stripeService.updateSubscription(id, newPriceId)

    return NextResponse.json({ subscription: updatedSubscription })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params()
    const { searchParams } = new URL(req.url)
    const cancelAtPeriodEnd = searchParams.get('cancelAtPeriodEnd') === 'true'

    // Cancel subscription
    const canceledSubscription = await stripeService.cancelSubscription(id, cancelAtPeriodEnd)

    return NextResponse.json({ subscription: canceledSubscription })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
