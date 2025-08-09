// import { NextAuthOptions } from 'next-auth' // Type not available
import { getServerSession } from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(token: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    const url = 'https://oauth2.googleapis.com/token'
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw new Error('Failed to refresh access token')
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + (refreshedTokens.expires_in || 3600) * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    }
  } catch (error) {
    console.error('Error refreshing access token:', error)
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

// Temporarily disable Prisma adapter due to connection issues
// import { PrismaAdapter } from '@next-auth/prisma-adapter'
// import { prisma } from '@/lib/prisma'

export const authOptions = {
  // adapter: PrismaAdapter(prisma), // Temporarily disabled until Prisma connection is fixed
  session: { strategy: 'jwt' as const },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics.manage.users.readonly',
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
  ],
  callbacks: {
    signIn: async ({ user, account, profile, email, credentials }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      // Check if we have the required environment variables
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error('Missing Google OAuth environment variables')
        return false
      }
      return true
    },
    session: async ({ session, token }: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
        },
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      }
    },
    jwt: async ({ token, user, account }: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (user) {
        token.id = user.id
      }
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.accessTokenExpires = account.expires_at
      }
      
      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires || 0) * 1000) {
        return token
      }
      
      // Access token has expired, try to refresh it
      return refreshAccessToken(token)
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  debug: process.env.NODE_ENV === 'development'
}

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}