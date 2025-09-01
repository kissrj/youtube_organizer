import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AutoTagsService } from '@/lib/services/autoTags';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const rules = await AutoTagsService.getAutoTagRules(session.user.id);
    return NextResponse.json(rules);
  } catch (error) {
    console.error('Erro ao obter regras de tags:', error);
    return NextResponse.json(
      { error: 'Erro ao obter regras de tags' },
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

    const body = await request.json();
    const rule = await AutoTagsService.createAutoTagRule({
      ...body,
      userId: session.user.id
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar regra de tag:', error);
    return NextResponse.json(
      { error: 'Erro ao criar regra de tag' },
      { status: 500 }
    );
  }
}
