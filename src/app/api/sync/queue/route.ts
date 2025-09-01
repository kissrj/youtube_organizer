import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SyncService } from '@/lib/services/sync';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const operation = await request.json();

    const queueItem = await SyncService.addToQueue(session.user.id, operation);
    return NextResponse.json(queueItem, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar à fila:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar à fila' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const queueItems = await prisma.syncQueue.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { priority: 'asc' },
        { scheduledAt: 'asc' }
      ],
      take: 20
    });

    return NextResponse.json(queueItems);
  } catch (error) {
    console.error('Erro ao obter fila:', error);
    return NextResponse.json(
      { error: 'Erro ao obter fila' },
      { status: 500 }
    );
  }
}
