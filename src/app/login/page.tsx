'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import GetInForm from '@/components/GetInForm'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const response = await fetch('/api/get-intended-event')
        const { intendedEvent } = await response.json()
        if (intendedEvent) {
          router.push(`/attendance/${intendedEvent}`)
        } else {
          router.push('/dashboard')
        }
      }
    }
    checkUser()
  }, [supabase, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="glass-panel p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-center">Get In</h2>
        <GetInForm />
      </div>
    </div>
  )
}