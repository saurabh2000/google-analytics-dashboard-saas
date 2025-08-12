declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
    user?: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: 'SUPER_ADMIN' | 'ADMIN' | 'TENANT_OWNER' | 'USER'
      tenantId?: string | null
      tenant?: {
        id: string
        name: string
        slug: string
        domain?: string | null
        logo?: string | null
      } | null
      isActive?: boolean
    }
  }
  
  interface User {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
    role?: 'SUPER_ADMIN' | 'ADMIN' | 'TENANT_OWNER' | 'USER'
    tenantId?: string | null
    isActive?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
    error?: string
  }
}