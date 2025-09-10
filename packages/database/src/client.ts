import { PrismaClient } from '../prisma/generated/client'

//https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client
const isServer = typeof (globalThis as { window?: unknown }).window === 'undefined'
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const client: PrismaClient = isServer
  ? (globalForPrisma.prisma ?? new PrismaClient())
  : (() => {
      throw new Error('PrismaClient is server-only')
    })()

if (isServer && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = client
}

export * from '../prisma/generated'
