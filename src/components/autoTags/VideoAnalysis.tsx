'use client';

import { useState, useEffect } from 'react';
import { VideoAnalysis as VideoAnalysisType } from '@/lib/types';

interface VideoAnalysisProps {
  videoId: string;
  onAnalysisComplete?: (analysis: VideoAnalysisType) => void;
}

export function VideoAnalysis({ videoId, onAnalysisComplete }: VideoAnalysisProps) {
  const [analysis, setAnalysis] = useState<VideoAnalysisType | null>(null);
  const [loading, setLoading] = useState(false);
  const [applyingTags, setApplyingTags] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [customTags, setCustomTags] = useState('');

  useEffect(() => {
    loadAnalysis();
    loadSuggestions();
  }, [videoId]);

  const loadAnalysis = async () => {
    try {
      const response = await fetch(`/api/auto-tags/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
        onAnalysisComplete?.(data);
      }
    } catch (error) {
      console.error('Erro ao carregar análise:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await fetch(`/api/auto-tags/suggestions?videoId=${videoId}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    await loadAnalysis();
    setLoading(false);
  };

  const handleApplyTags = async () => {
    setApplyingTags(true);
    try {
      const response = await fetch('/api/auto-tags/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      });

      if (response.ok) {
        const result = await response.json();
        await loadAnalysis();
        await loadSuggestions();
        alert(`Tags aplicadas com sucesso! ${result.tagsApplied} tags adicionadas.`);
      }
    } catch (error) {
      console.error('Erro ao aplicar tags:', error);
      alert('Erro ao aplicar tags automáticas.');
    } finally {
      setApplyingTags(false);
    }
  };

  const handleAcceptSuggestion = async (tagId: string) => {
    try {
      const response = await fetch('/api/auto-tags/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, tagId, action: 'accept' })
      });

      if (response.ok) {
        await loadSuggestions();
        await loadAnalysis();
      }
    } catch (error) {
      console.error('Erro ao aceitar sugestão:', error);
    }
  };

  const handleRejectSuggestion = async (tagId: string) => {
    try {
      const response = await fetch('/api/auto-tags/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, tagId, action: 'reject' })
      });

      if (response.ok) {
        await loadSuggestions();
      }
    } catch (error) {
      console.error('Erro ao rejeitar sugestão:', error);
    }
  };

  const handleAddCustomTag = async () => {
    if (!customTags.trim()) return;

    try {
      const tagNames = customTags.split(',').map((t: string) => t.trim()).filter((t: string) => t);

      for (const tagName of tagNames) {
        await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: tagName, isAuto: false })
        });

        await fetch('/api/videos/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId, tagName })
        });
      }

      setCustomTags('');
      await loadAnalysis();
      alert(`Tags personalizadas adicionadas: ${tagNames.join(', ')}`);
    } catch (error) {
      console.error('Erro ao adicionar tags personalizadas:', error);
      alert('Erro ao adicionar tags personalizadas.');
    }
  };

  if (!analysis) {
    return (
      <div className="space-y-4">
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Análise de Vídeo</h3>
          <p className="text-gray-600 mb-4">
            Analise o vídeo para obter sugestões de tags automáticas
          </p>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Analisando...' : 'Analisar Vídeo'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo da Análise */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Análise de Vídeo</h3>
        <p className="text-gray-600 mb-4">
          Análise automática de conteúdo e sugestões de tags
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(analysis.confidenceScore * 100)}%
            </div>
            <div className="text-sm text-gray-600">Confiança</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {analysis.suggestedTags.length}
            </div>
            <div className="text-sm text-gray-600">Tags Sugeridas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analysis.categoryAnalysis.primary}
            </div>
            <div className="text-sm text-gray-600">Categoria Principal</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Progresso da Análise</label>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${analysis.confidenceScore * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="border px-4 py-2 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Re-analisar
            </button>
            <button
              onClick={handleApplyTags}
              disabled={applyingTags}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {applyingTags ? 'Aplicando...' : 'Aplicar Tags'}
            </button>
          </div>
        </div>
      </div>

      {/* Análise Detalhada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Análise de Título */}
        <div className="border rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3">Análise de Título</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Sentimento</label>
              <span className={`inline-block px-2 py-1 rounded text-sm ${
                analysis.titleAnalysis.sentiment === 'positive'
                  ? 'bg-green-100 text-green-800'
                  : analysis.titleAnalysis.sentiment === 'negative'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {analysis.titleAnalysis.sentiment === 'positive' ? 'Positivo' :
                 analysis.titleAnalysis.sentiment === 'negative' ? 'Negativo' : 'Neutro'}
              </span>
            </div>

            <div>
              <label className="text-sm font-medium">Palavras-chave</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.titleAnalysis.keywords.map((keyword: string, index: number) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Tópicos Identificados</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.titleAnalysis.topics.map((topic: string, index: number) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Análise de Descrição */}
        <div className="border rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3">Análise de Descrição</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Sentimento</label>
              <span className={`inline-block px-2 py-1 rounded text-sm ${
                analysis.descriptionAnalysis.sentiment === 'positive'
                  ? 'bg-green-100 text-green-800'
                  : analysis.descriptionAnalysis.sentiment === 'negative'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {analysis.descriptionAnalysis.sentiment === 'positive' ? 'Positivo' :
                 analysis.descriptionAnalysis.sentiment === 'negative' ? 'Negativo' : 'Neutro'}
              </span>
            </div>

            <div>
              <label className="text-sm font-medium">Palavras-chave</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.descriptionAnalysis.keywords.map((keyword: string, index: number) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Tópicos Identificados</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.descriptionAnalysis.topics.map((topic: string, index: number) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Análise de Categoria */}
        <div className="border rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3">Análise de Categoria</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Categoria Principal</label>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                  {analysis.categoryAnalysis.primary}
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round(analysis.categoryAnalysis.confidence * 100)}% confiança
                </span>
              </div>
            </div>

            {analysis.categoryAnalysis.secondary.length > 0 && (
              <div>
                <label className="text-sm font-medium">Categorias Secundárias</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {analysis.categoryAnalysis.secondary.map((category: string, index: number) => (
                    <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tags Sugeridas */}
        <div className="border rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3">Tags Sugeridas</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Tags Automáticas</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.suggestedTags.map((tag: string, index: number) => (
                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Adicionar Tags Personalizadas</label>
              <div className="flex space-x-2 mt-1">
                <input
                  type="text"
                  placeholder="Tags separadas por vírgula"
                  value={customTags}
                  onChange={(e) => setCustomTags(e.target.value)}
                  className="flex-1 border rounded px-3 py-2"
                />
                <button
                  onClick={handleAddCustomTag}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sugestões Pendentes */}
      {suggestions.length > 0 && (
        <div className="border rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3">Sugestões Pendentes</h4>
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {suggestion.tag.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    Confiança: {Math.round(suggestion.confidence * 100)}%
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAcceptSuggestion(suggestion.tagId)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                  >
                    Aceitar
                  </button>
                  <button
                    onClick={() => handleRejectSuggestion(suggestion.tagId)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
