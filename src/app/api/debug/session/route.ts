import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      session,
      hasSession: !!session,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      isAdmin: session?.user?.isAdmin,
      userTenantId: session?.user?.tenantId
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get session', details: error }, { status: 500 })
  }
}