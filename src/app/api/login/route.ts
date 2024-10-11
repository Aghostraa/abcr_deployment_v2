import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const intendedEvent = request.nextUrl.searchParams.get('intended_event')
  
  const response = NextResponse.redirect(new URL('/login', request.url))
  
  if (intendedEvent) {
    response.cookies.set('intended_event', intendedEvent, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 5, // 5 minutes
      path: '/',
    })
  }
  
  return response
}