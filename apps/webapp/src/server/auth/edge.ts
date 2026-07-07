import NextAuth from 'next-auth'
import { authConfig } from './config'

/**
 * Edge-compatible NextAuth instance for use in the Next.js middleware.
 *
 * It only reads/decodes the JWT session (via the shared callbacks) and does NOT include the
 * database adapter or Node-only providers, so it can run on the Edge runtime.
 */
export const { auth } = NextAuth(authConfig)
