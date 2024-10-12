'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Award, Coffee, Calendar } from 'lucide-react'
import Confetti from './Confetti'

export default function QRAttendanceForm({ eventId, userId }: { eventId: string, userId: string }) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
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
        setStep(2)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000) // Turn off confetti after 5 seconds
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

  const rewardItems = [
    { icon: <CheckCircle className="text-green-400" />, text: '20 ABCr Points' },
    { icon: <Award className="text-yellow-400" />, text: 'Collect badges' },
    { icon: <Coffee className="text-red-400" />, text: 'Get free food' },
    { icon: <Calendar className="text-blue-400" />, text: 'Join cool events' },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-gradient-to-br from-purple-800 to-indigo-900 p-8 rounded-xl shadow-2xl max-w-md mx-auto"
    >
      <Confetti isActive={showConfetti} />
      {step === 1 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Receive your rewards:</h2>
          <ul className="space-y-4">
            {rewardItems.map((item, index) => (
              <motion.li 
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 bg-white bg-opacity-10 rounded-lg p-3"
              >
                {item.icon}
                <span className="text-white">{item.text}</span>
              </motion.li>
            ))}
          </ul>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAttendance}
            disabled={isSubmitting}
            className="btn-primary w-full py-3 rounded-lg text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
          >
            {isSubmitting ? 'Processing...' : 'Receive Rewards'}
          </motion.button>
          {message && <p className="text-red-400 text-center">{message}</p>}
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            Congratulations!
          </h2>
          <p className="text-xl text-center text-white">You&apos;ve received:</p>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
            className="bg-white bg-opacity-10 p-6 rounded-lg text-center"
          >
            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
              20 ABCr Points
            </p>
            <p className="text-lg text-gray-300 mt-2">New badge unlocked!</p>
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToProfile}
            className="btn-primary w-full py-3 rounded-lg text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-300"
          >
            Go to Profile
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}