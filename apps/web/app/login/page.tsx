import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F1] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2E2860] mb-4">
            <span className="text-3xl text-[#E0A943]">✝</span>
          </div>
          <h1 className="text-3xl font-bold text-[#2E2860]">Canal Gospel</h1>
          <p className="text-[#8A8797] mt-1">Painel de Gestão</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#1E1B2E]/8 shadow-sm p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
