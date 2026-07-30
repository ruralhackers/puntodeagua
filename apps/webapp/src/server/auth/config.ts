import type { CommunityDto } from '@pda/community'
import type { UserClientDto } from '@pda/user/domain'
import type { DefaultSession, NextAuthConfig } from 'next-auth'

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
      community: CommunityDto | null
      roles: string[]
    } & DefaultSession['user']
  }

  interface User extends UserClientDto {}
}

/**
 * Edge-compatible NextAuth configuration.
 *
 * This config must NOT import anything that relies on Node.js APIs (Prisma adapter, nodemailer,
 * bcrypt, etc.) because it is consumed by the Next.js middleware, which runs on the Edge runtime.
 *
 * Node-only providers and the database adapter are added on top of this base config in
 * `./index.ts`, which only runs in Node.js server contexts.
 *
 * @see https://authjs.dev/guides/edge-compatibility
 */
export const authConfig = {
  trustHost: true,
  session: {
    strategy: 'jwt'
  },
  providers: [],
  callbacks: {
    session: ({ session, token }) => {
      if (token && session.user) {
        session.user.id = (token.id as string) ?? (token.sub as string)
        session.user.email = token.email as string
        session.user.name = token.name as string | null
        session.user.roles = (token.roles as string[]) ?? []
        session.user.community = token.community as CommunityDto | null
      }

      return session
    },
    jwt: ({ token, user }) => {
      // On first login, user is defined. On subsequent calls, only token is available.
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.roles = user.roles
        token.community = user.community as CommunityDto | null
      }
      return token
    }
  },
  debug: process.env.NODE_ENV !== 'production'
} satisfies NextAuthConfig
