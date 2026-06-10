'use client'

import { useState } from 'react'

export function PixButton({
  pixKey,
  preacherName,
}: {
  pixKey: string
  preacherName: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pixKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#E0A943]/10 rounded-2xl p-4 border border-[#E0A943]/30">
      <p className="text-sm font-semibold text-[#B07A20] mb-2">
        💛 Apoie {preacherName} via PIX
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-white rounded-lg px-3 py-2 text-[#1E1B2E] border border-[#E0A943]/20 truncate">
          {pixKey}
        </code>
        <button
          onClick={handleCopy}
          className="shrink-0 px-4 py-2 bg-[#E0A943] text-[#1E1B2E] rounded-lg text-sm font-semibold transition-colors hover:bg-[#EFC06A]"
        >
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}
