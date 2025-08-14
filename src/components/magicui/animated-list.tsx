"use client"

import React, { ReactElement, useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface AnimatedListProps {
  className?: string
  children: React.ReactNode
  delay?: number
}

export const AnimatedList = React.memo(
  ({ className, children, delay = 1000 }: AnimatedListProps) => {
    const [messages, setMessages] = useState<ReactElement[]>([])
    const childrenArray = React.Children.toArray(children)

    useEffect(() => {
      const interval = setInterval(() => {
        if (messages.length < childrenArray.length) {
          setMessages((prev) => [...prev, childrenArray[prev.length] as ReactElement])
        }
      }, delay)

      return () => clearInterval(interval)
    }, [childrenArray, delay, messages])

    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <AnimatePresence>
          {messages.map((message, index) => (
            <AnimatedListItem key={index}>{message}</AnimatedListItem>
          ))}
        </AnimatePresence>
      </div>
    )
  }
)

AnimatedList.displayName = "AnimatedList"

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
  const animations = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, originY: 0 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: "spring", stiffness: 350, damping: 40 },
  }

  return (
    <motion.div {...animations} layout className="mx-auto w-full">
      {children}
    </motion.div>
  )
}