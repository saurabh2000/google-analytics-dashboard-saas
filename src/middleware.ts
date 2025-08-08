import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

// Protect these routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/analytics/:path*',
    '/api/tenant/:path*',
    '/api/webhooks/:path*',
    '/billing/:path*',
    '/debug/:path*',
    // Exclude auth routes and public pages
    '/((?!api/auth|auth|api/debug/session|$|_next/static|_next/image|favicon.ico).*)',
  ]
}