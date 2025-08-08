// Client onboarding flow and tutorial system
export interface OnboardingStep {
  id: string
  title: string
  description: string
  component: string // Component to render for this step
  isCompleted: boolean
  isRequired: boolean
  estimatedMinutes: number
  category: 'setup' | 'configuration' | 'tutorial' | 'integration'
}

export interface OnboardingFlow {
  id: string
  name: string
  description: string
  steps: OnboardingStep[]
  completedSteps: number
  totalSteps: number
  estimatedDuration: number
  targetRole: 'owner' | 'admin' | 'editor' | 'any'
}

export interface UserProgress {
  tenantId: string
  userId: string
  currentFlow?: string
  currentStep?: string
  completedSteps: string[]
  skippedSteps: string[]
  startedAt: Date
  lastActiveAt: Date
  completedAt?: Date
}

export interface TutorialTooltip {
  id: string
  target: string // CSS selector
  title: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right'
  action?: {
    type: 'click' | 'input' | 'wait'
    description: string
    validation?: (element: Element) => boolean
  }
}

export interface InteractiveTutorial {
  id: string
  name: string
  description: string
  category: string
  estimatedMinutes: number
  tooltips: TutorialTooltip[]
  prerequisites: string[]
}

// Sample onboarding flows
export const onboardingFlows: OnboardingFlow[] = [
  {
    id: 'tenant-setup',
    name: 'Organization Setup',
    description: 'Get your organization configured and ready to use',
    targetRole: 'owner',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Analytics Dashboard',
        description: 'Learn about the features and capabilities available to your organization',
        component: 'WelcomeStep',
        isCompleted: false,
        isRequired: true,
        estimatedMinutes: 2,
        category: 'setup'
      },
      {
        id: 'team-setup',
        title: 'Invite Your Team',
        description: 'Add team members and assign appropriate roles',
        component: 'TeamSetupStep',
        isCompleted: false,
        isRequired: false,
        estimatedMinutes: 5,
        category: 'setup'
      },
      {
        id: 'data-sources',
        title: 'Connect Data Sources',
        description: 'Connect Google Analytics and other data sources',
        component: 'DataSourcesStep',
        isCompleted: false,
        isRequired: true,
        estimatedMinutes: 8,
        category: 'integration'
      },
      {
        id: 'dashboard-setup',
        title: 'Customize Your Dashboard',
        description: 'Configure KPI cards and chart preferences',
        component: 'DashboardSetupStep',
        isCompleted: false,
        isRequired: false,
        estimatedMinutes: 5,
        category: 'configuration'
      },
      {
        id: 'alerts-setup',
        title: 'Set Up Alerts',
        description: 'Create alerts for important metrics and thresholds',
        component: 'AlertsSetupStep',
        isCompleted: false,
        isRequired: false,
        estimatedMinutes: 3,
        category: 'configuration'
      }
    ],
    completedSteps: 0,
    totalSteps: 5,
    estimatedDuration: 23,
  },
  {
    id: 'analyst-training',
    name: 'Analyst Training',
    description: 'Learn advanced analytics features and best practices',
    targetRole: 'any',
    steps: [
      {
        id: 'dashboard-overview',
        title: 'Dashboard Overview',
        description: 'Understand the main dashboard and navigation',
        component: 'DashboardOverviewStep',
        isCompleted: false,
        isRequired: true,
        estimatedMinutes: 3,
        category: 'tutorial'
      },
      {
        id: 'ab-testing-intro',
        title: 'A/B Testing Basics',
        description: 'Learn how to create and analyze A/B tests',
        component: 'ABTestingStep',
        isCompleted: false,
        isRequired: false,
        estimatedMinutes: 10,
        category: 'tutorial'
      },
      {
        id: 'cohort-analysis',
        title: 'Cohort Analysis',
        description: 'Understand user retention and cohort tracking',
        component: 'CohortAnalysisStep',
        isCompleted: false,
        isRequired: false,
        estimatedMinutes: 8,
        category: 'tutorial'
      },
      {
        id: 'segmentation',
        title: 'User Segmentation',
        description: 'Create and analyze user segments',
        component: 'SegmentationStep',
        isCompleted: false,
        isRequired: false,
        estimatedMinutes: 12,
        category: 'tutorial'
      }
    ],
    completedSteps: 0,
    totalSteps: 4,
    estimatedDuration: 33,
  }
]

