import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DataExportService } from '@/lib/services/dataExport';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const result = await DataExportService.startImport(params.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao iniciar importação:', error);
    return NextResponse.json(
      { error: 'Erro ao iniciar importação' },
      { status: 500 }
    );
  }
}
