import React, { useState, useMemo, memo } from 'react';
import { Search, Plus, Star, ArrowLeft, Play } from 'lucide-react';
import { WorkflowType } from '../App';
import { getCategoryIcon, getWorkflowIcon } from '@/utils/iconHelpers';

interface WorkflowsSectionProps {
  workflows: WorkflowType[];
  workflowCategories: string[];
  selectedCategory: string | null;
  searchTerm: string;
  onSelectCategory: (category: string | null) => void;
  onSearchChange: (term: string) => void;
  onToggleFavorite: (workflowId: string) => void;
  onEdit: (workflowId: string) => void;
  onDelete: (workflowId: string) => void;
  onExecute: (workflowId: string) => void;
  onAddNew: () => void;
  favoritesCount: number;
}

// Componente do card de workflow
const WorkflowCard = memo(({
  workflow,
  onToggleFavorite,
  onEdit,
  onDelete,
  onExecute
}: any) => (
  <div className="bg-[#151921] border border-gray-800/50 rounded-lg p-5 hover:border-green-700 transition-colors">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center text-green-400">
          {getWorkflowIcon(workflow.icon, 'md')}
        </div>
        <div>
          <h3 className="text-white font-semibold text-base">{workflow.name}</h3>
          <p className="text-xs text-gray-500">{workflow.category}</p>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(workflow.id);
        }}
        className="text-gray-500 hover:text-yellow-400 transition-colors"
      >
        <Star className={`w-5 h-5 ${workflow.favorite === true ? 'fill-yellow-400 text-yellow-400' : ''}`} />
      </button>
    </div>

    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{workflow.description}</p>

    <div className="mb-4">
      <p className="text-xs text-gray-500 mb-2">Webhook:</p>
      <p className="text-xs font-mono bg-gray-800/50 p-2 rounded text-gray-300 truncate">
        {workflow.webhookUrl || 'N/A'}
      </p>
    </div>

    <div className="flex gap-2">
      <button
        onClick={() => onExecute(workflow.id)}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
      >
        <Play className="w-4 h-4" />
        Executar
      </button>
      <button
        onClick={() => onEdit(workflow.id)}
        className="px-3 py-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
      >
        Editar
      </button>
      <button
        onClick={() => onDelete(workflow.id)}
        className="px-3 py-2 rounded bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors text-sm"
      >
        Apagar
      </button>
    </div>
  </div>
));

export const WorkflowsSection = memo((props: WorkflowsSectionProps) => {
  const filteredWorkflows = useMemo(() => {
    return props.workflows.filter(workflow => {
      let categoryMatch = true;

      if (props.selectedCategory === 'Favoritos') {
        categoryMatch = workflow.favorite === true;
      } else if (props.selectedCategory && props.selectedCategory !== 'Todos') {
        categoryMatch = workflow.category === props.selectedCategory;
      }

      const searchMatch = !props.searchTerm ||
        workflow.name.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
        workflow.description.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
        workflow.tags?.some((tag: string) => tag.toLowerCase().includes(props.searchTerm.toLowerCase()));

      return categoryMatch && searchMatch;
    });
  }, [props.workflows, props.selectedCategory, props.searchTerm]);

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

        {props.workflowCategories.filter(cat => cat !== 'Todos').map(category => (
          <div
            key={category}
            onClick={() => props.onSelectCategory(category)}
            className="bg-[#151921] border border-gray-800/50 rounded-lg p-6 hover:border-green-600 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-300 mb-4">
              {getCategoryIcon(category)}
            </div>
            <h3 className="text-white font-semibold text-lg">{category}</h3>
          </div>
        ))}
      </div>
    );
  }

  // Vista de workflows filtrados
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
              placeholder="Pesquisar workflows..."
              value={props.searchTerm}
              onChange={(e) => props.onSearchChange(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-600"
            />
          </div>
        </div>
        <button
          onClick={props.onAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap ml-4"
        >
          <Plus className="w-4 h-4" />
          Novo Workflow
        </button>
      </div>

      {filteredWorkflows.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Nenhum workflow encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredWorkflows.map(workflow => (
            <WorkflowCard key={workflow.id} workflow={workflow} {...props} />
          ))}
        </div>
      )}
    </div>
  );
});

WorkflowsSection.displayName = 'WorkflowsSection';
