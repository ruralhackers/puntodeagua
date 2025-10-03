import { toast } from 'sonner'

/**
 * Handles domain errors and shows appropriate Spanish messages to the user
 */
export function handleDomainError(error: unknown): void {
  // Check if it's a TRPC error with Spanish message (from our backend conversion)
  if (error && typeof error === 'object' && 'message' in error) {
    const trpcError = error as { message: string }
    // If the message is in Spanish, it's likely from our backend conversion
    if (
      trpcError.message.includes('lectura') ||
      trpcError.message.includes('contador') ||
      trpcError.message.includes('fecha')
    ) {
      toast.error(trpcError.message)
      return
    }
  }

  // Check if it's a domain error with defaultMessageEs
  if (error && typeof error === 'object' && 'defaultMessageEs' in error) {
    const domainError = error as { defaultMessageEs: string; name: string }
    toast.error(domainError.defaultMessageEs)
    return
  }

  // Check if it's an Error object with a message
  if (error instanceof Error) {
    toast.error(error.message)
    return
  }

  // Fallback for unknown errors
  toast.error('Ocurrió un error inesperado')
}

/**
 * Gets the Spanish error message from a domain error
 */
export function getDomainErrorMessage(error: unknown): string {
  // Check if it's a domain error with defaultMessageEs
  if (error && typeof error === 'object' && 'defaultMessageEs' in error) {
    const domainError = error as { defaultMessageEs: string }
    return domainError.defaultMessageEs
  }

  // Check if it's an Error object with a message
  if (error instanceof Error) {
    return error.message
  }

  // Fallback for unknown errors
  return 'Ocurrió un error inesperado'
}
