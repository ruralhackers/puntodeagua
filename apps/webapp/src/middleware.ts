import { NextResponse } from 'next/server'
import { isWaterMeterReaderOnly } from '@/lib/user-roles'
import { isPathAllowedForWaterMeterReader } from '@/lib/water-meter-reader-paths'
import { auth } from '@/server/auth/edge'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const roles = req.auth?.user?.roles ?? []

  if (!req.auth?.user || !isWaterMeterReaderOnly(roles)) {
    return NextResponse.next()
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/water-meter/new', req.url))
  }

  if (pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  if (!isPathAllowedForWaterMeterReader(pathname)) {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon|login|.*\\..*).*)']
}
