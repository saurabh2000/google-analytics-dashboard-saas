"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useState, useMemo, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface AnimatedBeamProps {
  containerRef: React.RefObject<HTMLElement>
  fromRef: React.RefObject<HTMLElement>
  toRef: React.RefObject<HTMLElement>
  className?: string
  curvature?: number
  reverse?: boolean
  pathColor?: string
  pathWidth?: number
  pathOpacity?: number
  gradientStartColor?: string
  gradientStopColor?: string
  delay?: number
  duration?: number
  startXOffset?: number
  startYOffset?: number
  endXOffset?: number
  endYOffset?: number
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  containerRef,
  fromRef,
  toRef,
  className,
  curvature = 0,
  reverse = false,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#3b82f6",
  gradientStopColor = "#8b5cf6",
  delay = 0,
  duration = 4,
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}) => {
  const [id] = useState(() => `beam-${Date.now()}-${Math.floor(Math.random() * 1000)}`)
  const [pathD, setPathD] = useState("")
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 })

  const updatePath = () => {
    if (containerRef.current && fromRef.current && toRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const fromRect = fromRef.current.getBoundingClientRect()
      const toRect = toRef.current.getBoundingClientRect()

      const svgWidth = containerRect.width
      const svgHeight = containerRect.height
      setSvgDimensions({ width: svgWidth, height: svgHeight })

      const startX = fromRect.left - containerRect.left + fromRect.width / 2 + startXOffset
      const startY = fromRect.top - containerRect.top + fromRect.height / 2 + startYOffset
      const endX = toRect.left - containerRect.left + toRect.width / 2 + endXOffset
      const endY = toRect.top - containerRect.top + toRect.height / 2 + endYOffset

      const controlY = startY - curvature
      const d = `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`
      setPathD(d)
    }
  }

  useEffect(() => {
    updatePath()

    const resizeObserver = new ResizeObserver(updatePath)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset])

  return (
    <svg
      className={cn("pointer-events-none absolute left-0 top-0 h-full w-full", className)}
      width={svgDimensions.width}
      height={svgDimensions.height}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      <path
        d={pathD}
        strokeWidth={pathWidth}
        stroke={`url(#${id})`}
        strokeOpacity="1"
        strokeLinecap="round"
      />
      <defs>
        <motion.linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{
            x1: reverse ? "100%" : "0%",
            y1: "0%",
            x2: reverse ? "0%" : "100%",
            y2: "0%",
          }}
          animate={{
            x1: reverse ? "0%" : "100%",
            y1: "0%",
            x2: reverse ? "-100%" : "200%",
            y2: "0%",
          }}
          transition={{
            duration,
            ease: "linear",
            repeat: Infinity,
            delay,
            repeatDelay: 0,
          }}
        >
          <stop stopColor={gradientStartColor} />
          <stop offset="50%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStartColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  )
}

export const Circle = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white dark:bg-gray-800 shadow-lg",
          className
        )}
      >
        {children}
      </div>
    )
  }
)

Circle.displayName = "Circle"