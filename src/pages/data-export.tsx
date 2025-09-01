'use client';

import { useState } from 'react';
import { ExportManager } from '@/components/dataExport/ExportManager';

export default function DataExportPage() {
  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Exportação e Importação de Dados</h1>
        <p className="text-gray-600">
          Gerencie a exportação e importação de suas coleções e configurações
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setSelectedTab('exports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'exports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Exportar
          </button>
          <button
            onClick={() => setSelectedTab('imports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'imports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Importar
          </button>
          <button
            onClick={() => setSelectedTab('mappings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'mappings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Mapeamentos
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Exportações Concluídas</dt>
                      <dd className="text-lg font-medium text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Importações Bem-sucedidas</dt>
                      <dd className="text-lg font-medium text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Formatos Suportados</dt>
                      <dd className="text-lg font-medium text-gray-900">5</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formatos Suportados */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Formatos Suportados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-600">JSON</span>
                    <div className="flex space-x-1">
                      <span className="text-green-600">✓</span>
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Formato estruturado ideal para backups</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-600">CSV</span>
                    <div className="flex space-x-1">
                      <span className="text-green-600">✓</span>
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Formato tabular compatível com Excel</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-purple-600">XML</span>
                    <div className="flex space-x-1">
                      <span className="text-green-600">✓</span>
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Formato markup para integrações</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-orange-600">Excel</span>
                    <div className="flex space-x-1">
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Planilhas com formatação</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-red-600">PDF</span>
                    <div className="flex space-x-1">
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Documentos para impressão</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-indigo-600">OPML</span>
                    <div className="flex space-x-1">
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Formatos de listas de feeds</p>
                </div>
              </div>
            </div>
          </div>

          {/* Próximos Passos */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Próximos Passos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 flex items-center">
                    <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar Dados
                  </h4>
                  <p className="text-gray-600">
                    Crie backups de suas coleções, feeds e tags em múltiplos formatos.
                  </p>
                  <button
                    onClick={() => setSelectedTab('exports')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Iniciar Exportação
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 flex items-center">
                    <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Importar Dados
                  </h4>
                  <p className="text-gray-600">
                    Importe dados de outras fontes e formatos.
                  </p>
                  <button
                    onClick={() => setSelectedTab('imports')}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                  >
                    Iniciar Importação
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'exports' && (
        <ExportManager userId="user-id" />
      )}

      {selectedTab === 'imports' && (
        <ExportManager userId="user-id" />
      )}

      {selectedTab === 'mappings' && (
        <ExportManager userId="user-id" />
      )}
    </div>
  );
}