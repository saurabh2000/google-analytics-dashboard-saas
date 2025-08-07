'use client'

import { useState } from 'react'
import { getAvailableJourneySources } from '@/lib/user-journey-data'

interface JourneySourceSelectorProps {
  propertyName: string | null
  selectedSource: string
  onSourceChange: (source: string) => void
  className?: string
}

export default function JourneySourceSelector({ 
  propertyName, 
  selectedSource, 
  onSourceChange,
  className = ''
}: JourneySourceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const availableSources = getAvailableJourneySources(propertyName)
  
  const selectedSourceData = availableSources.find(source => source.id === selectedSource)

  return (
    <div className={`relative ${className}`}>
      {/* Selected Source Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 w-full text-left hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
      >
        <span className="text-2xl">{selectedSourceData?.icon}</span>
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-white">
            {selectedSourceData?.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {selectedSourceData?.type.replace('-', ' ')} source
          </div>
        </div>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2 py-1">
              Select Traffic Source
            </div>
            
            {/* Group by source type */}
            {['paid-search', 'organic-search', 'social-media', 'email', 'direct'].map(type => {
              const sourcesOfType = availableSources.filter(source => source.type === type)
              if (sourcesOfType.length === 0) return null
              
              return (
                <div key={type} className="mb-2">
                  <div className="text-xs font-medium text-gray-400 dark:text-gray-500 px-2 py-1 capitalize">
                    {type.replace('-', ' ')}
                  </div>
                  {sourcesOfType.map(source => (
                    <button
                      key={source.id}
                      onClick={() => {
                        onSourceChange(source.id)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                        selectedSource === source.id
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-xl">{source.icon}</span>
                      <div>
                        <div className="font-medium">{source.name}</div>
                        {selectedSource === source.id && (
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            ✓ Currently selected
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>

          {/* Quick Stats Footer */}
          <div className="border-t border-gray-200 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              💡 Different sources show different conversion patterns and user behaviors
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}