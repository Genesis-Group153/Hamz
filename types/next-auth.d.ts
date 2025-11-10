import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: {
      id: string
      name?: string | null
      email?: string | null | undefined
      image?: string | null | undefined
      role?: string
      isApproved?: boolean
    }
  }

  interface User {
    accessToken?: string
    role?: string
    isApproved?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    role?: string
    isApproved?: boolean
  }
}
