'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { TenantProvider, useTenant } from '@/components/tenant/TenantProvider'
import TenantDashboardHeader from '@/components/tenant/TenantDashboardHeader'
import { 
  OnboardingService, 
  type OnboardingFlow, 
  type UserProgress,
  type InteractiveTutorial
} from '@/lib/onboarding'

// Inner onboarding component that uses tenant context
function TenantOnboarding() {
  const { tenant } = useTenant()
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [availableFlows, setAvailableFlows] = useState<OnboardingFlow[]>([])
  const [availableTutorials, setAvailableTutorials] = useState<InteractiveTutorial[]>([])
  const [currentFlow, setCurrentFlow] = useState<OnboardingFlow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tenant) {
      loadOnboardingData()
    }
  }, [tenant])

  const loadOnboardingData = async () => {
    if (!tenant) return

    setLoading(true)
    try {
      // Get user progress
      const progress = OnboardingService.getUserProgress(tenant.id, 'demo-user')
      setUserProgress(progress)

      // Get available flows for user role
      const flows = OnboardingService.getFlowsForRole('owner')
      setAvailableFlows(flows)

      // Get current flow with progress
      if (progress?.currentFlow) {
        const flowWithProgress = OnboardingService.getFlowWithProgress(progress.currentFlow, progress)
        setCurrentFlow(flowWithProgress)
      }

      // Get available tutorials
      const tutorials = OnboardingService.getTutorials()
      setAvailableTutorials(tutorials)
    } catch (error) {
      console.error('Failed to load onboarding data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startFlow = (flowId: string) => {
    if (!tenant) return

    const progress = OnboardingService.startOnboarding(tenant.id, 'demo-user', flowId)
    setUserProgress(progress)
    
    const flowWithProgress = OnboardingService.getFlowWithProgress(flowId, progress)
    setCurrentFlow(flowWithProgress)
  }

  const completeStep = (stepId: string) => {
    if (!tenant) return

    const updatedProgress = OnboardingService.completeStep(tenant.id, 'demo-user', stepId)
    if (updatedProgress) {
      setUserProgress(updatedProgress)
      
      if (updatedProgress.currentFlow) {
        const flowWithProgress = OnboardingService.getFlowWithProgress(
          updatedProgress.currentFlow, 
          updatedProgress
        )
        setCurrentFlow(flowWithProgress)
      }
    }
  }

  const skipStep = (stepId: string) => {
    if (!tenant) return

    const updatedProgress = OnboardingService.skipStep(tenant.id, 'demo-user', stepId)
    if (updatedProgress) {
      setUserProgress(updatedProgress)
      
      if (updatedProgress.currentFlow) {
        const flowWithProgress = OnboardingService.getFlowWithProgress(
          updatedProgress.currentFlow, 
          updatedProgress
        )
        setCurrentFlow(flowWithProgress)
      }
    }
  }

  const resetOnboarding = () => {
    if (!tenant) return

    if (confirm('Are you sure you want to reset your onboarding progress? This will start everything over from the beginning.')) {
      OnboardingService.resetProgress(tenant.id, 'demo-user')
      setUserProgress(null)
      setCurrentFlow(null)
    }
  }

  const getStepIcon = (category: string) => {
    switch (category) {
      case 'setup': return '🔧'
      case 'configuration': return '⚙️'
      case 'tutorial': return '🎓'
      case 'integration': return '🔗'
      default: return '📋'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'setup': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
      case 'configuration': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
      case 'tutorial': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
      case 'integration': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading onboarding...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <TenantDashboardHeader
        onShowAlerts={() => {}}
        onShowCustomization={() => {}}
        selectedDateRange="30d"
        onDateRangeChange={() => {}}
        isRefreshing={false}
        lastUpdated={new Date()}
      />

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to {tenant?.name}! 👋
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Let's get you started with your analytics dashboard. Choose a path below to begin.
            </p>
          </div>

          {/* Current Flow Progress */}
          {currentFlow && userProgress && (
            <div className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {currentFlow.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {currentFlow.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {currentFlow.completedSteps}/{currentFlow.totalSteps}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">completed</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{Math.round((currentFlow.completedSteps / currentFlow.totalSteps) * 100)}%</span>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentFlow.completedSteps / currentFlow.totalSteps) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  {currentFlow.steps.map((step, index) => (
                    <div 
                      key={step.id}
                      className={`flex items-center space-x-4 p-4 rounded-lg border ${
                        step.isCompleted 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : userProgress.currentStep === step.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {step.isCompleted ? (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                        ) : userProgress.currentStep === step.id ? (
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 text-sm font-bold">
                            {index + 1}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {step.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(step.category)}`}>
                            {step.category}
                          </span>
                          {step.isRequired && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {step.description}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Estimated: {step.estimatedMinutes} minutes
                        </div>
                      </div>

                      {userProgress.currentStep === step.id && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => completeStep(step.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Complete
                          </button>
                          {!step.isRequired && (
                            <button
                              onClick={() => skipStep(step.id)}
                              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-4 py-2 text-sm font-medium"
                            >
                              Skip
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={resetOnboarding}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                  >
                    Reset Progress
                  </button>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Estimated time remaining: {currentFlow.estimatedDuration - Math.round(currentFlow.completedSteps * (currentFlow.estimatedDuration / currentFlow.totalSteps))} minutes
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Available Flows */}
          {!currentFlow && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Choose Your Path
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableFlows.map((flow) => (
                  <div key={flow.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {flow.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {flow.description}
                        </p>
                      </div>
                      <span className="text-2xl">🚀</span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <span>{flow.totalSteps} steps</span>
                        <span>~{flow.estimatedDuration} minutes</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {flow.steps.slice(0, 3).map(step => (
                          <span key={step.id} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                            {getStepIcon(step.category)} {step.title}
                          </span>
                        ))}
                        {flow.steps.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                            +{flow.steps.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => startFlow(flow.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Start {flow.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Tutorials */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Interactive Tutorials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availableTutorials.map((tutorial) => (
                <div key={tutorial.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {tutorial.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {tutorial.description}
                      </p>
                    </div>
                    <span className="text-2xl">🎓</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {tutorial.category}
                      </span>
                      <span>~{tutorial.estimatedMinutes} minutes</span>
                    </div>
                    
                    {tutorial.prerequisites.length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Prerequisites: {tutorial.prerequisites.join(', ')}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      // In a real app, this would start the interactive tutorial
                      alert(`Starting tutorial: ${tutorial.name}`)
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Start Tutorial
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Help Resources */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8 border border-blue-200 dark:border-blue-800">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Need Help? 🤝
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We're here to help you succeed with your analytics journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Documentation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Comprehensive guides and API references
                </p>
                <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                  View Docs →
                </button>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-3">💬</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Support Chat</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Get instant help from our support team
                </p>
                <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                  Start Chat →
                </button>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Custom Training</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Schedule a personalized training session
                </p>
                <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                  Book Session →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Main page component with tenant provider
export default function TenantOnboardingPage() {
  const params = useParams()
  const tenantSlug = params.slug as string

  return (
    <TenantProvider tenantSlug={tenantSlug}>
      <TenantOnboarding />
    </TenantProvider>
  )
}