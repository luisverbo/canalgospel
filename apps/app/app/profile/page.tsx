'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PreacherProfileClient } from './[...slug]/PreacherProfileClient'

function ProfileRouter() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug') ?? ''
  return <PreacherProfileClient slugOverride={slug} />
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col">
        <div className="bg-[#2E2860] h-64 animate-pulse" />
        <div className="px-5 py-5 flex flex-col gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-white/60 animate-pulse" />)}
        </div>
      </div>
    }>
      <ProfileRouter />
    </Suspense>
  )
}
