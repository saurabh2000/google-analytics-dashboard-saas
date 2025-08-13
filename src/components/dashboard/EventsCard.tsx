'use client'

import { Activity, TrendingUp, Eye, MousePointer, Download, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface EventData {
  name: string
  count: number
  change: number
  icon: React.ReactNode
  color: string
}

interface EventsCardProps {
  events?: EventData[]
  isRealData?: boolean
}

const defaultEvents: EventData[] = [
  {
    name: 'Page Views',
    count: 12847,
    change: 8.2,
    icon: <Eye className="w-3 h-3" />,
    color: 'blue'
  },
  {
    name: 'Button Clicks',
    count: 3521,
    change: 12.5,
    icon: <MousePointer className="w-3 h-3" />,
    color: 'green'
  },
  {
    name: 'Downloads',
    count: 287,
    change: -2.1,
    icon: <Download className="w-3 h-3" />,
    color: 'purple'
  },
  {
    name: 'Video Plays',
    count: 1043,
    change: 15.7,
    icon: <Play className="w-3 h-3" />,
    color: 'orange'
  }
]

export default function EventsCard({ 
  events = defaultEvents, 
  isRealData = false 
}: EventsCardProps) {
  const totalEvents = events.reduce((sum, event) => sum + event.count, 0)
  const avgChange = events.reduce((sum, event) => sum + event.change, 0) / events.length

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
      green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
      purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
      orange: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
      red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
    }
    return colors[color] || colors.blue
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toLocaleString()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          User Events
        </CardTitle>
        <div className="flex items-center space-x-2">
          {!isRealData && (
            <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full">
              Demo
            </span>
          )}
          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <Activity className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(totalEvents)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total Events
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-center space-x-1">
              <TrendingUp className={cn(
                "w-4 h-4",
                avgChange > 0 ? "text-green-500" : "text-red-500"
              )} />
              <span className={cn(
                "text-2xl font-bold",
                avgChange > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {avgChange > 0 ? '+' : ''}{avgChange.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Avg Growth
            </div>
          </div>
        </div>

        {/* Individual Events */}
        <div className="space-y-3">
          {events.map((event, index) => {
            const percentage = (event.count / totalEvents) * 100
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={cn("p-1.5 rounded-md", getColorClasses(event.color))}>
                      {event.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatNumber(event.count)}
                    </span>
                    <span className={cn(
                      "text-xs font-medium",
                      event.change > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {event.change > 0 ? '+' : ''}{event.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{percentage.toFixed(1)}% of total</span>
                  </div>
                  <Progress value={percentage} className="h-1.5" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Event Categories */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Top Event Categories
          </div>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full">
              Navigation
            </span>
            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full">
              Engagement
            </span>
            <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded-full">
              Downloads
            </span>
            <span className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 px-2 py-1 rounded-full">
              Media
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}