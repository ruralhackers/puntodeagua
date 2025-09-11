import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generatePageTitle(title: string) {
  const env = process.env.NEXT_PUBLIC_DEPLOY_MODE || process.env.DEPLOY_MODE
  const abbreviation = getAbbreviation(env)
  return `${abbreviation} SWS | ${title}`
}

function getAbbreviation(env: string | undefined) {
  switch (env) {
    case 'local':
      return '🔵🄻'
    case 'dev':
      return '🟠🄳'
    case 'prod':
      return '🟢🄿'
    default:
      return '🟡'
  }
}

export function getEnvAbbreviation(env: string | undefined) {
  switch (env) {
    case 'local':
      return 'LCL'
    case 'dev':
      return 'DEV'
    case 'prod':
      return 'PRD'
    default:
      return 'TST'
  }
}

export const getInitials = (str: string): string => {
  if (typeof str !== 'string' || !str.trim()) return '?'

  return (
    str
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || '?'
  )
}

export function formatCurrency(
  amount: number,
  opts?: {
    currency?: string
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    noDecimals?: boolean
  }
) {
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits,
    maximumFractionDigits,
    noDecimals
  } = opts ?? {}

  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: noDecimals ? 0 : minimumFractionDigits,
    maximumFractionDigits: noDecimals ? 0 : maximumFractionDigits
  }

  return new Intl.NumberFormat(locale, formatOptions).format(amount)
}
