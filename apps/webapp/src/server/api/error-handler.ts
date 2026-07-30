import { TRPCError } from '@trpc/server'

/**
 * Handles domain errors and converts them to TRPC errors with Spanish messages
 * This ensures consistent error handling across all tRPC routers
 */
export function handleDomainError(error: unknown): never {
  // Handle domain errors with Spanish messages
  if (error?.constructor && 'defaultMessageEs' in error.constructor) {
    const errorClass = error.constructor as { defaultMessageEs: string; statusCode?: number }
    const errorCode = errorClass.statusCode === 404 ? 'NOT_FOUND' : 'BAD_REQUEST'
    throw new TRPCError({
      code: errorCode,
      message: errorClass.defaultMessageEs
    })
  }

  // Re-throw the original error if it's not a domain error
  throw error
}
