'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X, Zap, Building2, Users, BarChart3 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Plan {
  id: string
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  currency: string
  features: string[]
  limitations?: string[]
  popular?: boolean
  cta: string
  ideal: string
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for individuals getting started with analytics',
    price: {
      monthly: 0,
      yearly: 0
    },
    currency: 'USD',
    features: [
      '1 User',
      '1 Dashboard',
      'Basic Analytics',
      '7-day data retention',
      'Standard widgets',
      'Email support',
      'Basic reporting'
    ],
    limitations: [
      'No team collaboration',
      'No API access',
      'No custom branding',
      'No advanced analytics'
    ],
    cta: 'Start Free',
    ideal: 'Individuals & Freelancers'
  },
  {
    id: 'startup',
    name: 'Startup',
    description: 'For small teams that need collaboration and more features',
    price: {
      monthly: 29,
      yearly: 290
    },
    currency: 'USD',
    features: [
      'Up to 5 Users',
      '10 Dashboards',
      'Team collaboration',
      '30-day data retention',
      'Advanced widgets',
      'Priority email support',
      'Custom reports',
      'Basic API access',
      'Data export'
    ],
    limitations: [
      'Single workspace only',
      'No white-label options',
      'No dedicated support'
    ],
    cta: 'Start Trial',
    ideal: 'Small Teams & Startups'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing businesses with advanced analytics needs',
    price: {
      monthly: 99,
      yearly: 990
    },
    currency: 'USD',
    popular: true,
    features: [
      'Up to 20 Users',
      'Unlimited Dashboards',
      'Multiple workspaces',
      '90-day data retention',
      'All widget types',
      'A/B Testing',
      'Cohort Analysis',
      'Advanced segmentation',
      'Full API access',
      'Priority support',
      'Custom integrations',
      'Advanced reporting'
    ],
    limitations: [
      'Single tenant only',
      'Standard branding'
    ],
    cta: 'Start Trial',
    ideal: 'Growing Businesses'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Multi-Tenant',
    description: 'Complete platform for agencies and enterprise organizations',
    price: {
      monthly: 299,
      yearly: 2990
    },
    currency: 'USD',
    features: [
      'Unlimited Users',
      'Unlimited Dashboards',
      'Multi-tenant architecture',
      'Unlimited data retention',
      'White-label branding',
      'Custom domain support',
      'Dedicated account manager',
      'SLA guarantee',
      'Advanced security features',
      'SSO/SAML integration',
      'Custom AI insights',
      'On-premise deployment option',
      'Full platform API',
      'Training & onboarding'
    ],
    cta: 'Contact Sales',
    ideal: 'Agencies & Enterprises'
  }
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const router = useRouter()

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      router.push('/auth/register?plan=free')
    } else if (planId === 'enterprise') {
      router.push('/contact-sales')
    } else {
      router.push(`/auth/register?plan=${planId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                Analytics Platform
              </span>
            </Link>
            <Link 
              href="/auth/signin" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
              Choose Your Plan
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              From individuals to enterprises, we have a plan that fits your needs
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="mt-8 flex justify-center">
            <div className="relative bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                onClick={() => setBillingCycle('yearly')}
              >
                Yearly
                <span className="ml-1 text-green-600 dark:text-green-400 text-xs">Save 20%</span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="mt-12 grid gap-8 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl ${
                  plan.popular ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white text-center">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {plan.ideal}
                  </p>
                  <p className="mt-4 text-gray-600 dark:text-gray-300">
                    {plan.description}
                  </p>

                  <div className="mt-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        ${billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                      </span>
                      <span className="ml-1 text-xl text-gray-500 dark:text-gray-400">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                      <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                        Save ${(plan.price.monthly * 12 - plan.price.yearly).toFixed(0)} yearly
                      </p>
                    )}
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                    {plan.limitations?.map((limitation) => (
                      <li key={limitation} className="flex">
                        <X className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400 line-through">
                          {limitation}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`mt-8 w-full py-3 px-4 rounded-lg font-medium transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                        : plan.id === 'enterprise'
                        ? 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Multi-Tenant Benefits */}
          <div className="mt-20">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Why Choose Multi-Tenant?
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Perfect for agencies, SaaS platforms, and enterprises managing multiple clients
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 text-blue-600">
                  <Building2 className="h-12 w-12" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Isolated Workspaces
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Each tenant gets their own secure, isolated environment with separate data and users
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto h-12 w-12 text-blue-600">
                  <Zap className="h-12 w-12" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  White-Label Ready
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Customize branding, domains, and UI for each tenant to match their identity
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto h-12 w-12 text-blue-600">
                  <Users className="h-12 w-12" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Centralized Management
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Manage all tenants, users, and billing from a single admin dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}