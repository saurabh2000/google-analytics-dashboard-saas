'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Zap, Users } from 'lucide-react'
import MagicCard from '@/components/magicui/magic-card'
import { AnimatedBeam, Circle } from '@/components/magicui/animated-beam'
import NumberTicker from '@/components/magicui/number-ticker'
import SparklesButton from '@/components/magicui/sparkles-button'
import { cn } from '@/lib/utils'

interface FlowStep {
  id: string
  name: string
  users: number
  conversionRate: number
  dropoffRate: number
  icon: string
  color: string
  position: { x: number; y: number }
}

interface MagicUserFlowProps {
  title?: string
  steps?: FlowStep[]
  isAutoPlaying?: boolean
  className?: string
}

const defaultSteps: FlowStep[] = [
  {
    id: 'landing',
    name: 'Landing Page',
    users: 10000,
    conversionRate: 100,
    dropoffRate: 0,
    icon: '🏠',
    color: 'blue',
    position: { x: 20, y: 50 }
  },
  {
    id: 'signup',
    name: 'Sign Up Form',
    users: 6500,
    conversionRate: 65,
    dropoffRate: 35,
    icon: '📝',
    color: 'green',
    position: { x: 35, y: 30 }
  },
  {
    id: 'onboarding',
    name: 'Onboarding',
    users: 4875,
    conversionRate: 75,
    dropoffRate: 25,
    icon: '🎯',
    color: 'purple',
    position: { x: 50, y: 50 }
  },
  {
    id: 'trial',
    name: 'Free Trial',
    users: 3412,
    conversionRate: 70,
    dropoffRate: 30,
    icon: '🚀',
    color: 'orange',
    position: { x: 65, y: 30 }
  },
  {
    id: 'payment',
    name: 'Payment',
    users: 1706,
    conversionRate: 50,
    dropoffRate: 50,
    icon: '💳',
    color: 'red',
    position: { x: 80, y: 50 }
  }
]

