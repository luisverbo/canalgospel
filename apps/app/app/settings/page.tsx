'use client'

import { SettingsClient } from './SettingsClient'

export default function SettingsPage() {
  return (
    <div className="px-4 pt-6 pb-6">
      <h1 className="text-2xl font-bold text-[#2E2860] dark:text-[#F3F1FA] mb-6">Configurações</h1>
      <SettingsClient />
    </div>
  )
}
