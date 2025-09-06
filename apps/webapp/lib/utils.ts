import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Función helper para obtener mensajes de error legibles
 * @param error - El error a procesar
 * @returns Mensaje de error formateado
 */
export function getErrorMessage(error: unknown): string {
  // Manejar diferentes tipos de error
  if (error instanceof Error) {
    return error.message
  }

  // Si es un error HTTP con status
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: number }).status
    switch (status) {
      case 500:
        return 'Error interno del servidor. Inténtalo de nuevo.'
      case 400:
        return 'Datos inválidos. Revisa la información ingresada.'
      case 404:
        return 'Recurso no encontrado.'
      default:
        return `Error del servidor (${status}). Inténtalo de nuevo.`
    }
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}
