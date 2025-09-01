import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationsService } from '@/lib/services/notifications';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const options = {
      unreadOnly: searchParams.get('unreadOnly') === 'true',
      archived: searchParams.get('archived') === 'true',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      type: searchParams.get('type') || undefined,
      priority: searchParams.get('priority') || undefined
    };

    const notifications = await NotificationsService.getUserNotifications(session.user.id, options);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Erro ao obter notificações:', error);
    return NextResponse.json(
      { error: 'Erro ao obter notificações' },
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

    const data = await request.json();
    const notification = await NotificationsService.createNotification({
      userId: session.user.id,
      ...data
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar notificação' },
      { status: 500 }
    );
  }
}
