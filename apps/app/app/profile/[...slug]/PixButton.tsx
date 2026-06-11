'use client'

import { useState } from 'react'

export function PixButton({
  pixKey,
  preacherName,
}: {
  pixKey: string
  preacherName: string
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pixKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div>
      {/* CTA button — dourado, proeminente */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-[#E0A943] hover:bg-[#EFC06A] active:scale-[0.98] transition-all rounded-2xl text-[#1E1B2E] text-sm font-bold shadow-sm"
        >
          <span className="text-base">💛</span>
          Apoiar · PIX
        </button>
      )}

      {/* Expanded: chave PIX + copiar */}
      {open && (
        <div className="bg-[#E0A943]/12 dark:bg-[#E0A943]/8 rounded-2xl p-4 border border-[#E0A943]/40">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-[#B07A20] dark:text-[#E0A943]">
              💛 Apoie {preacherName} via PIX
            </p>
            <button
              onClick={() => { setOpen(false); setCopied(false) }}
              className="text-xs text-[#8A8797] hover:text-[#1E1B2E] dark:hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white dark:bg-[#1E1B2E] rounded-xl px-3 py-2.5 text-[#1E1B2E] dark:text-[#F3F1FA] border border-[#E0A943]/25 truncate font-mono">
              {pixKey}
            </code>
            <button
              onClick={handleCopy}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#E0A943] hover:bg-[#EFC06A] text-[#1E1B2E]'
              }`}
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
