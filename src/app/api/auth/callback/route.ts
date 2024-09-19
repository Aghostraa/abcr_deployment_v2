
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) throw error

      // Successful authentication, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(new URL('/login?error=AuthFailed', request.url))
    }
  }

  // If there's no code, redirect back to login
  return NextResponse.redirect(new URL('/login', request.url))
}