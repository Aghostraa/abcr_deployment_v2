'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ConfettiPieceProps {
  color: string;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ color }) => {
  const randomRotation = Math.random() * 360
  const randomScale = Math.random() * 0.5 + 0.5
  const randomX = (Math.random() - 0.5) * 200
  const randomY = Math.random() * -200

  return (
    <motion.div
      style={{
        width: '10px',
        height: '10px',
        backgroundColor: color,
        borderRadius: '50%',
        position: 'absolute',
        top: '50%',
        left: '50%',
      }}
      initial={{ scale: 0, rotate: 0 }}
      animate={{
        y: [0, randomY],
        x: [0, randomX],
        scale: [0, randomScale, 0],
        rotate: [0, randomRotation],
      }}
      transition={{ duration: 2, ease: "easeOut" }}
    />
  )
}

interface ConfettiProps {
  isActive: boolean;
}

const Confetti: React.FC<ConfettiProps> = ({ isActive }) => {
  const [pieces, setPieces] = useState<JSX.Element[]>([])

  useEffect(() => {
    if (isActive) {
      const newPieces = Array.from({ length: 50 }, (_, i) => (
        <ConfettiPiece key={i} color={`hsl(${Math.random() * 360}, 100%, 50%)`} />
      ))
      setPieces(newPieces)
    } else {
      setPieces([])
    }
  }, [isActive])

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces}
    </div>
  )
}

export default Confetti