// Interactive tutorials
export const interactiveTutorials: InteractiveTutorial[] = [
  {
    id: 'dashboard-walkthrough',
    name: 'Dashboard Walkthrough',
    description: 'Take a guided tour of your analytics dashboard',
    category: 'Getting Started',
    estimatedMinutes: 5,
    prerequisites: [],
    tooltips: [
      {
        id: 'kpi-cards',
        target: '[data-tutorial="kpi-cards"]',
        title: 'KPI Cards',
        content: 'These cards show your most important metrics at a glance. You can customize which metrics to display.',
        position: 'bottom'
      },
      {
        id: 'date-range',
        target: '[data-tutorial="date-range"]',
        title: 'Date Range Selector',
        content: 'Change the date range to analyze different time periods. This affects all charts and metrics.',
        position: 'left',
        action: {
          type: 'click',
          description: 'Try selecting a different date range'
        }
      },
      {
        id: 'charts-section',
        target: '[data-tutorial="charts"]',
        title: 'Interactive Charts',
        content: 'These charts provide detailed insights into your data. Hover over data points for more information.',
        position: 'top'
      },
      {
        id: 'user-journey',
        target: '[data-tutorial="user-journey"]',
        title: 'User Journey Flow',
        content: 'Visualize how users move through your site and identify conversion bottlenecks.',
        position: 'top'
      }
    ]
  },
  {
    id: 'ab-test-creation',
    name: 'Create Your First A/B Test',
    description: 'Learn how to set up and run an A/B test',
    category: 'A/B Testing',
    estimatedMinutes: 8,
    prerequisites: ['dashboard-walkthrough'],
    tooltips: [
      {
        id: 'ab-test-nav',
        target: '[data-tutorial="ab-testing-nav"]',
        title: 'A/B Testing Section',
        content: 'Navigate to the A/B testing section to create and manage your experiments.',
        position: 'right',
        action: {
          type: 'click',
          description: 'Click to go to A/B Testing'
        }
      },
      {
        id: 'create-test',
        target: '[data-tutorial="create-test"]',
        title: 'Create New Test',
        content: 'Click here to start creating a new A/B test experiment.',
        position: 'bottom',
        action: {
          type: 'click',
          description: 'Click to create a new test'
        }
      },
      {
        id: 'test-config',
        target: '[data-tutorial="test-config"]',
        title: 'Test Configuration',
        content: 'Configure your test variants, traffic allocation, and success metrics.',
        position: 'left'
      }
    ]
  },
  {
    id: 'cohort-setup',
    name: 'Understanding Cohorts',
    description: 'Learn how to analyze user retention with cohorts',
    category: 'Advanced Analytics',
    estimatedMinutes: 6,
    prerequisites: ['dashboard-walkthrough'],
    tooltips: [
      {
        id: 'cohorts-nav',
        target: '[data-tutorial="cohorts-nav"]',
        title: 'Cohort Analysis',
        content: 'Cohorts help you understand how user behavior changes over time.',
        position: 'right'
      },
      {
        id: 'cohort-heatmap',
        target: '[data-tutorial="cohort-heatmap"]',
        title: 'Retention Heatmap',
        content: 'This heatmap shows user retention rates for different cohorts over time.',
        position: 'top'
      },
      {
        id: 'cohort-filters',
        target: '[data-tutorial="cohort-filters"]',
        title: 'Cohort Filters',
        content: 'Filter cohorts by date range, user properties, or acquisition channel.',
        position: 'bottom'
      }
    ]
  }
]

// Onboarding service class
export class OnboardingService {
  private static readonly STORAGE_KEY = 'analytics_onboarding_progress'

