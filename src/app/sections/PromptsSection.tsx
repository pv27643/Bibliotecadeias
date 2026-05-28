import React, { useState, useMemo, memo } from 'react';
import { Search, Plus, Star, ArrowLeft } from 'lucide-react';
import { Prompt } from '../App';
import { getCategoryIcon, getBadgeColor } from '@/utils/iconHelpers';

interface PromptsSectionProps {
  prompts: Prompt[];
  promptCategories: string[];
  selectedCategory: string | null;
  searchTerm: string;
  onSelectCategory: (category: string | null) => void;
  onSearchChange: (term: string) => void;
  onToggleFavorite: (promptId: string) => void;
  onEdit: (promptId: string) => void;
  onDelete: (promptId: string) => void;
  onAddNew: () => void;
  favoritesCount: number;
}

// Componente do card de prompt
const PromptCard = memo(({ 
  prompt, 
  onToggleFavorite, 
  onEdit, 
  onDelete 
}: any) => (
  <div className="bg-[#151921] border border-gray-800/50 rounded-lg p-5 hover:border-gray-700 transition-colors">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-white font-semibold mb-1 text-base">{prompt.title}</h3>
        <p className="text-xs text-gray-500 mb-3">{prompt.category}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(prompt.id);
        }}
        className="text-gray-500 hover:text-yellow-400 transition-colors flex-shrink-0"
      >
        <Star className={`w-5 h-5 ${prompt.favorite === true ? 'fill-yellow-400 text-yellow-400' : ''}`} />
      </button>
    </div>
    <p className="text-sm text-gray-400 line-clamp-3 mb-4">{prompt.description}</p>
    <div className="flex items-center justify-between">
      <div className="flex flex-wrap gap-1">
        {prompt.models?.map((model: string, idx: number) => (
          <span key={idx} className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded">
            {model}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(prompt.id)}
          className="text-xs px-3 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(prompt.id)}
          className="text-xs px-3 py-1 rounded bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors"
        >
          Apagar
        </button>
      </div>
    </div>
  </div>
));

export const PromptsSection = memo((props: PromptsSectionProps) => {
  const filteredPrompts = useMemo(() => {
    return props.prompts.filter(prompt => {
      let categoryMatch = true;

      if (props.selectedCategory === 'Favoritos') {
        categoryMatch = prompt.favorite === true;
      } else if (props.selectedCategory && props.selectedCategory !== 'Todos') {
        categoryMatch = prompt.category === props.selectedCategory;
      }

      const searchMatch = !props.searchTerm ||
        prompt.title.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
        prompt.description.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
        prompt.models?.some((model: string) => model.toLowerCase().includes(props.searchTerm.toLowerCase()));

      return categoryMatch && searchMatch;
    });
  }, [props.prompts, props.selectedCategory, props.searchTerm]);

  if (props.selectedCategory === null && !props.searchTerm) {
    // Vista de categorias
    return (
      <div className="grid grid-cols-4 gap-4">
        <div
          onClick={() => props.onSelectCategory('Favoritos')}
          className="bg-[#151921] border border-gray-800/50 rounded-lg p-6 hover:border-yellow-600 transition-colors cursor-pointer"
        >
          <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center text-yellow-400 mb-4">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <h3 className="text-white font-semibold text-lg">Favoritos</h3>
          <p className="text-xs text-gray-500 mt-2">{props.favoritesCount} itens</p>
        </div>

        {props.promptCategories.filter(cat => cat !== 'Todos').map(category => (
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

  // Vista de prompts filtrados
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 items-center flex-1">
          {props.selectedCategory ? (
            <button
              onClick={() => props.onSelectCategory(null)}
              className="px-4 py-2 rounded-lg transition-colors bg-gray-800/50 text-gray-400 hover:bg-gray-800 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          ) : null}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar prompts..."
              value={props.searchTerm}
              onChange={(e) => props.onSearchChange(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
        <button
          onClick={props.onAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap ml-4"
        >
          <Plus className="w-4 h-4" />
          Novo Prompt
        </button>
      </div>

      {filteredPrompts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Nenhum prompt encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredPrompts.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} {...props} />
          ))}
        </div>
      )}
    </div>
  );
});

PromptsSection.displayName = 'PromptsSection';
