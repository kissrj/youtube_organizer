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

    const [channels, tags] = await Promise.all([
      AdvancedFiltersService.getAvailableChannels(session.user.id),
      AdvancedFiltersService.getAvailableTags(session.user.id)
    ]);

    return NextResponse.json({
      channels,
      tags
    });
  } catch (error) {
    console.error('Erro ao obter dados auxiliares:', error);
    return NextResponse.json(
      { error: 'Erro ao obter dados auxiliares' },
      { status: 500 }
    );
  }
}
