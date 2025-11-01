import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc'
import { registersRouter } from './routers/analysis'
import { authRouter } from './routers/auth'
import { communityRouter } from './routers/community'
import { incidentsRouter } from './routers/incident'
import { tableRouter } from './routers/table'
import { userRouter } from './routers/user'
import { waterAccountRouter } from './routers/water-account'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  community: communityRouter,
  registers: registersRouter,
  incidents: incidentsRouter,
  user: userRouter,
  table: tableRouter,
  waterAccount: waterAccountRouter
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
