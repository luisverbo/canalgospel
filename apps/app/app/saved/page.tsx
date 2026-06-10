import { SavedStudies } from './SavedStudies'

export default function SavedPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-2xl font-bold text-[#2E2860] dark:text-[#F3F1FA]">Salvos</h1>
      <SavedStudies />
    </div>
  )
}
