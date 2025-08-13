import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Check admin emails configuration
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
    const userEmail = session?.user?.email
    const isAdminEmail = userEmail && adminEmails.includes(userEmail)
    
    return NextResponse.json({
      session,
      adminEmails,
      userEmail,
      isAdminEmail,
      envVars: {
        hasAdminEmails: !!process.env.ADMIN_EMAILS,
        adminEmailsCount: adminEmails.length
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get auth debug info', details: error }, { status: 500 })
  }
}