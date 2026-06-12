import { loadAgentSettings, loadThemes, loadPendingDevotionals } from './actions'
import { AgentSettingsForm } from './AgentSettingsForm'
import { ThemesSection } from './ThemesSection'
import { GenerateSection } from './GenerateSection'
import { ApprovalQueue } from './ApprovalQueue'

export default async function AgentePage() {
  const [settings, themes, pending] = await Promise.all([
    loadAgentSettings(),
    loadThemes(),
    loadPendingDevotionals(),
  ])

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1E1B2E]">Agente de Devocional</h1>
        <p className="text-sm text-[#8A8797] mt-1">
          Geração de devocionais diários com IA — modo aprovação.
        </p>
      </div>

      {/* ── Gerar agora ─────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5">
        <h2 className="font-semibold text-[#1E1B2E] mb-4 flex items-center gap-2">
          <span>✨</span> Gerar devocional
        </h2>
        <GenerateSection />
      </section>

      {/* ── Fila de aprovação ───────────────────────────────────── */}
      <section>
        <h2 className="font-semibold text-[#1E1B2E] mb-4 flex items-center gap-2">
          <span>⏳</span> Fila de aprovação
          {pending.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {pending.length}
            </span>
          )}
        </h2>
        <ApprovalQueue devotionals={pending} />
      </section>

      {/* ── Agenda de temas ─────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5">
        <h2 className="font-semibold text-[#1E1B2E] mb-4 flex items-center gap-2">
          <span>📅</span> Agenda de temas
        </h2>
        <ThemesSection themes={themes} />
      </section>

      {/* ── Configurações do agente ─────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5">
        <h2 className="font-semibold text-[#1E1B2E] mb-4 flex items-center gap-2">
          <span>⚙️</span> Configurações do agente
        </h2>
        <AgentSettingsForm settings={settings} />
      </section>
    </div>
  )
}
