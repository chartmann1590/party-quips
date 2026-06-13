import { motion, AnimatePresence } from 'framer-motion'
import { type ReactNode } from 'react'

interface PhaseTransitionProps {
  phase: string
  children: ReactNode
}

export default function PhaseTransition({ phase, children }: PhaseTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.05, y: -20 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col flex-1"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
