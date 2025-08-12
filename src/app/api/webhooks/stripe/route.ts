import { webhookHandler } from '@/lib/webhook-handlers'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature header')
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      // Verify webhook signature
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
      if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET not configured')
        return NextResponse.json(
          { error: 'Webhook secret not configured' },
          { status: 500 }
        )
      }

      event = Stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log(`Received Stripe webhook: ${event.type} (ID: ${event.id})`)

    // Process the webhook event
    await webhookHandler.handleWebhookEvent(event)

    return NextResponse.json({ 
      received: true,
      eventType: event.type,
      eventId: event.id
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    
    // Return appropriate error response
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Webhook processing failed',
          message: error.message 
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stripe webhook endpoint is active',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  })
}