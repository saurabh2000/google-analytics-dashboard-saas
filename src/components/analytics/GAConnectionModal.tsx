'use client'

import { useState, useEffect } from 'react'

interface GAProperty {
  name: string
  displayName: string
  createTime: string
  updateTime: string
  currencyCode: string
  timeZone: string
}

interface GAConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (propertyId: string, propertyName: string) => void
}

export default function GAConnectionModal({ isOpen, onClose, onConnect }: GAConnectionModalProps) {
  const [properties, setProperties] = useState<GAProperty[]>([])
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      fetchProperties()
    }
  }, [isOpen])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/analytics/properties')
      const data = await response.json()
      
      if (response.ok) {
        setProperties(data.properties || [])
      } else {
        console.error('Failed to fetch properties:', data.error)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    if (!selectedProperty) return

    setConnecting(true)
    try {
      const response = await fetch('/api/analytics/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: selectedProperty })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        onConnect(selectedProperty, data.propertyName)
        onClose()
      } else {
        console.error('Failed to connect property:', data.error)
      }
    } catch (error) {
      console.error('Error connecting property:', error)
    } finally {
      setConnecting(false)
    }
  }

  if (!isOpen) {
    console.log('Modal is closed')
    return null
  }
  
  console.log('Modal is open, rendering...')

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10">
                <span className="text-2xl">📊</span>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Connect Google Analytics
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select a Google Analytics property to display real data in your dashboard.
                  </p>
                </div>

                {loading ? (
                  <div className="mt-4 flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      Loading properties...
                    </span>
                  </div>
                ) : (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Available Properties
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {properties.map((property) => (
                        <div
                          key={property.name}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedProperty === property.name
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                          onClick={() => setSelectedProperty(property.name)}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              checked={selectedProperty === property.name}
                              onChange={() => setSelectedProperty(property.name)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {property.displayName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {property.name} • {property.timeZone}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {properties.length === 0 && !loading && (
                        <div className="text-center py-8">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No Google Analytics properties found.
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Make sure you have Google Analytics set up and proper permissions.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleConnect}
              disabled={!selectedProperty || connecting}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connecting ? 'Connecting...' : 'Connect Property'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}