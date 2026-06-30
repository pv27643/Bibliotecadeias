import { useState, lazy, Suspense } from 'react';
import { Sparkles, MessageSquare, History, Play } from 'lucide-react';
import { WORKFLOWS } from '@/config/workflows.config';
import type { WorkflowConfig } from '@/types/workflow';
import type { BrandStyleProfile } from '@/types/brand';
import WorkflowRunner from '../components/WorkflowRunner';
import BrandSelector from '../components/BrandSelector';
import HistoryList from '../components/HistoryList';

const DesignAgentChat = lazy(() => import('../components/DesignAgentChat'));

export default function WorkflowsView() {
  const [activeBrand, setActiveBrand] = useState<BrandStyleProfile | null>(null);
  const [activeWorkflowConfig, setActiveWorkflowConfig] = useState<WorkflowConfig | null>(null);
  const [workflowsSubTab, setWorkflowsSubTab] = useState<'biblioteca' | 'assistente'>('biblioteca');

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold mb-1">Workflows</h1>
        <p className="text-gray-400">Geradores de conteúdo com IA e ferramentas de marca.</p>
      </div>

      {/* Sub-nav — 2 tabs */}
      <div className="flex gap-1 mb-6 bg-[#0f1420] rounded-lg p-1 w-fit">
        {([
          { key: 'biblioteca', label: 'Biblioteca', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { key: 'assistente', label: 'Assistente de IA Design', icon: <MessageSquare className="w-3.5 h-3.5" /> },
        ] as { key: typeof workflowsSubTab; label: string; icon: React.ReactNode }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => { setWorkflowsSubTab(tab.key); setActiveWorkflowConfig(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${workflowsSubTab === tab.key ? 'bg-[#1a1f2e] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ── Biblioteca ── */}
      {workflowsSubTab === 'biblioteca' && (
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Main column */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Brand selector */}
            <BrandSelector
              value={activeBrand}
              onChange={setActiveBrand}
              onCreateNew={() => {
                setActiveWorkflowConfig(WORKFLOWS.find(w => w.id === 'extract-brand-style') ?? null);
              }}
            />

            {/* AI Generators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {WORKFLOWS.map(wf => (
                <div
                  key={wf.id}
                  onClick={() => setActiveWorkflowConfig(wf)}
                  className="bg-[#151921] border border-gray-800/50 rounded-lg p-5 hover:border-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${wf.color} flex items-center justify-center flex-shrink-0`}>
                      <Play className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-white font-semibold mb-1 text-base">{wf.name}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{wf.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* History sidebar */}
          <div className="w-full lg:w-72 lg:flex-shrink-0">
            <div className="sticky top-6 bg-[#151921] border border-gray-800/50 rounded-xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-800/50 flex items-center gap-2">
                <History className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-300">Histórico</span>
                {activeBrand && (
                  <span className="text-xs text-gray-500 truncate ml-auto">{activeBrand.brand_name}</span>
                )}
              </div>
              <div className="p-3">
                {activeBrand ? (
                  <HistoryList brandId={activeBrand.id} />
                ) : (
                  <div className="py-8 text-center">
                    <History className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 leading-relaxed">Seleciona uma marca para ver o histórico de gerações.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── Assistente de IA Design ── */}
      {workflowsSubTab === 'assistente' && (
        <div className="bg-[#151921] border border-gray-800/50 rounded-xl">
          <Suspense fallback={<div className="p-6 text-center text-gray-500 text-sm">A carregar...</div>}>
            <DesignAgentChat activeBrand={activeBrand} />
          </Suspense>
        </div>
      )}

      {/* Modal: WorkflowRunner */}
      {activeWorkflowConfig && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setActiveWorkflowConfig(null); }}
        >
          <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <WorkflowRunner
                key={activeWorkflowConfig.id}
                workflow={activeWorkflowConfig}
                activeBrand={activeBrand}
                onBack={() => setActiveWorkflowConfig(null)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
