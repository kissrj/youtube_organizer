import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationsService } from '@/lib/services/notifications';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await NotificationsService.markAllAsRead(session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar todas notificações como lidas:', error);
    return NextResponse.json(
      { error: 'Erro ao marcar todas notificações como lidas' },
      { status: 500 }
    );
  }
}
