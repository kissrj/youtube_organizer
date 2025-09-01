import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Buscar estatísticas básicas que já existem
    const totalTags = await prisma.tag.count();
    const totalVideos = await prisma.video.count();

    // Para as novas tabelas, vamos retornar valores padrão por enquanto
    // até que o Prisma client seja atualizado
    const stats = {
      totalTags,
      totalRules: 0, // Será atualizado quando o client for gerado
      totalAnalyses: 0,
      totalSuggestions: 0,
      acceptanceRate: 0,
      coverageRate: totalVideos > 0 ? 0 : 0, // Sem análises por enquanto
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
