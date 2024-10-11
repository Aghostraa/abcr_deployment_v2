'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function QRAttendanceForm({ eventId, userId }: { eventId: string, userId: string }) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleAttendance = async () => {
    setIsSubmitting(true)
    setMessage('')
  
    try {
      const { data, error } = await supabase.rpc('add_points_to_user', {
        p_user_id: userId,
        p_event_id: eventId,
        p_points_to_add: 20
      })
  
      if (error) throw error
  
      if (data) {
        setStep(2) // Points were added successfully
      } else {
        setMessage('You have already attended this event and received points.')
      }
    } catch (error) {
      console.error('Error recording attendance:', error)
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToProfile = () => {
    router.push('/dashboard/profile')
  }

  if (step === 1) {
    return (
      <div className="space-y-4">
        <p className="text-xl">Receive your rewards:</p>
        <ul className="list-disc list-inside">
          <li>10 points</li>
          <li>Collect badges</li>
          <li>Get free food</li>
          <li>Join cool events</li>
        </ul>
        <button
          onClick={handleAttendance}
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting ? 'Processing...' : 'Receive'}
        </button>
        {message && <p className="text-red-500">{message}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Congratulations!</h2>
      <p className="text-xl">You&apos;ve received:</p>
      <div className="bg-white bg-opacity-10 p-4 rounded-lg">
        <p className="text-2xl font-bold">20 Points</p>
        <p>New badge unlocked!</p>
      </div>
      <button onClick={goToProfile} className="btn-primary w-full">
        Go to Profile
      </button>
    </div>
  )
}