import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SyncService } from '@/lib/services/sync';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { sessionId } = await request.json();

    const result = await SyncService.startSync(sessionId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao iniciar sincronização:', error);
    return NextResponse.json(
      { error: 'Erro ao iniciar sincronização' },
      { status: 500 }
    );
  }
}
