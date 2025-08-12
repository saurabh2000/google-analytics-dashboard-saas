'use client'

import { useState, useEffect } from 'react'
import { Play, RefreshCw, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface WebhookEvent {
  id: string
  type: string
  timestamp: string
  status: 'success' | 'error' | 'pending'
  message?: string
}

interface WebhookTestResult {
  success: boolean
  message: string
  eventId: string
  timestamp: string
}

export default function WebhookMonitor() {
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<WebhookTestResult | null>(null)
  const [selectedEventType, setSelectedEventType] = useState('customer.subscription.created')
  const [isTesting, setIsTesting] = useState(false)

  const availableEventTypes = [
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

  // Mock event data for testing
  const getMockEventData = (eventType: string) => {
    switch (eventType) {
      case 'customer.subscription.created':
        return {
          id: 'sub_test_123',
          customer: 'cus_test_456',
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          cancel_at_period_end: false,
          items: {
            data: [{
              price: { id: 'price_professional_monthly' }
            }]
          }
        }
      case 'invoice.payment_succeeded':
        return {
          id: 'in_test_789',
          customer: 'cus_test_456',
          subscription: 'sub_test_123',
          amount_paid: 9900,
          currency: 'usd',
          status: 'paid'
        }
      case 'customer.created':
        return {
          id: 'cus_test_456',
          email: 'test@example.com',
          name: 'Test Customer',
          metadata: { tenantId: 'test-tenant' }
        }
      default:
        return { id: 'test_id' }
    }
  }

  const testWebhook = async () => {
    setIsTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/webhooks/stripe/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType: selectedEventType,
          eventData: getMockEventData(selectedEventType)
        })
      })

      const result = await response.json()

      if (response.ok) {
        setTestResult({
          success: true,
          message: result.message,
          eventId: result.eventId,
          timestamp: result.timestamp
        })

        // Add to events list
        const newEvent: WebhookEvent = {
          id: result.eventId,
          type: selectedEventType,
          timestamp: result.timestamp,
          status: 'success',
          message: result.message
        }

        setEvents(prev => [newEvent, ...prev.slice(0, 9)]) // Keep last 10 events
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Test failed',
          eventId: 'error',
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
        eventId: 'error',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsTesting(false)
    }
  }

  const refreshEvents = () => {
    setIsLoading(true)
    // Simulate refreshing events
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const getEventIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <Eye className="w-4 h-4 text-gray-500" />
    }
  }

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Webhook Monitor</h2>
        <button
          onClick={refreshEvents}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Webhook Testing Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Test Webhook Events</h3>
        <div className="flex items-center gap-4">
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableEventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            onClick={testWebhook}
            disabled={isTesting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {isTesting ? 'Testing...' : 'Test Event'}
          </button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`mt-4 p-3 rounded-lg ${
            testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.message}
              </span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Event ID: {testResult.eventId} | {testResult.timestamp}
            </div>
          </div>
        )}
      </div>

      {/* Events List */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Webhook Events</h3>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No webhook events yet</p>
            <p className="text-sm">Test a webhook event to see it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getEventIcon(event.status)}
                  <div>
                    <div className="font-medium text-gray-900">{event.type}</div>
                    <div className="text-sm text-gray-600">
                      {event.message || 'Event processed'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Webhook Status */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Webhook Endpoint: /api/webhooks/stripe</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}
