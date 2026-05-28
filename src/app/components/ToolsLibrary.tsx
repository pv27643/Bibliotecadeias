import React, { useState, useMemo, memo } from 'react';
import { Search, Plus, Star, ArrowLeft } from 'lucide-react';
import { Tool } from '../App';
import { getCategoryIcon, getToolIcon, getBadgeColor } from '@/utils/iconHelpers';

interface ToolsLibraryProps {
  tools: Tool[];
  toolCategories: string[];
  subcategoriesMap: Record<string, string[]>;
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  selectedBadge: string | null;
  searchTerm: string;
  onSelectCategory: (category: string | null) => void;
  onSelectSubcategory: (subcategory: string | null) => void;
  onSelectBadge: (badge: string | null) => void;
  onSearchChange: (term: string) => void;
  onToggleFavorite: (toolId: string) => void;
  onEdit: (toolId: string) => void;
  onDelete: (toolId: string) => void;
  onAddNew: () => void;
  openMenuId: string | null;
  onMenuToggle: (menuId: string | null) => void;
  favoritesCount: number;
}

// Componente filtrado e memoizado
const ToolCard = memo(({ 
  tool, 
  onToggleFavorite, 
  onEdit, 
  onDelete, 
  openMenuId, 
  onMenuToggle 
}: any) => (
  <div className="bg-[#151921] border border-gray-800/50 rounded-lg p-5 hover:border-gray-700 transition-colors relative">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-300">
        {getToolIcon(tool.icon)}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(tool.id);
          }}
          className="text-gray-500 hover:text-yellow-400 transition-colors"
        >
          <Star className={`w-5 h-5 ${tool.favorite === true ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </button>
        {tool.badges.map((badge: string, idx: number) => (
          <span key={idx} className={`px-2.5 py-1 text-xs rounded font-medium ${getBadgeColor(badge)}`}>
            {badge}
          </span>
        ))}
      </div>
    </div>
    <h3 className="text-white font-semibold mb-2 text-base">{tool.name}</h3>
    <p className="text-sm text-gray-400 leading-relaxed">{tool.description}</p>
  </div>
));

export const ToolsLibrary = memo((props: ToolsLibraryProps) => {
  const filteredTools = useMemo(() => {
    return props.tools.filter(tool => {
      let categoryMatch = true;

      if (props.selectedCategory === 'Favoritos') {
        categoryMatch = tool.favorite === true;
      } else if (props.selectedSubcategory && props.selectedCategory) {
        categoryMatch = tool.category === props.selectedCategory && tool.subcategory === props.selectedSubcategory;
      } else if (props.selectedCategory) {
        categoryMatch = tool.category === props.selectedCategory;
      }

      const badgeMatch = !props.selectedBadge || tool.badges.includes(props.selectedBadge);
      const searchMatch = !props.searchTerm ||
        tool.name.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(props.searchTerm.toLowerCase()));
      
      return categoryMatch && badgeMatch && searchMatch;
    });
  }, [props.tools, props.selectedCategory, props.selectedSubcategory, props.selectedBadge, props.searchTerm]);

  if (props.selectedCategory === null && !props.searchTerm) {
    // Vista de categorias
    return (
      <div className="grid grid-cols-4 gap-4">
        {props.toolCategories.filter(cat => cat !== 'Todas').map(category => (
          <div
            key={category}
            onClick={() => props.onSelectCategory(category)}
            className="bg-[#151921] border border-gray-800/50 rounded-lg p-6 hover:border-blue-600 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-300">
                {getCategoryIcon(category)}
              </div>
            </div>
            <h3 className="text-white font-semibold text-lg">{category}</h3>
          </div>
        ))}
      </div>
    );
  }

  // Vista de ferramentas filtradas
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 items-center flex-1">
          {props.selectedCategory || props.selectedSubcategory ? (
            <button
              onClick={() => {
                if (props.selectedSubcategory) {
                  props.onSelectSubcategory(null);
                } else {
                  props.onSelectCategory(null);
                }
              }}
              className="px-4 py-2 rounded-lg transition-colors bg-gray-800/50 text-gray-400 hover:bg-gray-800 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          ) : null}
          {props.selectedSubcategory && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar ferramentas..."
                value={props.searchTerm}
                onChange={(e) => props.onSearchChange(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
              />
            </div>
          )}
        </div>
        <button
          onClick={props.onAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap ml-4"
        >
          <Plus className="w-4 h-4" />
          Nova Ferramenta
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredTools.map(tool => (
          <ToolCard key={tool.id} tool={tool} {...props} />
        ))}
      </div>
    </div>
  );
});

ToolsLibrary.displayName = 'ToolsLibrary';
