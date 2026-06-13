'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deletePartnerStudy } from './actions'

export function PartnerStudyDeleteButton({ studyId, title }: { studyId: string; title: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Excluir permanentemente "${title}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    const res = await deletePartnerStudy(studyId)
    setDeleting(false)
    if (res?.error) { alert(`Erro ao excluir: ${res.error}`); return }
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {deleting ? 'Excluindo…' : 'Excluir'}
    </button>
  )
}
