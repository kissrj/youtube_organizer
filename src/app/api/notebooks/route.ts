import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createNotebook,
  getUserNotebooks,
  createNotebookSchema,
} from '@/lib/services/notebooks'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeChildren = searchParams.get('includeChildren') === 'true'
    const includeContent = searchParams.get('includeContent') === 'true'
    const includeSettings = searchParams.get('includeSettings') === 'true'
    const parentId = searchParams.get('parentId') || undefined

    const notebooks = await getUserNotebooks(session.user.id, {
      includeChildren,
      includeContent,
      includeSettings,
      parentId,
    })

    // Build hierarchy if requested
    let hierarchy: any[] = []
    if (includeChildren) {
      hierarchy = notebooks.filter(n => !n.parentId)
    }

    return NextResponse.json({
      success: true,
      data: {
        notebooks,
        total: notebooks.length,
        hierarchy,
      },
    })
  } catch (error) {
    console.error('Error fetching notebooks:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createNotebookSchema.parse(body)

    const notebook = await createNotebook({
      ...validatedData,
      userId: session.user.id,
    })

    return NextResponse.json({
      success: true,
      data: notebook,
      message: 'Notebook created successfully',
    })
  } catch (error: any) {
    console.error('Error creating notebook:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}