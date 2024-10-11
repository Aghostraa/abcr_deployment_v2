import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get('eventId')
  
  if (!eventId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  const response = NextResponse.redirect(new URL('/login', request.url))
  
  response.cookies.set('intended_event', eventId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
    maxAge: 60 * 5, // 5 minutes
    path: '/',
  })
  
  return response
}