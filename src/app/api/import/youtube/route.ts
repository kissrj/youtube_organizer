import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { YouTubeImportService } from '@/lib/services/youtubeImport';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando requisição de importação YouTube');

    // Verificar sessão
    const session = await getServerSession(authOptions);
    console.log('👤 Sessão verificada:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id
    });

    if (!session?.user?.id) {
      console.log('❌ Sessão inválida');
      return NextResponse.json({
        error: 'Não autorizado',
        details: 'Sessão expirada ou inválida'
      }, { status: 401 });
    }

    // Verificar conta YouTube conectada
    const { prisma } = await import('@/lib/prisma');
    const youtubeAccount = await prisma.youTubeAccount.findUnique({
      where: { userId: session.user.id }
    });

    console.log('📺 Conta YouTube:', {
      hasAccount: !!youtubeAccount,
      hasAccessToken: !!youtubeAccount?.accessToken
    });

    if (!youtubeAccount?.accessToken) {
      console.log('❌ Conta YouTube não conectada');
      return NextResponse.json({
        error: 'Conta YouTube não conectada',
        details: 'Para importar dados do YouTube, você precisa conectar sua conta primeiro. Vá para a página inicial e clique em "Conectar YouTube".',
        action: 'CONNECT_YOUTUBE',
        redirectUrl: '/'
      }, { status: 400 });
    }

    // Parsear parâmetros
    const body = await request.json();
    const {
      importHistory = true,
      importPlaylists = true,
      days = 3,
      applyAITags = false // Desabilitado por padrão devido ao erro 402
    } = body;

    console.log('⚙️ Parâmetros da importação:', {
      importHistory,
      importPlaylists,
      days,
      applyAITags
    });

    const importService = new YouTubeImportService();

    // Iniciar importação em background
    console.log('🔄 Iniciando importação em background...');
    const importJob = await importService.startImport(session.user.id, {
      importHistory,
      importPlaylists,
      days,
      applyAITags
    });

    console.log('✅ Importação iniciada com sucesso:', importJob.jobId);

    return NextResponse.json({
      success: true,
      jobId: importJob.jobId,
      message: 'Importação iniciada com sucesso',
      status: 'running',
      estimatedTime: `${Math.max(1, days)}-${Math.max(2, days * 2)} minutos`
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar importação:', error);

    // Dar feedback mais específico sobre o erro
    let errorMessage = 'Erro interno do servidor';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('YouTube')) {
        errorMessage = 'Erro na API do YouTube';
        statusCode = 502;
      } else if (error.message.includes('database') || error.message.includes('prisma')) {
        errorMessage = 'Erro no banco de dados';
        statusCode = 503;
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Erro de conectividade';
        statusCode = 504;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    console.log('🔍 GET /api/import/youtube - Parâmetros recebidos:', {
      jobId: jobId || 'NÃO FORNECIDO',
      url: request.url,
      searchParams: Object.fromEntries(searchParams.entries())
    });

    if (!jobId) {
      console.log('❌ Job ID não fornecido - retornando erro 400');
      return NextResponse.json({
        error: 'Job ID é obrigatório',
        details: 'Forneça o parâmetro jobId na URL',
        debug: {
          receivedParams: Object.fromEntries(searchParams.entries()),
          suggestion: 'Use ?jobId=seu_job_id na URL'
        }
      }, { status: 400 });
    }

    if (jobId.trim() === '') {
      console.log('❌ Job ID vazio - retornando erro 400');
      return NextResponse.json({
        error: 'Job ID é obrigatório',
        details: 'Job ID não pode ser vazio'
      }, { status: 400 });
    }

    console.log('📊 Verificando status da importação:', jobId);

    const importService = new YouTubeImportService();
    const status = await importService.getImportStatus(jobId);

    if (!status) {
      console.log(`❌ Job ${jobId} não encontrado - retornando status simulado`);

      return NextResponse.json({
        jobId,
        status: 'failed',
        overallProgress: 0,
        currentStep: 'Job não encontrado ou expirado',
        videosImported: 0,
        playlistsImported: 0,
        tagsCreated: 0,
        categoriesCreated: 0,
        errors: ['Job não encontrado. Pode ter expirado ou o servidor foi reiniciado.'],
        startedAt: new Date(Date.now() - 60000).toISOString(),
        completedAt: new Date().toISOString(),
        userId: 'unknown',
        debug: {
          requestedJobId: jobId,
          suggestion: 'Inicie uma nova importação'
        }
      });
    }

    // Adicionar informações extras para melhor feedback
    const enhancedStatus = {
      ...status,
      timestamp: new Date().toISOString(),
      estimatedTimeRemaining: status.status === 'running' ?
        'Calculando...' : 'Concluído'
    };

    console.log('📈 Status da importação:', {
      jobId,
      status: status.status,
      progress: status.overallProgress,
      videos: status.videosImported,
      playlists: status.playlistsImported
    });

    return NextResponse.json(enhancedStatus);

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    return NextResponse.json({
      error: 'Erro ao verificar status',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}