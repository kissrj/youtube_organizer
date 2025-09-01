import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AutoTagsService } from '@/lib/services/autoTags';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const rule = await AutoTagsService.updateAutoTagRule(params.id, body);

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Erro ao atualizar regra de tag:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar regra de tag' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await AutoTagsService.deleteAutoTagRule(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir regra de tag:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir regra de tag' },
      { status: 500 }
    );
  }
}
