import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/analytics.readonly'
        }
      }
    })
  ],
  callbacks: {
    session: async ({ session, token }: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
        },
        accessToken: token.accessToken,
      }
    },
    jwt: async ({ token, user, account }: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (user) {
        token.id = user.id
      }
      if (account) {
        token.accessToken = account.access_token
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

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }