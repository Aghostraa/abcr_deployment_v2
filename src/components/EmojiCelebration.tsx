import React, { useState, useEffect } from 'react'
import EmojiRain from './EmojiRain'

interface EmojiCelebrationProps {
  trigger: boolean
  duration?: number
  emojis?: string[]
  count?: number
}

const EmojiCelebration: React.FC<EmojiCelebrationProps> = ({
  trigger,
  duration = 5000,
  emojis = ['🎉', '🎊', '🥳', '🏆', '🌟', '💯', '🔥', '👏'],
  count = 100
}) => {
  const [showEmojis, setShowEmojis] = useState(false)

  useEffect(() => {
    if (trigger) {
      setShowEmojis(true)
      const timer = setTimeout(() => setShowEmojis(false), duration)
      return () => clearTimeout(timer)
    }
  }, [trigger, duration])

  if (!showEmojis) return null

  return (
    <EmojiRain
      emojis={emojis}
      duration={duration}
      count={count}
    />
  )
}

export default EmojiCelebration