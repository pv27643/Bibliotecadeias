import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { supabase } from '@/utils/supabase/client';
import ImageUpload from '../components/ImageUpload';
import {
  getPromptCategorySubcategories as resolvePromptCategorySubcategories,
  getPromptMainCategories,
  getPromptRootSubcategories,
  getPromptCategory,
  getPromptSubcategory,
} from '@/utils/prompt-category-helpers';
import {
  DEFAULT_PROMPT_CATEGORIES,
  PROMPT_ROOT_CATEGORY,
} from '@/data/categories';
import type { Prompt } from '@/types/models';
import CategoryModal from './CategoryModal';

const DEFAULT_PROMPT_CATEGORY = DEFAULT_PROMPT_CATEGORIES[1] || PROMPT_ROOT_CATEGORY;

const PROMPT_SECTIONS = ['Objetivo', 'Quando usar', 'Como usar', 'Inputs a preencher', 'Prompt', 'Restrições obrigatórias', 'Output esperado', 'Variações'] as const;

const parsePromptContent = (content: string): Record<string, string> => {
  const sections: Record<string, string> = {};
  let currentKey = '';
  const currentLines: string[] = [];
  for (const line of content.split('\n')) {
    if ((PROMPT_SECTIONS as readonly string[]).includes(line.trim())) {
      if (currentKey) sections[currentKey] = currentLines.join('\n').trim();
      currentKey = line.trim();
      currentLines.length = 0;
    } else {
      currentLines.push(line);
    }
  }
  if (currentKey) sections[currentKey] = currentLines.join('\n').trim();
  if (!currentKey && content.trim()) sections['Prompt'] = content.trim();
  return sections;
};

const buildPromptContent = (s: Record<string, string>): string =>
  (['Quando usar', 'Como usar', 'Inputs a preencher', 'Prompt', 'Restrições obrigatórias', 'Output esperado', 'Variações'] as const)
    .filter(k => s[k]?.trim())
    .map(k => `${k}\n${s[k]}`)
    .join('\n\n');

interface PromptModalProps {
  isOpen: boolean;
  editingPrompt: Prompt | null;
  onClose: () => void;
}

