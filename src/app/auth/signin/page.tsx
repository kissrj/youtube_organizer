'use client'

import { getProviders, signIn, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Provider = {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Redirecionar se já estiver logado
    if (status === 'authenticated') {
      router.push('/')
      return
    }

    const getProvidersData = async () => {
      const providers = await getProviders()
      setProviders(providers)
    }
    getProvidersData()
  }, [status, router])

  const handleSignIn = (providerId: string) => {
    signIn(providerId, { callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Entrar no YouTube Organizer
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Organize suas playlists do YouTube de forma inteligente
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {providers && (
            <div className="space-y-4">
              {Object.values(providers).map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleSignIn(provider.id)}
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="w-5 h-5 mr-2 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded">
                    G
                  </span>
                  Entrar com {provider.name}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Organize suas playlists do YouTube
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}