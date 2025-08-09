import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { google } from 'googleapis'

export async function GET() {
  try {
    console.log('🔍 GA Debug: Starting comprehensive GA API test...')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({
        error: 'No session or access token',
        hasSession: !!session,
        hasAccessToken: !!session?.accessToken
      }, { status: 401 })
    }

    // Initialize OAuth2 client
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google` : 'http://localhost:3000/api/auth/callback/google'
    )

    auth.setCredentials({
      access_token: session.accessToken as string,
      refresh_token: session.refreshToken as string
    })

    const results: { session: { hasAccessToken: boolean; hasRefreshToken: boolean; user?: string }; tests: Record<string, unknown> } = {
      session: {
        hasAccessToken: !!session.accessToken,
        hasRefreshToken: !!session.refreshToken,
        user: session.user?.email
      },
      tests: {}
    }

    // Test 1: Check if Analytics Admin API is accessible
    try {
      console.log('🔍 GA Debug: Testing Analytics Admin API access...')
      const adminApi = google.analyticsadmin('v1alpha')
      adminApi.context._options.auth = auth
      
      const accountsResponse = await adminApi.accounts.list()
      console.log('✅ GA Debug: Admin API accessible, accounts found:', accountsResponse.data.accounts?.length || 0)
      
      results.tests.adminApiAccess = {
        success: true,
        accountsFound: accountsResponse.data.accounts?.length || 0,
        accounts: accountsResponse.data.accounts?.map((acc: { name: string; displayName: string }) => ({
          name: acc.name,
          displayName: acc.displayName
        })) || []
      }

      // Test 2: Try to get properties for each account
      const allProperties = []
      for (const account of accountsResponse.data.accounts || []) {
        if (account.name) {
          try {
            console.log(`🔍 GA Debug: Testing properties for account: ${account.displayName}`)
            const propertiesResponse = await adminApi.properties.list({
              filter: `parent:${account.name}`
            })
            
            const accountProperties = propertiesResponse.data.properties || []
            console.log(`✅ GA Debug: Found ${accountProperties.length} properties for ${account.displayName}`)
            
            allProperties.push(...accountProperties.map((prop: { name?: string; displayName?: string; propertyType?: string; createTime?: string; updateTime?: string }) => ({
              accountName: account.displayName,
              name: prop.name || '',
              displayName: prop.displayName || '',
              propertyId: prop.name?.split('/').pop() || '',
              propertyType: prop.propertyType,
              createTime: prop.createTime || '',
              updateTime: prop.updateTime || ''
            })))
          } catch (propError) {
            console.error(`❌ GA Debug: Failed to get properties for ${account.displayName}:`, propError)
            results.tests[`properties_${account.name}`] = {
              success: false,
              error: propError instanceof Error ? propError.message : 'Unknown error'
            }
          }
        }
      }

      results.tests.propertiesFound = {
        success: true,
        totalProperties: allProperties.length,
        properties: allProperties
      }

    } catch (adminError) {
      console.error('❌ GA Debug: Admin API failed:', adminError)
      results.tests.adminApiAccess = {
        success: false,
        error: adminError instanceof Error ? adminError.message : 'Unknown error',
        stack: adminError instanceof Error ? adminError.stack?.substring(0, 300) : undefined
      }
    }

    // Test 3: Check Analytics Data API access
    try {
      console.log('🔍 GA Debug: Testing Analytics Data API access...')
      const analyticsData = google.analyticsdata('v1beta')
      
      // This will fail if no properties exist, but will tell us if the API is accessible
      const testResponse = await analyticsData.properties.runReport({
        property: 'properties/000000000', // Dummy property ID to test API access
        requestBody: {
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          metrics: [{ name: 'activeUsers' }]
        },
        auth: auth
      })
      
      results.tests.dataApiAccess = {
        success: true,
        note: 'Data API is accessible'
      }
    } catch (dataError: unknown) {
      console.log('🔍 GA Debug: Data API test (expected to fail with dummy property):', dataError.message)
      
      // Check if it's just a property not found error (which means API is working)
      if (dataError.message?.includes('property') || dataError.message?.includes('not found')) {
        results.tests.dataApiAccess = {
          success: true,
          note: 'Data API is accessible (property not found error expected with dummy ID)'
        }
      } else {
        results.tests.dataApiAccess = {
          success: false,
          error: dataError.message,
          possibleCause: 'Analytics Data API might not be enabled'
        }
      }
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error('❌ GA Debug: Overall test failed:', error)
    return NextResponse.json({
      error: 'Debug test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}