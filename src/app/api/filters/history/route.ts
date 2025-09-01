import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdvancedFiltersService } from '@/lib/services/advancedFilters';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const options = {
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      collectionId: searchParams.get('collectionId') || undefined
    };

    const history = await AdvancedFiltersService.getFilterHistory(session.user.id, options);
    return NextResponse.json(history);
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    return NextResponse.json(
      { error: 'Erro ao obter histórico' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const olderThan = searchParams.get('olderThan') ? new Date(searchParams.get('olderThan')!) : undefined;

    const result = await AdvancedFiltersService.clearFilterHistory(session.user.id, olderThan);
    return NextResponse.json({
      message: 'Histórico limpo com sucesso',
      deletedCount: result.count
    });
  } catch (error) {
    console.error('Erro ao limpar histórico:', error);
    return NextResponse.json(
      { error: 'Erro ao limpar histórico' },
      { status: 500 }
    );
  }
}
