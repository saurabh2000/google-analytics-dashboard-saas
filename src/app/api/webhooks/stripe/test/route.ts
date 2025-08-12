import { webhookHandler } from '@/lib/webhook-handlers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { eventType, eventData } = await req.json()

    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      )
    }

    // Create a mock Stripe event for testing
    const mockEvent = {
      id: `evt_test_${Date.now()}`,
      type: eventType,
      created: Math.floor(Date.now() / 1000),
      data: {
        object: eventData || {}
      }
    }

    console.log(`Testing webhook with event type: ${eventType}`)

    // Process the mock event
    await webhookHandler.handleWebhookEvent(mockEvent as any)

    return NextResponse.json({
      success: true,
      message: `Webhook event '${eventType}' processed successfully`,
      eventId: mockEvent.id,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error testing webhook:', error)
    return NextResponse.json(
      { 
        error: 'Webhook test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook testing endpoint',
    usage: 'POST with { eventType: "customer.subscription.created", eventData: {...} }',
    availableEventTypes: [
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'customer.subscription.trial_will_end',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
      'invoice.payment_action_required',
      'customer.created',
      'customer.updated',
      'customer.deleted',
      'payment_method.attached',
      'payment_method.detached'
    ]
  })
}
