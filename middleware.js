import { NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export function middleware(request) {
  const sessionCookie = getSessionCookie(request)
  const pathname = request.nextUrl.pathname.replace(/\/+$/, '') || '/'

  // Allow access to login page when not authenticated
  if (pathname === '/admin/login') {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  // Protect all other /admin/* routes
  if (pathname.startsWith('/admin') && !sessionCookie) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
