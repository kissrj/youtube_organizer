'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  FileCode,
  Database,
  RefreshCw,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { ExportJob, ImportJob, DataMapping } from '@/lib/types';

interface ExportManagerProps {
  userId: string;
}

export function ExportManager({ userId }: ExportManagerProps) {
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [mappings, setMappings] = useState<DataMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('exports');

  // Estados para novo export
  const [exportName, setExportName] = useState('');
  const [exportDescription, setExportDescription] = useState('');
  const [exportFormat, setExportFormat] = useState<'JSON' | 'CSV' | 'XML' | 'EXCEL' | 'PDF'>('JSON');
  const [includeCollections, setIncludeCollections] = useState(true);
  const [includeFeeds, setIncludeFeeds] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);
  const [includeVideos, setIncludeVideos] = useState(false);

  // Estados para novo import
  const [importName, setImportName] = useState('');
  const [importDescription, setImportDescription] = useState('');
  const [importFormat, setImportFormat] = useState<'JSON' | 'CSV' | 'XML' | 'YOUTUBE_JSON' | 'OPML'>('JSON');
  const [importFile, setImportFile] = useState<File | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Carregar dados de exportação
      const exportResponse = await fetch('/api/exports');
      if (exportResponse.ok) {
        const exportData = await exportResponse.json();
        setExportJobs(exportData);
      }

      // Carregar dados de importação
      const importResponse = await fetch('/api/imports');
      if (importResponse.ok) {
        const importData = await importResponse.json();
        setImportJobs(importData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExport = async () => {
    if (!exportName.trim()) return;

    try {
      const response = await fetch('/api/exports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: exportName,
          description: exportDescription,
          format: exportFormat,
          include: {
            collections: includeCollections,
            feeds: includeFeeds,
            tags: includeTags,
            videos: includeVideos,
            channels: false,
            playlists: false
          }
        }),
      });

      if (response.ok) {
        const newJob = await response.json();
        setExportJobs(prev => [newJob, ...prev]);
        // Limpar formulário
        setExportName('');
        setExportDescription('');
      }
    } catch (error) {
      console.error('Erro ao criar exportação:', error);
    }
  };

  const handleStartExport = async (jobId: string) => {
    try {
      const response = await fetch(`/api/exports/${jobId}/start`, {
        method: 'POST',
      });

      if (response.ok) {
        // Recarregar dados
        loadAllData();
      }
    } catch (error) {
      console.error('Erro ao iniciar exportação:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleCreateImport = async () => {
    if (!importName.trim() || !importFile) return;

    try {
      const formData = new FormData();
      formData.append('name', importName);
      formData.append('description', importDescription);
      formData.append('format', importFormat);
      formData.append('file', importFile);

      const response = await fetch('/api/imports', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newJob = await response.json();
        setImportJobs(prev => [newJob, ...prev]);
        // Limpar formulário
        setImportName('');
        setImportDescription('');
        setImportFile(null);
      }
    } catch (error) {
      console.error('Erro ao criar importação:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'PROCESSING':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'PROCESSING':
        return 'Processando';
      case 'COMPLETED':
        return 'Concluído';
      case 'FAILED':
        return 'Falhou';
      case 'EXPIRED':
        return 'Expirado';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs para Export/Import */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setSelectedTab('exports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'exports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Exportações
          </button>
          <button
            onClick={() => setSelectedTab('imports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'imports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Importações
          </button>
        </nav>
      </div>

      {/* Conteúdo das tabs */}
      {selectedTab === 'exports' && (
        <div className="space-y-6">
          {/* Formulário de nova exportação */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Nova Exportação
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome da Exportação
                  </label>
                  <input
                    type="text"
                    value={exportName}
                    onChange={(e) => setExportName(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Backup mensal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Formato
                  </label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="JSON">JSON</option>
                    <option value="CSV">CSV</option>
                    <option value="XML">XML</option>
                    <option value="EXCEL">Excel</option>
                    <option value="PDF">PDF</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={exportDescription}
                    onChange={(e) => setExportDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descrição da exportação"
                  />
                </div>
                <div className="sm:col-span-2">
                  <fieldset>
                    <legend className="text-sm font-medium text-gray-700">
                      Dados a incluir
                    </legend>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          id="include-collections"
                          type="checkbox"
                          checked={includeCollections}
                          onChange={(e) => setIncludeCollections(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="include-collections" className="ml-2 text-sm text-gray-900">
                          Coleções
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="include-feeds"
                          type="checkbox"
                          checked={includeFeeds}
                          onChange={(e) => setIncludeFeeds(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="include-feeds" className="ml-2 text-sm text-gray-900">
                          Feeds
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="include-tags"
                          type="checkbox"
                          checked={includeTags}
                          onChange={(e) => setIncludeTags(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="include-tags" className="ml-2 text-sm text-gray-900">
                          Tags
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="include-videos"
                          type="checkbox"
                          checked={includeVideos}
                          onChange={(e) => setIncludeVideos(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="include-videos" className="ml-2 text-sm text-gray-900">
                          Vídeos
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={handleCreateExport}
                  disabled={!exportName.trim() || loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Criar Exportação
                </button>
              </div>
            </div>
          </div>

          {/* Lista de exportações */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Exportações Recentes
              </h3>
              {exportJobs.length === 0 ? (
                <p className="text-gray-500">Nenhuma exportação encontrada.</p>
              ) : (
                <div className="space-y-4">
                  {exportJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(job.status)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {job.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {job.description || 'Sem descrição'}
                            </p>
                            <p className="text-xs text-gray-400">
                              Criado em {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            job.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : job.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : job.status === 'PROCESSING'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusText(job.status)}
                          </span>
                          {job.status === 'PENDING' && (
                            <button
                              onClick={() => handleStartExport(job.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Iniciar
                            </button>
                          )}
                          {job.status === 'COMPLETED' && job.downloadUrl && (
                            <a
                              href={job.downloadUrl}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'imports' && (
        <div className="space-y-6">
          {/* Formulário de nova importação */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Nova Importação
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome da Importação
                  </label>
                  <input
                    type="text"
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Importação de backup"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Formato
                  </label>
                  <select
                    value={importFormat}
                    onChange={(e) => setImportFormat(e.target.value as any)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="JSON">JSON</option>
                    <option value="CSV">CSV</option>
                    <option value="XML">XML</option>
                    <option value="YOUTUBE_JSON">YouTube JSON</option>
                    <option value="OPML">OPML</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Arquivo
                  </label>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".json,.csv,.xml,.opml"
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={importDescription}
                    onChange={(e) => setImportDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descrição da importação"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={handleCreateImport}
                  disabled={!importName.trim() || !importFile || loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  Criar Importação
                </button>
              </div>
            </div>
          </div>

          {/* Lista de importações */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Importações Recentes
              </h3>
              {importJobs.length === 0 ? (
                <p className="text-gray-500">Nenhuma importação encontrada.</p>
              ) : (
                <div className="space-y-4">
                  {importJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(job.status)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {job.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {job.description || 'Sem descrição'}
                            </p>
                            <p className="text-xs text-gray-400">
                              Criado em {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            job.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : job.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : job.status === 'PROCESSING'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusText(job.status)}
                          </span>
                          {job.status === 'PENDING' && (
                            <button
                              onClick={() => handleStartExport(job.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Iniciar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
