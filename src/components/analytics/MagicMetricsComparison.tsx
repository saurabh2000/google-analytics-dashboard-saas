'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Calendar, Filter, Download } from 'lucide-react'
import MagicCard from '@/components/magicui/magic-card'
import NumberTicker from '@/components/magicui/number-ticker'
import { AnimatedBeam, Circle } from '@/components/magicui/animated-beam'
import SparklesButton from '@/components/magicui/sparkles-button'
import { cn } from '@/lib/utils'

interface MetricData {
  name: string
  current: number
  previous: number
  change: number
  format: 'number' | 'percentage' | 'currency' | 'time'
  color: string
  icon: React.ReactNode
}

interface MagicMetricsComparisonProps {
  title?: string
  subtitle?: string
  currentPeriod?: string
  previousPeriod?: string
  metrics?: MetricData[]
  className?: string
}

const defaultMetrics: MetricData[] = [
  {
    name: 'Page Views',
    current: 124589,
    previous: 98234,
    change: 26.8,
    format: 'number',
    color: 'blue',
    icon: '👀'
  },
  {
    name: 'Unique Visitors',
    current: 23456,
    previous: 19234,
    change: 21.9,
    format: 'number',
    color: 'green',
    icon: '👥'
  },
  {
    name: 'Bounce Rate',
    current: 42.3,
    previous: 48.7,
    change: -13.1,
    format: 'percentage',
    color: 'purple',
    icon: '⚡'
  },
  {
    name: 'Avg. Session',
    current: 245,
    previous: 198,
    change: 23.7,
    format: 'time',
    color: 'orange',
    icon: '⏱️'
  },
  {
    name: 'Conversion Rate',
    current: 3.8,
    previous: 2.9,
    change: 31.0,
    format: 'percentage',
    color: 'red',
    icon: '🎯'
  },
  {
    name: 'Revenue',
    current: 45678,
    previous: 38921,
    change: 17.4,
    format: 'currency',
    color: 'green',
    icon: '💰'
  }
]

export default function MagicMetricsComparison({
  title = "Performance Comparison",
  subtitle = "Compare key metrics across time periods",
  currentPeriod = "This Month",
  previousPeriod = "Last Month",
  metrics = defaultMetrics,
  className
}: MagicMetricsComparisonProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [beamNodes, setBeamNodes] = useState<Array<React.RefObject<HTMLDivElement>>>([])

  // Create refs for beam animation
  useEffect(() => {
    const refs = metrics.map(() => React.createRef<HTMLDivElement>())
    setBeamNodes(refs)
  }, [metrics])

  // Format value based on type
  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`
      case 'percentage':
        return `${value}%`
      case 'time':
        const minutes = Math.floor(value / 60)
        const seconds = value % 60
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      default:
        return value.toLocaleString()
    }
  }

  // Trigger animation cycle
  const triggerAnimation = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
  }

  return (
    <div ref={containerRef} className={cn("space-y-6", className)}>
      {/* Header */}
      <MagicCard 
        gradientColor="rgba(59, 130, 246, 0.05)" 
        gradientSize={600}
        className="relative"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">{currentPeriod}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">{previousPeriod}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <SparklesButton
              variant="outline"
              onClick={triggerAnimation}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Refresh Data
            </SparklesButton>
            <SparklesButton
              variant="ghost"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </SparklesButton>
          </div>
        </div>

        {/* Animated beam connections when refreshing */}
        <AnimatePresence>
          {isAnimating && beamNodes.length > 1 && (
            <>
              {beamNodes.slice(0, -1).map((fromRef, i) => (
                <AnimatedBeam
                  key={i}
                  containerRef={containerRef}
                  fromRef={fromRef}
                  toRef={beamNodes[i + 1]}
                  duration={1}
                  delay={i * 0.2}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </MagicCard>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const isSelected = selectedMetric === metric.name
          const isPositive = metric.change >= 0
          
          return (
            <motion.div
              key={metric.name}
              ref={beamNodes[index]}
              layout
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMetric(isSelected ? null : metric.name)}
            >
              <MagicCard
                className={cn(
                  "cursor-pointer transition-all duration-300",
                  isSelected && "ring-2 ring-blue-500 ring-opacity-50"
                )}
                gradientColor={`rgba(${
                  metric.color === 'blue' ? '59, 130, 246' :
                  metric.color === 'green' ? '34, 197, 94' :
                  metric.color === 'purple' ? '168, 85, 247' :
                  metric.color === 'orange' ? '251, 146, 60' :
                  metric.color === 'red' ? '239, 68, 68' :
                  '59, 130, 246'
                }, 0.15)`}
                gradientSize={250}
              >
                <div className="relative">
                  {/* Metric Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">{metric.icon}</div>
                    <motion.div
                      animate={isAnimating ? { rotate: 360 } : {}}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="p-1 rounded-full bg-gray-100 dark:bg-gray-800"
                    >
                      <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </motion.div>
                  </div>

                  {/* Metric Name */}
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {metric.name}
                  </h3>

                  {/* Current Value */}
                  <div className="mb-3">
                    <motion.div
                      key={`current-${metric.current}`}
                      initial={isAnimating ? { opacity: 0, y: 20 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-3xl font-bold text-gray-900 dark:text-white"
                    >
                      <NumberTicker
                        value={metric.current}
                        decimalPlaces={metric.format === 'percentage' || metric.format === 'time' ? 1 : 0}
                      />
                      {metric.format === 'percentage' && '%'}
                      {metric.format === 'currency' && (
                        <span className="text-xl ml-1 text-gray-600 dark:text-gray-400">
                          {metric.current >= 1000000 ? 'M' : metric.current >= 1000 ? 'K' : ''}
                        </span>
                      )}
                    </motion.div>
                  </div>

                  {/* Comparison */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      vs {formatValue(metric.previous, metric.format)}
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {Math.abs(metric.change).toFixed(1)}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className={cn(
                          "h-2 rounded-full",
                          isPositive ? "bg-green-500" : "bg-red-500"
                        )}
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${Math.min(Math.abs(metric.change), 100)}%` 
                        }}
                        transition={{ 
                          duration: 1, 
                          delay: index * 0.1 + 0.5,
                          ease: "easeOut"
                        }}
                      />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                      >
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500 dark:text-gray-500">Current</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {formatValue(metric.current, metric.format)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 dark:text-gray-500">Previous</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {formatValue(metric.previous, metric.format)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="text-gray-500 dark:text-gray-500">Net Change</div>
                          <div className={cn(
                            "font-medium",
                            isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          )}>
                            {isPositive ? '+' : ''}{formatValue(metric.current - metric.previous, metric.format)}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </MagicCard>
            </motion.div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <MagicCard gradientColor="rgba(34, 197, 94, 0.05)" gradientSize={800}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Overall Performance Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {metrics.filter(m => m.change > 0).length}/{metrics.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Metrics Improved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                <NumberTicker 
                  value={metrics.reduce((sum, m) => sum + Math.abs(m.change), 0) / metrics.length}
                  decimalPlaces={1}
                />%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Change Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                <NumberTicker 
                  value={Math.max(...metrics.map(m => Math.abs(m.change)))}
                  decimalPlaces={1}
                />%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Highest Change</div>
            </div>
          </div>
        </div>
      </MagicCard>
    </div>
  )
}