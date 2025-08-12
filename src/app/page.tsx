'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Check, X, Zap, Building2, Users, BarChart3, TrendingUp, Shield, Sparkles, Monitor, Beaker, UserCheck, Layers, Globe, Cpu } from 'lucide-react'

export default function Home() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isVisible, setIsVisible] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const stickyContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)

    const handleScroll = () => {
      if (!stickyContainerRef.current) return

      const container = stickyContainerRef.current
      const containerRect = container.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      
      // Check if we're in the sticky container area
      if (containerRect.top <= 0 && containerRect.bottom >= viewportHeight) {
        // Calculate scroll progress within the sticky container
        const totalScrollDistance = container.offsetHeight - viewportHeight
        const currentScrollPosition = Math.abs(containerRect.top)
        const progress = Math.min(currentScrollPosition / totalScrollDistance, 1)
        
        setScrollProgress(progress)
        
        // Determine current section based on progress
        const sectionIndex = Math.floor(progress * 4)
        setCurrentSection(Math.min(sectionIndex, 3))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for individuals getting started with analytics',
      price: {
        monthly: 0,
        yearly: 0
      },
      features: [
        '1 User',
        '1 Dashboard',
        'Basic Analytics',
        '7-day data retention',
        'Standard widgets',
        'Email support'
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
      features: [
        'Up to 5 Users',
        '10 Dashboards',
        'Team collaboration',
        '30-day data retention',
        'Advanced widgets',
        'Priority email support',
        'Custom reports',
        'Basic API access'
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
      popular: true,
      features: [
        'Up to 20 Users',
        'Unlimited Dashboards',
        'Multiple workspaces',
        '90-day data retention',
        'A/B Testing',
        'Cohort Analysis',
        'Advanced segmentation',
        'Full API access',
        'Priority support'
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
      features: [
        'Unlimited Users',
        'Unlimited Dashboards',
        'Multi-tenant architecture',
        'Unlimited data retention',
        'White-label branding',
        'Custom domain support',
        'Dedicated account manager',
        'SLA guarantee',
        'Advanced security features'
      ],
      cta: 'Contact Sales',
      ideal: 'Agencies & Enterprises'
    }
  ]

  const Dashboard3D = () => (
    <div className="relative w-full h-96 perspective-1000">
      <div className="absolute inset-0 transform-gpu transition-all duration-1000 hover:rotate-y-12 preserve-3d">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl transform rotate-3d">
          <div className="p-8 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <Monitor className="h-12 w-12 text-white/80" />
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/70 text-sm">Revenue</span>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">$124,592</div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div className="bg-green-400 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <BarChart3 className="h-6 w-6 text-blue-300 mb-2" />
                  <div className="text-white font-semibold">2.4K</div>
                  <div className="text-white/60 text-xs">Active Users</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <Sparkles className="h-6 w-6 text-purple-300 mb-2" />
                  <div className="text-white font-semibold">89%</div>
                  <div className="text-white/60 text-xs">Conversion</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const ABTest3D = () => (
    <div className="relative w-full h-96 perspective-1000">
      <div className="absolute inset-0 transform-gpu transition-all duration-1000 hover:rotate-y-12 preserve-3d">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl shadow-2xl transform -rotate-3d">
          <div className="p-8 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <Beaker className="h-12 w-12 text-white/80" />
              <div className="bg-white/20 rounded-full px-3 py-1">
                <span className="text-white text-sm font-medium">Running</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-white/70 text-sm mb-2">Test: Button Color</div>
                <div className="text-3xl font-bold text-white">A/B Split Test</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border-l-4 border-blue-400">
                  <div className="text-white font-semibold mb-1">Variant A</div>
                  <div className="text-2xl font-bold text-white">12.4%</div>
                  <div className="text-white/60 text-xs">Conversion Rate</div>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                    <div className="bg-blue-400 h-2 rounded-full w-1/2"></div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border-l-4 border-green-400">
                  <div className="text-white font-semibold mb-1">Variant B</div>
                  <div className="text-2xl font-bold text-white">15.7%</div>
                  <div className="text-white/60 text-xs">Conversion Rate</div>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                    <div className="bg-green-400 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
              <div className="bg-green-400/20 border border-green-400 rounded-lg p-2 text-center">
                <div className="text-green-300 text-sm font-medium">🎉 Variant B is winning with 95% confidence</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const Cohort3D = () => (
    <div className="relative w-full h-96 perspective-1000">
      <div className="absolute inset-0 transform-gpu transition-all duration-1000 hover:rotate-y-12 preserve-3d">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-2xl transform rotate-3d">
          <div className="p-8 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <UserCheck className="h-12 w-12 text-white/80" />
              <div className="text-white/70 text-sm">User Retention</div>
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-white/70 text-sm mb-3">30-Day Cohort Analysis</div>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {[100, 85, 72, 68, 61, 58, 52].map((value, i) => (
                    <div key={i} className="text-center">
                      <div className={`h-8 rounded ${
                        value >= 80 ? 'bg-green-400' : 
                        value >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                      } flex items-center justify-center`}>
                        <span className="text-xs font-bold text-white">{value}%</span>
                      </div>
                      <div className="text-white/60 text-xs mt-1">D{i}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-semibold">Weekly Retention</div>
                    <div className="text-white/60 text-sm">Average: 68%</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-300" />
                    <span className="text-white font-semibold">1,247 users</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const MultiTenant3D = () => (
    <div className="relative w-full h-96 perspective-1000">
      <div className="absolute inset-0 transform-gpu transition-all duration-1000 hover:rotate-y-12 preserve-3d">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl shadow-2xl transform -rotate-3d">
          <div className="p-8 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <Layers className="h-12 w-12 text-white/80" />
              <Globe className="h-8 w-8 text-white/60" />
            </div>
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="text-white/70 text-sm">Multi-Tenant Architecture</div>
                <div className="text-2xl font-bold text-white">4 Active Tenants</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['Acme Corp', 'TechStart', 'DataFlow', 'GrowthCo'].map((tenant, i) => (
                  <div key={tenant} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border-l-4 border-blue-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-medium text-sm">{tenant}</div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-white/60 text-xs">
                      {[156, 89, 234, 123][i]} users • {[12, 7, 18, 9][i]} dashboards
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-blue-300" />
                  <span className="text-white text-sm">System Health</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-12 bg-white/20 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full w-11/12"></div>
                  </div>
                  <span className="text-green-300 text-sm font-medium">98%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <style jsx>{`
        .sticky-container {
          height: 400vh; /* 4x viewport height for 4 sections */
        }
        .sticky-content {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
        }
        .section-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transform: translateY(50px);
          transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform, opacity;
        }
        .section-slide.active {
          opacity: 1;
          transform: translateY(0);
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .rotate-3d {
          transform: rotateX(15deg) rotateY(-15deg);
        }
        .-rotate-3d {
          transform: rotateX(-15deg) rotateY(15deg);
        }
        .rotate-y-12:hover {
          transform: rotateY(12deg);
        }
        .transform-gpu {
          transform: translateZ(0);
          will-change: transform;
        }
        .number-animate {
          background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c);
          background-size: 400% 400%;
          animation: gradient 3s ease infinite;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(1deg); }
          50% { transform: translateY(-5px) rotate(-1deg); }
          75% { transform: translateY(-15px) rotate(0.5deg); }
        }
        .progress-indicator {
          position: fixed;
          right: 2rem;
          top: 50%;
          transform: translateY(-50%);
          z-index: 50;
        }
        .progress-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin: 1rem 0;
          background: rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }
        .progress-dot.active {
          background: #667eea;
          transform: scale(1.2);
        }
      `}</style>
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AnalyticsPro
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                Features
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
              >
                Pricing
              </Link>
              <Link href="#demo" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                Demo
              </Link>
              <Link 
                href="/auth/signin"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`py-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                🚀 Enterprise-Grade Analytics Platform
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Transform Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                Analytics Data
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
              Build beautiful dashboards, run A/B tests, analyze user cohorts, and make data-driven decisions 
              with our comprehensive analytics platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/auth/register"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
              >
                <span>🚀 Start Free Trial</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <a 
                href="#pricing"
                className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                View Pricing
              </a>
            </div>

            {/* Social Proof */}
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Trusted by teams at</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <span className="font-semibold text-gray-400">Acme Corp</span>
                <span className="font-semibold text-gray-400">TechStart</span>
                <span className="font-semibold text-gray-400">DataFlow</span>
                <span className="font-semibold text-gray-400">GrowthCo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section with sticky scroll behavior */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8">
              Everything You Need to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Analyze & Grow
              </span>
            </h2>
            <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              From basic analytics to advanced machine learning insights, our platform scales with your business needs 
              and delivers actionable insights that drive growth.
            </p>
          </div>

          {/* Sticky Feature Showcase */}
          <div ref={stickyContainerRef} className="sticky-container">
            <div className="sticky-content">
              {/* Progress Indicator */}
              <div className="progress-indicator">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`progress-dot ${currentSection === index ? 'active' : ''}`}
                  />
                ))}
              </div>

              {/* Section 01 - Dashboard Analytics */}
              <div className={`section-slide ${currentSection === 0 ? 'active' : ''}`}>
                <div className="h-full flex items-center">
                  <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                      <div className="float">
                        <Dashboard3D />
                      </div>
                      <div>
                        <div className="flex items-center mb-6">
                          <span className="text-6xl font-bold text-transparent bg-clip-text mr-6 number-animate">
                            01
                          </span>
                          <div className="h-px flex-1 bg-gradient-to-r from-blue-600 to-transparent"></div>
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                          Interactive Dashboards
                        </h3>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                          Build stunning dashboards with drag-and-drop widgets, real-time data streams, 
                          and customizable KPI cards. Visualize your data exactly how you need it.
                        </p>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            <span className="text-gray-700 dark:text-gray-300">Real-time data visualization</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            <span className="text-gray-700 dark:text-gray-300">Drag-and-drop dashboard builder</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Sparkles className="h-5 w-5 text-blue-600" />
                            <span className="text-gray-700 dark:text-gray-300">50+ pre-built widgets</span>
                          </div>
                        </div>
                        <Link 
                          href="/tenant/demo/dashboard" 
                          className="inline-flex items-center mt-8 text-blue-600 dark:text-blue-400 font-semibold text-lg hover:underline"
                        >
                          View Live Dashboard Demo →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 02 - A/B Testing */}
              <div className={`section-slide ${currentSection === 1 ? 'active' : ''}`}>
                <div className="h-full flex items-center">
                  <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                      <div className="float">
                        <ABTest3D />
                      </div>
                      <div>
                        <div className="flex items-center mb-6">
                          <span className="text-6xl font-bold text-transparent bg-clip-text mr-6 number-animate">
                            02
                          </span>
                          <div className="h-px flex-1 bg-gradient-to-r from-purple-600 to-transparent"></div>
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                          A/B Testing Suite
                        </h3>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                          Run statistically significant experiments with automated insights, variant analysis, 
                          and intelligent recommendations to optimize your conversion rates.
                        </p>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Shield className="h-5 w-5 text-purple-600" />
                            <span className="text-gray-700 dark:text-gray-300">Statistical significance tracking</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                            <span className="text-gray-700 dark:text-gray-300">Automated winner detection</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            <span className="text-gray-700 dark:text-gray-300">Multi-variant testing</span>
                          </div>
                        </div>
                        <Link 
                          href="/tenant/demo/ab-testing" 
                          className="inline-flex items-center mt-8 text-purple-600 dark:text-purple-400 font-semibold text-lg hover:underline"
                        >
                          Try A/B Testing →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 03 - Cohort Analysis */}
              <div className={`section-slide ${currentSection === 2 ? 'active' : ''}`}>
                <div className="h-full flex items-center">
                  <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                      <div className="float">
                        <Cohort3D />
                      </div>
                      <div>
                        <div className="flex items-center mb-6">
                          <span className="text-6xl font-bold text-transparent bg-clip-text mr-6 number-animate">
                            03
                          </span>
                          <div className="h-px flex-1 bg-gradient-to-r from-green-600 to-transparent"></div>
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                          Cohort Analysis & Retention
                        </h3>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                          Track user retention, lifetime value, and behavioral patterns with beautiful cohort visualizations 
                          that reveal insights about customer loyalty and churn.
                        </p>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Users className="h-5 w-5 text-green-600" />
                            <span className="text-gray-700 dark:text-gray-300">User retention analysis</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <span className="text-gray-700 dark:text-gray-300">Lifetime value tracking</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <BarChart3 className="h-5 w-5 text-green-600" />
                            <span className="text-gray-700 dark:text-gray-300">Behavioral pattern recognition</span>
                          </div>
                        </div>
                        <Link 
                          href="/tenant/demo/cohorts" 
                          className="inline-flex items-center mt-8 text-green-600 dark:text-green-400 font-semibold text-lg hover:underline"
                        >
                          Explore Cohorts →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 04 - Multi-Tenant Architecture */}
              <div className={`section-slide ${currentSection === 3 ? 'active' : ''}`}>
                <div className="h-full flex items-center">
                  <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                      <div className="float">
                        <MultiTenant3D />
                      </div>
                      <div>
                        <div className="flex items-center mb-6">
                          <span className="text-6xl font-bold text-transparent bg-clip-text mr-6 number-animate">
                            04
                          </span>
                          <div className="h-px flex-1 bg-gradient-to-r from-indigo-600 to-transparent"></div>
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                          Multi-Tenant SaaS Platform
                        </h3>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                          Serve multiple organizations with completely isolated data, custom branding, 
                          role-based permissions, and white-label capabilities.
                        </p>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                            <span className="text-gray-700 dark:text-gray-300">Isolated tenant workspaces</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Zap className="h-5 w-5 text-indigo-600" />
                            <span className="text-gray-700 dark:text-gray-300">White-label branding</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Shield className="h-5 w-5 text-indigo-600" />
                            <span className="text-gray-700 dark:text-gray-300">Enterprise-grade security</span>
                          </div>
                        </div>
                        <Link 
                          href="/tenant" 
                          className="inline-flex items-center mt-8 text-indigo-600 dark:text-indigo-400 font-semibold text-lg hover:underline"
                        >
                          See Multi-Tenancy →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="mt-32 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-8 rounded-2xl border border-orange-100 dark:border-orange-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl mb-6">🎯</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Advanced Segmentation
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Create precise user segments based on behavior, geography, demographics, and custom properties.
              </p>
              <Link href="/tenant/demo/segments" className="text-orange-600 dark:text-orange-400 font-medium hover:underline">
                Build Segments →
              </Link>
            </div>

            <div className="group bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-8 rounded-2xl border border-yellow-100 dark:border-yellow-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl mb-6">🤖</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                AI-Powered Insights
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Get automated recommendations, anomaly detection, and predictive analytics powered by machine learning.
              </p>
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                Coming Soon →
              </span>
            </div>

            <div className="group bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-8 rounded-2xl border border-cyan-100 dark:border-cyan-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl mb-6">🔗</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                API & Integrations
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Connect with 100+ tools and services through our REST API, webhooks, and native integrations.
              </p>
              <span className="text-cyan-600 dark:text-cyan-400 font-medium">
                View Docs →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose the perfect plan for your business. From individuals to enterprises, 
              we have a solution that scales with your needs.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="relative bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex">
              <button
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                onClick={() => setBillingCycle('yearly')}
              >
                Yearly
                <span className="ml-2 text-green-600 dark:text-green-400 text-xs font-bold">Save 20%</span>
              </button>
            </div>
          </div>
          
          {/* Plans Grid */}
          <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 transition-all duration-300 hover:scale-105 ${
                  plan.popular ? 'border-blue-600 ring-4 ring-blue-600/20' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 mx-auto w-32">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-full text-sm font-bold text-center">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {plan.ideal}
                    </p>
                    <div className="mb-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                          ${billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                        </span>
                        <span className="ml-1 text-lg text-gray-500 dark:text-gray-400">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                          Save ${(plan.price.monthly * 12 - plan.price.yearly).toFixed(0)} yearly
                        </p>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.id === 'enterprise' ? '/contact-sales' : `/auth/register?plan=${plan.id}`}
                    className={`block w-full py-3 px-4 rounded-lg font-medium text-center transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                        : plan.id === 'enterprise'
                        ? 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  {plan.id !== 'enterprise' && (
                    <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                      14-day free trial • No credit card required
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Multi-Tenant Benefits */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Enterprise Multi-Tenant?
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Perfect for agencies, SaaS platforms, and enterprises managing multiple clients
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="mx-auto h-16 w-16 text-blue-600 mb-4">
                  <Building2 className="h-16 w-16" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Isolated Workspaces
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Each tenant gets their own secure, isolated environment with separate data and users
                </p>
              </div>

              <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="mx-auto h-16 w-16 text-blue-600 mb-4">
                  <Zap className="h-16 w-16" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  White-Label Ready
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Customize branding, domains, and UI for each tenant to match their identity
                </p>
              </div>

              <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="mx-auto h-16 w-16 text-blue-600 mb-4">
                  <Users className="h-16 w-16" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Centralized Management
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage all tenants, users, and billing from a single admin dashboard
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Questions about our pricing? <Link href="#contact" className="text-blue-600 hover:underline font-medium">Contact our sales team</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              See It In Action
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Explore our live demo with real data and interactive features. No signup required.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Link 
                href="/tenant/demo/dashboard"
                className="group bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-white mb-2">Starter Plan</h3>
                <p className="text-blue-100 text-sm mb-4">Basic analytics and A/B testing</p>
                <span className="text-blue-200 group-hover:text-white transition-colors">
                  Try Demo →
                </span>
              </Link>

              <Link 
                href="/tenant/acme/dashboard"
                className="group bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                <div className="text-3xl mb-4">🚀</div>
                <h3 className="text-lg font-semibold text-white mb-2">Professional</h3>
                <p className="text-blue-100 text-sm mb-4">Advanced features + cohorts</p>
                <span className="text-blue-200 group-hover:text-white transition-colors">
                  Try Demo →
                </span>
              </Link>

              <Link 
                href="/tenant/startup/dashboard"
                className="group bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                <div className="text-3xl mb-4">💎</div>
                <h3 className="text-lg font-semibold text-white mb-2">Enterprise</h3>
                <p className="text-blue-100 text-sm mb-4">All features + white-label</p>
                <span className="text-blue-200 group-hover:text-white transition-colors">
                  Try Demo →
                </span>
              </Link>
            </div>

            <Link 
              href="/tenant"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              <span>🏢 Explore Multi-Tenant Demo</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Transform Your Analytics?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
              Join thousands of teams who trust AnalyticsPro for their data insights and business intelligence needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/auth/register"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
              >
                <span>🚀 Get Started Today</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link 
                href="/auth/signin"
                className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="text-xl font-bold text-white">AnalyticsPro</span>
              </div>
              <p className="text-gray-400 text-sm">
                Enterprise-grade analytics platform for modern businesses.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <Link href="/tenant/demo/dashboard" className="block text-gray-400 hover:text-white text-sm">Dashboard</Link>
                <Link href="/tenant/demo/ab-testing" className="block text-gray-400 hover:text-white text-sm">A/B Testing</Link>
                <Link href="/tenant/demo/cohorts" className="block text-gray-400 hover:text-white text-sm">Cohort Analysis</Link>
                <Link href="/tenant/demo/segments" className="block text-gray-400 hover:text-white text-sm">Segmentation</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-gray-400 hover:text-white text-sm">About</Link>
                <Link href="#" className="block text-gray-400 hover:text-white text-sm">Blog</Link>
                <Link href="#" className="block text-gray-400 hover:text-white text-sm">Careers</Link>
                <Link href="#" className="block text-gray-400 hover:text-white text-sm">Contact</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-gray-400 hover:text-white text-sm">Documentation</Link>
                <Link href="/tenant/demo/onboarding" className="block text-gray-400 hover:text-white text-sm">Onboarding</Link>
                <Link href="#" className="block text-gray-400 hover:text-white text-sm">API Reference</Link>
                <Link href="#" className="block text-gray-400 hover:text-white text-sm">Status</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 AnalyticsPro. Built with Next.js, TypeScript, and Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