export default function MagicUserFlow({
  title = "User Conversion Flow",
  steps = defaultSteps,
  isAutoPlaying = false,
  className
}: MagicUserFlowProps) {
  const [isPlaying, setIsPlaying] = useState(isAutoPlaying)
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightedPath, setHighlightedPath] = useState<number | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const stepRefs = React.useRef<Array<React.RefObject<HTMLDivElement>>>([])

  // Initialize refs
  useEffect(() => {
    stepRefs.current = steps.map(() => React.createRef<HTMLDivElement>())
  }, [steps])

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % steps.length
        setHighlightedPath(next > 0 ? next - 1 : null)
        return next
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [isPlaying, steps.length])

  const resetAnimation = () => {
    setCurrentStep(0)
    setHighlightedPath(null)
  }

  const getDropoffColor = (rate: number) => {
    if (rate <= 20) return 'text-green-600 dark:text-green-400'
    if (rate <= 40) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getStepColor = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Controls */}
      <MagicCard gradientColor="rgba(59, 130, 246, 0.05)" gradientSize={400}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track user journey and conversion optimization opportunities
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <SparklesButton
              variant="outline"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </SparklesButton>
            <SparklesButton
              variant="ghost"
              onClick={resetAnimation}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </SparklesButton>
          </div>
        </div>
      </MagicCard>

      {/* Flow Visualization */}
      <MagicCard 
        className="relative min-h-[500px]" 
        gradientColor="rgba(168, 85, 247, 0.03)"
        gradientSize={800}
      >
        <div ref={containerRef} className="relative w-full h-[500px] overflow-hidden">
          {/* Step Nodes */}
          {steps.map((step, index) => {
            const isActive = index <= currentStep
            const isCurrent = index === currentStep
            
            return (
              <motion.div
                key={step.id}
                ref={stepRefs.current[index]}
                className="absolute"
                style={{
                  left: `${step.position.x}%`,
                  top: `${step.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isActive ? 1 : 0.7, 
                  opacity: isActive ? 1 : 0.5,
                  zIndex: isCurrent ? 10 : 1
                }}
                transition={{ 
                  duration: 0.5, 
                  delay: isPlaying ? index * 0.3 : 0,
                  type: "spring",
                  stiffness: 300
                }}
                whileHover={{ scale: 1.1 }}
              >
                <Circle
                  className={cn(
                    "w-20 h-20 border-4 shadow-xl relative overflow-hidden",
                    isCurrent ? "border-blue-500 shadow-blue-500/25" : "border-gray-300 dark:border-gray-600"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-90",
                    getStepColor(step.color)
                  )} />
                  
                  <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
                    <div className="text-2xl mb-1">{step.icon}</div>
                    <div className="text-xs font-bold text-white drop-shadow">
                      <NumberTicker value={step.users} />
                    </div>
                  </div>

                  {/* Pulse effect for current step */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 border-4 border-blue-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </Circle>

                {/* Step Label */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 text-center">
                  <div className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <NumberTicker value={step.conversionRate} />% conversion
                  </div>
                  {step.dropoffRate > 0 && (
                    <div className={cn("text-xs font-medium", getDropoffColor(step.dropoffRate))}>
                      {step.dropoffRate}% drop-off
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}

          {/* Animated Beams */}
          {steps.slice(0, -1).map((step, index) => {
            const nextStep = steps[index + 1]
            const isHighlighted = highlightedPath === index || (isPlaying && index < currentStep)
            
            return (
              <AnimatedBeam
                key={`${step.id}-${nextStep.id}`}
                containerRef={containerRef}
                fromRef={stepRefs.current[index]}
                toRef={stepRefs.current[index + 1]}
                curvature={index % 2 === 0 ? 50 : -50}
                duration={2}
                delay={isPlaying ? index * 0.5 : 0}
                pathOpacity={isHighlighted ? 0.3 : 0.1}
                gradientStartColor={isHighlighted ? "#3b82f6" : "#9ca3af"}
                gradientStopColor={isHighlighted ? "#8b5cf6" : "#6b7280"}
                pathColor={isHighlighted ? "#3b82f6" : "#e5e7eb"}
              />
            )
          })}

          {/* Dropoff Indicators */}
          {steps.map((step, index) => {
            if (step.dropoffRate === 0 || index === 0) return null
            
            return (
              <motion.div
                key={`dropoff-${step.id}`}
                className="absolute"
                style={{
                  left: `${step.position.x - 5}%`,
                  top: `${step.position.y + 15}%`,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: index <= currentStep ? 1 : 0, 
                  y: index <= currentStep ? 0 : 10 
                }}
                transition={{ delay: index * 0.5 }}
              >
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-2 text-center min-w-[80px]">
                  <Zap className="w-4 h-4 text-red-600 dark:text-red-400 mx-auto mb-1" />
                  <div className="text-xs font-medium text-red-600 dark:text-red-400">
                    <NumberTicker value={steps[index - 1].users - step.users} /> lost
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </MagicCard>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MagicCard gradientColor="rgba(59, 130, 246, 0.1)" gradientSize={200}>
          <div className="text-center">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              <NumberTicker value={steps[0]?.users || 0} />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Visitors</div>
          </div>
        </MagicCard>

        <MagicCard gradientColor="rgba(34, 197, 94, 0.1)" gradientSize={200}>
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              <NumberTicker value={steps[steps.length - 1]?.users || 0} />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Conversions</div>
          </div>
        </MagicCard>

        <MagicCard gradientColor="rgba(168, 85, 247, 0.1)" gradientSize={200}>
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              <NumberTicker 
                value={steps.length > 0 ? (steps[steps.length - 1].users / steps[0].users) * 100 : 0}
                decimalPlaces={1}
              />%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Overall Rate</div>
          </div>
        </MagicCard>

        <MagicCard gradientColor="rgba(239, 68, 68, 0.1)" gradientSize={200}>
          <div className="text-center">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              <NumberTicker 
                value={steps.reduce((sum, step, i) => i > 0 ? sum + step.dropoffRate : sum, 0) / Math.max(steps.length - 1, 1)}
                decimalPlaces={1}
              />%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Drop-off</div>
          </div>
        </MagicCard>
      </div>
    </div>
  )
}