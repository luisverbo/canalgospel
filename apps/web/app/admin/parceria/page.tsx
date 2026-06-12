import { loadPartnershipSettings } from './actions'
import { ParceriaForm } from './ParceriaForm'

export default async function ParceriaAdminPage() {
  const settings = await loadPartnershipSettings()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E1B2E]">Parceria de Conteúdo</h1>
        <p className="text-sm text-[#8A8797] mt-1">
          Configure o texto e os canais de contato da página "Seja um Parceiro" no app.
        </p>
      </div>
      <ParceriaForm settings={settings} />
    </div>
  )
}
