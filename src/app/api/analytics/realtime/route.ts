import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 })
    }

    // Google Analytics Data API v1 request for real-time data
    const response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runRealtimeReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: [
            { name: 'activeUsers' }
          ]
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GA Realtime API Error:', response.status, errorText)
      return NextResponse.json({ 
        error: 'Failed to fetch real-time data',
        details: errorText 
      }, { status: response.status })
    }

    const data = await response.json()
    
    let activeUsers = 0
    
    if (data.rows && data.rows.length > 0) {
      activeUsers = parseInt(data.rows[0].metricValues[0].value || '0')
    }

    return NextResponse.json({ 
      realTimeUsers: activeUsers,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Analytics Realtime API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}