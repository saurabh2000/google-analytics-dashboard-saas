import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailToken } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    
    if (!token || !email) {
      return NextResponse.json(
        { error: 'Missing token or email parameter' },
        { status: 400 }
      )
    }
    
    // Verify the token
    const isValid = await verifyEmailToken(token, email)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }
    
    // Create audit log
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true }
    })
    
    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'EMAIL_VERIFIED',
          resource: 'User',
          resourceId: user.id,
          metadata: { email },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          userAgent: request.headers.get('user-agent')
        }
      })
    }
    
    return NextResponse.json({
      message: 'Email verified successfully',
      verified: true
    })
    
  } catch (error) {
    console.error('❌ Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Check if user exists and is not already verified
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, emailVerified: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    if (user.emailVerified) {
      return NextResponse.json({
        message: 'Email is already verified',
        alreadyVerified: true
      })
    }
    
    // Import email service dynamically to avoid circular dependency
    const { sendVerificationEmail, isEmailServiceConfigured } = await import('@/lib/email')
    
    if (!isEmailServiceConfigured()) {
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      )
    }
    
    // Send new verification email
    await sendVerificationEmail(email, user.name, user.id)
    
    return NextResponse.json({
      message: 'Verification email sent successfully',
      sent: true
    })
    
  } catch (error) {
    console.error('❌ Resend verification error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    )
  }
}