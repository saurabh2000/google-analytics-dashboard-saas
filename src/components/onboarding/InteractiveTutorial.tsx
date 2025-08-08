'use client'

import { useState, useEffect, useRef } from 'react'
import { type InteractiveTutorial, type TutorialTooltip } from '@/lib/onboarding'

interface InteractiveTutorialProps {
  tutorial: InteractiveTutorial
  isActive: boolean
  onComplete: () => void
  onSkip: () => void
  onExit: () => void
}

export default function InteractiveTutorial({ 
  tutorial, 
  isActive, 
  onComplete, 
  onSkip, 
  onExit 
}: InteractiveTutorialProps) {
  const [currentTooltipIndex, setCurrentTooltipIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [targetElement, setTargetElement] = useState<Element | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const currentTooltip = tutorial.tooltips[currentTooltipIndex]

  useEffect(() => {
    if (isActive && currentTooltip) {
      showTooltip()
    } else {
      hideTooltip()
    }
  }, [isActive, currentTooltipIndex, currentTooltip])

  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'auto'
      }
    }
  }, [isActive])

  const showTooltip = () => {
    const element = document.querySelector(currentTooltip.target)
    if (!element) {
      console.warn(`Tutorial target not found: ${currentTooltip.target}`)
      nextTooltip()
      return
    }

    setTargetElement(element)
    calculateTooltipPosition(element)
    setIsVisible(true)

    // Scroll element into view
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'center'
    })

    // Add highlight class to target element
    element.classList.add('tutorial-highlight')
  }

  const hideTooltip = () => {
    if (targetElement) {
      targetElement.classList.remove('tutorial-highlight')
    }
    setIsVisible(false)
    setTargetElement(null)
  }

  const calculateTooltipPosition = (element: Element) => {
    const rect = element.getBoundingClientRect()
    const tooltipWidth = 320
    const tooltipHeight = 200
    const offset = 20

    let top = 0
    let left = 0

    switch (currentTooltip.position) {
      case 'top':
        top = rect.top - tooltipHeight - offset
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2)
        break
      case 'bottom':
        top = rect.bottom + offset
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2)
        break
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2)
        left = rect.left - tooltipWidth - offset
        break
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2)
        left = rect.right + offset
        break
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    if (left < 10) left = 10
    if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10
    if (top < 10) top = 10
    if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10

    setTooltipPosition({ top, left })
  }

  const nextTooltip = () => {
    hideTooltip()
    
    if (currentTooltipIndex < tutorial.tooltips.length - 1) {
      setTimeout(() => {
        setCurrentTooltipIndex(currentTooltipIndex + 1)
      }, 300)
    } else {
      // Tutorial completed
      onComplete()
    }
  }

  const previousTooltip = () => {
    if (currentTooltipIndex > 0) {
      hideTooltip()
      setTimeout(() => {
        setCurrentTooltipIndex(currentTooltipIndex - 1)
      }, 300)
    }
  }

  const handleAction = () => {
    if (currentTooltip.action) {
      const element = targetElement
      if (!element) return

      switch (currentTooltip.action.type) {
        case 'click':
          // Simulate click
          ;(element as HTMLElement).click()
          break
        case 'input':
          // Focus on input element
          ;(element as HTMLInputElement).focus()
          break
        case 'wait':
          // Just wait
          break
      }

      // Auto-advance after action
      setTimeout(nextTooltip, 1000)
    } else {
      nextTooltip()
    }
  }

  const getTargetHighlightStyle = () => {
    if (!targetElement || !isVisible) return {}

    const rect = targetElement.getBoundingClientRect()
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    }
  }

  if (!isActive) return null

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
      >
        {/* Target highlight */}
        {isVisible && targetElement && (
          <div
            className="absolute border-4 border-blue-500 rounded-lg shadow-lg pointer-events-none"
            style={{
              ...getTargetHighlightStyle(),
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
            }}
          />
        )}

        {/* Tooltip */}
        {isVisible && (
          <div
            ref={tooltipRef}
            className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm z-60"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          >
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {currentTooltipIndex + 1} of {tutorial.tooltips.length}
              </div>
              <button
                onClick={onExit}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
              >
                ×
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${((currentTooltipIndex + 1) / tutorial.tooltips.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {currentTooltip.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {currentTooltip.content}
              </p>
              
              {currentTooltip.action && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                    Try it: {currentTooltip.action.description}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={previousTooltip}
                  disabled={currentTooltipIndex === 0}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    currentTooltipIndex === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  ← Back
                </button>
                <button
                  onClick={onSkip}
                  className="px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Skip Tutorial
                </button>
              </div>

              <button
                onClick={handleAction}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                {currentTooltip.action ? (
                  <>
                    <span>{currentTooltip.action.type === 'click' ? 'Click' : 'Continue'}</span>
                    <span>→</span>
                  </>
                ) : (
                  <>
                    <span>{currentTooltipIndex === tutorial.tooltips.length - 1 ? 'Finish' : 'Next'}</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tutorial CSS */}
      <style jsx global>{`
        .tutorial-highlight {
          position: relative;
          z-index: 51;
          animation: tutorialPulse 2s infinite;
        }

        @keyframes tutorialPulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  )
}

// Hook for managing tutorial state
export function useTutorial() {
  const [activeTutorial, setActiveTutorial] = useState<InteractiveTutorial | null>(null)
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([])

  useEffect(() => {
    // Load completed tutorials from localStorage
    const completed = localStorage.getItem('completed_tutorials')
    if (completed) {
      try {
        setCompletedTutorials(JSON.parse(completed))
      } catch {
        setCompletedTutorials([])
      }
    }
  }, [])

  const startTutorial = (tutorial: InteractiveTutorial) => {
    setActiveTutorial(tutorial)
  }

  const completeTutorial = () => {
    if (activeTutorial) {
      const newCompleted = [...completedTutorials, activeTutorial.id]
      setCompletedTutorials(newCompleted)
      localStorage.setItem('completed_tutorials', JSON.stringify(newCompleted))
    }
    setActiveTutorial(null)
  }

  const skipTutorial = () => {
    setActiveTutorial(null)
  }

  const exitTutorial = () => {
    setActiveTutorial(null)
  }

  return {
    activeTutorial,
    completedTutorials,
    startTutorial,
    completeTutorial,
    skipTutorial,
    exitTutorial
  }
}