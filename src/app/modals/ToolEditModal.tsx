import React, { useState, memo } from 'react';
import { X } from 'lucide-react';
import { Tool } from '../App';

interface ToolEditModalProps {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (tool: Tool) => void;
  onDelete: (toolId: string) => void;
}

export const ToolEditModal = memo((props: ToolEditModalProps) => {
  const [formData, setFormData] = useState<Tool>(
    props.tool || {
      id: Date.now().toString(),
      name: '',
      description: '',
      category: 'Outros',
      subcategory: 'Geral',
      badges: ['Freemium'],
      tags: [],
      icon: 'sparkles',
      link: '',
      favorite: false
    }
  );

  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1a202c] border border-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">
            {props.tool ? 'Editar Ferramenta' : 'Nova Ferramenta'}
          </h2>
          <button
            onClick={props.onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
              placeholder="Ex: Midjourney"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 resize-none h-24"
              placeholder="Descrever a ferramenta..."
            />
          </div>

          {/* Grid 2 colunas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600"
              >
                <option>Imagem</option>
                <option>Vídeo</option>
                <option>Audio</option>
                <option>Texto</option>
                <option>Código</option>
                <option>3D</option>
                <option>Negócios</option>
                <option>Outros</option>
              </select>
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Link</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Badges */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Preço</label>
            <div className="flex gap-3">
              {['Free', 'Freemium', 'Pago'].map(badge => (
                <button
                  key={badge}
                  onClick={() => setFormData({ ...formData, badges: [badge] })}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    formData.badges.includes(badge)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {badge}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-800 bg-gray-900/50">
          {props.tool && (
            <button
              onClick={() => {
                props.onDelete(props.tool!.id);
                props.onClose();
              }}
              className="px-4 py-2 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors font-medium"
            >
              Apagar
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={props.onClose}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                props.onSave(formData);
                props.onClose();
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ToolEditModal.displayName = 'ToolEditModal';
