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
    try {
      const [exportsRes, importsRes] = await Promise.all([
        fetch('/api/exports'),
        fetch('/api/imports')
      ]);

      if (exportsRes.ok) {
        const exportsData = await exportsRes.json();
        setExportJobs(exportsData);
      }

      if (importsRes.ok) {
        const importsData = await importsRes.json();
        setImportJobs(importsData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleCreateExport = async () => {
    if (!exportName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        })
      });

      if (response.ok) {
        const job = await response.json();
        setExportJobs([job, ...exportJobs]);
        resetExportForm();
      }
    } catch (error) {
      console.error('Erro ao criar exportação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExport = async (jobId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/exports/${jobId}/start`, {
        method: 'POST'
      });

      if (response.ok) {
        await loadAllData();
      }
    } catch (error) {
      console.error('Erro ao iniciar exportação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExport = async (job: ExportJob) => {
    if (!job.downloadUrl) return;

    window.open(job.downloadUrl, '_blank');
  };

  const handleCreateImport = async () => {
    if (!importName.trim() || !importFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('name', importName);
      formData.append('description', importDescription);
      formData.append('format', importFormat);

      const response = await fetch('/api/imports', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const job = await response.json();
        setImportJobs([job, ...importJobs]);
        resetImportForm();
      }
    } catch (error) {
      console.error('Erro ao criar importação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartImport = async (jobId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/imports/${jobId}/start`, {
        method: 'POST'
      });

      if (response.ok) {
        await loadAllData();
      }
    } catch (error) {
      console.error('Erro ao iniciar importação:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetExportForm = () => {
    setExportName('');
    setExportDescription('');
    setExportFormat('JSON');
    setIncludeCollections(true);
    setIncludeFeeds(true);
    setIncludeTags(true);
    setIncludeVideos(false);
  };

  const resetImportForm = () => {
    setImportName('');
    setImportDescription('');
    setImportFormat('JSON');
    setImportFile(null);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'JSON':
        return <FileCode className="h-4 w-4" />;
      case 'CSV':
      case 'EXCEL':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'XML':
        return <FileCode className="h-4 w-4" />;
      case 'PDF':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PROCESSING':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Gerenciador de Dados</h2>
          <p className="text-gray-600">
            Exporte e importe seus dados em múltiplos formatos
          </p>
        </div>
        <button
          onClick={loadAllData}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setSelectedTab('exports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              selectedTab === 'exports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
          <button
            onClick={() => setSelectedTab('imports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              selectedTab === 'imports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>Importar</span>
          </button>
          <button
            onClick={() => setSelectedTab('mappings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              selectedTab === 'mappings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Mapeamentos</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'exports' && (
        <div className="space-y-6">
          {/* Formulário de Exportação */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Download className="h-5 w-5" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">Nova Exportação</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Crie um novo job de exportação em diferentes formatos
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nome da Exportação</label>
                    <input
                      type="text"
                      value={exportName}
                      onChange={(e) => setExportName(e.target.value)}
                      placeholder="Ex: Backup Completo"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Descrição</label>
                    <textarea
                      value={exportDescription}
                      onChange={(e) => setExportDescription(e.target.value)}
                      placeholder="Descrição opcional"
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Formato</label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as any)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="JSON">JSON</option>
                      <option value="CSV">CSV</option>
                      <option value="XML">XML</option>
                      <option value="EXCEL">Excel</option>
                      <option value="PDF">PDF</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Incluir Dados</label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center">
                        <input
                          id="collections"
                          type="checkbox"
                          checked={includeCollections}
                          onChange={(e) => setIncludeCollections(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="collections" className="ml-2 text-sm text-gray-700">Coleções</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="feeds"
                          type="checkbox"
                          checked={includeFeeds}
                          onChange={(e) => setIncludeFeeds(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="feeds" className="ml-2 text-sm text-gray-700">Feeds</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="tags"
                          type="checkbox"
                          checked={includeTags}
                          onChange={(e) => setIncludeTags(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="tags" className="ml-2 text-sm text-gray-700">Tags</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="videos"
                          type="checkbox"
                          checked={includeVideos}
                          onChange={(e) => setIncludeVideos(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="videos" className="ml-2 text-sm text-gray-700">Vídeos</label>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateExport}
                    disabled={!exportName.trim() || loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Criar Exportação
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Jobs de Exportação */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Jobs de Exportação</h3>
            {exportJobs.length === 0 ? (
              <div className="bg-white shadow rounded-lg">
                <div className="text-center py-8">
                  <Download className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nenhum job de exportação encontrado</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {exportJobs.map((job) => (
                  <div key={job.id} className="bg-white shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          {getFormatIcon(job.format)}
                          <h4 className="text-lg font-medium">{job.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            job.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                            job.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(job.status)}
                          {job.status === 'COMPLETED' && job.downloadUrl && (
                            <button
                              onClick={() => handleDownloadExport(job)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          {job.status === 'PENDING' && (
                            <button
                              onClick={() => handleStartExport(job.id)}
                              disabled={loading}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {job.description && (
                        <p className="text-gray-600 mb-3">{job.description}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="font-medium">Formato:</span>
                          <p className="text-gray-600">{job.format}</p>
                        </div>
                        <div>
                          <span className="font-medium">Itens:</span>
                          <p className="text-gray-600">{job.exportedItems}/{job.totalItems}</p>
                        </div>
                        <div>
                          <span className="font-medium">Arquivo:</span>
                          <p className="text-gray-600">
                            {job.fileSize ? `${(job.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Agendado:</span>
                          <p className="text-gray-600">
                            {new Date(job.scheduledAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      {job.status === 'PROCESSING' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{Math.round((job.exportedItems / job.totalItems) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(job.exportedItems / job.totalItems) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'imports' && (
        <div className="space-y-6">
          {/* Formulário de Importação */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Upload className="h-5 w-5" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">Nova Importação</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Importe dados de diferentes fontes e formatos
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nome da Importação</label>
                    <input
                      type="text"
                      value={importName}
                      onChange={(e) => setImportName(e.target.value)}
                      placeholder="Ex: Importação do YouTube"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Descrição</label>
                    <textarea
                      value={importDescription}
                      onChange={(e) => setImportDescription(e.target.value)}
                      placeholder="Descrição opcional"
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Formato</label>
                    <select
                      value={importFormat}
                      onChange={(e) => setImportFormat(e.target.value as any)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="JSON">JSON</option>
                      <option value="CSV">CSV</option>
                      <option value="XML">XML</option>
                      <option value="YOUTUBE_JSON">YouTube JSON</option>
                      <option value="OPML">OPML</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Arquivo</label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept=".json,.csv,.xml,.opml"
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      {importFile && (
                        <p className="text-sm text-gray-600 mt-1">
                          {importFile.name} ({(importFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleCreateImport}
                    disabled={!importName.trim() || !importFile || loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Criar Importação
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Jobs de Importação */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Jobs de Importação</h3>
            {importJobs.length === 0 ? (
              <div className="bg-white shadow rounded-lg">
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nenhum job de importação encontrado</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {importJobs.map((job) => (
                  <div key={job.id} className="bg-white shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          {getFormatIcon(job.format)}
                          <h4 className="text-lg font-medium">{job.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            job.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                            job.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(job.status)}
                          {job.status === 'PENDING' && (
                            <button
                              onClick={() => handleStartImport(job.id)}
                              disabled={loading}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {job.description && (
                        <p className="text-gray-600 mb-3">{job.description}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="font-medium">Formato:</span>
                          <p className="text-gray-600">{job.format}</p>
                        </div>
                        <div>
                          <span className="font-medium">Processado:</span>
                          <p className="text-gray-600">{job.processedItems}/{job.totalItems}</p>
                        </div>
                        <div>
                          <span className="font-medium">Sucesso:</span>
                          <p className="text-green-600">{job.successItems}</p>
                        </div>
                        <div>
                          <span className="font-medium">Erros:</span>
                          <p className="text-red-600">{job.errorItems}</p>
                        </div>
                      </div>

                      {job.status === 'PROCESSING' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{Math.round((job.processedItems / job.totalItems) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(job.processedItems / job.totalItems) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'mappings' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="h-5 w-5" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">Mapeamentos de Dados</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Configure mapeamentos personalizados para importações
            </p>

            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Funcionalidade em desenvolvimento</p>
              <p className="text-sm text-gray-500 mt-2">
                Mapeamentos personalizados estarão disponíveis em breve
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
