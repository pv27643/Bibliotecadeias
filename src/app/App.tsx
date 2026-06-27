import { useState, useEffect, useMemo } from 'react';
import { Zap, Workflow, FileText, Library, Plus, X, Sparkles, Layout, Box, Smartphone, ClipboardList, Linkedin, Mail, BarChart3, Edit, Trash2, Star, ArrowLeft, Search, MoreVertical, Clock, ArrowRight, CheckCircle2, Check, Copy, MessageSquare, Circle, Video, Image, PenTool, Settings, History, Play, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useApp } from '../hooks/useApp';
import { getCategoryIcon, getWorkflowIcon, getToolIcon } from '../utils/iconHelpers';
import { supabase } from '../utils/supabase/client';
import ImageUpload from './components/ImageUpload';
import WorkflowRunner from './components/WorkflowRunner';
import BrandSelector from './components/BrandSelector';
import HistoryList from './components/HistoryList';
import DesignAgentChat from './components/DesignAgentChat';
import { WORKFLOWS } from '../config/workflows.config';
import type { WorkflowConfig } from '../config/workflows.config';
import type { BrandStyleProfile } from '../types/brand';
import {
  DEFAULT_PROMPT_CATEGORIES,
  DEFAULT_PROMPT_SUBCATEGORIES,
  PROMPT_ROOT_CATEGORY,
  PROTECTED_PROMPT_CATEGORIES,
  PROTECTED_TOOL_CATEGORIES,
  PROTECTED_WORKFLOW_CATEGORIES
} from '../data/categories';
import {
  getPromptCategory,
  getPromptCategorySubcategories as resolvePromptCategorySubcategories,
  getPromptMainCategories,
  getPromptRootSubcategories,
  getPromptSubcategory
} from '../utils/promptCategoryHelpers';

type View = 'biblioteca' | 'prompts' | 'workflows';
type Modal = 'categoria' | 'ferramenta' | 'prompt' | null;
const DEFAULT_PROMPT_CATEGORY = DEFAULT_PROMPT_CATEGORIES[1] || PROMPT_ROOT_CATEGORY;

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  badges: string[];
  tags: string[];
  icon: string;
  link?: string;
  favorite?: boolean;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  models: string[];
  content: string;
  image?: string;
  favorite?: boolean;
}

export interface WorkflowStep {
  tool: string;
  status?: 'pending' | 'completed' | 'failed' | string;
  icon?: string;
}

export interface WorkflowType {
  id: string;
  title: string;
  description?: string;
  category?: string;
  steps: WorkflowStep[];
  webhookUrl?: string;
  webhookPath?: string;
  isN8nWorkflow?: boolean;
  inputs?: any[];
  image?: string;
  favorite?: boolean;
}

