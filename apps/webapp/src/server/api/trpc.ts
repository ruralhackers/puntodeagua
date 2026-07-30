/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'

import {
  canAccessAdminPanel,
  canCreateWaterPoint,
  canManageWaterDeposits,
  isWaterMeterReaderOnly
} from '@/lib/user-roles'
import { auth } from '@/server/auth'
import { db } from '@/server/db'

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth()

  return {
    db,
    session,
    ...opts
  }
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  isDev: false,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
      }
    }
  }
})

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now()

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }

  const result = await next()

  const end = Date.now()
  // console.log(`[TRPC] ${path} took ${end - start}ms to execute`)

  return result
})

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware)

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(timingMiddleware).use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user }
    }
  })
})

/**
 * Accessible by any authenticated user, including WATER_METER_READER.
 * Used for the water meter reading creation flow.
 */
export const waterMeterReaderAllowedProcedure = protectedProcedure

/**
 * Staff-only procedure (ADMIN, COMMUNITY_ADMIN, MANAGER).
 * Blocks users with only the WATER_METER_READER role.
 */
export const staffProcedure = protectedProcedure.use(({ ctx, next }) => {
  const roles = ctx.session.user.roles ?? []
  if (isWaterMeterReaderOnly(roles)) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx })
})

/**
 * Global admin procedure.
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  const roles = ctx.session.user.roles ?? []
  if (!roles.includes('ADMIN')) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx })
})

/**
 * Admin panel procedure (ADMIN only).
 */
export const adminPanelProcedure = protectedProcedure.use(({ ctx, next }) => {
  const roles = ctx.session.user.roles ?? []
  if (!canAccessAdminPanel(roles)) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx })
})

/**
 * Water point creation procedure (ADMIN or COMMUNITY_ADMIN).
 */
export const waterPointManagementProcedure = protectedProcedure.use(({ ctx, next }) => {
  const roles = ctx.session.user.roles ?? []
  if (!canCreateWaterPoint(roles)) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx })
})

/**
 * Water deposit management procedure (ADMIN or COMMUNITY_ADMIN).
 */
export const waterDepositManagementProcedure = protectedProcedure.use(({ ctx, next }) => {
  const roles = ctx.session.user.roles ?? []
  if (!canManageWaterDeposits(roles)) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx })
})

/**
 * The set of communities a caller may act on. 'global' is only ever produced
 * for the ADMIN role, which is a system-wide role.
 *
 * This is a discriminated union rather than a nullable communityId on purpose:
 * a nullable id can be ignored by accident, which is exactly how the
 * cross-community holes appeared in the first place. Consumers have to handle
 * both cases explicitly.
 */
export type CommunityScope = { kind: 'global' } | { kind: 'community'; communityId: string }

/**
 * Resolves the caller's community scope from their session.
 */
export function resolveCommunityScope(roles: string[], communityId?: string): CommunityScope {
  if (roles.includes('ADMIN')) {
    return { kind: 'global' }
  }
  if (!communityId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'User has no community assigned' })
  }
  return { kind: 'community', communityId }
}

/**
 * Staff procedure with the caller's community scope resolved once.
 *
 * Endpoints using it must take the community from ctx.scope and never from
 * their input, which makes cross-community access impossible to express
 * rather than merely checked.
 */
export const communityScopedProcedure = staffProcedure.use(({ ctx, next }) => {
  const scope = resolveCommunityScope(ctx.session.user.roles ?? [], ctx.session.user.community?.id)
  return next({ ctx: { ...ctx, scope } })
})

/**
 * The single community a new resource belongs to. A global admin has to say
 * which one, because "create it in every community" is not a thing.
 */
export function requireCommunityId(scope: CommunityScope, explicit?: string): string {
  if (scope.kind === 'community') return scope.communityId
  if (explicit) return explicit
  throw new TRPCError({
    code: 'BAD_REQUEST',
    message: 'A global admin must specify the target community'
  })
}
