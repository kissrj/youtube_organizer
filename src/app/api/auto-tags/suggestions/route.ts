import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (videoId) {
      // Obter sugestões para um vídeo específico
      const suggestions = await prisma.tagSuggestion.findMany({
        where: {
          videoId,
          isAccepted: null,
          video: { userId: session.user.id }
        },
        include: {
          tag: {
            select: { id: true, name: true, color: true, category: true }
          }
        },
        orderBy: { confidence: 'desc' },
        take: limit
      });

      return NextResponse.json(suggestions);
    } else {
      // Obter todas as sugestões pendentes
      const suggestions = await prisma.tagSuggestion.findMany({
        where: {
          isAccepted: null,
          video: { userId: session.user.id }
        },
        include: {
          video: {
            select: { id: true, title: true }
          },
          tag: {
            select: { id: true, name: true, color: true, category: true }
          }
        },
        orderBy: { confidence: 'desc' },
        take: limit
      });

      return NextResponse.json(suggestions);
    }
  } catch (error) {
    console.error('Erro ao obter sugestões:', error);
    return NextResponse.json(
      { error: 'Erro ao obter sugestões' },
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

    const { videoId, tagId, action } = await request.json();

    if (!videoId || !tagId || !action) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios: videoId, tagId, action' }, { status: 400 });
    }

    if (action === 'accept') {
      await prisma.tagSuggestion.update({
        where: {
          videoId_tagId: {
            videoId,
            tagId
          }
        },
        data: {
          isAccepted: true,
          acceptedAt: new Date()
        }
      });
      return NextResponse.json({ success: true, message: 'Sugestão aceita' });
    } else if (action === 'reject') {
      await prisma.tagSuggestion.update({
        where: {
          videoId_tagId: {
            videoId,
            tagId
          }
        },
        data: {
          isAccepted: false,
          rejectedAt: new Date()
        }
      });
      return NextResponse.json({ success: true, message: 'Sugestão rejeitada' });
    } else {
      return NextResponse.json({ error: 'Ação inválida. Use "accept" ou "reject"' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro ao processar sugestão:', error);
    return NextResponse.json(
      { error: 'Erro ao processar sugestão' },
      { status: 500 }
    );
  }
}
