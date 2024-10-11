import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const intendedEvent = request.cookies.get('intended_event')?.value
  
  const response = NextResponse.json({ intendedEvent })
  
  if (intendedEvent) {
    response.cookies.delete('intended_event')
  }
  
  return response
}