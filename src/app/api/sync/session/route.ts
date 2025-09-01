import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SyncService } from '@/lib/services/sync';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { deviceName, deviceType, os, browser } = await request.json();

    const syncSession = await SyncService.getOrCreateSession(session.user.id, {
      deviceName,
      deviceType,
      os,
      browser
    });

    return NextResponse.json(syncSession);
  } catch (error) {
    console.error('Erro ao criar sessão de sincronização:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão de sincronização' },
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

    const sessions = await SyncService.getUserSessions(session.user.id);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Erro ao obter sessões:', error);
    return NextResponse.json(
      { error: 'Erro ao obter sessões' },
      { status: 500 }
    );
  }
}
