import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc'
import { registersRouter } from './routers/analysis'
import { communityRouter } from './routers/community'
import { tableRouter } from './routers/table'
import { userRouter } from './routers/user'
import { waterAccountRouter } from './routers/water-account'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  community: communityRouter,
  registers: registersRouter,
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
