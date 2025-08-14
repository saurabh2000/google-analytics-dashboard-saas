"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SparklesButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "default" | "ghost" | "outline"
}

export default function SparklesButton({
  children,
  className,
  variant = "default",
  ...props
}: SparklesButtonProps) {
  const sparkles = Array.from({ length: 6 }).map((_, i) => (
    <motion.span
      key={i}
      className="absolute h-1 w-1 rounded-full bg-yellow-400"
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 5)],
        y: [0, -20 - i * 3],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        repeatDelay: i * 0.3,
        delay: i * 0.3,
      }}
      style={{
        left: `${20 + i * 12}%`,
        top: `${30 + (i % 3) * 15}%`,
      }}
    />
  ))

  const baseStyles = "relative inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  
  const variantStyles = {
    default: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
    outline: "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
  }

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        "overflow-hidden px-4 py-2",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 overflow-hidden">
        {sparkles}
      </div>
    </button>
  )
}