import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserTags, createTag } from '@/lib/services/tag'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const tags = await getUserTags(session.user.id)
    return NextResponse.json(tags)
  } catch (error) {
    console.error('Erro ao buscar tags:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    const tag = await createTag({
      name,
      userId: session.user.id,
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Erro ao criar tag:', error)
    return NextResponse.json(
      { error: 'Erro ao criar tag' },
      { status: 500 }
    )
  }
}