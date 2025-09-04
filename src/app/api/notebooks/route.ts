import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/notebooks - Lista notebooks do usuário
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API Notebooks: Starting GET request')

    const session = await getServerSession(authOptions)
    console.log('👤 API Notebooks: Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id
    })

    if (!session?.user?.id) {
      console.log('❌ API Notebooks: No authenticated user')
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    console.log('🔍 API Notebooks: Querying database for user:', session.user.id)

    // First, let's check if there are any collections at all
    const allCollections = await prisma.collection.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        createdAt: true
      }
    })

    console.log('📊 API Notebooks: All collections for user:', allCollections.length)
    console.log('📋 API Notebooks: Collection details:', allCollections.map(c => ({ id: c.id, name: c.name })))

    const notebooks = await prisma.notebook.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('✅ API Notebooks: Query successful, found', notebooks.length, 'notebooks')
    console.log('📝 API Notebooks: Notebook details:', notebooks.map(n => ({ id: n.id, name: n.name })))

    const response = {
      data: {
        notebooks,
        total: notebooks.length
      }
    }

    console.log('📤 API Notebooks: Sending response:', response)

    return NextResponse.json(response)

  } catch (error) {
    console.error('💥 API Notebooks: Error occurred:', error)
    console.error('💥 API Notebooks: Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notebooks - Cria um novo notebook
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { name, description } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    const notebook = await prisma.notebook.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        userId: session.user.id,
        color: '#3b82f6', // Cor padrão
      }
    })

    return NextResponse.json({
      data: notebook
    })

  } catch (error) {
    console.error('Erro ao criar notebook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}