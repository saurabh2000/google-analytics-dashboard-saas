'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import PlanComparison from '@/components/billing/PlanComparison'

export default function Home() {
  const [showPricing, setShowPricing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
              <button 
                onClick={() => setShowPricing(!showPricing)} 
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
              >
                Pricing
              </button>
              <Link href="#demo" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                Demo
              </Link>
              <Link 
                href="/tenant/demo/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Try Demo
              </Link>
              <Link 
                href="/admin"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Admin Panel
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
                href="/tenant/demo/dashboard"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
              >
                <span>🚀 Start Free Trial</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link 
                href="#demo"
                className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Watch Demo
              </Link>
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

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Analyze & Grow</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From basic analytics to advanced machine learning insights, our platform scales with your business needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-2xl border border-blue-100 dark:border-blue-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl mb-6">📊</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Interactive Dashboards
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Build stunning dashboards with drag-and-drop widgets, real-time data, and customizable KPI cards.
              </p>
              <Link href="/tenant/demo/dashboard" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                View Dashboard Demo →
              </Link>
            </div>

            <div className="group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-2xl border border-purple-100 dark:border-purple-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl mb-6">🧪</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                A/B Testing Suite
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Run experiments with statistical significance calculations, variant analysis, and automated insights.
              </p>
              <Link href="/tenant/demo/ab-testing" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
                Try A/B Testing →
              </Link>
            </div>

            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 rounded-2xl border border-green-100 dark:border-green-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl mb-6">👥</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Cohort Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Track user retention, lifetime value, and behavioral patterns with beautiful cohort visualizations.
              </p>
              <Link href="/tenant/demo/cohorts" className="text-green-600 dark:text-green-400 font-medium hover:underline">
                Explore Cohorts →
              </Link>
            </div>

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

            <div className="group bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl mb-6">🏢</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Multi-Tenant SaaS
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Serve multiple organizations with isolated data, custom branding, and role-based permissions.
              </p>
              <Link href="/tenant" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                See Multi-Tenancy →
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
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {showPricing && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Choose Your Plan
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Start free and scale as you grow. All plans include our core analytics features.
              </p>
            </div>
            
            <PlanComparison />
          </div>
        </section>
      )}

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
                href="/tenant/demo/onboarding"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
              >
                <span>🎓 Start Guided Onboarding</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link 
                href="/auth/signin"
                className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Sign In with Google
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
