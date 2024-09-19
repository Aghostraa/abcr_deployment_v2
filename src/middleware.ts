import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

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
    if (req.nextUrl.pathname.startsWith('/tasks') || req.nextUrl.pathname.startsWith('/teams')) {
      if (role === 'Visitor') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }
  } else if (!req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/manager/:path*', '/member/:path*', '/tasks/:path*', '/teams/:path*', '/profile/:path*'],
}