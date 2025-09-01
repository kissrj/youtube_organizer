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

    const data = await AdvancedFiltersService.exportFilterPresets(session.user.id);

    return NextResponse.json(data, {
      headers: {
        'Content-Disposition': `attachment; filename="filter-presets-${new Date().toISOString().split('T')[0]}.json"`
      }
    });
  } catch (error) {
    console.error('Erro ao exportar presets:', error);
    return NextResponse.json(
      { error: 'Erro ao exportar presets' },
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
    const results = await AdvancedFiltersService.importFilterPresets(session.user.id, data);

    return NextResponse.json({
      message: 'Importação concluída',
      results
    });
  } catch (error) {
    console.error('Erro ao importar presets:', error);
    return NextResponse.json(
      { error: 'Erro ao importar presets' },
      { status: 500 }
    );
  }
}
