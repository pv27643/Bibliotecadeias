import { useState, useEffect, useMemo } from 'react';
import { Plus, Star, ArrowLeft, Search, ArrowRight, Edit, Trash2, MoreVertical, FileText, X, Check, Copy } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import {
  getPromptCategorySubcategories as resolvePromptCategorySubcategories,
  getPromptMainCategories,
  getPromptRootSubcategories,
  getPromptCategory,
  getPromptSubcategory,
} from '@/utils/prompt-category-helpers';
import type { Prompt } from '@/types/models';
import PromptModal from '../modals/PromptModal';

const PROMPT_SECTIONS = ['Objetivo', 'Quando usar', 'Como usar', 'Inputs a preencher', 'Prompt', 'Restrições obrigatórias', 'Output esperado', 'Variações'] as const;

const parsePromptContent = (content: string): Record<string, string> => {
  const sections: Record<string, string> = {};
  let currentKey = '';
  const currentLines: string[] = [];
  for (const line of content.split('\n')) {
    if ((PROMPT_SECTIONS as readonly string[]).includes(line.trim())) {
      if (currentKey) sections[currentKey] = currentLines.join('\n').trim();
      currentKey = line.trim();
      currentLines.length = 0;
    } else {
      currentLines.push(line);
    }
  }
  if (currentKey) sections[currentKey] = currentLines.join('\n').trim();
  if (!currentKey && content.trim()) sections['Prompt'] = content.trim();
  return sections;
};

