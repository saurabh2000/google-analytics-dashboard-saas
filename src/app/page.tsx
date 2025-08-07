import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Google Analytics
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Dashboard SaaS
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Transform your Google Analytics data into beautiful, actionable insights.
              Create custom dashboards, visualize trends, and make data-driven decisions.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Interactive Charts
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Line charts, bar charts, pie charts, and KPI cards with real-time data
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="text-3xl mb-4">🔐</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Secure OAuth
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Connect securely with your Google Analytics account
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Responsive Design
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Perfect experience on desktop, tablet, and mobile devices
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/auth/signin"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get Started with Google
            </Link>
            <Link 
              href="/dashboard"
              className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-semibold px-8 py-3 rounded-lg transition-all duration-200"
            >
              View Demo Dashboard
            </Link>
          </div>

          {/* Status Badge */}
          <div className="mt-8">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              MVP Complete - Ready for Beta Testing
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
