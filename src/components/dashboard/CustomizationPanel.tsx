'use client'

import { useState } from 'react'
import { getAvailableKpiCards } from '@/lib/drill-down-data'

interface CustomizationPanelProps {
  enabledCards: string[]
  onUpdateCards: (cardIds: string[]) => void
  isOpen: boolean
  onClose: () => void
}

export default function CustomizationPanel({ 
  enabledCards, 
  onUpdateCards, 
  isOpen, 
  onClose 
}: CustomizationPanelProps) {
  const [availableCards] = useState(getAvailableKpiCards())
  const [tempEnabledCards, setTempEnabledCards] = useState(enabledCards)

  const handleToggleCard = (cardId: string) => {
    if (tempEnabledCards.includes(cardId)) {
      setTempEnabledCards(tempEnabledCards.filter(id => id !== cardId))
    } else {
      setTempEnabledCards([...tempEnabledCards, cardId])
    }
  }

  const handleSave = () => {
    onUpdateCards(tempEnabledCards)
    onClose()
  }

  const handleCancel = () => {
    setTempEnabledCards(enabledCards)
    onClose()
  }

  const handleSelectAll = () => {
    setTempEnabledCards(availableCards.map(card => card.id))
  }

  const handleDeselectAll = () => {
    setTempEnabledCards([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Customize Dashboard
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Select the KPI cards you want to display on your dashboard. 
              You can add or remove cards at any time.
            </p>
            
            {/* Bulk Actions */}
            <div className="flex space-x-3 mb-4">
              <button
                onClick={handleSelectAll}
                className="text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 px-3 py-1 rounded"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded"
              >
                Deselect All
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                {tempEnabledCards.length} of {availableCards.length} selected
              </span>
            </div>
          </div>

          {/* Card Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {availableCards.map((card) => {
              const isEnabled = tempEnabledCards.includes(card.id)
              const colorClasses = {
                blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
                green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
                purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
                orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300',
                red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300',
                yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300',
                indigo: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300',
                teal: 'bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300',
                pink: 'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300'
              }[card.color as keyof typeof colorClasses]

              return (
                <label
                  key={card.id}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isEnabled
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => handleToggleCard(card.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  
                  <div className="ml-3 flex items-center flex-1">
                    <div className={`w-8 h-8 ${colorClasses} rounded-md flex items-center justify-center mr-3`}>
                      <span className="text-lg">{card.icon}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {card.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {card.id === 'total-users' && 'Total unique visitors to your site'}
                        {card.id === 'sessions' && 'Number of sessions across all users'}
                        {card.id === 'page-views' && 'Total page views including repeated views'}
                        {card.id === 'avg-session' && 'Average duration of user sessions'}
                        {card.id === 'bounce-rate' && 'Percentage of single-page sessions'}
                        {card.id === 'conversion-rate' && 'Percentage of sessions that converted'}
                        {card.id === 'revenue' && 'Total revenue generated'}
                        {card.id === 'new-users' && 'First-time visitors to your site'}
                        {card.id === 'returning-users' && 'Users who have visited before'}
                        {card.id === 'events' && 'Total events tracked across your site'}
                      </div>
                    </div>
                  </div>
                </label>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}