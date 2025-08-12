'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Building2, Users, CreditCard, Check } from 'lucide-react'

interface PlanInfo {
  id: string
  name: string
  price: number
  features: string[]
}

const planDetails: Record<string, PlanInfo> = {
  free: {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    features: ['1 User', '1 Dashboard', 'Basic Analytics']
  },
  startup: {
    id: 'startup',
    name: 'Startup Plan',
    price: 29,
    features: ['Up to 5 Users', '10 Dashboards', 'Team Collaboration']
  },
  professional: {
    id: 'professional',
    name: 'Professional Plan',
    price: 99,
    features: ['Up to 20 Users', 'Unlimited Dashboards', 'Advanced Analytics']
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Multi-Tenant',
    price: 299,
    features: ['Unlimited Users', 'Multi-Tenant', 'White-Label']
  }
}

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const plan = searchParams.get('plan') || 'free'
  const selectedPlan = planDetails[plan] || planDetails.free

  const [step, setStep] = useState(1)
  const [accountType, setAccountType] = useState<'personal' | 'tenant'>('personal')
  const [formData, setFormData] = useState({
    // Personal/User info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Tenant info (for tenant owners)
    organizationName: '',
    organizationSlug: '',
    industry: '',
    teamSize: '',
    // Agreement
    agreeToTerms: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Determine if this is a multi-tenant plan
  const isMultiTenantPlan = plan === 'enterprise'
  const canCreateTenant = ['startup', 'professional', 'enterprise'].includes(plan)

  useEffect(() => {
    // Auto-select tenant account type for eligible plans
    if (canCreateTenant && plan !== 'free') {
      setAccountType('tenant')
    }
  }, [plan, canCreateTenant])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleOrganizationNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      organizationName: name,
      organizationSlug: generateSlug(name)
    }))
  }

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.password) {
          setError('Please fill in all fields')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          return false
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters')
          return false
        }
        break
      case 2:
        if (accountType === 'tenant') {
          if (!formData.organizationName || !formData.organizationSlug) {
            setError('Please provide organization details')
            return false
          }
        }
        break
      case 3:
        if (!formData.agreeToTerms) {
          setError('Please agree to the terms and conditions')
          return false
        }
        break
    }
    setError('')
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep()) return

    setLoading(true)
    setError('')

    try {
      // Create account via API (using mock for now due to DB connection issues)
      const response = await fetch('/api/auth/register-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          plan: selectedPlan.id,
          accountType,
          role: accountType === 'tenant' ? 'TENANT_OWNER' : 'USER'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Registration successful - show success message and redirect to login
      alert(`Registration successful! Please sign in with your credentials.\n\nAccount created for: ${formData.email}`)
      
      // Redirect to sign in page
      router.push('/auth/signin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              AnalyticsPro
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Your Account
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Join thousands of teams using our analytics platform
          </p>
        </div>

        {/* Plan Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {selectedPlan.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedPlan.price === 0 ? 'Free forever' : `$${selectedPlan.price}/month`}
              </p>
            </div>
            <Link 
              href="/pricing" 
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Change plan
            </Link>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  i <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {i < step ? <Check className="w-5 h-5" /> : i}
                </div>
                {i < 3 && (
                  <div className={`w-20 h-1 ${
                    i < step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Personal Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Account Type & Organization */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Account Type
              </h2>

              {canCreateTenant && (
                <div className="space-y-4">
                  <label className="block">
                    <input
                      type="radio"
                      name="accountType"
                      value="personal"
                      checked={accountType === 'personal'}
                      onChange={(e) => setAccountType(e.target.value as 'personal' | 'tenant')}
                      className="mr-2"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Personal Account (Join existing organization)
                    </span>
                  </label>

                  <label className="block">
                    <input
                      type="radio"
                      name="accountType"
                      value="tenant"
                      checked={accountType === 'tenant'}
                      onChange={(e) => setAccountType(e.target.value as 'personal' | 'tenant')}
                      className="mr-2"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Organization Account (Create new tenant)
                    </span>
                  </label>
                </div>
              )}

              {accountType === 'tenant' && (
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleOrganizationNameChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Organization URL
                    </label>
                    <div className="flex items-center">
                      <span className="text-gray-500 pr-2">app.analytics.com/</span>
                      <input
                        type="text"
                        name="organizationSlug"
                        value={formData.organizationSlug}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Industry
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select industry</option>
                      <option value="technology">Technology</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="finance">Finance</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Team Size
                    </label>
                    <select
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select team size</option>
                      <option value="1-5">1-5 people</option>
                      <option value="6-20">6-20 people</option>
                      <option value="21-50">21-50 people</option>
                      <option value="51-100">51-100 people</option>
                      <option value="100+">100+ people</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Review & Confirm
              </h2>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Account Type:</span>
                  <span className="font-medium capitalize">{accountType}</span>
                </div>
                {accountType === 'tenant' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Organization:</span>
                    <span className="font-medium">{formData.organizationName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 mr-2"
                    required
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Sign In Link */}
        <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
