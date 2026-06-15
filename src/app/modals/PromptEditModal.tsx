import React, { memo } from 'react';
import { X } from 'lucide-react';
import { Prompt } from '../App';
import {
  DEFAULT_PROMPT_SUBCATEGORIES,
  PROMPT_ROOT_CATEGORY
} from '../../data/categories';

interface PromptEditModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: Prompt) => void;
  onDelete: (promptId: string) => void;
}

export const PromptEditModal = memo((props: PromptEditModalProps) => {
  const [formData, setFormData] = React.useState<Prompt>(
    props.prompt || {
      id: Date.now().toString(),
      title: '',
      description: '',
      category: PROMPT_ROOT_CATEGORY,
      subcategory: DEFAULT_PROMPT_SUBCATEGORIES[0],
      models: [],
      content: '',
      favorite: false
    }
  );

  React.useEffect(() => {
    setFormData(
      props.prompt || {
        id: Date.now().toString(),
        title: '',
        description: '',
        category: PROMPT_ROOT_CATEGORY,
        subcategory: DEFAULT_PROMPT_SUBCATEGORIES[0],
        models: [],
        content: '',
        favorite: false
      }
    );
  }, [props.prompt]);

  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1a202c] border border-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">
            {props.prompt ? 'Editar Prompt' : 'Novo Prompt'}
          </h2>
          <button onClick={props.onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 resize-none h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Conteúdo</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 resize-none h-32 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Categoria Principal</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({
                ...formData,
                category: e.target.value,
                subcategory: DEFAULT_PROMPT_SUBCATEGORIES[0]
              })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600"
            >
              <option value={PROMPT_ROOT_CATEGORY}>{PROMPT_ROOT_CATEGORY}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Subcategoria</label>
            <select
              value={formData.subcategory || DEFAULT_PROMPT_SUBCATEGORIES[0]}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600"
            >
              {DEFAULT_PROMPT_SUBCATEGORIES.map(subcategory => (
                <option key={subcategory} value={subcategory}>{subcategory}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-800 bg-gray-900/50">
          {props.prompt && (
            <button
              onClick={() => {
                props.onDelete(props.prompt!.id);
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
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

PromptEditModal.displayName = 'PromptEditModal';