export default function PromptsView() {
  const { prompts, promptCategories, subcategoriesMap, toggleFavorite, getFavoritesCount, savePrompts } = useApp();

  const [selectedPromptCategory, setSelectedPromptCategory] = useState<string | null>(null);
  const [selectedPromptSubcategory, setSelectedPromptSubcategory] = useState<string | null>(null);
  const [searchPromptTerm, setSearchPromptTerm] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [showPromptDetails, setShowPromptDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  const promptRootSubcategories = useMemo(
    () => getPromptRootSubcategories(promptCategories, subcategoriesMap),
    [promptCategories, subcategoriesMap]
  );

  const getPromptCategorySubcategories = (category: string) => (
    resolvePromptCategorySubcategories(category, promptRootSubcategories, subcategoriesMap)
  );

  const promptMainCategories = useMemo(
    () => getPromptMainCategories(promptCategories, promptRootSubcategories),
    [promptCategories, promptRootSubcategories]
  );

  useEffect(() => {
    setFieldValues({});
    setShowPromptDetails(false);
  }, [selectedPrompt]);

  useEffect(() => {
    if (selectedPromptCategory && selectedPromptCategory !== 'Favoritos' && !promptMainCategories.includes(selectedPromptCategory)) {
      setSelectedPromptCategory(null);
      setSelectedPromptSubcategory(null);
    }
  }, [promptMainCategories, selectedPromptCategory]);

  const getCategoryCount = (category: string) => {
    return prompts.filter(prompt => getPromptCategory(prompt) === category).length;
  };

  const getPromptSubcategoryCount = (category: string, subcategory: string) => {
    return prompts.filter(prompt =>
      getPromptCategory(prompt) === category && getPromptSubcategory(prompt) === subcategory
    ).length;
  };

  const copyPromptToClipboard = async (content: string) => {
    const filteredContent = content
      .split('\n')
      .filter(line => !line.trim().startsWith('Model:') && !line.trim().startsWith('Casos de Uso:'))
      .join('\n')
      .trim();

    try {
      await navigator.clipboard.writeText(filteredContent);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = filteredContent;
      textarea.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (id: string) => {
    setShowDeleteConfirm(id);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;
    await savePrompts(prompts.filter(p => p.id !== showDeleteConfirm));
    setShowDeleteConfirm(null);
  };

  const handleEdit = (prompt: Prompt) => {
    setOpenMenuId(null);
    setEditingPrompt(prompt);
    setPromptModalOpen(true);
  };

  return (
    <div onClick={() => setOpenMenuId(null)}>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Meus Prompts</h1>
        <p className="text-gray-400">Organize e reutilize os seus melhores exemplares de IA.</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 items-center flex-1">
          {selectedPromptCategory ? (
            <button
              onClick={() => {
                if (selectedPromptSubcategory) {
                  setSelectedPromptSubcategory(null);
                } else {
                  setSelectedPromptCategory(null);
                  setSearchPromptTerm('');
                }
              }}
              className="px-4 py-2 rounded-lg transition-colors bg-gray-800/50 text-gray-400 hover:bg-gray-800 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedPromptCategory('Favoritos');
                setSelectedPromptSubcategory(null);
              }}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedPromptCategory === 'Favoritos'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
            >
              <Star className="w-4 h-4" />
              Favoritos ({getFavoritesCount('prompt')})
            </button>
          )}
          {(selectedPromptSubcategory || selectedPromptCategory === 'Favoritos' || !selectedPromptCategory || (selectedPromptCategory && getPromptCategorySubcategories(selectedPromptCategory).length === 0)) && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={!selectedPromptCategory ? 'Pesquisa global em todos os prompts...' : 'Pesquisar prompts...'}
                value={searchPromptTerm}
                onChange={(e) => setSearchPromptTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditingPrompt(null);
            setPromptModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap ml-4"
        >
          <Plus className="w-4 h-4" />
          Novo Prompt
        </button>
      </div>

      {!selectedPromptCategory && searchPromptTerm ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(() => {
            const results = prompts.filter(p =>
              p.title.toLowerCase().includes(searchPromptTerm.toLowerCase()) ||
              p.description.toLowerCase().includes(searchPromptTerm.toLowerCase()) ||
              p.content.toLowerCase().includes(searchPromptTerm.toLowerCase())
            );
            if (results.length === 0) return (
              <div className="col-span-3 py-16 text-center">
                <Search className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">Nenhum prompt encontrado para "{searchPromptTerm}"</p>
                <p className="text-sm text-gray-600 mt-1">Tenta outras palavras-chave</p>
              </div>
            );
            return results.map(prompt => (
              <div key={prompt.id} onClick={() => setSelectedPrompt(prompt)}
                className="bg-[#151921] border border-gray-800/50 rounded-lg p-5 hover:border-gray-700 transition-colors cursor-pointer">
                <span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 text-xs rounded uppercase font-medium">
                  {getPromptSubcategory(prompt) || getPromptCategory(prompt)}
                </span>
                <h3 className="text-white font-semibold mt-3 mb-2 text-base">{prompt.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{prompt.description}</p>
              </div>
            ));
          })()}
        </div>
      ) : !selectedPromptCategory && !searchPromptTerm ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {promptMainCategories.map(category => (
            <div
              key={category}
              onClick={() => {
                setSelectedPromptCategory(category);
                setSelectedPromptSubcategory(null);
              }}
              className="bg-[#151921] border border-gray-800/50 rounded-lg p-4 hover:border-blue-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-300">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-lg font-semibold text-gray-500">
                  {getCategoryCount(category)}
                </span>
              </div>
              <h3 className="text-white font-medium text-sm">{category}</h3>
            </div>
          ))}
        </div>
      ) : selectedPromptCategory && !selectedPromptSubcategory && selectedPromptCategory !== 'Favoritos' && getPromptCategorySubcategories(selectedPromptCategory).length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {getPromptCategorySubcategories(selectedPromptCategory).map(subcategory => (
            <div
              key={subcategory}
              onClick={() => setSelectedPromptSubcategory(subcategory)}
              className="bg-[#151921] border border-gray-800/50 rounded-lg p-4 hover:border-blue-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-300">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-lg font-semibold text-gray-500">
                  {getPromptSubcategoryCount(selectedPromptCategory, subcategory)}
                </span>
              </div>
              <h3 className="text-white font-medium text-sm">{subcategory}</h3>
            </div>
          ))}
          {getPromptCategorySubcategories(selectedPromptCategory).length === 0 && (
            <div className="col-span-4 text-center py-12">
              <p className="text-gray-400">Nenhuma subcategoria encontrada</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prompts.filter(prompt => {
            let categoryMatch = true;

            if (selectedPromptCategory === 'Favoritos') {
              categoryMatch = prompt.favorite === true;
            } else if (selectedPromptCategory && selectedPromptSubcategory) {
              categoryMatch = getPromptCategory(prompt) === selectedPromptCategory && getPromptSubcategory(prompt) === selectedPromptSubcategory;
            } else if (selectedPromptCategory) {
              categoryMatch = getPromptCategory(prompt) === selectedPromptCategory;
            }

            const searchMatch = !searchPromptTerm ||
              prompt.title.toLowerCase().includes(searchPromptTerm.toLowerCase()) ||
              prompt.description.toLowerCase().includes(searchPromptTerm.toLowerCase()) ||
              prompt.content.toLowerCase().includes(searchPromptTerm.toLowerCase());
            return categoryMatch && searchMatch;
          }).map(prompt => (
            <div
              key={prompt.id}
              onClick={() => setSelectedPrompt(prompt)}
              className="bg-[#151921] border border-gray-800/50 rounded-lg overflow-hidden hover:border-gray-700 transition-colors cursor-pointer relative"
            >
              {prompt.image && (
                <div className="w-full h-48 overflow-hidden bg-gray-800">
                  <img src={prompt.image} alt={prompt.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 text-xs rounded uppercase font-medium">
                    {getPromptSubcategory(prompt) || getPromptCategory(prompt)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite('prompt', prompt.id);
                      }}
                      className="text-gray-500 hover:text-yellow-400 transition-colors"
                    >
                      <Star className={`w-5 h-5 ${prompt.favorite === true ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === `prompt-${prompt.id}` ? null : `prompt-${prompt.id}`);
                        }}
                        className="text-gray-500 hover:text-gray-300 transition-colors p-1"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === `prompt-${prompt.id}` && (
                        <div className="absolute right-0 top-8 bg-[#1a1f2e] border border-gray-800 rounded-lg shadow-xl z-10 py-1 min-w-[140px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(prompt);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(prompt.id);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-3 text-base">{prompt.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">{prompt.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    {prompt.models.map((model, idx) => (
                      <span key={idx} className="text-xs text-gray-500">{model}</span>
                    ))}
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center gap-1">
                    Usar
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-white mb-3">Eliminar item?</h2>
            <p className="text-sm text-gray-400 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Visualizar Prompt */}
      {selectedPrompt && (() => {
        const sections = parsePromptContent(selectedPrompt.content);
        const promptText = sections['Prompt'] || selectedPrompt.content.trim();

        const promptFields = [...new Set([...promptText.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]))];

        const resolvedPrompt = promptText.replace(/\[([^\]]+)\]/g, (_, field) =>
          fieldValues[field] || `[${field}]`
        );

        const unfilledCount = promptFields.filter(f => !fieldValues[f]?.trim()).length;
        const allFilled = unfilledCount === 0;

        const renderPreview = (text: string) =>
          text.split(/(\[[^\]]+\])/).map((part, i) => {
            const match = part.match(/^\[([^\]]+)\]$/);
            if (!match) return <span key={i}>{part}</span>;
            const fieldName = match[1];
            const filled = fieldValues[fieldName]?.trim();
            return filled
              ? <span key={i} className="text-white">{filled}</span>
              : <span key={i} className="text-amber-400 bg-amber-500/10 rounded px-0.5">{part}</span>;
          });

        const detailSections = (['Inputs a preencher', 'Restrições obrigatórias', 'Output esperado', 'Variações'] as const)
          .filter(k => sections[k]?.trim());

        const handleClose = () => { setSelectedPrompt(null); setCopied(false); };

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

              {/* Header */}
              <div className="px-6 pt-6 pb-5 border-b border-gray-800/60">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-[11px] rounded-md uppercase font-semibold tracking-wide">
                        {getPromptSubcategory(selectedPrompt) || getPromptCategory(selectedPrompt)}
                      </span>
                      {selectedPrompt.models.filter(Boolean).map((model, idx) => (
                        <span key={idx} className="text-[11px] text-gray-500 font-mono">{model}</span>
                      ))}
                    </div>
                    <h2 className="text-lg font-semibold text-white leading-snug">{selectedPrompt.title}</h2>
                    {selectedPrompt.description && (
                      <p className="text-sm text-gray-400 mt-1 leading-relaxed">{selectedPrompt.description}</p>
                    )}
                  </div>
                  <button onClick={handleClose} className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0 mt-0.5">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                {/* Quando usar */}
                {sections['Quando usar'] && (
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-1.5">Quando usar</p>
                    <p className="text-sm text-gray-400 leading-relaxed">{sections['Quando usar']}</p>
                  </div>
                )}

                {/* Como usar */}
                {sections['Como usar'] && (
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-1.5">Como usar</p>
                    <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{sections['Como usar']}</p>
                  </div>
                )}

                {/* Campos a preencher */}
                {promptFields.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">Campos a preencher</p>
                      {Object.values(fieldValues).some(v => v.trim()) && (
                        <button
                          onClick={() => setFieldValues({})}
                          className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {promptFields.map(field => (
                        <div key={field} className="flex items-center gap-3">
                          <label className="text-xs text-amber-400 font-mono w-36 flex-shrink-0 truncate" title={field}>
                            [{field}]
                          </label>
                          <input
                            type="text"
                            value={fieldValues[field] ?? ''}
                            onChange={e => setFieldValues(prev => ({ ...prev, [field]: e.target.value }))}
                            placeholder={`Preenche ${field}…`}
                            className="flex-1 bg-[#0c1018] border border-gray-700/60 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prompt preview */}
                <div className="bg-[#0c1018] border border-gray-700/60 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700/40">
                    <span className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">
                      {promptFields.length > 0 ? 'Preview' : 'Prompt'}
                    </span>
                    <span className="text-[11px] text-gray-600">{resolvedPrompt.length} chars</span>
                  </div>
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono leading-relaxed p-5">
                    {renderPreview(resolvedPrompt)}
                  </pre>
                </div>

                {/* Collapsible details */}
                {detailSections.length > 0 && (
                  <div className="border border-gray-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowPromptDetails(v => !v)}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-800/30 transition-colors"
                    >
                      <span className="text-sm text-gray-400 font-medium">
                        {showPromptDetails ? 'Ocultar detalhes' : 'Ver mais detalhes'}
                      </span>
                      <span className={`text-gray-500 transition-transform duration-200 ${showPromptDetails ? 'rotate-180' : ''}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </span>
                    </button>
                    {showPromptDetails && (
                      <div className="divide-y divide-gray-800/60 border-t border-gray-800">
                        {detailSections.map(k => (
                          <div key={k} className="px-5 py-4">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">{k}</p>
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{sections[k]}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-800/60 flex items-center justify-between gap-4">
                {!allFilled && promptFields.length > 0 ? (
                  <span className="text-[11px] text-gray-500">
                    {unfilledCount} {unfilledCount === 1 ? 'campo por preencher' : 'campos por preencher'}
                  </span>
                ) : (
                  <span />
                )}
                <button
                  onClick={() => copyPromptToClipboard(resolvedPrompt)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors text-sm font-semibold shadow-lg shadow-blue-600/20"
                >
                  {copied
                    ? <><Check className="w-4 h-4" />Copiado!</>
                    : <><Copy className="w-4 h-4" />Copiar Prompt</>}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      <PromptModal
        isOpen={promptModalOpen}
        editingPrompt={editingPrompt}
        onClose={() => {
          setPromptModalOpen(false);
          setEditingPrompt(null);
        }}
      />
    </div>
  );
}
