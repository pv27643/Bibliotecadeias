import { useState, useEffect } from 'react';
import { Plus, Star, ArrowLeft, Search, ArrowRight, Edit, Trash2, MoreVertical, Library } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { getCategoryIcon, getToolIcon } from '@/utils/icon-helpers';
import type { Tool } from '@/types/models';
import ToolModal from '../modals/ToolModal';

const getBadgeColor = (badge: string) => {
  switch (badge.toLowerCase()) {
    case 'free':
      return 'bg-green-600/20 text-green-400';
    case 'freemium':
      return 'bg-orange-600/20 text-orange-400';
    case 'pago':
      return 'bg-red-600/20 text-red-400';
    default:
      return 'bg-gray-600/20 text-gray-400';
  }
};

export default function BibliotecaView() {
  const { tools, toolCategories, subcategoriesMap, toggleFavorite, getFavoritesCount, saveTools } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [toolModalOpen, setToolModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'Favoritos' && !toolCategories.includes(selectedCategory)) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    }
  }, [toolCategories, selectedCategory]);

  const getCategoryCount = (category: string) => {
    return tools.filter(tool => tool.category === category).length;
  };

  const getSubcategoryCount = (category: string, subcategory: string) => {
    return tools.filter(tool => tool.category === category && tool.subcategory === subcategory).length;
  };

  const handleDelete = (id: string) => {
    setShowDeleteConfirm(id);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;
    await saveTools(tools.filter(t => t.id !== showDeleteConfirm));
    setShowDeleteConfirm(null);
  };

  const handleEdit = (tool: Tool) => {
    setOpenMenuId(null);
    setEditingTool(tool);
    setToolModalOpen(true);
  };

  return (
    <div onClick={() => setOpenMenuId(null)}>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">
          {selectedSubcategory
            ? `${selectedCategory} → ${selectedSubcategory}`
            : selectedCategory && selectedCategory !== 'Favoritos'
              ? selectedCategory
              : 'Biblioteca de IAs'
          }
        </h1>
        <p className="text-gray-400">
          {selectedSubcategory
            ? `Ferramentas de ${selectedSubcategory}`
            : selectedCategory && selectedCategory !== 'Favoritos'
              ? `Escolha uma subcategoria`
              : 'Descubra e gere as suas ferramentas e recursos de IA consolidados.'
          }
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 items-center flex-1">
          {selectedCategory || selectedSubcategory ? (
            <button
              onClick={() => {
                if (selectedSubcategory) {
                  setSelectedSubcategory(null);
                  setSelectedBadge(null);
                  setSearchTerm('');
                } else {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                  setSelectedBadge(null);
                  setSearchTerm('');
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
                setSelectedCategory('Favoritos');
                setSelectedSubcategory(null);
                setSelectedBadge(null);
              }}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedCategory === 'Favoritos'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
            >
              <Star className="w-4 h-4" />
              Favoritos ({getFavoritesCount('tool')})
            </button>
          )}
          {(selectedSubcategory || (!selectedCategory && !selectedSubcategory)) && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={selectedSubcategory ? 'Pesquisar ferramentas...' : 'Pesquisa global em todas as ferramentas...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditingTool(null);
            setToolModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap ml-4"
        >
          <Plus className="w-4 h-4" />
          Nova Ferramenta
        </button>
      </div>

      {!selectedCategory && searchTerm ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(() => {
            const results = tools.filter(t =>
              t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            if (results.length === 0) return (
              <div className="col-span-3 py-16 text-center">
                <Search className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">Nenhuma ferramenta encontrada para "{searchTerm}"</p>
                <p className="text-sm text-gray-600 mt-1">Tenta outras palavras-chave</p>
              </div>
            );
            return results.map(tool => (
              <div key={tool.id} className="bg-[#151921] border border-gray-800/50 rounded-lg p-5 hover:border-gray-700 transition-colors relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-300">
                    {getToolIcon(tool.icon)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); toggleFavorite('tool', tool.id); }} className="text-gray-500 hover:text-yellow-400 transition-colors">
                      <Star className={`w-5 h-5 ${tool.favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </button>
                    {tool.badges.map((badge, idx) => (
                      <span key={idx} className={`px-2.5 py-1 text-xs rounded font-medium ${getBadgeColor(badge)}`}>{badge}</span>
                    ))}
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-1 text-base">{tool.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{tool.category} › {tool.subcategory}</p>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">{tool.description}</p>
                {tool.link && (
                  <a href={tool.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    Visitar <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ));
          })()}
        </div>
      ) : !selectedCategory && !searchTerm ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {toolCategories.filter(cat => cat !== 'Todas').map(category => (
            <div
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setSelectedSubcategory(null);
              }}
              className="bg-[#151921] border border-gray-800/50 rounded-lg p-6 hover:border-blue-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-300">
                  {getCategoryIcon(category)}
                </div>
                <span className="text-2xl font-semibold text-gray-500">
                  {getCategoryCount(category)}
                </span>
              </div>
              <h3 className="text-white font-semibold text-lg">{category}</h3>
            </div>
          ))}
        </div>
      ) : selectedCategory && !selectedSubcategory && selectedCategory !== 'Favoritos' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {(subcategoriesMap[selectedCategory] || []).map(subcategory => (
            <div
              key={subcategory}
              onClick={() => setSelectedSubcategory(subcategory)}
              className="bg-[#151921] border border-gray-800/50 rounded-lg p-6 hover:border-blue-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-300">
                  <Library className="w-6 h-6" />
                </div>
                <span className="text-2xl font-semibold text-gray-500">
                  {getSubcategoryCount(selectedCategory, subcategory)}
                </span>
              </div>
              <h3 className="text-white font-semibold text-lg">{subcategory}</h3>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedBadge(null)}
              className={`px-4 py-2 rounded-lg transition-colors ${!selectedBadge
                ? 'bg-green-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
            >
              Todos os Preços
            </button>
            <button
              onClick={() => setSelectedBadge('Free')}
              className={`px-4 py-2 rounded-lg transition-colors ${selectedBadge === 'Free'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
            >
              Free
            </button>
            <button
              onClick={() => setSelectedBadge('Freemium')}
              className={`px-4 py-2 rounded-lg transition-colors ${selectedBadge === 'Freemium'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
            >
              Freemium
            </button>
            <button
              onClick={() => setSelectedBadge('Pago')}
              className={`px-4 py-2 rounded-lg transition-colors ${selectedBadge === 'Pago'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
            >
              Pago
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              const filtered = tools.filter(tool => {
                let categoryMatch = true;

                if (selectedCategory === 'Favoritos') {
                  categoryMatch = tool.favorite === true;
                } else if (selectedSubcategory && selectedCategory) {
                  categoryMatch = tool.category === selectedCategory && tool.subcategory === selectedSubcategory;
                } else if (selectedCategory) {
                  categoryMatch = tool.category === selectedCategory;
                }

                const badgeMatch = !selectedBadge || tool.badges.includes(selectedBadge);
                const searchMatch = !searchTerm ||
                  tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
                return categoryMatch && badgeMatch && searchMatch;
              });

              if (filtered.length === 0) return (
                <div className="col-span-3 py-16 text-center">
                  <Search className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">Nenhuma ferramenta encontrada</p>
                  <p className="text-sm text-gray-600 mt-1">{searchTerm ? `Sem resultados para "${searchTerm}"` : 'Não há ferramentas nesta subcategoria ainda'}</p>
                </div>
              );
              return filtered.map(tool => (
                <div key={tool.id} className="bg-[#151921] border border-gray-800/50 rounded-lg p-5 hover:border-gray-700 transition-colors relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-300">
                      {getToolIcon(tool.icon)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite('tool', tool.id);
                        }}
                        className="text-gray-500 hover:text-yellow-400 transition-colors"
                      >
                        <Star className={`w-5 h-5 ${tool.favorite === true ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </button>
                      {tool.badges.map((badge, idx) => (
                        <span key={idx} className={`px-2.5 py-1 text-xs rounded font-medium ${getBadgeColor(badge)}`}>
                          {badge}
                        </span>
                      ))}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === `tool-${tool.id}` ? null : `tool-${tool.id}`);
                          }}
                          className="text-gray-500 hover:text-gray-300 transition-colors p-1"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === `tool-${tool.id}` && (
                          <div className="absolute right-0 top-8 bg-[#1a1f2e] border border-gray-800 rounded-lg shadow-xl z-10 py-1 min-w-[140px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(tool);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(tool.id);
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
                  <h3 className="text-white font-semibold mb-2 text-base">{tool.name}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">{tool.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {tool.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {tool.link && (
                      <a
                        href={tool.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ));
            })()}
          </div>
        </>
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

      <ToolModal
        isOpen={toolModalOpen}
        editingTool={editingTool}
        onClose={() => {
          setToolModalOpen(false);
          setEditingTool(null);
        }}
      />
    </div>
  );
}
