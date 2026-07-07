import { NextResponse } from 'next/server'
import { isWaterMeterReaderOnly } from '@/lib/user-roles'
import { auth } from '@/server/auth/edge'

const WATER_METER_READER_ALLOWED_PATHS = ['/water-meter/new', '/unauthorized', '/privacy', '/terms']

function isPathAllowedForWaterMeterReader(pathname: string): boolean {
  return WATER_METER_READER_ALLOWED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
}

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
