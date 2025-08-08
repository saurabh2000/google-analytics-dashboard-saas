'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { WidgetConfig } from './WidgetConfigPanel'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// Dynamic imports for widget components
const LineChart = dynamic(() => import('@/components/charts/LineChart'), {
  loading: () => <WidgetSkeleton />
})

const BarChart = dynamic(() => import('@/components/charts/BarChart'), {
  loading: () => <WidgetSkeleton />
})

const PieChart = dynamic(() => import('@/components/charts/PieChart'), {
  loading: () => <WidgetSkeleton />
})

const SimpleKPICard = dynamic(() => import('@/components/dashboard/SimpleKPICard'), {
  loading: () => <WidgetSkeleton />
})

const DataTable = dynamic(() => import('./DataTable'), {
  loading: () => <WidgetSkeleton />
})

const GeographicMap = dynamic(() => import('./GeographicMap'), {
  loading: () => <WidgetSkeleton />
})

const RealtimeCounter = dynamic(() => import('./RealtimeCounter'), {
  loading: () => <WidgetSkeleton />
})

function WidgetSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  )
}

interface WidgetFactoryProps {
  config: WidgetConfig
  data?: any
  onEdit?: () => void
  onDelete?: () => void
}

export default function WidgetFactory({ 
  config, 
  data,
  onEdit,
  onDelete 
}: WidgetFactoryProps) {
  const renderWidget = () => {
    // Mock data for demonstration
    const mockData = data || getMockDataForWidget(config.type)

    switch (config.type) {
      case 'LINE_CHART':
        return (
          <LineChart
            title={config.title}
            data={mockData.datasets[0].data}
            labels={mockData.labels}
            color={mockData.datasets[0].borderColor}
          />
        )
      
      case 'BAR_CHART':
        return (
          <BarChart
            title={config.title}
            data={mockData.datasets[0].data}
            labels={mockData.labels}
            color={mockData.datasets[0].borderColor}
          />
        )
      
      case 'PIE_CHART':
        return (
          <PieChart
            title={config.title}
            data={mockData.datasets[0].data}
            labels={mockData.labels}
            colors={mockData.datasets[0].backgroundColor}
          />
        )
      
      case 'KPI_CARD':
        return (
          <SimpleKPICard
            title={mockData.title}
            value={mockData.value}
            change={mockData.change}
            trend={mockData.trend}
            subtitle={mockData.subtitle}
          />
        )
      
      case 'DATA_TABLE':
        return <DataTable data={mockData} />
      
      case 'GEO_MAP':
        return <GeographicMap data={mockData} />
      
      case 'REALTIME_COUNTER':
        return (
          <RealtimeCounter
            title={mockData.title}
            initialValue={mockData.value}
            trend={mockData.trend}
          />
        )
      
      case 'FUNNEL_CHART':
        return (
          <div className="p-8 text-center text-gray-500">
            <p>Funnel Chart</p>
            <p className="text-sm mt-2">Coming soon...</p>
          </div>
        )
      
      default:
        return (
          <div className="p-8 text-center text-gray-500">
            <p>Unknown widget type: {config.type}</p>
          </div>
        )
    }
  }

  return (
    <Card 
      className="h-full relative overflow-hidden"
      style={{
        gridColumn: `span ${config.size.width}`,
        gridRow: `span ${config.size.height}`,
      }}
    >
      {/* Widget Header */}
      {(config.title || onEdit || onDelete) && (
        <div className="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-10 px-4 py-2 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">{config.title}</h3>
            <div className="flex gap-1">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Widget Content */}
      <div className={`h-full ${config.title ? 'pt-12' : ''}`}>
        <Suspense fallback={<WidgetSkeleton />}>
          {renderWidget()}
        </Suspense>
      </div>
    </Card>
  )
}

// Mock data generators for different widget types
function getMockDataForWidget(type: string) {
  switch (type) {
    case 'LINE_CHART':
    case 'BAR_CHART':
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Sessions',
          data: [3245, 4523, 3897, 4234, 5123, 4897, 4123],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        }]
      }
    
    case 'PIE_CHART':
      return {
        labels: ['Desktop', 'Mobile', 'Tablet'],
        datasets: [{
          data: [45, 35, 20],
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
        }]
      }
    
    case 'KPI_CARD':
      return {
        title: 'Total Users',
        value: '12,543',
        change: 12.5,
        trend: 'up',
        subtitle: 'vs last period'
      }
    
    case 'DATA_TABLE':
      return {
        headers: ['Page', 'Views', 'Bounce Rate', 'Avg. Time'],
        rows: [
          ['/home', '4,523', '32.4%', '2:45'],
          ['/products', '3,421', '28.9%', '3:12'],
          ['/about', '2,112', '45.2%', '1:23'],
          ['/contact', '1,023', '52.1%', '0:54'],
        ]
      }
    
    case 'GEO_MAP':
      return [
        { country: 'United States', value: 4523 },
        { country: 'United Kingdom', value: 2341 },
        { country: 'Germany', value: 1823 },
        { country: 'France', value: 1523 },
        { country: 'Canada', value: 1234 },
      ]
    
    case 'REALTIME_COUNTER':
      return {
        title: 'Active Users',
        value: 234,
        trend: 'up'
      }
    
    default:
      return null
  }
}