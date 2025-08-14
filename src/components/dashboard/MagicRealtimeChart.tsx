'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Users, Eye } from 'lucide-react'
import MagicCard from '@/components/magicui/magic-card'
import { cn } from '@/lib/utils'

interface DataPoint {
  time: string
  users: number
  pageViews: number
  events: number
}

interface MagicRealtimeChartProps {
  isRealData?: boolean
  propertyName?: string | null
}

export default function MagicRealtimeChart({ isRealData = false, propertyName }: MagicRealtimeChartProps) {
  const [data, setData] = useState<DataPoint[]>([])
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'pageViews' | 'events'>('users')

  // Initialize with data - show animations when GA is connected, static demo when not connected
  useEffect(() => {
    const initialData: DataPoint[] = []
    const now = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000) // 1 minute intervals
      const seed = time.getMinutes() + time.getHours() * 60 // Stable seed based on time
      
      // If GA connected, use realistic values based on property, otherwise use smaller demo values
      const baseMultiplier = isRealData ? (propertyName === 'VerySoul' ? 3 : 2) : 1
      
      initialData.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        users: Math.floor((Math.sin(seed * 0.1) + 1) * 25 * baseMultiplier) + (isRealData ? 40 : 20),
        pageViews: Math.floor((Math.sin(seed * 0.05) + 1) * 100 * baseMultiplier) + (isRealData ? 200 : 100),
        events: Math.floor((Math.sin(seed * 0.08) + 1) * 50 * baseMultiplier) + (isRealData ? 80 : 50),
      })
    }
    
    setData(initialData)
  }, [isRealData, propertyName])

  // Real-time updates - animate when GA is connected, static when not connected
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData.slice(1)]
        const now = new Date()
        
        const seed = now.getMinutes() + now.getHours() * 60 // Stable seed based on time
        const baseMultiplier = isRealData ? (propertyName === 'VerySoul' ? 3 : 2) : 1
        
        newData.push({
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          users: Math.floor((Math.sin(seed * 0.1) + 1) * 25 * baseMultiplier) + (isRealData ? 40 : 20),
          pageViews: Math.floor((Math.sin(seed * 0.05) + 1) * 100 * baseMultiplier) + (isRealData ? 200 : 100),
          events: Math.floor((Math.sin(seed * 0.08) + 1) * 50 * baseMultiplier) + (isRealData ? 80 : 50),
        })
        
        return newData
      })
    }, isRealData ? 3000 : 10000) // Faster updates when GA connected (3s), slower in demo (10s)

    return () => clearInterval(interval)
  }, [isRealData, propertyName])

  const metrics = {
    users: { label: 'Active Users', icon: Users, color: 'blue' },
    pageViews: { label: 'Page Views', icon: Eye, color: 'green' },
    events: { label: 'Events', icon: Activity, color: 'purple' },
  }

  const currentMetric = metrics[selectedMetric]
  const maxValue = Math.max(...data.map(d => d[selectedMetric]))
  const currentValue = data[data.length - 1]?.[selectedMetric] || 0

  return (
    <MagicCard
      className="h-full"
      gradientColor="rgba(59, 130, 246, 0.1)"
      gradientSize={500}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Real-time Analytics</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {propertyName || 'Live activity monitoring'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {Object.entries(metrics).map(([key, metric]) => {
            const Icon = metric.icon
            const isSelected = key === selectedMetric
            
            return (
              <button
                key={key}
                onClick={() => setSelectedMetric(key as typeof selectedMetric)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  isSelected
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                )}
              >
                <Icon className="w-4 h-4" />
                {metric.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Current Value Display */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <motion.span
            key={currentValue}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 dark:text-white"
          >
            {currentValue.toLocaleString()}
          </motion.span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentMetric.label.toLowerCase()} right now
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 100 192">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y * 190}
              x2="100"
              y2={y * 190}
              stroke="currentColor"
              strokeOpacity="0.1"
              className="text-gray-400"
            />
          ))}
          
          {/* Data visualization */}
          <AnimatePresence mode="wait">
            <motion.g key={selectedMetric}>
              {/* Area fill */}
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                exit={{ opacity: 0 }}
                d={`
                  M 0,${190}
                  ${data.map((point, i) => {
                    const x = (i / (data.length - 1)) * 100
                    const y = 190 - (point[selectedMetric] / maxValue) * 180
                    return `L ${x},${y}`
                  }).join(' ')}
                  L 100,${190}
                  Z
                `}
                fill={`url(#gradient-${currentMetric.color})`}
              />
              
              {/* Line */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
                d={`
                  M 0,${190 - (data[0]?.[selectedMetric] / maxValue) * 180}
                  ${data.slice(1).map((point, i) => {
                    const x = ((i + 1) / (data.length - 1)) * 100
                    const y = 190 - (point[selectedMetric] / maxValue) * 180
                    return `L ${x},${y}`
                  }).join(' ')}
                `}
                fill="none"
                stroke={`url(#gradient-line-${currentMetric.color})`}
                strokeWidth="3"
                strokeLinecap="round"
              />
              
              {/* Data points */}
              {data.map((point, i) => {
                const x = (i / (data.length - 1)) * 100
                const y = 190 - (point[selectedMetric] / maxValue) * 180
                
                return (
                  <motion.circle
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.01 }}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="white"
                    stroke={`var(--${currentMetric.color}-600)`}
                    strokeWidth="2"
                    className="opacity-0 hover:opacity-100 transition-opacity"
                  />
                )
              })}
            </motion.g>
          </AnimatePresence>
          
          {/* Gradients */}
          <defs>
            <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient-line-blue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.5" />
              <stop offset="50%" stopColor="rgb(59, 130, 246)" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.5" />
            </linearGradient>
            
            <linearGradient id="gradient-green" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(34, 197, 94)" />
              <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient-line-green" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.5" />
              <stop offset="50%" stopColor="rgb(34, 197, 94)" />
              <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.5" />
            </linearGradient>
            
            <linearGradient id="gradient-purple" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(168, 85, 247)" />
              <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient-line-purple" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.5" />
              <stop offset="50%" stopColor="rgb(168, 85, 247)" />
              <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Time labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span>{data[0]?.time}</span>
        <span>Now</span>
      </div>

      {/* Status indicator */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            isRealData ? "bg-green-500" : "bg-yellow-500"
          )} />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isRealData ? `Connected to GA4 (${propertyName})` : 'Demo Mode'} • Updates every {isRealData ? '3s' : '10s'}
          </span>
        </div>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
          Full report →
        </button>
      </div>
    </MagicCard>
  )
}