'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { X, ExternalLink, CheckCircle, AlertCircle, Loader } from 'lucide-react'

interface GAProperty {
  name: string
  displayName: string
  propertyId: string
  createTime: string
  updateTime: string
  currencyCode?: string
  timeZone?: string
}

interface GoogleAnalyticsModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (propertyId: string, propertyName: string) => void
  currentProperty?: string
}

export default function GoogleAnalyticsModal({ 
  isOpen, 
  onClose, 
  onConnect,
  currentProperty 
}: GoogleAnalyticsModalProps) {
  const { data: session } = useSession()
  const [properties, setProperties] = useState<GAProperty[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<string>('')
  const [isReal, setIsReal] = useState(false)

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/analytics/properties')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch properties')
      }

      setProperties(result.properties || [])
      setIsReal(result.isReal || false)
      
      // Auto-select current property if it exists
      if (currentProperty && result.properties) {
        const matchingProperty = result.properties.find(
          (p: GAProperty) => p.displayName === currentProperty || p.propertyId === currentProperty
        )
        if (matchingProperty) {
          setSelectedProperty(matchingProperty.propertyId)
        }
      }
    } catch (err) {
      console.error('Failed to fetch properties:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch properties')
    } finally {
      setLoading(false)
    }
  }, [currentProperty])

  // Load properties when modal opens and user is authenticated
  useEffect(() => {
    if (isOpen && session) {
      fetchProperties()
    }
  }, [isOpen, session, fetchProperties])

  const handleConnect = () => {
    if (!selectedProperty) return

    const property = properties.find(p => p.propertyId === selectedProperty)
    if (property) {
      onConnect(property.propertyId, property.displayName)
      onClose()
    }
  }

  const handleSignIn = () => {
    signIn('google', { 
      callbackUrl: window.location.href,
      redirect: false
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">GA</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Google Analytics Integration
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Connect your Google Analytics property to view real data
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Authentication Status */}
            {!session ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Sign in with Google
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  To access your Google Analytics data, you need to sign in with your Google account 
                  that has access to the Analytics properties you want to view.
                </p>
                <button
                  onClick={handleSignIn}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto"
                >
                  <span>Sign in with Google</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Signed in as {session.user?.name || session.user?.email}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {isReal ? 'Real Google Analytics data available' : 'Demo data mode active'}
                    </p>
                  </div>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">
                      Loading your Google Analytics properties...
                    </span>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        Error loading properties
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                      <button
                        onClick={fetchProperties}
                        className="text-xs text-red-600 dark:text-red-400 underline hover:no-underline mt-1"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                )}

                {/* Properties List */}
                {!loading && !error && properties.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Select a Google Analytics Property
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {properties.map((property) => (
                        <label
                          key={property.propertyId}
                          className={`block p-4 rounded-lg border cursor-pointer transition-all ${
                            selectedProperty === property.propertyId
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700/50'
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="property"
                              value={property.propertyId}
                              checked={selectedProperty === property.propertyId}
                              onChange={(e) => setSelectedProperty(e.target.value)}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {property.displayName}
                                </h4>
                                {isReal && (
                                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full">
                                    Live Data
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                                <p>Property ID: {property.propertyId}</p>
                                {property.currencyCode && (
                                  <p>Currency: {property.currencyCode}</p>
                                )}
                                {property.timeZone && (
                                  <p>Timezone: {property.timeZone}</p>
                                )}
                                <p className="text-xs">
                                  Created: {new Date(property.createTime).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Properties Found */}
                {!loading && !error && properties.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Properties Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md mx-auto">
                      No Google Analytics properties were found for your account. Make sure you have 
                      access to at least one Google Analytics property and try again.
                    </p>
                    <button
                      onClick={fetchProperties}
                      className="text-blue-600 dark:text-blue-400 underline hover:no-underline"
                    >
                      Refresh Properties
                    </button>
                  </div>
                )}

                {/* Demo Mode Notice */}
                {!isReal && properties.length > 0 && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                        Demo Mode Active
                      </p>
                    </div>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      These are sample properties. Real Google Analytics integration requires additional 
                      API permissions and configuration.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {session && properties.length > 0 && (
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={!selectedProperty}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-all"
              >
                Connect Property
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}