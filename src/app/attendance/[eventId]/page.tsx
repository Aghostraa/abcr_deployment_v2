import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import QRAttendanceForm from '@/components/QRAttendanceForm'

export default async function QRAttendancePage({ params }: { params: { eventId: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // Redirect to a new API route that will handle cookie setting
    redirect(`/api/set-intended-event?eventId=${params.eventId}`)
  }

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.eventId)
    .single()

  if (error || !event) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to {event.name}!</h1>
      <QRAttendanceForm eventId={event.id} userId={session.user.id} />
    </div>
  )
}