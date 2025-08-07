'use client'

import { useState } from 'react'
import PieChart from './PieChart'
import { DrillDownData, DrillDownBreadcrumb } from '@/lib/drill-down-data'

interface DrillDownChartProps {
  title: string
  data: DrillDownData
  height?: number
}

export default function DrillDownChart({ title, data, height = 300 }: DrillDownChartProps) {
  const [currentData, setCurrentData] = useState<DrillDownData>(data)
  const [breadcrumbs, setBreadcrumbs] = useState<DrillDownBreadcrumb[]>([{ name: title, key: 'root' }])
  const [selectedPath, setSelectedPath] = useState<string[]>([])

  const handleChartClick = (index: number) => {
    const keys = Object.keys(currentData)
    const selectedKey = keys[index]
    const selectedItem = currentData[selectedKey]

    if (selectedItem.children) {
      // Navigate deeper
      setCurrentData(selectedItem.children)
      setBreadcrumbs([...breadcrumbs, { name: selectedItem.name, key: selectedKey }])
      setSelectedPath([...selectedPath, selectedKey])
    }
  }

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      // Go back to root
      setCurrentData(data)
      setBreadcrumbs([{ name: title, key: 'root' }])
      setSelectedPath([])
    } else {
      // Navigate to specific level
      const newPath = selectedPath.slice(0, index)
      let targetData = data
      
      // Navigate to the target level
      for (const pathKey of newPath) {
        if (targetData[pathKey]?.children) {
          targetData = targetData[pathKey].children!
        }
      }
      
      setCurrentData(targetData)
      setBreadcrumbs(breadcrumbs.slice(0, index + 1))
      setSelectedPath(newPath)
    }
  }

  // Convert current data to chart format
  const chartLabels = Object.values(currentData).map(item => item.name)
  const chartData = Object.values(currentData).map(item => item.value)
  const chartColors = Object.values(currentData).map(item => item.color || 'rgb(59, 130, 246)')

  // Check if any items have children (drill-down available)
  const hasChildrenData = Object.values(currentData).some(item => item.children)

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.key} className="flex items-center">
            <button
              onClick={() => handleBreadcrumbClick(index)}
              className={`${
                index === breadcrumbs.length - 1
                  ? 'text-gray-900 dark:text-white font-medium'
                  : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
              }`}
            >
              {crumb.name}
            </button>
            {index < breadcrumbs.length - 1 && (
              <span className="mx-2 text-gray-400">/</span>
            )}
          </div>
        ))}
      </div>

      {/* Drill-down hint */}
      {hasChildrenData && (
        <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center space-x-1">
          <span>💡</span>
          <span>Click on chart segments to drill down for more details</span>
        </div>
      )}

      {/* Chart */}
      <div className="relative">
        <PieChart
          title={breadcrumbs[breadcrumbs.length - 1].name}
          data={chartData}
          labels={chartLabels}
          colors={chartColors}
          height={height}
        />
        
        {/* Clickable overlay for drill-down */}
        {hasChildrenData && (
          <div 
            className="absolute inset-0 cursor-pointer"
            onClick={(e) => {
              // Calculate which segment was clicked based on mouse position
              // This is a simplified approach - in production you'd use Chart.js click events
              const rect = e.currentTarget.getBoundingClientRect()
              const centerX = rect.width / 2
              const centerY = rect.height / 2
              const mouseX = e.clientX - rect.left - centerX
              const mouseY = e.clientY - rect.top - centerY
              
              // Calculate angle from center
              let angle = Math.atan2(mouseY, mouseX) * (180 / Math.PI)
              if (angle < 0) angle += 360
              
              // Convert angle to segment index (simplified)
              const segmentCount = chartData.length
              const segmentSize = 360 / segmentCount
              const segmentIndex = Math.floor(angle / segmentSize)
              
              if (segmentIndex >= 0 && segmentIndex < segmentCount) {
                handleChartClick(segmentIndex)
              }
            }}
            title="Click to drill down"
          />
        )}
      </div>

      {/* Current Level Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(currentData).map(([key, item]) => (
          <div
            key={key}
            className={`p-3 rounded-lg border-l-4 bg-gray-50 dark:bg-gray-700 ${
              item.children 
                ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' 
                : ''
            }`}
            style={{ borderLeftColor: item.color }}
            onClick={() => {
              if (item.children) {
                const index = Object.keys(currentData).indexOf(key)
                handleChartClick(index)
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.name}
                </span>
                {item.children && (
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    →
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {item.value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {item.percentage}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}