export default function App() {

  const {
    tools, setTools,
    prompts, setPrompts,
    toolCategories, setToolCategories,
    promptCategories, setPromptCategories,
    subcategoriesMap, setSubcategoriesMap,
    isLoading,
    saveTools, savePrompts,
    saveCategories, saveSubcategories,
    toggleFavorite, getFavoritesCount
  } = useApp();

  // UI state - kept local to App
  const [currentView, setCurrentView] = useState<View>('biblioteca');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'tool' | 'prompt'; id: string } | null>(null);

  // Editing / modal state
  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  const [newToolName, setNewToolName] = useState('');
  const [newToolDescription, setNewToolDescription] = useState('');
  const [newToolLink, setNewToolLink] = useState('');
  const [newToolCategory, setNewToolCategory] = useState('General AI');
  const [newToolSubcategory, setNewToolSubcategory] = useState<string | undefined>('');
  const [newToolIcon, setNewToolIcon] = useState('sparkles');
  const [newToolBadges, setNewToolBadges] = useState<string[]>(['Free']);
  const [newToolTags, setNewToolTags] = useState('');

  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
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


  const [activeModal, setActiveModal] = useState<Modal>(null);
  const [activeTab, setActiveTab] = useState<'item' | 'categoria' | 'subcategoria'>('item');

  // Filters & selection
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedPromptCategory, setSelectedPromptCategory] = useState<string | null>(null);
  const [selectedPromptSubcategory, setSelectedPromptSubcategory] = useState<string | null>(null);
  const [searchPromptTerm, setSearchPromptTerm] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});



  // Brand & AI workflows state
  const [activeBrand, setActiveBrand] = useState<BrandStyleProfile | null>(null);
  const [activeWorkflowConfig, setActiveWorkflowConfig] = useState<WorkflowConfig | null>(null);
  const [workflowsSubTab, setWorkflowsSubTab] = useState<'biblioteca' | 'assistente'>('biblioteca');
  const [toolFormError, setToolFormError] = useState('');
  const [promptFormError, setPromptFormError] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [showPromptDetails, setShowPromptDetails] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [categoryTab, setCategoryTab] = useState<'categoria' | 'subcategoria'>('categoria');
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] = useState<string>('');

  useEffect(() => {
    setFieldValues({});
    setShowPromptDetails(false);
  }, [selectedPrompt]);

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
  const getProtectedCategories = (type: 'tool' | 'prompt') => (
    type === 'tool' ? PROTECTED_TOOL_CATEGORIES : PROTECTED_PROMPT_CATEGORIES
  );
  const isProtectedCategory = (type: 'tool' | 'prompt', category: string) =>
    getProtectedCategories(type).includes(category);

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
    setEditingPromptId(null);
    setPromptFormError('');
  };

  useEffect(() => {
    if (!selectedCategoryForSubcategory) {
      const availableCategories = activeModal === 'prompt' ? promptMainCategories : toolCategories;
      const defaultCategory = availableCategories.find(cat => cat !== 'Todas' && cat !== 'Todos') || availableCategories[0];
      setSelectedCategoryForSubcategory(defaultCategory);
    }
  }, [activeModal, promptMainCategories, toolCategories, selectedCategoryForSubcategory]);


  const getCategoryCount = (category: string, type: 'tool' | 'prompt') => {
    if (type === 'tool') {
      return tools.filter(tool => tool.category === category).length;
    } else {
      return prompts.filter(prompt => getPromptCategory(prompt) === category).length;
    }
  };

  const getSubcategoryCount = (category: string, subcategory: string) => {
    return tools.filter(tool => tool.category === category && tool.subcategory === subcategory).length;
  };

  const getPromptSubcategoryCount = (category: string, subcategory: string) => {
    return prompts.filter(prompt =>
      getPromptCategory(prompt) === category && getPromptSubcategory(prompt) === subcategory
    ).length;
  };

  

  const copyPromptToClipboard = async (content: string) => {
    const filteredContent = content
      .split('\n')
      .filter(line => !line.trim().startsWith('Model:') && !line.trim().startsWith('Casos de Uso:'))
      .join('\n')
      .trim();

    try {
      await navigator.clipboard.writeText(filteredContent);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = filteredContent;
      textarea.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Upload de imagem para Supabase Storage
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

  const getBadgeColor = (badge: string) => {
    switch (badge.toLowerCase()) {
      case 'free':
        return 'bg-green-600/20 text-green-400';
      case 'freemium':
        return 'bg-orange-600/20 text-orange-400';
      case 'pago':
        return 'bg-red-600/20 text-red-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  };

  const handleDelete = (type: 'tool' | 'prompt', id: string) => {
    setShowDeleteConfirm({ type, id });
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;

    const { type, id } = showDeleteConfirm;

    if (type === 'tool') {
      await saveTools(tools.filter(t => t.id !== id));
    } else if (type === 'prompt') {
      await savePrompts(prompts.filter(p => p.id !== id));
    }

    setShowDeleteConfirm(null);
  };

  const handleEdit = (type: 'tool' | 'prompt', id: string) => {
    setOpenMenuId(null);

    if (type === 'prompt') {
      const prompt = prompts.find(p => p.id === id);
      if (prompt) {
        const sections = parsePromptContent(prompt.content);
        setEditingPromptId(id);
        setNewPromptTitle(prompt.title);
        setNewPromptDescription(prompt.description || sections['Objetivo'] || '');
        setNewPromptWhenToUse(sections['Quando usar'] || '');
        setNewPromptHowToUse(sections['Como usar'] || '');
        setNewPromptInputs(sections['Inputs a preencher'] || '');
        setNewPromptText(sections['Prompt'] || '');
        setNewPromptRestrictions(sections['Restrições obrigatórias'] || '');
        setNewPromptExpectedOutput(sections['Output esperado'] || '');
        setNewPromptVariations(sections['Variações'] || '');
        setNewPromptImage(prompt.image || '');
        setNewPromptCategory(getPromptCategory(prompt));
        setNewPromptSubcategory(getPromptSubcategory(prompt) || getPromptCategorySubcategories(getPromptCategory(prompt))[0] || '');
        setNewPromptModels(prompt.models.join(', '));
        setActiveModal('prompt');
        setActiveTab('item');
      }
    } else if (type === 'tool') {
      const tool = tools.find(t => t.id === id);
      if (tool) {
        setEditingToolId(id);
        setNewToolName(tool.name);
        setNewToolDescription(tool.description);
        setNewToolLink(tool.link || '');
        setNewToolCategory(tool.category);
        setNewToolSubcategory(tool.subcategory);
        setNewToolIcon(tool.icon);
        setNewToolBadges(tool.badges);
        setNewToolTags(tool.tags.join(', '));
        setShowIconPicker(false);
        setActiveModal('ferramenta');
        setActiveTab('item');
      }
    }
  };

  const handleAddCategory = async () => {
    const categoryName = newCategoryName.trim();
    if (!categoryName) return;

    if (activeModal === 'ferramenta') {
      if (!toolCategories.includes(categoryName)) {
        const updated = [...toolCategories, categoryName];
        setToolCategories(updated);
        await saveCategories('tool', updated);
        // Inicializar subcategorias vazias para nova categoria
        if (!subcategoriesMap[categoryName]) {
          const updatedSubcategories = {
            ...subcategoriesMap,
            [categoryName]: []
          };
          setSubcategoriesMap(updatedSubcategories);
          await saveSubcategories(updatedSubcategories);
        }
      }
    } else if (activeModal === 'prompt') {
      if (!promptCategories.includes(categoryName)) {
        const updated = [...promptCategories, categoryName];
        setPromptCategories(updated);
        await saveCategories('prompt', updated);
        if (!subcategoriesMap[categoryName]) {
          const updatedSubcategories = {
            ...subcategoriesMap,
            [categoryName]: []
          };
          setSubcategoriesMap(updatedSubcategories);
          await saveSubcategories(updatedSubcategories);
        }
      }
    }

    setNewCategoryName('');
  };

  const handleDeleteCategory = async (type: 'tool' | 'prompt', categoryName: string) => {
    if (isProtectedCategory(type, categoryName)) return;

    if (type === 'tool') {
      const updated = toolCategories.filter(cat => cat !== categoryName);
      setToolCategories(updated);
      await saveCategories('tool', updated);
      // Remover subcategorias associadas
      const updatedSubcategories = { ...subcategoriesMap };
      delete updatedSubcategories[categoryName];
      setSubcategoriesMap(updatedSubcategories);
      await saveSubcategories(updatedSubcategories);
      if (selectedCategory === categoryName) {
        setSelectedCategory(null);
      }
    } else if (type === 'prompt') {
      const updated = promptCategories.filter(cat => cat !== categoryName);
      setPromptCategories(updated);
      await saveCategories('prompt', updated);
      const updatedSubcategories = { ...subcategoriesMap };
      delete updatedSubcategories[categoryName];
      setSubcategoriesMap(updatedSubcategories);
      await saveSubcategories(updatedSubcategories);
      if (selectedPromptCategory === categoryName) {
        setSelectedPromptCategory(null);
        setSelectedPromptSubcategory(null);
      }
    }
  };

  const handleAddSubcategory = async () => {
    const subcategoryName = newSubcategoryName.trim();
    if (!subcategoryName || !selectedCategoryForSubcategory) return;

    const currentSubcategories = activeModal === 'prompt'
      ? getPromptCategorySubcategories(selectedCategoryForSubcategory)
      : (subcategoriesMap[selectedCategoryForSubcategory] || []);

    if (!currentSubcategories.includes(subcategoryName)) {
      const storedSubcategories = subcategoriesMap[selectedCategoryForSubcategory] || [];
      const updated = {
        ...subcategoriesMap,
        [selectedCategoryForSubcategory]: [...storedSubcategories, subcategoryName]
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
      [category]: currentSubcategories.filter(sub => sub !== subcategoryName)
    };
    setSubcategoriesMap(updated);
    await saveSubcategories(updated);

    if (category === PROMPT_ROOT_CATEGORY && promptCategories.includes(subcategoryName)) {
      const updatedPromptCategories = promptCategories.filter(cat => cat !== subcategoryName);
      setPromptCategories(updatedPromptCategories);
      await saveCategories('prompt', updatedPromptCategories);
    }

    if (selectedSubcategory === subcategoryName) {
      setSelectedSubcategory(null);
    }
    if (selectedPromptSubcategory === subcategoryName) {
      setSelectedPromptSubcategory(null);
    }
  };

  const handleAddTool = async () => {
    setToolFormError('');
    if (!newToolName.trim() || !newToolDescription.trim()) {
      setToolFormError('Preenche o nome e a descrição.');
      return;
    }

    const tagsArray = newToolTags.trim()
      ? newToolTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [newToolCategory];

    const existingTool = tools.find(tool => tool.id === editingToolId);
    const toolToSave: Tool = {
      id: editingToolId || Date.now().toString(),
      name: newToolName,
      description: newToolDescription,
      category: newToolCategory,
      subcategory: newToolSubcategory,
      badges: newToolBadges,
      tags: tagsArray,
      icon: newToolIcon,
      link: newToolLink || undefined,
      favorite: existingTool ? existingTool.favorite : false
    };

    const updatedTools = editingToolId
      ? tools.map(tool => tool.id === editingToolId ? { ...tool, ...toolToSave } : tool)
      : [...tools, toolToSave];

    setTools(updatedTools);
    await saveTools(updatedTools);

    // Limpar form
    setNewToolName('');
    setNewToolDescription('');
    setNewToolLink('');
    setNewToolCategory('General AI');
    setNewToolSubcategory('');
    setNewToolIcon('sparkles');
    setNewToolBadges(['Free']);
    setNewToolTags('');
    setToolFormError('');
    setShowIconPicker(false);
    setEditingToolId(null);
    setActiveModal(null);
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

    const updatedPrompts = editingPromptId
      ? prompts.map(p => p.id === editingPromptId ? { ...p, ...promptData } : p)
      : [...prompts, { id: Date.now().toString(), favorite: false, ...promptData }];

    setPrompts(updatedPrompts);
    await savePrompts(updatedPrompts);
    resetPromptForm();
    setActiveModal(null);
  };

  const availableIcons = [
    { name: 'sparkles', label: 'Sparkles', value: 'sparkles' },
    { name: 'layout', label: 'Layout', value: 'layout' },
    { name: 'image', label: 'Imagem', value: 'image' },
    { name: 'pen-tool', label: 'Caneta', value: 'pen-tool' },
    { name: 'video', label: 'Vídeo', value: 'video' },
    { name: 'box', label: 'Box', value: 'box' },
    { name: 'message-square', label: 'Chat', value: 'message-square' },
  ];

  return (
    <div
      className="min-h-screen bg-[#0a0e1a] text-white flex"
      onClick={() => {
        setOpenMenuId(null);
        setShowIconPicker(false);
      }}
    >
      {/* Sidebar */}
      <div className="w-64 bg-[#0f1420] border-r border-gray-800 p-4 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-8 px-2">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-500" />
            <span className="font-semibold text-lg">Celeuma IA</span>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <button
            onClick={() => setCurrentView('workflows')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${currentView === 'workflows' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50'
              }`}
          >
            <Workflow className="w-5 h-5" />
            <span>Workflows</span>
          </button>

          <button
            onClick={() => setCurrentView('prompts')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${currentView === 'prompts' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50'
              }`}
          >
            <FileText className="w-5 h-5" />
            <span>Prompts</span>
          </button>

          <button
            onClick={() => setCurrentView('biblioteca')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${currentView === 'biblioteca' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50'
              }`}
          >
            <Library className="w-5 h-5" />
            <span>Biblioteca de IAs</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">

          {/* Loading skeleton */}
          {isLoading && (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-800/60 rounded-lg w-48 mb-3" />
              <div className="h-4 bg-gray-800/40 rounded w-80 mb-10" />
              <div className="grid grid-cols-4 gap-4">
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

          {/* Biblioteca de IAs */}
          {!isLoading && currentView === 'biblioteca' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-semibold mb-2">
                  {selectedSubcategory
                    ? `${selectedCategory} → ${selectedSubcategory}`
                    : selectedCategory && selectedCategory !== 'Favoritos'
                      ? selectedCategory
                      : 'Biblioteca de IAs'
                  }
                </h1>
                <p className="text-gray-400">
                  {selectedSubcategory
                    ? `Ferramentas de ${selectedSubcategory}`
                    : selectedCategory && selectedCategory !== 'Favoritos'
                      ? `Escolha uma subcategoria`
                      : 'Descubra e gere as suas ferramentas e recursos de IA consolidados.'
                  }
                </p>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2 items-center flex-1">
                  {selectedCategory || selectedSubcategory ? (
                    <button
                      onClick={() => {
                        if (selectedSubcategory) {
                          setSelectedSubcategory(null);
                          setSelectedBadge(null);
                          setSearchTerm('');
                        } else {
                          setSelectedCategory(null);
                          setSelectedSubcategory(null);
                          setSelectedBadge(null);
                          setSearchTerm('');
                        }
                      }}
                      className="px-4 py-2 rounded-lg transition-colors bg-gray-800/50 text-gray-400 hover:bg-gray-800 flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedCategory('Favoritos');
                        setSelectedSubcategory(null);
                        setSelectedBadge(null);
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedCategory === 'Favoritos'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                        }`}
                    >
                      <Star className="w-4 h-4" />
                      Favoritos ({getFavoritesCount('tool')})
                    </button>
                  )}
                  {(selectedSubcategory || (!selectedCategory && !selectedSubcategory)) && (
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder={selectedSubcategory ? 'Pesquisar ferramentas...' : 'Pesquisa global em todas as ferramentas...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors"
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setEditingToolId(null);
                    setNewToolName('');
                    setNewToolDescription('');
                    setNewToolLink('');
                    setNewToolCategory('General AI');
                    setNewToolSubcategory('');
                    setNewToolIcon('sparkles');
                    setNewToolBadges(['Free']);
                    setNewToolTags('');
                    setShowIconPicker(false);
                    setActiveModal('ferramenta');
                    setActiveTab('item');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap ml-4"
                >
                  <Plus className="w-4 h-4" />
                  Nova Ferramenta
                </button>
              </div>

              {!selectedCategory && searchTerm ? (
                <div className="grid grid-cols-3 gap-4">
                  {(() => {
                    const results = tools.filter(t =>
                      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                    );
                    if (results.length === 0) return (
                      <div className="col-span-3 py-16 text-center">
                        <Search className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">Nenhuma ferramenta encontrada para "{searchTerm}"</p>
                        <p className="text-sm text-gray-600 mt-1">Tenta outras palavras-chave</p>
                      </div>
                    );
                    return results.map(tool => (
                      <div key={tool.id} className="bg-[#151921] border border-gray-800/50 rounded-lg p-5 hover:border-gray-700 transition-colors relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-300">
                            {getToolIcon(tool.icon)}
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={e => { e.stopPropagation(); toggleFavorite('tool', tool.id); }} className="text-gray-500 hover:text-yellow-400 transition-colors">
                              <Star className={`w-5 h-5 ${tool.favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </button>
                            {tool.badges.map((badge, idx) => (
                              <span key={idx} className={`px-2.5 py-1 text-xs rounded font-medium ${getBadgeColor(badge)}`}>{badge}</span>
                            ))}
                          </div>
                        </div>
                        <h3 className="text-white font-semibold mb-1 text-base">{tool.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{tool.category} › {tool.subcategory}</p>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">{tool.description}</p>
                        {tool.link && (
                          <a href={tool.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            Visitar <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              ) : !selectedCategory && !searchTerm ? (
                <div className="grid grid-cols-4 gap-4">
                  {toolCategories.filter(cat => cat !== 'Todas').map(category => (
                    <div
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedSubcategory(null);
                      }}
                      className="bg-[#151921] border border-gray-800/50 rounded-lg p-6 hover:border-blue-600 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-300">
                          {getCategoryIcon(category)}
                        </div>
                        <span className="text-2xl font-semibold text-gray-500">
                          {getCategoryCount(category, 'tool')}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-lg">{category}</h3>
                    </div>
                  ))}
                </div>
              ) : selectedCategory && !selectedSubcategory && selectedCategory !== 'Favoritos' ? (
                <div className="grid grid-cols-4 gap-4">
                  {(subcategoriesMap[selectedCategory] || []).map(subcategory => (
                    <div
                      key={subcategory}
                      onClick={() => setSelectedSubcategory(subcategory)}
                      className="bg-[#151921] border border-gray-800/50 rounded-lg p-6 hover:border-blue-600 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-300">
                          <Library className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-semibold text-gray-500">
                          {getSubcategoryCount(selectedCategory, subcategory)}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-lg">{subcategory}</h3>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => setSelectedBadge(null)}
                      className={`px-4 py-2 rounded-lg transition-colors ${!selectedBadge
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                        }`}
                    >
                      Todos os Preços
                    </button>
                    <button
                      onClick={() => setSelectedBadge('Free')}
                      className={`px-4 py-2 rounded-lg transition-colors ${selectedBadge === 'Free'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                        }`}
                    >
                      Free
                    </button>
                    <button
                      onClick={() => setSelectedBadge('Freemium')}
                      className={`px-4 py-2 rounded-lg transition-colors ${selectedBadge === 'Freemium'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                        }`}
                    >
                      Freemium
                    </button>
                    <button
                      onClick={() => setSelectedBadge('Pago')}
                      className={`px-4 py-2 rounded-lg transition-colors ${selectedBadge === 'Pago'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                        }`}
                    >
                      Pago
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {(() => {
                      const filtered = tools.filter(tool => {
                        let categoryMatch = true;

                        // Debug: log das condições
                        if (selectedCategory === 'Favoritos') {
                          categoryMatch = tool.favorite === true;
                        } else if (selectedSubcategory && selectedCategory) {
                          categoryMatch = tool.category === selectedCategory && tool.subcategory === selectedSubcategory;
                        } else if (selectedCategory) {
                          categoryMatch = tool.category === selectedCategory;
                        }

                        const badgeMatch = !selectedBadge || tool.badges.includes(selectedBadge);
                        const searchMatch = !searchTerm ||
                          tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
                        return categoryMatch && badgeMatch && searchMatch;
                      });

                      if (filtered.length === 0) return (
                        <div className="col-span-3 py-16 text-center">
                          <Search className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                          <p className="text-gray-400 font-medium">Nenhuma ferramenta encontrada</p>
                          <p className="text-sm text-gray-600 mt-1">{searchTerm ? `Sem resultados para "${searchTerm}"` : 'Não há ferramentas nesta subcategoria ainda'}</p>
                        </div>
                      );
                      return filtered;
                    })().map(tool => (
                      <div key={tool.id} className="bg-[#151921] border border-gray-800/50 rounded-lg p-5 hover:border-gray-700 transition-colors relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-300">
                            {getToolIcon(tool.icon)}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite('tool', tool.id);
                              }}
                              className="text-gray-500 hover:text-yellow-400 transition-colors"
                            >
                              <Star className={`w-5 h-5 ${tool.favorite === true ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </button>
                            {tool.badges.map((badge, idx) => (
                              <span key={idx} className={`px-2.5 py-1 text-xs rounded font-medium ${getBadgeColor(badge)}`}>
                                {badge}
                              </span>
                            ))}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === `tool-${tool.id}` ? null : `tool-${tool.id}`);
                                }}
                                className="text-gray-500 hover:text-gray-300 transition-colors p-1"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {openMenuId === `tool-${tool.id}` && (
                                <div className="absolute right-0 top-8 bg-[#1a1f2e] border border-gray-800 rounded-lg shadow-xl z-10 py-1 min-w-[140px]">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit('tool', tool.id);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete('tool', tool.id);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Eliminar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <h3 className="text-white font-semibold mb-2 text-base">{tool.name}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed mb-6">{tool.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {tool.tags.map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                          {tool.link && (
                            <a
                              href={tool.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ArrowRight className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Meus Prompts */}
          {!isLoading && currentView === 'prompts' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-semibold mb-2">Meus Prompts</h1>
                <p className="text-gray-400">Organize e reutilize os seus melhores exemplares de IA.</p>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2 items-center flex-1">
                  {selectedPromptCategory ? (
                    <button
                      onClick={() => {
                        if (selectedPromptSubcategory) {
                          setSelectedPromptSubcategory(null);
                        } else {
                          setSelectedPromptCategory(null);
                          setSearchPromptTerm('');
                        }
                      }}
                      className="px-4 py-2 rounded-lg transition-colors bg-gray-800/50 text-gray-400 hover:bg-gray-800 flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedPromptCategory('Favoritos');
                        setSelectedPromptSubcategory(null);
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedPromptCategory === 'Favoritos'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                        }`}
                    >
                      <Star className="w-4 h-4" />
                      Favoritos ({getFavoritesCount('prompt')})
                    </button>
                  )}
                  {(selectedPromptSubcategory || selectedPromptCategory === 'Favoritos' || !selectedPromptCategory || (selectedPromptCategory && getPromptCategorySubcategories(selectedPromptCategory).length === 0)) && (
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder={!selectedPromptCategory ? 'Pesquisa global em todos os prompts...' : 'Pesquisar prompts...'}
                        value={searchPromptTerm}
                        onChange={(e) => setSearchPromptTerm(e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors"
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setActiveModal('prompt');
                    setActiveTab('item');
                    setEditingPromptId(null);
                    setNewPromptCategory(DEFAULT_PROMPT_CATEGORY);
                    setNewPromptSubcategory(getPromptCategorySubcategories(DEFAULT_PROMPT_CATEGORY)[0] || '');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap ml-4"
                >
                  <Plus className="w-4 h-4" />
                  Novo Prompt
                </button>
              </div>

              {!selectedPromptCategory && searchPromptTerm ? (
                <div className="grid grid-cols-3 gap-4">
                  {(() => {
                    const results = prompts.filter(p =>
                      p.title.toLowerCase().includes(searchPromptTerm.toLowerCase()) ||
                      p.description.toLowerCase().includes(searchPromptTerm.toLowerCase()) ||
                      p.content.toLowerCase().includes(searchPromptTerm.toLowerCase())
                    );
                    if (results.length === 0) return (
                      <div className="col-span-3 py-16 text-center">
                        <Search className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">Nenhum prompt encontrado para "{searchPromptTerm}"</p>
                        <p className="text-sm text-gray-600 mt-1">Tenta outras palavras-chave</p>
                      </div>
                    );
                    return results.map(prompt => (
                      <div key={prompt.id} onClick={() => setSelectedPrompt(prompt)}
                        className="bg-[#151921] border border-gray-800/50 rounded-lg p-5 hover:border-gray-700 transition-colors cursor-pointer">
                        <span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 text-xs rounded uppercase font-medium">
                          {getPromptSubcategory(prompt) || getPromptCategory(prompt)}
                        </span>
                        <h3 className="text-white font-semibold mt-3 mb-2 text-base">{prompt.title}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">{prompt.description}</p>
                      </div>
                    ));
                  })()}
                </div>
              ) : !selectedPromptCategory && !searchPromptTerm ? (
                <div className="grid grid-cols-4 gap-4">
                  {promptMainCategories.map(category => (
                    <div
                      key={category}
                      onClick={() => {
                        setSelectedPromptCategory(category);
                        setSelectedPromptSubcategory(null);
                      }}
                      className="bg-[#151921] border border-gray-800/50 rounded-lg p-6 hover:border-blue-600 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-300">
                          <FileText className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-semibold text-gray-500">
                          {getCategoryCount(category, 'prompt')}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-lg">{category}</h3>
                    </div>
                  ))}
                </div>
              ) : selectedPromptCategory && !selectedPromptSubcategory && selectedPromptCategory !== 'Favoritos' && getPromptCategorySubcategories(selectedPromptCategory).length > 0 ? (
                <div className="grid grid-cols-4 gap-4">
                  {getPromptCategorySubcategories(selectedPromptCategory).map(subcategory => (
                    <div
                      key={subcategory}
                      onClick={() => setSelectedPromptSubcategory(subcategory)}
                      className="bg-[#151921] border border-gray-800/50 rounded-lg p-6 hover:border-blue-600 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-300">
                          <FileText className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-semibold text-gray-500">
                          {getPromptSubcategoryCount(selectedPromptCategory, subcategory)}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-lg">{subcategory}</h3>
                    </div>
                  ))}
                  {getPromptCategorySubcategories(selectedPromptCategory).length === 0 && (
                    <div className="col-span-4 text-center py-12">
                      <p className="text-gray-400">Nenhuma subcategoria encontrada</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {prompts.filter(prompt => {
                    let categoryMatch = true;

                    if (selectedPromptCategory === 'Favoritos') {
                      categoryMatch = prompt.favorite === true;
                    } else if (selectedPromptCategory && selectedPromptSubcategory) {
                      categoryMatch = getPromptCategory(prompt) === selectedPromptCategory && getPromptSubcategory(prompt) === selectedPromptSubcategory;
                    } else if (selectedPromptCategory) {
                      categoryMatch = getPromptCategory(prompt) === selectedPromptCategory;
                    }

                    const searchMatch = !searchPromptTerm ||
                      prompt.title.toLowerCase().includes(searchPromptTerm.toLowerCase()) ||
                      prompt.description.toLowerCase().includes(searchPromptTerm.toLowerCase()) ||
                      prompt.content.toLowerCase().includes(searchPromptTerm.toLowerCase());
                    return categoryMatch && searchMatch;
                  }).map(prompt => (
                    <div
                      key={prompt.id}
                      onClick={() => setSelectedPrompt(prompt)}
                      className="bg-[#151921] border border-gray-800/50 rounded-lg overflow-hidden hover:border-gray-700 transition-colors cursor-pointer relative"
                    >
                      {prompt.image && (
                        <div className="w-full h-48 overflow-hidden bg-gray-800">
                          <img src={prompt.image} alt={prompt.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 text-xs rounded uppercase font-medium">
                            {getPromptSubcategory(prompt) || getPromptCategory(prompt)}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite('prompt', prompt.id);
                              }}
                              className="text-gray-500 hover:text-yellow-400 transition-colors"
                            >
                              <Star className={`w-5 h-5 ${prompt.favorite === true ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </button>
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === `prompt-${prompt.id}` ? null : `prompt-${prompt.id}`);
                                }}
                                className="text-gray-500 hover:text-gray-300 transition-colors p-1"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {openMenuId === `prompt-${prompt.id}` && (
                                <div className="absolute right-0 top-8 bg-[#1a1f2e] border border-gray-800 rounded-lg shadow-xl z-10 py-1 min-w-[140px]">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit('prompt', prompt.id);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete('prompt', prompt.id);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Eliminar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <h3 className="text-white font-semibold mb-3 text-base">{prompt.title}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed mb-6">{prompt.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-3">
                            {prompt.models.map((model, idx) => (
                              <span key={idx} className="text-xs text-gray-500">{model}</span>
                            ))}
                          </div>
                          <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center gap-1">
                            Usar
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Workflows */}
          {!isLoading && currentView === 'workflows' && (
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
                <div className="flex gap-6">

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

                    {/* AI Generators — same card style as Biblioteca de IAs */}
                    <div className="grid grid-cols-3 gap-4">
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
                  <div className="w-72 flex-shrink-0">
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
                  <DesignAgentChat activeBrand={activeBrand} />
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
          )}
        </div>
      </div>

      {/* Modal: Adicionar Ferramenta */}
      {activeModal === 'ferramenta' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{editingToolId ? 'Editar Ferramenta' : 'Adicionar Novo'}</h2>
              <button onClick={() => {
                setActiveModal(null);
                setNewToolName('');
                setNewToolDescription('');
                setNewToolLink('');
                setNewToolCategory('Texto');
                setNewToolSubcategory('Copywriting');
                setNewToolIcon('sparkles');
                setNewToolBadges(['Free']);
                setNewToolTags('');
                setShowIconPicker(false);
                setEditingToolId(null);
              }} className="text-gray-400 hover:text-gray-300">
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
                    onClick={() => {
                      setActiveModal(null);
                      setNewToolName('');
                      setNewToolDescription('');
                      setNewToolLink('');
                      setNewToolCategory('Texto');
                      setNewToolSubcategory('Copywriting');
                      setNewToolBadges(['Free']);
                      setNewToolTags('');
                      setShowIconPicker(false);
                    }}
                    className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddTool}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editingToolId ? 'Salvar Alterações' : 'Adicionar Ferramenta'}
                  </button>
                </div>
                {toolFormError && (
                  <p className="text-sm text-red-400 text-center -mt-2">{toolFormError}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-4 mb-4 border-b border-gray-800">
                  <button
                    onClick={() => setCategoryTab('categoria')}
                    className={`px-4 py-2 ${categoryTab === 'categoria' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                  >
                    Categoria Principal
                  </button>
                  <button
                    onClick={() => setCategoryTab('subcategoria')}
                    className={`px-4 py-2 ${categoryTab === 'subcategoria' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                  >
                    Subcategorias
                  </button>
                </div>

                {categoryTab === 'categoria' ? (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Nome da Categoria</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ex: Produtividade"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddCategory();
                            }
                          }}
                          className="flex-1 bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
                        />
                        <button
                          onClick={handleAddCategory}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-3">Categorias Existentes</label>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {(activeModal === 'ferramenta' ? toolCategories : promptCategories)
                          .filter(cat => cat !== 'Todas' && cat !== 'Todos')
                          .map(cat => (
                            <div key={cat} className="flex items-center justify-between bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2.5">
                              <span className="text-white">{cat}</span>
                              {isProtectedCategory(
                                activeModal === 'ferramenta' ? 'tool' : 'prompt',
                                cat
                              ) ? (
                                <span className="text-xs text-gray-500">Base</span>
                              ) : (
                                <button
                                  onClick={() => handleDeleteCategory(
                                    activeModal === 'ferramenta' ? 'tool' : 'prompt',
                                    cat
                                  )}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        {(activeModal === 'ferramenta' ? toolCategories : promptCategories)
                          .filter(cat => cat !== 'Todas' && cat !== 'Todos').length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">Nenhuma categoria adicionada</p>
                          )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Categoria Principal</label>
                      <select
                        value={selectedCategoryForSubcategory}
                        onChange={(e) => setSelectedCategoryForSubcategory(e.target.value)}
                        className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 transition-colors mb-4"
                      >
                        {toolCategories.filter(cat => cat !== 'Todas').map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Nome da Subcategoria</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ex: Geração de Imagens"
                          value={newSubcategoryName}
                          onChange={(e) => setNewSubcategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddSubcategory();
                            }
                          }}
                          className="flex-1 bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
                        />
                        <button
                          onClick={handleAddSubcategory}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-3">Subcategorias de {selectedCategoryForSubcategory}</label>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {(subcategoriesMap[selectedCategoryForSubcategory] || []).map(subcat => (
                          <div key={subcat} className="flex items-center justify-between bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2.5">
                            <span className="text-white">{subcat}</span>
                            <button
                              onClick={() => handleDeleteSubcategory(selectedCategoryForSubcategory, subcat)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {(subcategoriesMap[selectedCategoryForSubcategory] || []).length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">Nenhuma subcategoria adicionada</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setNewCategoryName('');
                      setNewSubcategoryName('');
                      setCategoryTab('categoria');
                      setActiveTab('item');
                    }}
                    className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Adicionar Prompt */}
      {activeModal === 'prompt' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{editingPromptId ? 'Editar Prompt' : 'Adicionar Novo'}</h2>
              <button onClick={() => { setActiveModal(null); resetPromptForm(); }} className="text-gray-400 hover:text-gray-300">
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
                    onClick={() => { setActiveModal(null); resetPromptForm(); }}
                    className="px-4 py-2.5 bg-transparent text-gray-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddPrompt}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingPromptId ? 'Atualizar Prompt' : 'Guardar Prompt'}
                  </button>
                </div>
                {promptFormError && (
                  <p className="text-sm text-red-400 text-center -mt-2">{promptFormError}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-4 mb-4 border-b border-gray-800">
                  <button
                    onClick={() => setCategoryTab('categoria')}
                    className={`px-4 py-2 ${categoryTab === 'categoria' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                  >
                    Categoria Principal
                  </button>
                  <button
                    onClick={() => {
                      setCategoryTab('subcategoria');
                      setSelectedCategoryForSubcategory(newPromptCategory || PROMPT_ROOT_CATEGORY);
                    }}
                    className={`px-4 py-2 ${categoryTab === 'subcategoria' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                  >
                    Subcategorias
                  </button>
                </div>

                {categoryTab === 'categoria' ? (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Nome da Categoria</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ex: Produtividade"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddCategory();
                            }
                          }}
                          className="flex-1 bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
                        />
                        <button
                          onClick={handleAddCategory}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-3">Categorias Existentes</label>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {promptMainCategories
                          .filter(cat => cat !== 'Todas' && cat !== 'Todos')
                          .map(cat => (
                            <div key={cat} className="flex items-center justify-between bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2.5">
                              <span className="text-white">{cat}</span>
                              <button
                                onClick={() => handleDeleteCategory(
                                  activeModal === 'ferramenta' ? 'tool' :
                                    activeModal === 'prompt' ? 'prompt' : 'workflow',
                                  cat
                                )}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        {promptMainCategories
                          .filter(cat => cat !== 'Todas' && cat !== 'Todos').length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">Nenhuma categoria adicionada</p>
                          )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Categoria Principal</label>
                      <select
                        value={selectedCategoryForSubcategory}
                        onChange={(e) => setSelectedCategoryForSubcategory(e.target.value)}
                        className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 transition-colors mb-4"
                      >
                        {promptMainCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Nome da Subcategoria</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ex: Prompts para video"
                          value={newSubcategoryName}
                          onChange={(e) => setNewSubcategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddSubcategory();
                            }
                          }}
                          className="flex-1 bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
                        />
                        <button
                          onClick={handleAddSubcategory}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-3">Subcategorias de {selectedCategoryForSubcategory}</label>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {getPromptCategorySubcategories(selectedCategoryForSubcategory).map(subcat => (
                          <div key={subcat} className="flex items-center justify-between bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2.5">
                            <span className="text-white">{subcat}</span>
                            <button
                              onClick={() => handleDeleteSubcategory(selectedCategoryForSubcategory, subcat)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {getPromptCategorySubcategories(selectedCategoryForSubcategory).length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">Nenhuma subcategoria adicionada</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setNewCategoryName('');
                      setActiveTab('item');
                    }}
                    className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


{/* Modal: Visualizar Prompt */}
      {selectedPrompt && (() => {
        const sections = parsePromptContent(selectedPrompt.content);
        const promptText = sections['Prompt'] || selectedPrompt.content.trim();

        // Source of truth: unique [campos] detected from the prompt text
        const promptFields = [...new Set([...promptText.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]))];

        // Build the resolved prompt: replace [campo] with typed value or keep original
        const resolvedPrompt = promptText.replace(/\[([^\]]+)\]/g, (_, field) =>
          fieldValues[field] || `[${field}]`
        );

        // Count unfilled fields
        const unfilledCount = promptFields.filter(f => !fieldValues[f]?.trim()).length;
        const allFilled = unfilledCount === 0;

        // Render the preview: filled fields = normal text, unfilled = amber highlight
        const renderPreview = (text: string) =>
          text.split(/(\[[^\]]+\])/).map((part, i) => {
            const match = part.match(/^\[([^\]]+)\]$/);
            if (!match) return <span key={i}>{part}</span>;
            const fieldName = match[1];
            const filled = fieldValues[fieldName]?.trim();
            return filled
              ? <span key={i} className="text-white">{filled}</span>
              : <span key={i} className="text-amber-400 bg-amber-500/10 rounded px-0.5">{part}</span>;
          });

        const detailSections = (['Inputs a preencher', 'Restrições obrigatórias', 'Output esperado', 'Variações'] as const)
          .filter(k => sections[k]?.trim());

        const handleClose = () => { setSelectedPrompt(null); setCopied(false); };

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

              {/* Header */}
              <div className="px-6 pt-6 pb-5 border-b border-gray-800/60">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-[11px] rounded-md uppercase font-semibold tracking-wide">
                        {getPromptSubcategory(selectedPrompt) || getPromptCategory(selectedPrompt)}
                      </span>
                      {selectedPrompt.models.filter(Boolean).map((model, idx) => (
                        <span key={idx} className="text-[11px] text-gray-500 font-mono">{model}</span>
                      ))}
                    </div>
                    <h2 className="text-lg font-semibold text-white leading-snug">{selectedPrompt.title}</h2>
                    {selectedPrompt.description && (
                      <p className="text-sm text-gray-400 mt-1 leading-relaxed">{selectedPrompt.description}</p>
                    )}
                  </div>
                  <button onClick={handleClose} className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0 mt-0.5">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                {/* Quando usar */}
                {sections['Quando usar'] && (
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-1.5">Quando usar</p>
                    <p className="text-sm text-gray-400 leading-relaxed">{sections['Quando usar']}</p>
                  </div>
                )}

                {/* Campos a preencher — inputs editáveis */}
                {promptFields.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">Campos a preencher</p>
                      {Object.values(fieldValues).some(v => v.trim()) && (
                        <button
                          onClick={() => setFieldValues({})}
                          className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {promptFields.map(field => (
                        <div key={field} className="flex items-center gap-3">
                          <label className="text-xs text-amber-400 font-mono w-36 flex-shrink-0 truncate" title={field}>
                            [{field}]
                          </label>
                          <input
                            type="text"
                            value={fieldValues[field] ?? ''}
                            onChange={e => setFieldValues(prev => ({ ...prev, [field]: e.target.value }))}
                            placeholder={`Preenche ${field}…`}
                            className="flex-1 bg-[#0c1018] border border-gray-700/60 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prompt preview */}
                <div className="bg-[#0c1018] border border-gray-700/60 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700/40">
                    <span className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">
                      {promptFields.length > 0 ? 'Preview' : 'Prompt'}
                    </span>
                    <span className="text-[11px] text-gray-600">{resolvedPrompt.length} chars</span>
                  </div>
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono leading-relaxed p-5">
                    {renderPreview(resolvedPrompt)}
                  </pre>
                </div>

                {/* Collapsible details */}
                {detailSections.length > 0 && (
                  <div className="border border-gray-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowPromptDetails(v => !v)}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-800/30 transition-colors"
                    >
                      <span className="text-sm text-gray-400 font-medium">
                        {showPromptDetails ? 'Ocultar detalhes' : 'Ver mais detalhes'}
                      </span>
                      <span className={`text-gray-500 transition-transform duration-200 ${showPromptDetails ? 'rotate-180' : ''}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </span>
                    </button>
                    {showPromptDetails && (
                      <div className="divide-y divide-gray-800/60 border-t border-gray-800">
                        {detailSections.map(k => (
                          <div key={k} className="px-5 py-4">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">{k}</p>
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{sections[k]}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-800/60 flex items-center justify-between gap-4">
                {!allFilled && promptFields.length > 0 ? (
                  <span className="text-[11px] text-gray-500">
                    {unfilledCount} {unfilledCount === 1 ? 'campo por preencher' : 'campos por preencher'}
                  </span>
                ) : (
                  <span />
                )}
                <button
                  onClick={() => copyPromptToClipboard(resolvedPrompt)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors text-sm font-semibold shadow-lg shadow-blue-600/20"
                >
                  {copied
                    ? <><Check className="w-4 h-4" />Copiado!</>
                    : <><Copy className="w-4 h-4" />Copiar Prompt</>}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Modal: Confirmar Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-white mb-3">Eliminar item?</h2>
            <p className="text-sm text-gray-400 mb-6">Esta ação não pode ser desfeita.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
