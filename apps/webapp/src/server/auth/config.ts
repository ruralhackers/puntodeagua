import { PrismaAdapter } from '@auth/prisma-adapter'
import { Email, verifyPassword } from '@pda/common/domain'
import type { CommunityClientDto } from '@pda/community'
import { UserFactory } from '@pda/user'
import type { UserClientDto } from '@pda/user/domain'
import type { DefaultSession, NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'
import { db } from '@/server/db'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      email: string | null
      name: string | null
      image: string | null
      community: CommunityClientDto | null
      roles: string[]
    } & DefaultSession['user']
  }

  interface User extends UserClientDto {}
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  session: {
    strategy: 'jwt'
  },
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
    // ...add more providers here
    // GitHubProvider,
    // DiscordProvider,
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, token }) => {
      if (token && session.user) {
        session.user.id = (token.id as string) ?? (token.sub as string)
        session.user.email = token.email as string
        session.user.name = token.name as string | null
        session.user.image = token.image as string | null
        session.user.roles = (token.roles as string[]) ?? []
        session.user.community = token.community as CommunityClientDto | null
      }

      return session
    },
    jwt: ({ token, user }) => {
      // On first login, user is defined. On subsequent calls, only token is available.
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
        token.roles = user.roles
        token.community = user.community as CommunityClientDto | null
      }
      return token
    }
  },
  debug: process.env.NODE_ENV === 'development'
} satisfies NextAuthConfig
