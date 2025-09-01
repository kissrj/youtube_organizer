import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdvancedFiltersService } from '@/lib/services/advancedFilters';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const preset = await AdvancedFiltersService.getFilterPreset(params.id, session.user.id);
    if (!preset) {
      return NextResponse.json({ error: 'Preset não encontrado' }, { status: 404 });
    }

    return NextResponse.json(preset);
  } catch (error) {
    console.error('Erro ao obter preset:', error);
    return NextResponse.json(
      { error: 'Erro ao obter preset' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const preset = await AdvancedFiltersService.updateFilterPreset(params.id, session.user.id, data);

    if (!preset) {
      return NextResponse.json({ error: 'Preset não encontrado' }, { status: 404 });
    }

    return NextResponse.json(preset);
  } catch (error) {
    console.error('Erro ao atualizar preset:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar preset' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const success = await AdvancedFiltersService.deleteFilterPreset(params.id, session.user.id);
    if (!success) {
      return NextResponse.json({ error: 'Preset não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Preset deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar preset:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar preset' },
      { status: 500 }
    );
  }
}
