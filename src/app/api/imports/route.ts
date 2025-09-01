import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DataExportService } from '@/lib/services/dataExport';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const jobs = await DataExportService.getUserImportJobs(session.user.id);
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Erro ao obter jobs de importação:', error);
    return NextResponse.json(
      { error: 'Erro ao obter jobs de importação' },
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
    const job = await DataExportService.createImportJob(session.user.id, data);

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar job de importação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar job de importação' },
      { status: 500 }
    );
  }
}
