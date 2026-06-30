import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { getToolIcon } from '@/utils/icon-helpers';
import { PROTECTED_TOOL_CATEGORIES } from '@/data/categories';
import type { Tool } from '@/types/models';
import CategoryModal from './CategoryModal';

interface ToolModalProps {
  isOpen: boolean;
  editingTool: Tool | null;
  onClose: () => void;
}

const availableIcons = [
  { name: 'sparkles', label: 'Sparkles', value: 'sparkles' },
  { name: 'layout', label: 'Layout', value: 'layout' },
  { name: 'image', label: 'Imagem', value: 'image' },
  { name: 'pen-tool', label: 'Caneta', value: 'pen-tool' },
  { name: 'video', label: 'Vídeo', value: 'video' },
  { name: 'box', label: 'Box', value: 'box' },
  { name: 'message-square', label: 'Chat', value: 'message-square' },
];

export default function ToolModal({ isOpen, editingTool, onClose }: ToolModalProps) {
  const {
    tools, setTools,
    toolCategories, setToolCategories,
    subcategoriesMap, setSubcategoriesMap,
    saveTools, saveCategories, saveSubcategories,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'item' | 'categoria'>('item');
  const [newToolName, setNewToolName] = useState('');
  const [newToolDescription, setNewToolDescription] = useState('');
  const [newToolLink, setNewToolLink] = useState('');
  const [newToolCategory, setNewToolCategory] = useState('General AI');
  const [newToolSubcategory, setNewToolSubcategory] = useState<string | undefined>('');
  const [newToolIcon, setNewToolIcon] = useState('sparkles');
  const [newToolBadges, setNewToolBadges] = useState<string[]>(['Free']);
  const [newToolTags, setNewToolTags] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [toolFormError, setToolFormError] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [categoryTab, setCategoryTab] = useState<'categoria' | 'subcategoria'>('categoria');
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingTool) {
      setNewToolName(editingTool.name);
      setNewToolDescription(editingTool.description);
      setNewToolLink(editingTool.link || '');
      setNewToolCategory(editingTool.category);
      setNewToolSubcategory(editingTool.subcategory);
      setNewToolIcon(editingTool.icon);
      setNewToolBadges(editingTool.badges);
      setNewToolTags(editingTool.tags.join(', '));
      setShowIconPicker(false);
    } else {
      setNewToolName('');
      setNewToolDescription('');
      setNewToolLink('');
      setNewToolCategory('General AI');
      setNewToolSubcategory('');
      setNewToolIcon('sparkles');
      setNewToolBadges(['Free']);
      setNewToolTags('');
      setShowIconPicker(false);
    }
    setActiveTab('item');
    setToolFormError('');
  }, [isOpen, editingTool]);

  useEffect(() => {
    if (!selectedCategoryForSub) {
      const defaultCategory = toolCategories.find(cat => cat !== 'Todas' && cat !== 'Todos') || toolCategories[0];
      setSelectedCategoryForSub(defaultCategory);
    }
  }, [toolCategories, selectedCategoryForSub]);

  const handleAddTool = async () => {
    setToolFormError('');
    if (!newToolName.trim() || !newToolDescription.trim()) {
      setToolFormError('Preenche o nome e a descrição.');
      return;
    }

    const tagsArray = newToolTags.trim()
      ? newToolTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [newToolCategory];

    const existingTool = tools.find(tool => tool.id === editingTool?.id);
    const toolToSave: Tool = {
      id: editingTool?.id || Date.now().toString(),
      name: newToolName,
      description: newToolDescription,
      category: newToolCategory,
      subcategory: newToolSubcategory,
      badges: newToolBadges,
      tags: tagsArray,
      icon: newToolIcon,
      link: newToolLink || undefined,
      favorite: existingTool ? existingTool.favorite : false,
    };

    const updatedTools = editingTool
      ? tools.map(tool => tool.id === editingTool.id ? { ...tool, ...toolToSave } : tool)
      : [...tools, toolToSave];

    setTools(updatedTools);
    await saveTools(updatedTools);
    onClose();
  };

  const handleAddCategory = async () => {
    const categoryName = newCategoryName.trim();
    if (!categoryName) return;

    if (!toolCategories.includes(categoryName)) {
      const updated = [...toolCategories, categoryName];
      setToolCategories(updated);
      await saveCategories('tool', updated);
      if (!subcategoriesMap[categoryName]) {
        const updatedSubcategories = { ...subcategoriesMap, [categoryName]: [] };
        setSubcategoriesMap(updatedSubcategories);
        await saveSubcategories(updatedSubcategories);
      }
    }
    setNewCategoryName('');
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (PROTECTED_TOOL_CATEGORIES.includes(categoryName)) return;
    const updated = toolCategories.filter(cat => cat !== categoryName);
    setToolCategories(updated);
    await saveCategories('tool', updated);
    const updatedSubcategories = { ...subcategoriesMap };
    delete updatedSubcategories[categoryName];
    setSubcategoriesMap(updatedSubcategories);
    await saveSubcategories(updatedSubcategories);
  };

  const handleAddSubcategory = async () => {
    const subcategoryName = newSubcategoryName.trim();
    if (!subcategoryName || !selectedCategoryForSub) return;

    const currentSubcategories = subcategoriesMap[selectedCategoryForSub] || [];
    if (!currentSubcategories.includes(subcategoryName)) {
      const updated = {
        ...subcategoriesMap,
        [selectedCategoryForSub]: [...currentSubcategories, subcategoryName],
      };
      setSubcategoriesMap(updated);
      await saveSubcategories(updated);
    }
    setNewSubcategoryName('');
  };

  const handleDeleteSubcategory = async (category: string, subcategoryName: string) => {
    const currentSubcategories = subcategoriesMap[category] || [];
    const updated = {
      ...subcategoriesMap,
      [category]: currentSubcategories.filter(sub => sub !== subcategoryName),
    };
    setSubcategoriesMap(updated);
    await saveSubcategories(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-[#1a1f2e] border border-gray-800/50 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{editingTool ? 'Editar Ferramenta' : 'Adicionar Novo'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-4 mb-4 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('item')}
            className={`px-4 py-2 ${activeTab === 'item' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            Ferramenta
          </button>
          <button
            onClick={() => setActiveTab('categoria')}
            className={`px-4 py-2 ${activeTab === 'categoria' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            Categoria
          </button>
        </div>

        {activeTab === 'item' ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Nome</label>
              <input
                type="text"
                placeholder="Ex: Notion AI"
                value={newToolName}
                onChange={(e) => setNewToolName(e.target.value)}
                className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Descrição</label>
              <textarea
                placeholder="Descreva a ferramenta e as suas principais funcionalidades..."
                rows={2}
                value={newToolDescription}
                onChange={(e) => setNewToolDescription(e.target.value)}
                className="w-full bg-[#0f1420] border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Link</label>
              <input
                type="url"
                placeholder="https://exemplo.com"
                value={newToolLink}
                onChange={(e) => setNewToolLink(e.target.value)}
                className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Preço</label>
              <div className="flex gap-2">
                {['Free', 'Freemium', 'Pago'].map(badge => (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => {
                      if (newToolBadges.includes(badge)) {
                        setNewToolBadges(newToolBadges.filter(b => b !== badge));
                      } else {
                        setNewToolBadges([...newToolBadges, badge]);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${newToolBadges.includes(badge)
                      ? badge === 'Free' ? 'bg-green-600 text-white'
                        : badge === 'Freemium' ? 'bg-orange-600 text-white'
                          : 'bg-red-600 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                      }`}
                  >
                    {badge}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Tags (separadas por vírgula)</label>
              <input
                type="text"
                placeholder="Ex: 3D, Design, Marketing"
                value={newToolTags}
                onChange={(e) => setNewToolTags(e.target.value)}
                className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Se deixar vazio, usará o nome da categoria como tag</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Categoria Principal</label>
                <select
                  value={newToolCategory}
                  onChange={(e) => {
                    setNewToolCategory(e.target.value);
                    const firstSubcategory = subcategoriesMap[e.target.value]?.[0] || '';
                    setNewToolSubcategory(firstSubcategory);
                  }}
                  className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 transition-colors"
                >
                  {toolCategories.filter(cat => cat !== 'Todas').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Subcategoria</label>
                <select
                  value={newToolSubcategory}
                  onChange={(e) => setNewToolSubcategory(e.target.value)}
                  className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 transition-colors"
                >
                  {(subcategoriesMap[newToolCategory] || []).map(subcat => (
                    <option key={subcat} value={subcat}>{subcat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm text-gray-400 mb-1.5">Ícone</label>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowIconPicker(!showIconPicker);
                }}
                className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 transition-colors flex items-center gap-2"
              >
                <div className="text-gray-300">
                  {getToolIcon(newToolIcon, 'sm')}
                </div>
                <span className="flex-1 text-left">
                  {availableIcons.find(i => i.value === newToolIcon)?.label}
                </span>
              </button>
              {showIconPicker && (
                <div
                  className="absolute z-10 mt-2 w-full bg-[#1a1f2e] border border-gray-800 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {availableIcons.map(icon => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => {
                        setNewToolIcon(icon.value);
                        setShowIconPicker(false);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className="text-gray-300">
                        {getToolIcon(icon.value, 'sm')}
                      </div>
                      <span className="text-white">{icon.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddTool}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {editingTool ? 'Salvar Alterações' : 'Adicionar Ferramenta'}
              </button>
            </div>
            {toolFormError && (
              <p className="text-sm text-red-400 text-center -mt-2">{toolFormError}</p>
            )}
          </div>
        ) : (
          <CategoryModal
            categories={toolCategories}
            getSubcategories={(cat) => subcategoriesMap[cat] || []}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            newSubcategoryName={newSubcategoryName}
            setNewSubcategoryName={setNewSubcategoryName}
            categoryTab={categoryTab}
            setCategoryTab={setCategoryTab}
            selectedCategoryForSub={selectedCategoryForSub}
            setSelectedCategoryForSub={setSelectedCategoryForSub}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddSubcategory={handleAddSubcategory}
            onDeleteSubcategory={handleDeleteSubcategory}
            onClose={() => {
              setNewCategoryName('');
              setNewSubcategoryName('');
              setCategoryTab('categoria');
              setActiveTab('item');
            }}
            isProtected={(cat) => PROTECTED_TOOL_CATEGORIES.includes(cat)}
          />
        )}
      </div>
    </div>
  );
}
