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

    const preferences = await NotificationsService.getUserPreferences(session.user.id);
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Erro ao obter preferências:', error);
    return NextResponse.json(
      { error: 'Erro ao obter preferências' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const preferences = await NotificationsService.updatePreferences(session.user.id, data);

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar preferências' },
      { status: 500 }
    );
  }
}
