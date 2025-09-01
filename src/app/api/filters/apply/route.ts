import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdvancedFiltersService } from '@/lib/services/advancedFilters';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { filterOptions, presetId, collectionId, sortOptions } = await request.json();

    let filtersToApply = filterOptions;
    if (presetId) {
      const preset = await AdvancedFiltersService.getFilterPreset(presetId, session.user.id);
      if (!preset) {
        return NextResponse.json({ error: 'Preset não encontrado' }, { status: 404 });
      }
      filtersToApply = preset.conditions;
    }

    const result = await AdvancedFiltersService.applyFilters(
      collectionId,
      session.user.id,
      filtersToApply,
      sortOptions || {}
    );

    return NextResponse.json({
      videos: result.videos,
      count: result.total,
      pagination: result.pagination,
      executionTime: result.executionTime
    });
  } catch (error) {
    console.error('Erro ao aplicar filtros:', error);
    return NextResponse.json(
      { error: 'Erro ao aplicar filtros' },
      { status: 500 }
    );
  }
}
