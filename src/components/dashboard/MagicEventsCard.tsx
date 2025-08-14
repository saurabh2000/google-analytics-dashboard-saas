'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Activity, ShoppingCart, UserCheck, Download, Share2, Heart } from 'lucide-react'
import MagicCard from '@/components/magicui/magic-card'
import { AnimatedList } from '@/components/magicui/animated-list'
import { cn } from '@/lib/utils'

interface Event {
  id: string
  type: 'pageview' | 'purchase' | 'signup' | 'download' | 'share' | 'like'
  title: string
  value?: string
  timestamp: string
  user?: string
}

const eventIcons = {
  pageview: Activity,
  purchase: ShoppingCart,
  signup: UserCheck,
  download: Download,
  share: Share2,
  like: Heart,
}

const eventColors = {
  pageview: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20',
  purchase: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
  signup: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20',
  download: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20',
  share: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/20',
  like: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20',
}

interface MagicEventsCardProps {
  events?: Event[]
  isRealData?: boolean
}

const defaultEvents: Event[] = [
  {
    id: '1',
    type: 'purchase',
    title: 'Premium Plan Purchase',
    value: '$99.00',
    timestamp: '2 min ago',
    user: 'john.doe@example.com'
  },
  {
    id: '2',
    type: 'signup',
    title: 'New User Registration',
    timestamp: '5 min ago',
    user: 'sarah.smith@example.com'
  },
  {
    id: '3',
    type: 'pageview',
    title: 'Pricing Page Visit',
    timestamp: '8 min ago',
    user: 'Anonymous'
  },
  {
    id: '4',
    type: 'download',
    title: 'Analytics Report Export',
    value: 'Q4_Report.pdf',
    timestamp: '12 min ago',
    user: 'mike@company.com'
  },
  {
    id: '5',
    type: 'share',
    title: 'Dashboard Shared',
    timestamp: '15 min ago',
    user: 'team@startup.io'
  },
  {
    id: '6',
    type: 'like',
    title: 'Feature Request Upvoted',
    value: 'Dark Mode Support',
    timestamp: '18 min ago',
    user: 'user1234'
  },
]

export default function MagicEventsCard({ events = defaultEvents, isRealData = false }: MagicEventsCardProps) {
  return (
    <MagicCard
      className="h-full"
      gradientColor="rgba(168, 85, 247, 0.1)"
      gradientSize={400}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Events</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Recent user activity</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            isRealData ? "bg-green-500" : "bg-yellow-500"
          )} />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isRealData ? 'Live' : 'Demo'}
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-hidden">
        <AnimatedList delay={1500}>
          {events.map((event) => {
            const Icon = eventIcons[event.type]
            const colorClass = eventColors[event.type]
            
            return (
              <motion.div
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <div className={cn("p-2 rounded-lg", colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {event.title}
                      </p>
                      {event.value && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {event.value}
                        </p>
                      )}
                      {event.user && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                          {event.user}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {event.timestamp}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatedList>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
          View all events →
        </button>
      </div>
    </MagicCard>
  )
}