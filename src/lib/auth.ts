import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { Adapter } from 'next-auth/adapters'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import type { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  debug: process.env.NODE_ENV !== 'production',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  logger: {
    error(code, metadata) {
      console.error('NextAuth error:', code, metadata)
    },
    warn(code) {
      console.warn('NextAuth warn:', code)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('NextAuth debug:', code, metadata)
      }
    },
  },
  events: {
    signIn(message) {
      console.log('NextAuth event: signIn', message)
    },
    signOut(message) {
      console.log('NextAuth event: signOut', message)
    },
    createUser(message) {
      console.log('NextAuth event: createUser', message)
    },
    linkAccount(message) {
      console.log('NextAuth event: linkAccount', message)
    },
    session(message) {
      console.log('NextAuth event: session', message)
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      // Ensure proper typing for the JWT token
      const t = token as JWT & { id?: string }

      // On first sign-in, 'user' is present; on subsequent calls, use token.sub
      if (user && (user as any).id) {
        t.id = (user as any).id
      } else if (!t.id && t.sub) {
        // Backfill id from default 'sub' claim created by NextAuth
        t.id = t.sub
      }
      return t
    },
    async session({ session, token }) {
      const t = token as JWT & { id?: string }
      if (session.user) {
        const idFromToken = t.id || t.sub || ''
        if (idFromToken) {
          ;(session.user as any).id = idFromToken
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}