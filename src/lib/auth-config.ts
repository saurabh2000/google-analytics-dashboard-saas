import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
  // Don't use adapter with credentials provider - causes issues
  session: { strategy: 'jwt' as const },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
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

        // Check database for users with credentials
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
                isActive: user.isActive,
                emailVerified: user.emailVerified
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
      
      // All sign-ins are allowed - role assignment happens in session callback
      
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
        tokenRole: token.role,
        sessionUserEmail: session.user?.email 
      })
      
      // Check if user is in ADMIN_EMAILS environment variable
      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
      const isAdminEmail = session.user?.email && adminEmails.includes(session.user.email)
      
      if (isAdminEmail) {
        console.log('✅ Setting admin session based on ADMIN_EMAILS')
        session.user = {
          ...session.user,
          role: 'SUPER_ADMIN',
          isAdmin: true
        }
        return session
      }
      
      // Fetch user details including role and tenant for database users
      if (session.user?.email && token.sub !== 'admin-001') {
        try {
          // For Google OAuth users, look up by email instead of token.sub
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { tenant: true }
          })
          
          if (dbUser) {
            console.log('✅ Found database user, assigning DB role:', dbUser.role)
            session.user = {
              ...session.user,
              id: dbUser.id,
              role: dbUser.role,
              tenantId: dbUser.tenantId,
              tenant: dbUser.tenant,
              isActive: dbUser.isActive
            }
          } else {
            // If no user found, they're a new Google OAuth user - assign default role
            console.log('✅ New Google OAuth user, assigning USER role')
            session.user = {
              ...session.user,
              role: 'USER',
              isActive: true
            }
          }
        } catch (error) {
          console.error('💥 Error fetching user session:', error)
          // Default to USER role on error
          console.log('✅ Database error, defaulting to USER role')
          session.user = {
            ...session.user,
            role: 'USER',
            isActive: true
          }
        }
      } else {
        // Ensure there's always a role, even if no email
        console.log('✅ No email or admin user, ensuring USER role')
        session.user = {
          ...session.user,
          role: session.user?.role || 'USER',
          isActive: true
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
          role: user.role,
          email: user.email 
        })
        
        token.id = user.id
        token.role = user.role || 'USER'
        token.tenantId = user.tenantId
        token.isActive = user.isActive !== false
        token.email = user.email
        
        // Role assignment will be handled in session callback based on ADMIN_EMAILS
      }
      
      console.log('🔍 JWT token state:', {
        hasUser: !!user,
        tokenRole: token.role,
        tokenEmail: token.email,
        provider: account?.provider
      })
      
      // Handle Google OAuth tokens
      if (account && account.provider === 'google') {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.accessTokenExpires = account.expires_at
      }
      
      // Continue with normal token handling
      
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