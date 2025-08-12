import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
  // Don't use adapter with credentials provider - causes issues
  session: { strategy: 'jwt' as const },
  providers: [
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔍 Authorize called with:', { 
          email: credentials?.email, 
          passwordLength: credentials?.password?.length 
        })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        // Check if this is the admin login
        if (credentials.email === 'saurabh2000@gmail.com') {
          console.log('🔍 Checking admin credentials...')
          if (credentials.password === 'Admin@2025!') {
            console.log('✅ Admin credentials valid!')
            // Return admin user object
            return {
              id: 'admin-001',
              email: 'saurabh2000@gmail.com',
              name: 'Admin User',
              role: 'SUPER_ADMIN',
              isAdmin: true
            }
          } else {
            console.log('❌ Admin password incorrect')
          }
        }

        // Check database for other users with credentials
        try {
          console.log('🔍 Checking database for user:', credentials.email)
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { tenant: true }
          })

          if (user && user.password) {
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
            if (isPasswordValid) {
              console.log('✅ Database user credentials valid!')
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenantId,
                tenant: user.tenant,
                isActive: user.isActive
              }
            }
          }
        } catch (error) {
          console.error('💥 Database error during auth:', error)
        }

        console.log('❌ No valid credentials found')
        return null
      }
    }),
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
    signIn: async ({ user, account, profile }: any) => {
      console.log('🔍 SignIn callback:', { 
        provider: account?.provider, 
        userEmail: user?.email,
        isAdmin: user?.isAdmin 
      })
      
      // Allow admin credentials sign in
      if (account?.provider === 'admin-credentials') {
        console.log('✅ Admin credentials sign in allowed')
        return true
      }
      
      // Check if we have the required environment variables for Google OAuth
      if (account?.provider === 'google') {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
          console.error('❌ Missing Google OAuth environment variables')
          return false
        }
        
        // Update last login timestamp for database users
        if (user.email) {
          try {
            await prisma.user.update({
              where: { email: user.email },
              data: { lastLoginAt: new Date() }
            })
          } catch (error) {
            console.error('💥 Error updating last login:', error)
          }
        }
      }
      
      return true
    },
    session: async ({ session, token }: any) => {
      console.log('🔍 Session callback:', { 
        tokenSub: token.sub, 
        tokenIsAdmin: token.isAdmin,
        sessionUserEmail: session.user?.email 
      })
      
      // Handle admin credentials session
      if (token.isAdmin) {
        console.log('✅ Setting admin session')
        session.user = {
          ...session.user,
          id: token.sub,
          role: 'SUPER_ADMIN',
          isAdmin: true
        }
        return session
      }
      
      // Fetch user details including role and tenant for database users
      if (token.sub && token.sub !== 'admin-001') {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            include: { tenant: true }
          })
          
          if (dbUser) {
            session.user = {
              ...session.user,
              id: dbUser.id,
              role: dbUser.role,
              tenantId: dbUser.tenantId,
              tenant: dbUser.tenant,
              isActive: dbUser.isActive
            }
          }
        } catch (error) {
          console.error('💥 Error fetching user session:', error)
        }
      }
      
      return {
        ...session,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      }
    },
    jwt: async ({ token, user, account }: any) => {
      if (user) {
        console.log('🔍 JWT callback with user:', { 
          userId: user.id, 
          isAdmin: user.isAdmin,
          role: user.role 
        })
        
        token.id = user.id
        // Mark admin users
        if (user.isAdmin) {
          console.log('✅ Marking token as admin')
          token.isAdmin = true
          token.role = 'SUPER_ADMIN'
        }
      }
      
      // Handle Google OAuth tokens
      if (account && account.provider === 'google') {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.accessTokenExpires = account.expires_at
      }
      
      // For admin credentials, skip token refresh
      if (token.isAdmin) {
        return token
      }
      
      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires || 0) * 1000) {
        return token
      }
      
      // Access token has expired, try to refresh it (Google OAuth only)
      if (token.refreshToken) {
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
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
          }
        } catch (error) {
          console.error('💥 Error refreshing access token:', error)
          return {
            ...token,
            error: 'RefreshAccessTokenError',
          }
        }
      }
      
      return token
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  debug: process.env.NODE_ENV === 'development'
}