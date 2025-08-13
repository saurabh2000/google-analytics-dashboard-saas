import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = cookies()
    
    // Clear all NextAuth cookies
    const cookieNames = [
      'next-auth.session-token',
      'next-auth.csrf-token', 
      'next-auth.callback-url',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token',
      'admin-token'
    ]
    
    cookieNames.forEach(name => {
      cookieStore.set(name, '', { 
        expires: new Date(0),
        path: '/',
        httpOnly: true 
      })
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Session cleared successfully' 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to clear session',
      details: error 
    }, { status: 500 })
  }
}