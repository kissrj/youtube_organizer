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

    const backup = await SyncService.generateBackup(session.user.id);
    return NextResponse.json(backup);
  } catch (error) {
    console.error('Erro ao gerar backup:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar backup' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const backup = await request.json();
    const result = await SyncService.restoreBackup(session.user.id, backup);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    return NextResponse.json(
      { error: 'Erro ao restaurar backup' },
      { status: 500 }
    );
  }
}
