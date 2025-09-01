import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = '/' + params.path.join('/');

    // Em uma implementação real, você buscaria o arquivo do storage
    // Para este exemplo, vamos simular o download
    const fileName = filePath.split('/').pop() || 'export';

    return NextResponse.json({
      message: 'Download simulado',
      filePath,
      fileName
    });
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error);
    return NextResponse.json(
      { error: 'Erro ao baixar arquivo' },
      { status: 500 }
    );
  }
}