  // Get user progress for a specific tenant
  static getUserProgress(tenantId: string, userId: string): UserProgress | null {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}_${tenantId}_${userId}`)
      if (!stored) return null
      
      const progress = JSON.parse(stored)
      return {
        ...progress,
        startedAt: new Date(progress.startedAt),
        lastActiveAt: new Date(progress.lastActiveAt),
        completedAt: progress.completedAt ? new Date(progress.completedAt) : undefined
      }
    } catch {
      return null
    }
  }

  // Save user progress
  static saveUserProgress(progress: UserProgress): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(
        `${this.STORAGE_KEY}_${progress.tenantId}_${progress.userId}`,
        JSON.stringify(progress)
      )
    } catch (error) {
      console.warn('Failed to save onboarding progress:', error)
    }
  }

  // Start an onboarding flow
  static startOnboarding(
    tenantId: string, 
    userId: string, 
    flowId: string
  ): UserProgress {
    const progress: UserProgress = {
      tenantId,
      userId,
      currentFlow: flowId,
      currentStep: undefined,
      completedSteps: [],
      skippedSteps: [],
      startedAt: new Date(),
      lastActiveAt: new Date()
    }

    const flow = this.getFlow(flowId)
    if (flow && flow.steps.length > 0) {
      progress.currentStep = flow.steps[0].id
    }

    this.saveUserProgress(progress)
    return progress
  }

  // Mark step as completed
  static completeStep(
    tenantId: string, 
    userId: string, 
    stepId: string
  ): UserProgress | null {
    const progress = this.getUserProgress(tenantId, userId)
    if (!progress) return null

    // Add to completed steps if not already there
    if (!progress.completedSteps.includes(stepId)) {
      progress.completedSteps.push(stepId)
    }

    // Remove from skipped steps if it was skipped
    progress.skippedSteps = progress.skippedSteps.filter(id => id !== stepId)

    // Update timestamps
    progress.lastActiveAt = new Date()

    // Move to next step
    const flow = this.getFlow(progress.currentFlow!)
    if (flow) {
      const currentStepIndex = flow.steps.findIndex(s => s.id === stepId)
      const nextStep = flow.steps[currentStepIndex + 1]
      
      if (nextStep) {
        progress.currentStep = nextStep.id
      } else {
        // Flow completed
        progress.completedAt = new Date()
        progress.currentStep = undefined
      }
    }

    this.saveUserProgress(progress)
    return progress
  }

  // Skip a step
  static skipStep(
    tenantId: string, 
    userId: string, 
    stepId: string
  ): UserProgress | null {
    const progress = this.getUserProgress(tenantId, userId)
    if (!progress) return null

    // Add to skipped steps if not already there
    if (!progress.skippedSteps.includes(stepId)) {
      progress.skippedSteps.push(stepId)
    }

    // Remove from completed steps if it was completed
    progress.completedSteps = progress.completedSteps.filter(id => id !== stepId)

    // Move to next step (same logic as complete)
    const flow = this.getFlow(progress.currentFlow!)
    if (flow) {
      const currentStepIndex = flow.steps.findIndex(s => s.id === stepId)
      const nextStep = flow.steps[currentStepIndex + 1]
      
      if (nextStep) {
        progress.currentStep = nextStep.id
      } else {
        progress.currentStep = undefined
      }
    }

    progress.lastActiveAt = new Date()
    this.saveUserProgress(progress)
    return progress
  }

  // Get available flows for a user role
  static getFlowsForRole(role: string): OnboardingFlow[] {
    return onboardingFlows.filter(flow => 
      flow.targetRole === 'any' || flow.targetRole === role
    )
  }

  // Get a specific flow
  static getFlow(flowId: string): OnboardingFlow | null {
    return onboardingFlows.find(flow => flow.id === flowId) || null
  }

  // Get flow with progress information
  static getFlowWithProgress(
    flowId: string, 
    progress: UserProgress
  ): OnboardingFlow | null {
    const flow = this.getFlow(flowId)
    if (!flow) return null

    // Calculate completed steps
    const completedSteps = flow.steps.filter(step => 
      progress.completedSteps.includes(step.id)
    ).length

    return {
      ...flow,
      completedSteps,
      steps: flow.steps.map(step => ({
        ...step,
        isCompleted: progress.completedSteps.includes(step.id)
      }))
    }
  }

  // Get available tutorials
  static getTutorials(): InteractiveTutorial[] {
    return interactiveTutorials
  }

  // Get tutorial by ID
  static getTutorial(tutorialId: string): InteractiveTutorial | null {
    return interactiveTutorials.find(tutorial => tutorial.id === tutorialId) || null
  }

  // Check if user can start a tutorial (prerequisites met)
  static canStartTutorial(
    tutorialId: string, 
    completedTutorials: string[]
  ): boolean {
    const tutorial = this.getTutorial(tutorialId)
    if (!tutorial) return false

    return tutorial.prerequisites.every(prereq => 
      completedTutorials.includes(prereq)
    )
  }

  // Reset onboarding progress
  static resetProgress(tenantId: string, userId: string): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(`${this.STORAGE_KEY}_${tenantId}_${userId}`)
    } catch (error) {
      console.warn('Failed to reset onboarding progress:', error)
    }
  }
}