export default function PromptModal({ isOpen, editingPrompt, onClose }: PromptModalProps) {
  const {
    prompts, setPrompts,
    promptCategories, setPromptCategories,
    subcategoriesMap, setSubcategoriesMap,
    savePrompts, saveCategories, saveSubcategories,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'item' | 'categoria'>('item');
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptDescription, setNewPromptDescription] = useState('');
  const [newPromptWhenToUse, setNewPromptWhenToUse] = useState('');
  const [newPromptHowToUse, setNewPromptHowToUse] = useState('');
  const [newPromptInputs, setNewPromptInputs] = useState('');
  const [newPromptText, setNewPromptText] = useState('');
  const [newPromptRestrictions, setNewPromptRestrictions] = useState('');
  const [newPromptExpectedOutput, setNewPromptExpectedOutput] = useState('');
  const [newPromptVariations, setNewPromptVariations] = useState('');
  const [newPromptImage, setNewPromptImage] = useState('');
  const [newPromptCategory, setNewPromptCategory] = useState(DEFAULT_PROMPT_CATEGORY);
  const [newPromptSubcategory, setNewPromptSubcategory] = useState<string | undefined>('');
  const [newPromptModels, setNewPromptModels] = useState('ChatGPT');
  const [promptFormError, setPromptFormError] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [categoryTab, setCategoryTab] = useState<'categoria' | 'subcategoria'>('categoria');
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<string>('');

  const promptRootSubcategories = useMemo(
    () => getPromptRootSubcategories(promptCategories, subcategoriesMap),
    [promptCategories, subcategoriesMap]
  );

  const getPromptCategorySubcategories = (category: string) => (
    resolvePromptCategorySubcategories(category, promptRootSubcategories, subcategoriesMap)
  );

  const promptMainCategories = useMemo(
    () => getPromptMainCategories(promptCategories, promptRootSubcategories),
    [promptCategories, promptRootSubcategories]
  );

  const resetPromptForm = () => {
    setNewPromptTitle('');
    setNewPromptDescription('');
    setNewPromptWhenToUse('');
    setNewPromptHowToUse('');
    setNewPromptInputs('');
    setNewPromptText('');
    setNewPromptRestrictions('');
    setNewPromptExpectedOutput('');
    setNewPromptVariations('');
    setNewPromptImage('');
    setNewPromptCategory(DEFAULT_PROMPT_CATEGORY);
    setNewPromptSubcategory('');
    setNewPromptModels('ChatGPT');
    setPromptFormError('');
  };

  useEffect(() => {
    if (!isOpen) return;
    if (editingPrompt) {
      const sections = parsePromptContent(editingPrompt.content);
      setNewPromptTitle(editingPrompt.title);
      setNewPromptDescription(editingPrompt.description || sections['Objetivo'] || '');
      setNewPromptWhenToUse(sections['Quando usar'] || '');
      setNewPromptHowToUse(sections['Como usar'] || '');
      setNewPromptInputs(sections['Inputs a preencher'] || '');
      setNewPromptText(sections['Prompt'] || '');
      setNewPromptRestrictions(sections['Restrições obrigatórias'] || '');
      setNewPromptExpectedOutput(sections['Output esperado'] || '');
      setNewPromptVariations(sections['Variações'] || '');
      setNewPromptImage(editingPrompt.image || '');
      setNewPromptCategory(getPromptCategory(editingPrompt));
      setNewPromptSubcategory(getPromptSubcategory(editingPrompt) || getPromptCategorySubcategories(getPromptCategory(editingPrompt))[0] || '');
      setNewPromptModels(editingPrompt.models.join(', '));
    } else {
      resetPromptForm();
      setNewPromptCategory(DEFAULT_PROMPT_CATEGORY);
      setNewPromptSubcategory(getPromptCategorySubcategories(DEFAULT_PROMPT_CATEGORY)[0] || '');
    }
    setActiveTab('item');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingPrompt]);

  useEffect(() => {
    if (!selectedCategoryForSub) {
      const defaultCategory = promptMainCategories.find(cat => cat !== 'Todas' && cat !== 'Todos') || promptMainCategories[0];
      setSelectedCategoryForSub(defaultCategory);
    }
  }, [promptMainCategories, selectedCategoryForSub]);

  const uploadImageToSupabase = async (base64Image: string): Promise<string | null> => {
    try {
      const base64Data = base64Image.split(',')[1];
      const mimeType = base64Image.split(',')[0].split(':')[1].split(';')[0];
      const byteArray = new Uint8Array(atob(base64Data).split('').map(c => c.charCodeAt(0)));
      const blob = new Blob([byteArray], { type: mimeType });
      const fileName = `prompt-${Date.now()}-${Math.random().toString(36).substring(7)}.${mimeType.split('/')[1]}`;

      const { error } = await supabase.storage
        .from('prompt-images')
        .upload(fileName, blob, { contentType: mimeType, cacheControl: '3600', upsert: false });

      if (error) return null;

      const { data: publicUrlData } = supabase.storage.from('prompt-images').getPublicUrl(fileName);
      return publicUrlData.publicUrl;
    } catch {
      return null;
    }
  };

  const handleAddPrompt = async () => {
    setPromptFormError('');
    if (!newPromptTitle.trim() || !newPromptDescription.trim() || !newPromptText.trim()) {
      setPromptFormError('Preenche o título, objetivo e o prompt.');
      return;
    }
    if (!newPromptModels.trim()) {
      setPromptFormError('Indica pelo menos uma IA/modelo.');
      return;
    }

    const modelsArray = newPromptModels.split(',').map(m => m.trim()).filter(m => m.length > 0);
    const builtContent = buildPromptContent({
      'Quando usar': newPromptWhenToUse,
      'Como usar': newPromptHowToUse,
      'Inputs a preencher': newPromptInputs,
      'Prompt': newPromptText,
      'Restrições obrigatórias': newPromptRestrictions,
      'Output esperado': newPromptExpectedOutput,
      'Variações': newPromptVariations,
    });

    let imageUrl = newPromptImage;
    if (newPromptImage && newPromptImage.startsWith('data:')) {
      const uploadedUrl = await uploadImageToSupabase(newPromptImage);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        setPromptFormError('Erro ao fazer upload da imagem. Verifica se o bucket "prompt-images" está criado e é público.');
        imageUrl = '';
      }
    }

    const promptData = {
      title: newPromptTitle,
      description: newPromptDescription,
      category: newPromptCategory,
      subcategory: newPromptSubcategory || undefined,
      models: modelsArray,
      content: builtContent,
      image: imageUrl || undefined,
    };

    const updatedPrompts = editingPrompt
      ? prompts.map(p => p.id === editingPrompt.id ? { ...p, ...promptData } : p)
      : [...prompts, { id: Date.now().toString(), favorite: false, ...promptData }];

    setPrompts(updatedPrompts);
    await savePrompts(updatedPrompts);
    resetPromptForm();
    onClose();
  };

  const handleAddCategory = async () => {
    const categoryName = newCategoryName.trim();
    if (!categoryName) return;

    if (!promptCategories.includes(categoryName)) {
      const updated = [...promptCategories, categoryName];
      setPromptCategories(updated);
      await saveCategories('prompt', updated);
      if (!subcategoriesMap[categoryName]) {
        const updatedSubcategories = { ...subcategoriesMap, [categoryName]: [] };
        setSubcategoriesMap(updatedSubcategories);
        await saveSubcategories(updatedSubcategories);
      }
    }
    setNewCategoryName('');
  };

  const handleDeleteCategory = async (categoryName: string) => {
    const updated = promptCategories.filter(cat => cat !== categoryName);
    setPromptCategories(updated);
    await saveCategories('prompt', updated);
    const updatedSubcategories = { ...subcategoriesMap };
    delete updatedSubcategories[categoryName];
    setSubcategoriesMap(updatedSubcategories);
    await saveSubcategories(updatedSubcategories);
  };

  const handleAddSubcategory = async () => {
    const subcategoryName = newSubcategoryName.trim();
    if (!subcategoryName || !selectedCategoryForSub) return;

    const currentSubcategories = getPromptCategorySubcategories(selectedCategoryForSub);
    if (!currentSubcategories.includes(subcategoryName)) {
      const storedSubcategories = subcategoriesMap[selectedCategoryForSub] || [];
      const updated = {
        ...subcategoriesMap,
        [selectedCategoryForSub]: [...storedSubcategories, subcategoryName],
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

    if (category === PROMPT_ROOT_CATEGORY && promptCategories.includes(subcategoryName)) {
      const updatedPromptCategories = promptCategories.filter(cat => cat !== subcategoryName);
      setPromptCategories(updatedPromptCategories);
      await saveCategories('prompt', updatedPromptCategories);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-[#1a1f2e] border border-gray-800/50 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{editingPrompt ? 'Editar Prompt' : 'Adicionar Novo'}</h2>
          <button onClick={() => { onClose(); resetPromptForm(); }} className="text-gray-400 hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-4 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('item')}
            className={`px-4 py-2 ${activeTab === 'item' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            Prompt
          </button>
          <button
            onClick={() => {
              setActiveTab('categoria');
              setCategoryTab('categoria');
            }}
            className={`px-4 py-2 ${activeTab === 'categoria' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            Categoria
          </button>
        </div>

        {activeTab === 'item' ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Título</label>
              <input
                type="text"
                placeholder="Ex: Refatorar Código Python"
                value={newPromptTitle}
                onChange={(e) => setNewPromptTitle(e.target.value)}
                className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Objetivo <span className="text-red-500">*</span></label>
              <textarea
                placeholder="Para que serve este prompt? Ex: Gerar uma imagem de hero shot profissional..."
                rows={2}
                value={newPromptDescription}
                onChange={(e) => setNewPromptDescription(e.target.value)}
                className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Imagem (opcional)</label>
              <ImageUpload
                onImageUpload={setNewPromptImage}
                currentImage={newPromptImage}
                maxSizeMB={50}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Categoria Principal</label>
                <select
                  value={newPromptCategory}
                  onChange={(e) => {
                    setNewPromptCategory(e.target.value);
                    const firstSubcategory = getPromptCategorySubcategories(e.target.value)[0] || '';
                    setNewPromptSubcategory(firstSubcategory);
                  }}
                  className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 transition-colors"
                >
                  {promptMainCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Subcategoria</label>
                <select
                  value={newPromptSubcategory}
                  onChange={(e) => setNewPromptSubcategory(e.target.value)}
                  className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 transition-colors"
                >
                  {getPromptCategorySubcategories(newPromptCategory).map(subcat => (
                    <option key={subcat} value={subcat}>{subcat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">IAs/Modelos compatíveis</label>
              <div className="text-xs text-gray-500 mb-1">Separe múltiplos modelos por vírgula (ex: ChatGPT, Claude, Gemini)</div>
              <input
                type="text"
                placeholder="Ex: ChatGPT, Claude, Midjourney"
                value={newPromptModels}
                onChange={(e) => setNewPromptModels(e.target.value)}
                className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Quando usar <span className="text-gray-600 font-normal">(opcional)</span></label>
              <textarea
                placeholder="Ex: Usa quando precisares de gerar uma imagem profissional — produto, campanha, editorial..."
                rows={2}
                value={newPromptWhenToUse}
                onChange={(e) => setNewPromptWhenToUse(e.target.value)}
                className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Como usar <span className="text-gray-600 font-normal">(opcional)</span></label>
              <textarea
                placeholder="Ex: Cola o prompt numa ferramenta de geração de imagens. Substitui os campos entre [colchetes]..."
                rows={2}
                value={newPromptHowToUse}
                onChange={(e) => setNewPromptHowToUse(e.target.value)}
                className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Inputs a preencher <span className="text-gray-600 font-normal">(opcional)</span></label>
              <textarea
                placeholder="• Produto / sujeito: [product]&#10;• Formato: [1:1 / 4:5 / 9:16]&#10;• Estilo: [minimal / editorial]"
                rows={3}
                value={newPromptInputs}
                onChange={(e) => setNewPromptInputs(e.target.value)}
                className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Prompt <span className="text-red-500">*</span></label>
              <div className="text-xs text-gray-500 mb-1">O texto que vai ser copiado e colado na IA. Usa [VARIÁVEL] para campos dinâmicos.</div>
              <textarea
                placeholder="Act as a senior art director... [product], [style], [format]"
                rows={5}
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                className="w-full bg-[#0f1420] border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 resize-none font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Restrições obrigatórias <span className="text-gray-600 font-normal">(opcional)</span></label>
              <textarea
                placeholder="• Sem mãos distorcidas, rostos desfigurados...&#10;• Mantém o sujeito principal longe das extremidades..."
                rows={3}
                value={newPromptRestrictions}
                onChange={(e) => setNewPromptRestrictions(e.target.value)}
                className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Output esperado <span className="text-gray-600 font-normal">(opcional)</span></label>
              <textarea
                placeholder="Ex: Devolve apenas o prompt final em inglês, pronto para colar diretamente na ferramenta."
                rows={2}
                value={newPromptExpectedOutput}
                onChange={(e) => setNewPromptExpectedOutput(e.target.value)}
                className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Variações <span className="text-gray-600 font-normal">(opcional)</span></label>
              <textarea
                placeholder='Ex: Pede 5 variações mudando só: (1) lighting, (2) background, (3) camera angle...'
                rows={2}
                value={newPromptVariations}
                onChange={(e) => setNewPromptVariations(e.target.value)}
                className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 resize-none text-sm"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => { onClose(); resetPromptForm(); }}
                className="px-4 py-2.5 bg-transparent text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPrompt}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingPrompt ? 'Atualizar Prompt' : 'Guardar Prompt'}
              </button>
            </div>
            {promptFormError && (
              <p className="text-sm text-red-400 text-center -mt-2">{promptFormError}</p>
            )}
          </div>
        ) : (
          <CategoryModal
            categories={promptMainCategories}
            getSubcategories={getPromptCategorySubcategories}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            newSubcategoryName={newSubcategoryName}
            setNewSubcategoryName={setNewSubcategoryName}
            categoryTab={categoryTab}
            setCategoryTab={(t) => {
              setCategoryTab(t);
              if (t === 'subcategoria') {
                setSelectedCategoryForSub(newPromptCategory || PROMPT_ROOT_CATEGORY);
              }
            }}
            selectedCategoryForSub={selectedCategoryForSub}
            setSelectedCategoryForSub={setSelectedCategoryForSub}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddSubcategory={handleAddSubcategory}
            onDeleteSubcategory={handleDeleteSubcategory}
            onClose={() => {
              setNewCategoryName('');
              setActiveTab('item');
            }}
          />
        )}
      </div>
    </div>
  );
}
