import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import QRAttendanceForm from '@/components/QRAttendanceForm'

export default async function QRAttendancePage({ params }: { params: { eventId: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">
          Thank you for attending <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600">{event.name}</span>!
        </h1>
        <QRAttendanceForm eventId={event.id} userId={session.user.id} />
      </div>
    </div>
  )
}