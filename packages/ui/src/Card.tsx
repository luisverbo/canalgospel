import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  as?: keyof JSX.IntrinsicElements
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export function Card({
  children,
  className = '',
  onClick,
  as: Tag = 'div',
  padding = 'md',
}: CardProps) {
  return (
    <Tag
      onClick={onClick}
      className={[
        'bg-white rounded-[16px] border border-[#1E1B2E]/8 shadow-sm',
        paddingStyles[padding],
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-150' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  )
}
