import { useState } from 'react';
import { Zap, Workflow, FileText, Library, Menu, X } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import type { WorkflowConfig, WorkflowStep } from '@/types/workflow';
import BibliotecaView from './views/BibliotecaView';
import PromptsView from './views/PromptsView';
import WorkflowsView from './views/WorkflowsView';

export type { Tool, Prompt } from '@/types/models';
export type { WorkflowStep };
export type WorkflowType = WorkflowConfig;

type View = 'biblioteca' | 'prompts' | 'workflows';

export default function App() {
  const { isLoading } = useApp();
  const [currentView, setCurrentView] = useState<View>('biblioteca');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = (view: View) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#0f1420] border-r border-gray-800 p-4 flex flex-col
        transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:z-auto
      `}>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-500" />
            <span className="font-semibold text-lg">Celeuma IA</span>
          </div>
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-1 flex-1">
          <button
            onClick={() => navigate('workflows')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${currentView === 'workflows' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50'}`}
          >
            <Workflow className="w-5 h-5" />
            <span>Workflows</span>
          </button>

          <button
            onClick={() => navigate('prompts')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${currentView === 'prompts' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50'}`}
          >
            <FileText className="w-5 h-5" />
            <span>Prompts</span>
          </button>

          <button
            onClick={() => navigate('biblioteca')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${currentView === 'biblioteca' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50'}`}
          >
            <Library className="w-5 h-5" />
            <span>Biblioteca de IAs</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 overflow-auto flex flex-col">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#0f1420] border-b border-gray-800 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Zap className="w-5 h-5 text-blue-500" />
          <span className="font-semibold">Celeuma IA</span>
        </div>

        <div className="max-w-5xl mx-auto w-full p-4 md:p-8">

          {/* Loading skeleton */}
          {isLoading && (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-800/60 rounded-lg w-48 mb-3" />
              <div className="h-4 bg-gray-800/40 rounded w-80 mb-10" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-[#151921] border border-gray-800/50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-800/60 rounded-lg" />
                      <div className="w-8 h-6 bg-gray-800/60 rounded" />
                    </div>
                    <div className="h-4 bg-gray-800/60 rounded w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isLoading && currentView === 'biblioteca' && <BibliotecaView />}
          {!isLoading && currentView === 'prompts' && <PromptsView />}
          {!isLoading && currentView === 'workflows' && <WorkflowsView />}

        </div>
      </div>
    </div>
  );
}
