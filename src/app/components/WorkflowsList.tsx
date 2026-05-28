import { useState } from 'react';
import { WORKFLOWS, WorkflowConfig, getCategories } from '@/config/workflows.config';
import WorkflowExecutor from './WorkflowExecutor';

/**
 * Componente que lista todos os workflows disponíveis
 * Parecido com a interface do Celeuma IA que viste
 */

export default function WorkflowsList() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowConfig | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = getCategories();

  const displayedWorkflows = selectedCategory
    ? WORKFLOWS.filter(w => w.category === selectedCategory)
    : WORKFLOWS;

  if (selectedWorkflow) {
    return (
      <WorkflowExecutor
        workflow={selectedWorkflow}
        onBack={() => setSelectedWorkflow(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">⚡ Workflows</h1>
          <p className="text-gray-400">
            Automatiza tarefas combinando múltiplas ferramentas de IA em cadeia.
          </p>
        </div>

        {/* Filtros de Categoria */}
        <div className="mb-8 flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Todos
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid de Workflows */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedWorkflows.map(workflow => (
            <button
              key={workflow.id}
              onClick={() => setSelectedWorkflow(workflow)}
              className="group text-left"
            >
              <div
                className={`relative overflow-hidden rounded-lg p-6 bg-gradient-to-br ${workflow.color} 
                transition transform hover:scale-105 hover:shadow-xl cursor-pointer
                h-full min-h-48 flex flex-col`}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-black opacity-20 group-hover:opacity-10 transition"></div>

                {/* Conteúdo */}
                <div className="relative z-10">
                  <div className="text-4xl mb-3">{workflow.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{workflow.name}</h3>
                  <p className="text-white text-sm mb-4 opacity-90 flex-grow">
                    {workflow.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                      {workflow.category}
                    </span>
                    <span className="text-sm opacity-75 group-hover:opacity-100 transition">
                      → Executar
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {displayedWorkflows.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              Nenhum workflow encontrado nesta categoria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
