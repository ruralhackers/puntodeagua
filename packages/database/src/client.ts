import { PrismaClient } from '../prisma/generated/client'

//https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client
declare global {
  var prisma: PrismaClient | undefined
}

export let client: PrismaClient

if (typeof window === 'undefined') {
  if (process.env.NODE_ENV === 'production') {
    client = new PrismaClient()
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient()
    }
    client = global.prisma
  }
}

export * from '../prisma/generated'
