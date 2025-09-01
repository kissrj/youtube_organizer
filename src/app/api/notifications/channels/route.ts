import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationsService } from '@/lib/services/notifications';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const channels = await NotificationsService.getUserChannels(session.user.id);
    return NextResponse.json(channels);
  } catch (error) {
    console.error('Erro ao obter canais:', error);
    return NextResponse.json(
      { error: 'Erro ao obter canais' },
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

    const data = await request.json();
    const channel = await NotificationsService.addChannel(session.user.id, data);

    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar canal:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar canal' },
      { status: 500 }
    );
  }
}
