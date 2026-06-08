import React from 'react'

type BadgeVariant = 'indigo' | 'gold' | 'neutral' | 'green' | 'red'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  indigo: 'bg-[#2E2860]/10 text-[#2E2860]',
  gold: 'bg-[#E0A943]/15 text-[#B07A20]',
  neutral: 'bg-[#8A8797]/10 text-[#8A8797]',
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
}

export function Badge({
  children,
  variant = 'indigo',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
