'use client'

import { useState, useEffect } from 'react'
import { CollaborationEvent } from '@/lib/socket'
import collaborationManager from '@/lib/socket'

interface ActivityFeedProps {
  className?: string
  maxItems?: number
}

export default function ActivityFeed({ className = '', maxItems = 20 }: ActivityFeedProps) {
  const [events, setEvents] = useState<CollaborationEvent[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const unsubscribe = collaborationManager.onEvent((event) => {
      setEvents(prev => {
        const newEvents = [event, ...prev].slice(0, maxItems)
        return newEvents
      })
    })

    return unsubscribe
  }, [maxItems])

  if (events.length === 0) {
    return null
  }

  return (
    <>
      {/* Activity Feed Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-40"
        title="Show activity feed"
      >
        <div className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 6h16M4 12h7M4 18h7" />
          </svg>
          {events.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {events.length > 9 ? '9+' : events.length}
            </div>
          )}
        </div>
      </button>

      {/* Activity Feed Panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-6 w-80 max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white">Activity Feed</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Activity List */}
          <div className="overflow-y-auto max-h-80">
            {events.map((event, index) => (
              <ActivityItem key={`${event.timestamp}-${index}`} event={event} />
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{events.length} recent activities</span>
              <button
                onClick={() => setEvents([])}
                className="hover:text-gray-700 dark:hover:text-gray-300"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isVisible && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setIsVisible(false)}
        />
      )}
    </>
  )
}

function ActivityItem({ event }: { event: CollaborationEvent }) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'filter_change':
        return '🔄'
      case 'card_add':
        return '➕'
      case 'card_remove':
        return '➖'
      case 'chart_drill':
        return '🔍'
      case 'user_join':
        return '👋'
      case 'user_leave':
        return '👋'
      default:
        return '📝'
    }
  }

  const getEventDescription = (event: CollaborationEvent) => {
    switch (event.type) {
      case 'filter_change':
        return (
          <span>
            changed filters
            {event.data.selectedDateRange && (
              <span className="text-blue-600 dark:text-blue-400"> to {event.data.selectedDateRange}</span>
            )}
          </span>
        )
      case 'card_add':
        return (
          <span>
            added <span className="font-medium text-green-600 dark:text-green-400">{event.data.cardId}</span> card
          </span>
        )
      case 'card_remove':
        return (
          <span>
            removed <span className="font-medium text-red-600 dark:text-red-400">{event.data.cardId}</span> card
          </span>
        )
      case 'chart_drill':
        return (
          <span>
            drilled down to <span className="font-medium text-purple-600 dark:text-purple-400">{event.data.path?.join(' → ')}</span>
          </span>
        )
      case 'user_join':
        return <span className="text-green-600 dark:text-green-400">joined the dashboard</span>
      case 'user_leave':
        return <span className="text-orange-600 dark:text-orange-400">left the dashboard</span>
      default:
        return 'made changes'
    }
  }

  const timeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return `${seconds}s ago`
  }

  return (
    <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0">
      {/* User Avatar */}
      <div className="flex-shrink-0">
        {event.user.avatar ? (
          <img
            src={event.user.avatar}
            alt={event.user.name}
            className="w-8 h-8 rounded-full"
            style={{ borderWidth: '2px', borderColor: event.user.color }}
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: event.user.color }}
          >
            {event.user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Event Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-900 dark:text-white">
              <span className="font-medium">{event.user.name}</span>{' '}
              {getEventDescription(event)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {timeAgo(event.timestamp)}
            </p>
          </div>
          <span className="text-lg ml-2 flex-shrink-0">
            {getEventIcon(event.type)}
          </span>
        </div>

        {/* Additional Data */}
        {event.data && Object.keys(event.data).length > 0 && event.type !== 'user_join' && event.type !== 'user_leave' && (
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded text-xs">
            <details>
              <summary className="cursor-pointer text-gray-600 dark:text-gray-300">
                View details
              </summary>
              <pre className="mt-1 text-gray-700 dark:text-gray-200 overflow-x-auto">
                {JSON.stringify(event.data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}