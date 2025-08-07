'use client'

import { useState, useEffect } from 'react'
import { User, CollaborationEvent } from '@/lib/socket'
import collaborationManager from '@/lib/socket'

interface ActiveUsersProps {
  className?: string
}

export default function ActiveUsers({ className = '' }: ActiveUsersProps) {
  const [users, setUsers] = useState<User[]>([])
  const [recentEvents, setRecentEvents] = useState<CollaborationEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Subscribe to user updates
    const unsubscribeUsers = collaborationManager.onUsersUpdated((updatedUsers) => {
      setUsers(updatedUsers)
    })

    // Subscribe to collaboration events
    const unsubscribeEvents = collaborationManager.onEvent((event) => {
      setRecentEvents(prev => {
        const newEvents = [event, ...prev].slice(0, 5) // Keep last 5 events
        return newEvents
      })

      // Auto-remove events after 10 seconds
      setTimeout(() => {
        setRecentEvents(prev => prev.filter(e => e.timestamp !== event.timestamp))
      }, 10000)
    })

    // Check connection status
    const checkConnection = () => {
      setIsConnected(collaborationManager.isConnected())
    }

    const interval = setInterval(checkConnection, 1000)
    checkConnection()

    return () => {
      unsubscribeUsers()
      unsubscribeEvents()
      clearInterval(interval)
    }
  }, [])

  if (!isConnected && users.length === 0) {
    return null
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center space-x-4">
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
          }`}></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Active Users Avatars */}
        {users.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {users.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="relative group"
                  title={`${user.name} (${user.email})`}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                      style={{ borderColor: user.color }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* User tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {user.name}
                    <div className="text-xs text-gray-300">{user.email}</div>
                  </div>
                </div>
              ))}

              {/* Show count if more than 5 users */}
              {users.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white dark:border-gray-800 shadow-sm flex items-center justify-center text-white text-xs font-medium">
                  +{users.length - 5}
                </div>
              )}
            </div>

            <span className="text-xs text-gray-500 dark:text-gray-400">
              {users.length === 1 ? '1 viewer' : `${users.length} viewers`}
            </span>
          </div>
        )}

        {/* Recent Activity Indicator */}
        {recentEvents.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
            <div className="text-xs text-blue-600 dark:text-blue-400 max-w-xs truncate">
              {recentEvents[0].user.name} {getEventDescription(recentEvents[0])}
            </div>
          </div>
        )}
      </div>

      {/* Cursors Overlay */}
      <CursorsOverlay users={users} />
    </div>
  )
}

// Cursor overlay component
function CursorsOverlay({ users }: { users: User[] }) {
  const [cursors, setCursors] = useState<Map<string, { x: number, y: number }>>(new Map())

  useEffect(() => {
    const updateCursors = () => {
      const newCursors = new Map()
      users.forEach(user => {
        if (user.cursor && user.id !== collaborationManager.getCurrentUser()?.id) {
          newCursors.set(user.id, user.cursor)
        }
      })
      setCursors(newCursors)
    }

    updateCursors()
  }, [users])

  useEffect(() => {
    // Track mouse movement and send to other users
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      collaborationManager.updateCursor(x, y)
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {Array.from(cursors.entries()).map(([userId, cursor]) => {
        const user = users.find(u => u.id === userId)
        if (!user) return null

        return (
          <div
            key={userId}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ease-out"
            style={{
              left: `${cursor.x}%`,
              top: `${cursor.y}%`
            }}
          >
            {/* Cursor */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              className="drop-shadow-md"
            >
              <path
                d="M3 3L17 9L10 12L7 17L3 3Z"
                fill={user.color}
                stroke="white"
                strokeWidth="1"
              />
            </svg>

            {/* User name label */}
            <div
              className="ml-4 -mt-1 px-2 py-1 rounded text-xs text-white shadow-lg"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function getEventDescription(event: CollaborationEvent): string {
  switch (event.type) {
    case 'filter_change':
      return 'changed filters'
    case 'card_add':
      return 'added a card'
    case 'card_remove':
      return 'removed a card'
    case 'chart_drill':
      return 'drilled down'
    case 'user_join':
      return 'joined'
    case 'user_leave':
      return 'left'
    default:
      return 'made changes'
  }
}