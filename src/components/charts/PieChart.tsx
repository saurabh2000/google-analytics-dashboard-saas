'use client'

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface PieChartProps {
  title: string
  data: number[]
  labels: string[]
  colors?: string[]
  height?: number
}

const defaultColors = [
  'rgb(59, 130, 246)',   // blue
  'rgb(34, 197, 94)',    // green
  'rgb(251, 191, 36)',   // yellow
  'rgb(239, 68, 68)',    // red
  'rgb(168, 85, 247)',   // purple
  'rgb(236, 72, 153)',   // pink
]

export default function PieChart({ 
  title, 
  data, 
  labels, 
  colors = defaultColors, 
  height = 300 
}: PieChartProps) {
  const total = data.reduce((sum, value) => sum + value, 0)

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor: colors.map(color => color + '80'), // 50% opacity
        borderColor: colors,
        borderWidth: 2,
        hoverBackgroundColor: colors.map(color => color + 'B0'), // 70% opacity
        hoverBorderWidth: 3,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 12,
          },
          color: '#6B7280',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.label}: ${context.parsed.toLocaleString()} (${percentage}%)`
          }
        }
      },
    },
    cutout: '60%', // Makes it a doughnut chart
    animation: {
      animateRotate: true,
      animateScale: false,
    },
  }

  return (
    <div className="relative" style={{ height: `${height}px` }}>
      <Doughnut data={chartData} options={options} />
      {/* Center text for doughnut */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {total.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total
          </div>
        </div>
      </div>
    </div>
  )
}