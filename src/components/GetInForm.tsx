'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function GetInForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Google sign-in error:', error)
      setError('An error occurred during Google sign-in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-red-400">{error}</p>}
      <button 
        type="button" 
        onClick={handleGoogleSignIn}
        className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
    </div>
  )
}