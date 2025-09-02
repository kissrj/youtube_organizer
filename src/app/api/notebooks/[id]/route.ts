import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getNotebook,
  updateNotebook,
  deleteNotebook,
  updateNotebookSchema,
} from '@/lib/services/notebooks'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const includeChildren = searchParams.get('includeChildren') === 'true'
    const includeContent = searchParams.get('includeContent') === 'true'
    const includeSettings = searchParams.get('includeSettings') === 'true'

    const notebook = await getNotebook(id, {
      includeChildren,
      includeContent,
      includeSettings,
    })

    if (!notebook) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 })
    }

    if (notebook.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: notebook,
    })
  } catch (error) {
    console.error('Error fetching notebook:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateNotebookSchema.parse(body)

    // Check if notebook exists and belongs to user
    const existingNotebook = await getNotebook(id)
    if (!existingNotebook) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 })
    }

    if (existingNotebook.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const notebook = await updateNotebook(id, validatedData)

    return NextResponse.json({
      success: true,
      data: notebook,
      message: 'Notebook updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating notebook:', error)

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if notebook exists and belongs to user
    const existingNotebook = await getNotebook(id)
    if (!existingNotebook) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 })
    }

    if (existingNotebook.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await deleteNotebook(id)

    return NextResponse.json({
      success: true,
      message: 'Notebook deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting notebook:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}