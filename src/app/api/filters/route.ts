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
      includePublic: searchParams.get('includePublic') === 'true',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    const presets = await AdvancedFiltersService.getUserFilterPresets(session.user.id, options);
    return NextResponse.json(presets);
  } catch (error) {
    console.error('Erro ao obter presets:', error);
    return NextResponse.json(
      { error: 'Erro ao obter presets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const preset = await AdvancedFiltersService.createFilterPreset(session.user.id, data);

    return NextResponse.json(preset, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar preset:', error);
    return NextResponse.json(
      { error: 'Erro ao criar preset' },
      { status: 500 }
    );
  }
}
