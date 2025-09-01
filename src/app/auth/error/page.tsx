"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthErrorPage() {
  const params = useSearchParams()
  const error = params.get('error')

  const messages: Record<string, string> = {
    OAuthSignin: 'Falha ao iniciar o fluxo OAuth.',
    OAuthCallback: 'Falha ao concluir o OAuth (callback).',
    OAuthCreateAccount: 'Não foi possível criar a conta via OAuth.',
    EmailCreateAccount: 'Erro ao criar conta por e-mail.',
    Callback: 'Erro no callback de autenticação.',
    OAuthAccountNotLinked: 'Conta OAuth não vinculada ao e-mail. Tente outro método.',
    EmailSignin: 'Falha ao enviar link de login por e-mail.',
    CredentialsSignin: 'Credenciais inválidas.',
    SessionRequired: 'Sessão requerida para acessar esta página.',
    Default: 'Ocorreu um erro ao autenticar.',
  }

  const detail = messages[error || 'Default'] || messages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro de autenticação</h1>
        <p className="text-gray-700 mb-4">{detail}</p>
        {error && (
          <p className="text-xs text-gray-500 mb-6">Código: {error}</p>
        )}
        <div className="flex gap-3">
          <Link href="/auth/signin" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Tentar novamente
          </Link>
          <Link href="/" className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
