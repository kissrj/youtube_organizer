import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { disconnectYouTubeAccount } from '@/lib/youtube-oauth'

/**
 * Desconecta a conta YouTube do usuário
 * DELETE /api/auth/youtube/disconnect
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    await disconnectYouTubeAccount(session.user.id)

    return NextResponse.json({
      success: true,
      message: 'Conta YouTube desconectada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao desconectar conta YouTube:', error)

    // Se o erro for porque a conta não existe, consideramos sucesso
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json({
        success: true,
        message: 'Conta YouTube já estava desconectada'
      })
    }

    return NextResponse.json(
      { error: 'Erro ao desconectar conta YouTube' },
      { status: 500 }
    )
  }
}