// Teste simples do serviço de exportação
import { DataExportService } from './lib/services/dataExport';

async function testExportService() {
  try {
    console.log('Testando criação de job de exportação...');

    const job = await DataExportService.createExportJob('test-user', {
      name: 'Test Export',
      description: 'Test description',
      format: 'JSON',
      include: {
        collections: true,
        feeds: true,
        tags: true,
        videos: false,
        channels: false,
        playlists: false
      }
    });

    console.log('Job criado:', job);

    console.log('Testando obtenção de jobs...');
    const jobs = await DataExportService.getUserExportJobs('test-user');
    console.log('Jobs encontrados:', jobs.length);

    console.log('Teste concluído com sucesso!');
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testExportService();
