// User journey flow data with conversion funnels
export interface JourneyStage {
  id: string
  name: string
  description: string
  icon: string
  users: number
  conversionRate: number
  dropOffRate: number
  avgTimeOnStage: string
  commonActions: string[]
  dropOffReasons: string[]
}

export interface UserJourney {
  source: string
  sourceType: 'organic-search' | 'paid-search' | 'social-media' | 'direct' | 'email' | 'referral'
  stages: JourneyStage[]
  totalUsers: number
  totalConversions: number
  overallConversionRate: number
}

export interface JourneyFilter {
  trafficSource?: string
  dateRange?: string
  deviceType?: string
  userType?: 'new' | 'returning' | 'all'
}

// Generate journey data based on traffic source
export const getJourneyData = (
  propertyName: string | null, 
  source: string = 'reddit-ads',
  filters: JourneyFilter = {}
): UserJourney => {
  const isEcommerce = propertyName === 'E-commerce Site'
  const isWebsite = propertyName === 'My Website'
  
  // Base multipliers for different property types
  const baseMultiplier = isEcommerce ? 2.5 : isWebsite ? 1.2 : 1.0
  
  // Journey templates based on source type
  if (source === 'reddit-ads') {
    const initialUsers = Math.round(1200 * baseMultiplier)
    
    return {
      source: 'Reddit Ads',
      sourceType: 'paid-search',
      totalUsers: initialUsers,
      totalConversions: Math.round(initialUsers * 0.08),
      overallConversionRate: 8.0,
      stages: [
        {
          id: 'landing',
          name: 'Landing Page',
          description: 'Users arrive from Reddit ads',
          icon: '🎯',
          users: initialUsers,
          conversionRate: 100,
          dropOffRate: 0,
          avgTimeOnStage: '0:45',
          commonActions: ['View landing page', 'Read headline', 'Scroll down'],
          dropOffReasons: []
        },
        {
          id: 'engagement',
          name: 'Content Engagement',
          description: 'Users interact with content',
          icon: '👀',
          users: Math.round(initialUsers * 0.65),
          conversionRate: 65,
          dropOffRate: 35,
          avgTimeOnStage: '2:30',
          commonActions: ['Read article', 'Watch video', 'Click CTA button'],
          dropOffReasons: ['Content not relevant', 'Slow page load', 'Ad mismatch']
        },
        {
          id: 'form-view',
          name: 'Registration Form',
          description: 'Users view event registration form',
          icon: '📝',
          users: Math.round(initialUsers * 0.45),
          conversionRate: 45,
          dropOffRate: 20,
          avgTimeOnStage: '1:15',
          commonActions: ['View form', 'Read event details', 'Check requirements'],
          dropOffReasons: ['Form too long', 'Required fields unclear', 'Privacy concerns']
        },
        {
          id: 'form-start',
          name: 'Form Started',
          description: 'Users begin filling the form',
          icon: '✏️',
          users: Math.round(initialUsers * 0.28),
          conversionRate: 28,
          dropOffRate: 17,
          avgTimeOnStage: '3:45',
          commonActions: ['Enter name', 'Enter email', 'Select preferences'],
          dropOffReasons: ['Form validation errors', 'Distraction', 'Technical issues']
        },
        {
          id: 'verification',
          name: 'Email Verification',
          description: 'Users verify their email',
          icon: '📧',
          users: Math.round(initialUsers * 0.18),
          conversionRate: 18,
          dropOffRate: 10,
          avgTimeOnStage: '5:20',
          commonActions: ['Check email', 'Click verify link', 'Return to site'],
          dropOffReasons: ['Email in spam', 'Forgot to check', 'Link expired']
        },
        {
          id: 'confirmation',
          name: 'Event Registration Complete',
          description: 'Successfully registered for event',
          icon: '🎉',
          users: Math.round(initialUsers * 0.08),
          conversionRate: 8,
          dropOffRate: 10,
          avgTimeOnStage: '1:00',
          commonActions: ['View confirmation', 'Add to calendar', 'Share event'],
          dropOffReasons: ['Payment issues', 'Changed mind', 'Technical error']
        }
      ]
    }
  }
  
  if (source === 'google-ads') {
    const initialUsers = Math.round(3500 * baseMultiplier)
    
    return {
      source: 'Google Ads',
      sourceType: 'paid-search',
      totalUsers: initialUsers,
      totalConversions: Math.round(initialUsers * 0.12),
      overallConversionRate: 12.0,
      stages: [
        {
          id: 'landing',
          name: 'Landing Page',
          description: 'Users arrive from Google ads',
          icon: '🎯',
          users: initialUsers,
          conversionRate: 100,
          dropOffRate: 0,
          avgTimeOnStage: '0:35',
          commonActions: ['View landing page', 'Read headline', 'Scan content'],
          dropOffReasons: []
        },
        {
          id: 'engagement',
          name: 'Content Engagement',
          description: 'Users explore the content',
          icon: '👀',
          users: Math.round(initialUsers * 0.78),
          conversionRate: 78,
          dropOffRate: 22,
          avgTimeOnStage: '2:10',
          commonActions: ['Read content', 'View testimonials', 'Check pricing'],
          dropOffReasons: ['High competition', 'Price concerns', 'Not ready to buy']
        },
        {
          id: 'form-view',
          name: 'Registration Form',
          description: 'Users view the registration form',
          icon: '📝',
          users: Math.round(initialUsers * 0.58),
          conversionRate: 58,
          dropOffRate: 20,
          avgTimeOnStage: '1:25',
          commonActions: ['Review form', 'Check requirements', 'Read terms'],
          dropOffReasons: ['Too many fields', 'Unclear benefits', 'Trust issues']
        },
        {
          id: 'form-start',
          name: 'Form Started',
          description: 'Users begin registration process',
          icon: '✏️',
          users: Math.round(initialUsers * 0.42),
          conversionRate: 42,
          dropOffRate: 16,
          avgTimeOnStage: '2:55',
          commonActions: ['Fill personal info', 'Select options', 'Review details'],
          dropOffReasons: ['Form errors', 'Abandoned mid-way', 'Comparison shopping']
        },
        {
          id: 'verification',
          name: 'Email Verification',
          description: 'Email verification step',
          icon: '📧',
          users: Math.round(initialUsers * 0.32),
          conversionRate: 32,
          dropOffRate: 10,
          avgTimeOnStage: '4:15',
          commonActions: ['Check email', 'Verify account', 'Return to complete'],
          dropOffReasons: ['Email delivery issues', 'Verification delay', 'Lost interest']
        },
        {
          id: 'confirmation',
          name: 'Registration Complete',
          description: 'Successfully completed registration',
          icon: '🎉',
          users: Math.round(initialUsers * 0.12),
          conversionRate: 12,
          dropOffRate: 20,
          avgTimeOnStage: '0:45',
          commonActions: ['Confirm registration', 'Download resources', 'Set reminders'],
          dropOffReasons: ['Last minute doubts', 'Payment failed', 'System error']
        }
      ]
    }
  }
  
  if (source === 'organic-search') {
    const initialUsers = Math.round(5200 * baseMultiplier)
    
    return {
      source: 'Organic Search',
      sourceType: 'organic-search',
      totalUsers: initialUsers,
      totalConversions: Math.round(initialUsers * 0.15),
      overallConversionRate: 15.0,
      stages: [
        {
          id: 'landing',
          name: 'Landing Page',
          description: 'Users arrive from search results',
          icon: '🔍',
          users: initialUsers,
          conversionRate: 100,
          dropOffRate: 0,
          avgTimeOnStage: '1:10',
          commonActions: ['Read page content', 'Check credibility', 'Browse sections'],
          dropOffReasons: []
        },
        {
          id: 'engagement',
          name: 'Content Exploration',
          description: 'Users explore multiple pages',
          icon: '📖',
          users: Math.round(initialUsers * 0.85),
          conversionRate: 85,
          dropOffRate: 15,
          avgTimeOnStage: '3:45',
          commonActions: ['Read blog posts', 'View about page', 'Check testimonials'],
          dropOffReasons: ['Information overload', 'Slow navigation', 'Poor mobile experience']
        },
        {
          id: 'form-view',
          name: 'Event Discovery',
          description: 'Users find event registration',
          icon: '🎪',
          users: Math.round(initialUsers * 0.68),
          conversionRate: 68,
          dropOffRate: 17,
          avgTimeOnStage: '2:20',
          commonActions: ['View event details', 'Check schedule', 'Read speaker info'],
          dropOffReasons: ['Event not relevant', 'Date conflicts', 'Location issues']
        },
        {
          id: 'form-start',
          name: 'Registration Start',
          description: 'Users start event registration',
          icon: '📋',
          users: Math.round(initialUsers * 0.45),
          conversionRate: 45,
          dropOffRate: 23,
          avgTimeOnStage: '4:20',
          commonActions: ['Fill registration form', 'Select sessions', 'Choose options'],
          dropOffReasons: ['Complex form', 'Required payment', 'Time constraints']
        },
        {
          id: 'verification',
          name: 'Account Verification',
          description: 'Email and account verification',
          icon: '✅',
          users: Math.round(initialUsers * 0.28),
          conversionRate: 28,
          dropOffRate: 17,
          avgTimeOnStage: '3:30',
          commonActions: ['Verify email', 'Create account', 'Set preferences'],
          dropOffReasons: ['Email issues', 'Account problems', 'Process too long']
        },
        {
          id: 'confirmation',
          name: 'Registration Success',
          description: 'Event registration confirmed',
          icon: '🎯',
          users: Math.round(initialUsers * 0.15),
          conversionRate: 15,
          dropOffRate: 13,
          avgTimeOnStage: '1:30',
          commonActions: ['Confirm attendance', 'Download ticket', 'Share with others'],
          dropOffReasons: ['Payment issues', 'System errors', 'Changed plans']
        }
      ]
    }
  }
  
  // Default journey for social media sources
  const initialUsers = Math.round(800 * baseMultiplier)
  
  return {
    source: 'Social Media',
    sourceType: 'social-media',
    totalUsers: initialUsers,
    totalConversions: Math.round(initialUsers * 0.06),
    overallConversionRate: 6.0,
    stages: [
      {
        id: 'landing',
        name: 'Social Landing',
        description: 'Users click from social media',
        icon: '📱',
        users: initialUsers,
        conversionRate: 100,
        dropOffRate: 0,
        avgTimeOnStage: '0:25',
        commonActions: ['Quick page scan', 'Check if relevant', 'Decide to stay'],
        dropOffReasons: []
      },
      {
        id: 'engagement',
        name: 'Quick Browse',
        description: 'Brief content engagement',
        icon: '⚡',
        users: Math.round(initialUsers * 0.45),
        conversionRate: 45,
        dropOffRate: 55,
        avgTimeOnStage: '1:15',
        commonActions: ['Skim content', 'Check images', 'Look for social proof'],
        dropOffReasons: ['Short attention span', 'Mobile distractions', 'Content mismatch']
      },
      {
        id: 'form-view',
        name: 'Event Interest',
        description: 'Show interest in event',
        icon: '💡',
        users: Math.round(initialUsers * 0.22),
        conversionRate: 22,
        dropOffRate: 23,
        avgTimeOnStage: '0:55',
        commonActions: ['View event info', 'Quick details scan', 'Check date'],
        dropOffReasons: ['Impulse browsing', 'Event not appealing', 'No immediate need']
      },
      {
        id: 'form-start',
        name: 'Quick Registration',
        description: 'Start registration process',
        icon: '🚀',
        users: Math.round(initialUsers * 0.12),
        conversionRate: 12,
        dropOffRate: 10,
        avgTimeOnStage: '2:10',
        commonActions: ['Quick form fill', 'Minimal info', 'Fast submission'],
        dropOffReasons: ['Form too long', 'Lost interest', 'Mobile issues']
      },
      {
        id: 'verification',
        name: 'Quick Verify',
        description: 'Simple verification step',
        icon: '⚡',
        users: Math.round(initialUsers * 0.08),
        conversionRate: 8,
        dropOffRate: 4,
        avgTimeOnStage: '2:45',
        commonActions: ['Check email quickly', 'One-click verify', 'Return fast'],
        dropOffReasons: ['Forgot to check', 'Distracted by other content', 'Lost momentum']
      },
      {
        id: 'confirmation',
        name: 'Event Registered',
        description: 'Registration completed',
        icon: '✨',
        users: Math.round(initialUsers * 0.06),
        conversionRate: 6,
        dropOffRate: 2,
        avgTimeOnStage: '0:30',
        commonActions: ['Quick confirm', 'Share on social', 'Set reminder'],
        dropOffReasons: ['Last second doubts', 'Technical issues', 'Changed mind']
      }
    ]
  }
}

// Get available traffic sources for journey analysis
export const getAvailableJourneySources = (propertyName: string | null) => {
  const sources = [
    { id: 'reddit-ads', name: 'Reddit Ads', type: 'paid-search', icon: '📱' },
    { id: 'google-ads', name: 'Google Ads', type: 'paid-search', icon: '🎯' },
    { id: 'organic-search', name: 'Organic Search', type: 'organic-search', icon: '🔍' },
    { id: 'facebook-ads', name: 'Facebook Ads', type: 'social-media', icon: '📘' },
    { id: 'linkedin-ads', name: 'LinkedIn Ads', type: 'social-media', icon: '💼' },
    { id: 'instagram-ads', name: 'Instagram Ads', type: 'social-media', icon: '📸' },
    { id: 'email-campaign', name: 'Email Campaign', type: 'email', icon: '📧' },
    { id: 'direct-traffic', name: 'Direct Traffic', type: 'direct', icon: '🔗' }
  ]
  
  return sources
}