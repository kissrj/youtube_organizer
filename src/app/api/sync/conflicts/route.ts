import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SyncService } from '@/lib/services/sync';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const conflictCount = await SyncService.detectConflicts(session.user.id);
    return NextResponse.json({ conflictsDetected: conflictCount });
  } catch (error) {
    console.error('Erro ao detectar conflitos:', error);
    return NextResponse.json(
      { error: 'Erro ao detectar conflitos' },
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

    const conflicts = await prisma.syncConflict.findMany({
      where: { sessionId: { userId: session.user.id } },
      include: {
        session: {
          select: { deviceName: true, deviceType: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(conflicts);
  } catch (error) {
    console.error('Erro ao obter conflitos:', error);
    return NextResponse.json(
      { error: 'Erro ao obter conflitos' },
      { status: 500 }
    );
  }
}
