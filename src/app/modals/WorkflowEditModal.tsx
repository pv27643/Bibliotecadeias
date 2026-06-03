import React, { memo } from 'react';
import { X } from 'lucide-react';
import { WorkflowType } from '../App';

interface WorkflowEditModalProps {
  workflow: WorkflowType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (workflow: WorkflowType) => void;
  onDelete: (workflowId: string) => void;
}

export const WorkflowEditModal = memo((props: WorkflowEditModalProps) => {
  const [formData, setFormData] = React.useState<WorkflowType>(
    props.workflow || {
      id: Date.now().toString(),
      name: '',
      description: '',
      category: 'Marketing',
      tags: [],
      webhookUrl: '',
      icon: 'sparkles',
      favorite: false
    }
  );

  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1a202c] border border-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">
            {props.workflow ? 'Editar Workflow' : 'Novo Workflow'}
          </h2>
          <button onClick={props.onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-600 resize-none h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-600"
              >
                <option>Marketing</option>
                <option>Operações</option>
                <option>Vendas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Webhook URL</label>
              <input
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-green-600"
                placeholder="https://ivannnnnn.app.n8n.cloud/webhook/nome-do-webhook"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags (separadas por vírgula)</label>
            <input
              type="text"
              value={formData.tags?.join(', ') || ''}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-600"
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-800 bg-gray-900/50">
          {props.workflow && (
            <button
              onClick={() => {
                props.onDelete(props.workflow!.id);
                props.onClose();
              }}
              className="px-4 py-2 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50"
            >
              Apagar
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={props.onClose}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                props.onSave(formData);
                props.onClose();
              }}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

WorkflowEditModal.displayName = 'WorkflowEditModal';
