'use client'

import { useState, useEffect } from 'react'
import { getJourneyData, getAvailableJourneySources, type UserJourney, type JourneyStage } from '@/lib/user-journey-data'

interface UserJourneyFlowProps {
  propertyName: string | null
  selectedSource?: string
}

export default function UserJourneyFlow({ propertyName, selectedSource = 'reddit-ads' }: UserJourneyFlowProps) {
  const [journeyData, setJourneyData] = useState<UserJourney | null>(null)
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [availableSources] = useState(getAvailableJourneySources(propertyName))

  useEffect(() => {
    const data = getJourneyData(propertyName, selectedSource)
    setJourneyData(data)
    setSelectedStage(null)
  }, [propertyName, selectedSource])

  if (!journeyData) return null

  const handleStageClick = (stageId: string) => {
    setSelectedStage(selectedStage === stageId ? null : stageId)
  }

  const selectedStageData = journeyData.stages.find(stage => stage.id === selectedStage)

  return (
    <div className="space-y-6">
      {/* Journey Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              User Journey: {journeyData.source}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              From landing to event registration completion
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {journeyData.overallConversionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Overall Conversion Rate
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {journeyData.totalUsers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
              {journeyData.totalConversions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Conversions</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
              {(journeyData.totalUsers - journeyData.totalConversions).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Drop-offs</div>
          </div>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Conversion Funnel Flow
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Click on any stage to see detailed breakdown and drop-off analysis
          </p>
        </div>

        {/* Flow Stages */}
        <div className="relative">
          {/* Connection Lines */}
          <div className="absolute left-0 right-0 top-16 h-1 bg-gradient-to-r from-blue-200 via-blue-300 to-green-300 dark:from-blue-700 dark:via-blue-600 dark:to-green-600 rounded"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 relative z-10">
            {journeyData.stages.map((stage, index) => {
              const isSelected = selectedStage === stage.id
              const isLast = index === journeyData.stages.length - 1
              
              // Calculate drop-off from previous stage
              let dropOffFromPrevious = 0
              if (index > 0) {
                const prevStage = journeyData.stages[index - 1]
                dropOffFromPrevious = ((prevStage.users - stage.users) / prevStage.users) * 100
              }

              return (
                <div
                  key={stage.id}
                  className={`relative bg-white dark:bg-gray-700 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isSelected 
                      ? 'border-blue-500 shadow-lg scale-105' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => handleStageClick(stage.id)}
                >
                  {/* Stage Number */}
                  <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isLast 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-500 text-white'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="p-4">
                    {/* Stage Icon and Name */}
                    <div className="text-center mb-3">
                      <div className="text-3xl mb-2">{stage.icon}</div>
                      <h5 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {stage.name}
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {stage.description}
                      </p>
                    </div>

                    {/* User Count */}
                    <div className="text-center mb-2">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {stage.users.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">users</div>
                    </div>

                    {/* Conversion Rate */}
                    <div className="text-center mb-2">
                      <div className={`text-sm font-medium ${
                        stage.conversionRate >= 50 
                          ? 'text-green-600 dark:text-green-400'
                          : stage.conversionRate >= 25
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {stage.conversionRate.toFixed(0)}% converted
                      </div>
                      {index > 0 && (
                        <div className="text-xs text-red-500 dark:text-red-400">
                          -{dropOffFromPrevious.toFixed(0)}% drop-off
                        </div>
                      )}
                    </div>

                    {/* Time on Stage */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ⏱️ {stage.avgTimeOnStage} avg
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            stage.conversionRate >= 50 
                              ? 'bg-green-500'
                              : stage.conversionRate >= 25
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${stage.conversionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stage Details Panel */}
      {selectedStageData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{selectedStageData.icon}</span>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedStageData.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedStageData.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedStage(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {selectedStageData.users.toLocaleString()}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Users at Stage</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {selectedStageData.conversionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Conversion Rate</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {selectedStageData.dropOffRate.toFixed(1)}%
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">Drop-off Rate</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {selectedStageData.avgTimeOnStage}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Avg. Time</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Common Actions */}
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                Common User Actions
              </h5>
              <ul className="space-y-2">
                {selectedStageData.commonActions.map((action, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Drop-off Reasons */}
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                Main Drop-off Reasons
              </h5>
              <ul className="space-y-2">
                {selectedStageData.dropOffReasons.map((reason, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="text-red-500">⚠</span>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Optimization Suggestions */}
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h5 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              💡 Optimization Suggestions
            </h5>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              {selectedStageData.conversionRate < 30 && (
                <p>• This stage has a low conversion rate. Consider A/B testing different approaches.</p>
              )}
              {selectedStageData.dropOffRate > 40 && (
                <p>• High drop-off detected. Review user experience and remove friction points.</p>
              )}
              {selectedStageData.avgTimeOnStage.includes('3:') && (
                <p>• Users spend significant time here. Ensure the experience is optimized.</p>
              )}
              <p>• Monitor user behavior and implement improvements based on common drop-off reasons.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}