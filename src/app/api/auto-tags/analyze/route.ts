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

    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json({ error: 'ID do vídeo é obrigatório' }, { status: 400 });
    }

    const analysis = await AutoTagsService.analyzeVideo(videoId);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Erro ao analisar vídeo:', error);
    return NextResponse.json(
      { error: 'Erro ao analisar vídeo' },
      { status: 500 }
    );
  }
}
