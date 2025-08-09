import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    console.log('🔍 Debug Session: Getting server session...')
    const session = await getServerSession(authOptions)
    
    const sessionInfo = {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email || null,
      hasAccessToken: !!session?.accessToken,
      hasRefreshToken: !!session?.refreshToken,
      accessTokenLength: session?.accessToken ? (session.accessToken as string).length : 0,
      refreshTokenLength: session?.refreshToken ? (session.refreshToken as string).length : 0,
    }
    
    console.log('🔍 Debug Session Info:', sessionInfo)
    
    return NextResponse.json({
      session: sessionInfo,
      message: 'Session debug information'
    })
  } catch (error) {
    console.error('❌ Debug Session Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get session debug info',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}