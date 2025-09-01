import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SyncService } from '@/lib/services/sync';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const status = await SyncService.getSyncStatus(session.user.id);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Erro ao obter status de sincronização:', error);
    return NextResponse.json(
      { error: 'Erro ao obter status de sincronização' },
      { status: 500 }
    );
  }
}
