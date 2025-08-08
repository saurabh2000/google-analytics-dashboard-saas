'use client'

import { useEffect, useRef, useState } from 'react'
import { WidgetErrorBoundary } from '@/components/ui/error-boundary'
import dynamic from 'next/dynamic'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface GeographicDataPoint {
  country: string
  countryCode: string
  lat: number
  lng: number
  users: number
  sessions: number
  bounceRate: number
}

interface GeographicMapProps {
  title: string
  data: GeographicDataPoint[]
  height?: string
  showLegend?: boolean
  className?: string
}

// Sample data generator for demo
function generateSampleGeoData(): GeographicDataPoint[] {
  const countries = [
    { country: 'United States', countryCode: 'US', lat: 39.8283, lng: -98.5795 },
    { country: 'United Kingdom', countryCode: 'GB', lat: 55.3781, lng: -3.4360 },
    { country: 'Germany', countryCode: 'DE', lat: 51.1657, lng: 10.4515 },
    { country: 'France', countryCode: 'FR', lat: 46.2276, lng: 2.2137 },
    { country: 'Canada', countryCode: 'CA', lat: 56.1304, lng: -106.3468 },
    { country: 'Australia', countryCode: 'AU', lat: -25.2744, lng: 133.7751 },
    { country: 'Japan', countryCode: 'JP', lat: 36.2048, lng: 138.2529 },
    { country: 'Brazil', countryCode: 'BR', lat: -14.2350, lng: -51.9253 },
    { country: 'India', countryCode: 'IN', lat: 20.5937, lng: 78.9629 },
    { country: 'China', countryCode: 'CN', lat: 35.8617, lng: 104.1954 },
  ]

  return countries.map(country => ({
    ...country,
    users: Math.floor(Math.random() * 10000) + 500,
    sessions: Math.floor(Math.random() * 15000) + 800,
    bounceRate: Math.floor(Math.random() * 60) + 20,
  }))
}

function MapWidget({ title, data, height = '400px', showLegend = true, className = '' }: GeographicMapProps) {
  const [mapData, setMapData] = useState<GeographicDataPoint[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setMapData(data.length > 0 ? data : generateSampleGeoData())
  }, [data])

  // Don't render map on server side
  if (!isClient) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`} style={{ height }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  const maxUsers = Math.max(...mapData.map(d => d.users))
  
  const getMarkerSize = (users: number) => {
    const ratio = users / maxUsers
    return Math.max(8, Math.min(50, ratio * 40))
  }

  const getMarkerColor = (users: number) => {
    const ratio = users / maxUsers
    if (ratio > 0.7) return '#dc2626' // red-600
    if (ratio > 0.4) return '#ea580c' // orange-600
    if (ratio > 0.2) return '#ca8a04' // yellow-600
    return '#16a34a' // green-600
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-500">
          {mapData.length} countries
        </div>
      </div>

      <div className="relative" style={{ height }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {mapData.map((point, index) => (
            <CircleMarker
              key={`${point.countryCode}-${index}`}
              center={[point.lat, point.lng]}
              radius={getMarkerSize(point.users)}
              fillColor={getMarkerColor(point.users)}
              fillOpacity={0.7}
              color="white"
              weight={2}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold text-gray-900">{point.country}</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Users:</span>
                      <span className="font-medium">{point.users.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sessions:</span>
                      <span className="font-medium">{point.sessions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bounce Rate:</span>
                      <span className="font-medium">{point.bounceRate}%</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {showLegend && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600">Users:</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span className="text-xs text-gray-500">Low</span>
              <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
              <span className="text-xs text-gray-500">Medium</span>
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span className="text-xs text-gray-500">High</span>
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span className="text-xs text-gray-500">Very High</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total Users: {mapData.reduce((sum, d) => sum + d.users, 0).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
}

export default function GeographicMap(props: GeographicMapProps) {
  return (
    <WidgetErrorBoundary widgetName="Geographic Map">
      <MapWidget {...props} />
    </WidgetErrorBoundary>
  )
}