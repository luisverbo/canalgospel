import Link from 'next/link'
import { CreatePartnerForm } from './CreatePartnerForm'

export default function NovoParceiroPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/parceiros" className="text-sm text-[#8A8797] hover:text-[#1E1B2E] transition-colors">
          ← Voltar para Parceiros
        </Link>
        <h1 className="text-2xl font-bold text-[#2E2860] mt-2">Novo Parceiro</h1>
        <p className="text-[#8A8797] mt-1">
          Cria o acesso do pregador (usuário + perfil público). As credenciais são geradas automaticamente.
        </p>
      </div>
      <CreatePartnerForm />
    </div>
  )
}
