import { PrismaAdapter } from '@auth/prisma-adapter'
import { Email, verifyPassword } from '@pda/common/domain'
import { UserFactory } from '@pda/user'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'
import { cache } from 'react'
import { db } from '@/server/db'
import { authConfig } from './config'

/**
 * Full NextAuth configuration used in Node.js server contexts (route handlers, server components,
 * server actions, tRPC). Extends the edge-safe base config with the database adapter and the
 * providers that depend on Node.js APIs (Prisma, nodemailer, bcrypt).
 */
const {
  auth: uncachedAuth,
  handlers,
  signIn,
  signOut
} = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM
      // maxAge: 24 * 60 * 60, // How long email links are valid for (default 24h)
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password', placeholder: '••••••••' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        try {
          const repo = UserFactory.userPrismaRepository()
          const email = Email.fromString(credentials.email as string)
          const user = await repo.findByEmail(email)

          if (!user || !user.passwordHash) {
            console.log('User not found or missing passwordHash')
            return null
          }

          const isPasswordValid = await verifyPassword(
            credentials.password as string,
            user.passwordHash
          )

          if (!isPasswordValid) {
            return null
          }

          return user.toClientDto()
        } catch (error) {
          console.error('Error in authorize function:', error)
          return null
        }
      }
    })
  ]
})

const auth = cache(uncachedAuth)

export { auth, handlers, signIn, signOut }
