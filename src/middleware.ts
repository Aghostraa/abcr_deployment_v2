import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Allow access to impressum, attendance pages, and login API route without authentication
  if (req.nextUrl.pathname === '/impressum' || 
      req.nextUrl.pathname.startsWith('/attendance') ||
      req.nextUrl.pathname.startsWith('/api/login')) {
    return res
  }

  // Redirect unauthenticated users to login page
  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (session) {
    const { data: { user } } = await supabase.auth.getUser()
    const role = user?.app_metadata?.role || 'Visitor'

    // Redirect based on role
    if (req.nextUrl.pathname.startsWith('/admin') && role !== 'Admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    if (req.nextUrl.pathname.startsWith('/manager') && !['Admin', 'Manager'].includes(role)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    if (req.nextUrl.pathname.startsWith('/member') && !['Admin', 'Manager', 'Member'].includes(role)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    if ((req.nextUrl.pathname.startsWith('/tasks') || req.nextUrl.pathname.startsWith('/teams')) && role === 'Visitor') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/admin/:path*', 
    '/manager/:path*', 
    '/member/:path*', 
    '/tasks/:path*', 
    '/teams/:path*', 
    '/profile/:path*', 
    '/impressum',
    '/attendance/:path*',
    '/api/login'
  ],
}