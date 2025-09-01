import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AutoTagsService } from '@/lib/services/autoTags';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { videoId, videoIds } = await request.json();

    if (videoId) {
      // Aplicar a um único vídeo
      const result = await AutoTagsService.applyAutoTags(videoId);
      return NextResponse.json(result);
    } else if (videoIds && Array.isArray(videoIds)) {
      // Aplicar a múltiplos vídeos
      const result = await AutoTagsService.applyAutoToMultipleVideos(videoIds);
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: 'ID do vídeo ou IDs de vídeos são obrigatórios' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro ao aplicar tags automáticas:', error);
    return NextResponse.json(
      { error: 'Erro ao aplicar tags automáticas' },
      { status: 500 }
    );
  }
}
