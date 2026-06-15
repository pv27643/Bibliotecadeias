import { useState, useEffect, useMemo } from 'react';
import { Zap, Workflow, FileText, Library, Plus, X, Sparkles, Layout, Box, Smartphone, ClipboardList, Linkedin, Mail, BarChart3, Edit, Trash2, Star, ArrowLeft, Search, MoreVertical, Clock, ArrowRight, CheckCircle2, Check, Copy, MessageSquare, Circle, Video, Image, PenTool, Settings } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useApp } from '../hooks/useApp';
import { getCategoryIcon, getWorkflowIcon, getToolIcon } from '../utils/iconHelpers';
import { supabase } from '../utils/supabase/client';
import ImageUpload from './components/ImageUpload';
import BrandPostGenerator from './components/BrandPostGenerator';
import WorkflowExecutor from './components/WorkflowExecutor';
import N8nConfigModal from './components/N8nConfigModal';
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
import {
  loadToolsFromSupabase,
  loadPromptsFromSupabase,
  loadWorkflowsFromSupabase,
  loadFavoritesFromSupabase,
  syncToolsToSupabase,
  syncPromptsToSupabase,
  syncWorkflowsToSupabase,
  syncCategoriesToSupabase,
  syncSubcategoriesToSupabase,
  loadToolCategoriesWithDefaults,
  loadPromptCategoriesWithDefaults,
  loadWorkflowCategoriesWithDefaults,
  loadSubcategoriesWithDefaults,
  migrateLocalStorageToSupabase,
  clearLocalStorageForSupabase,
  addFavoriteToSupabase,
  removeFavoriteFromSupabase,
} from '../utils/supabase/sync';

type View = 'biblioteca' | 'prompts' | 'workflows';
type Modal = 'categoria' | 'ferramenta' | 'prompt' | 'workflow' | null;
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
  inputs?: any[];
  image?: string;
  favorite?: boolean;
}

export default function App() {

  const {
    tools, setTools,
    prompts, setPrompts,
    workflows, setWorkflows,
    toolCategories, setToolCategories,
    promptCategories, setPromptCategories,
    workflowCategories, setWorkflowCategories,
    subcategoriesMap, setSubcategoriesMap,
    saveTools, savePrompts, saveWorkflows,
    saveCategories, saveSubcategories,
    toggleFavorite, getFavoritesCount
  } = useApp();

  // UI state - kept local to App
  const [currentView, setCurrentView] = useState<View>('biblioteca');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'tool' | 'prompt' | 'workflow'; id: string } | null>(null);

  // Editing / modal state
  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  const [newToolName, setNewToolName] = useState('');
  const [newToolDescription, setNewToolDescription] = useState('');
  const [newToolLink, setNewToolLink] = useState('');
  const [newToolCategory, setNewToolCategory] = useState('Texto');
  const [newToolSubcategory, setNewToolSubcategory] = useState<string | undefined>('Copywriting');
  const [newToolIcon, setNewToolIcon] = useState('sparkles');
  const [newToolBadges, setNewToolBadges] = useState<string[]>(['Free']);
  const [newToolTags, setNewToolTags] = useState('');

  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptDescription, setNewPromptDescription] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [newPromptImage, setNewPromptImage] = useState('');
  const [newPromptCategory, setNewPromptCategory] = useState(DEFAULT_PROMPT_CATEGORY);
  const [newPromptSubcategory, setNewPromptSubcategory] = useState<string | undefined>('');
  const [newPromptModels, setNewPromptModels] = useState('ChatGPT');

  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [newWorkflowTitle, setNewWorkflowTitle] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');
  const [newWorkflowImage, setNewWorkflowImage] = useState('');
  const [newWorkflowCategory, setNewWorkflowCategory] = useState('Marketing');
  const [newWorkflowWebhookUrl, setNewWorkflowWebhookUrl] = useState('');
  const [newWorkflowInputs, setNewWorkflowInputs] = useState<any[]>([]);

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

  const [selectedWorkflowCategory, setSelectedWorkflowCategory] = useState<string | null>(null);
  const [searchWorkflowTerm, setSearchWorkflowTerm] = useState('');
  const [showN8nConfig, setShowN8nConfig] = useState(false);
  const [showBrandGenerator, setShowBrandGenerator] = useState(false);
  const [executingWorkflow, setExecutingWorkflow] = useState<WorkflowType | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [categoryTab, setCategoryTab] = useState<'categoria' | 'subcategoria'>('categoria');
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] = useState<string>('');

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
  const getProtectedCategories = (type: 'tool' | 'prompt' | 'workflow') => (
    type === 'tool'
      ? PROTECTED_TOOL_CATEGORIES
      : type === 'prompt'
        ? PROTECTED_PROMPT_CATEGORIES
        : PROTECTED_WORKFLOW_CATEGORIES
  );
  const isProtectedCategory = (type: 'tool' | 'prompt' | 'workflow', category: string) =>
    getProtectedCategories(type).includes(category);

  useEffect(() => {
    if (!selectedCategoryForSubcategory) {
      const availableCategories = activeModal === 'prompt' ? promptMainCategories : toolCategories;
      const defaultCategory = availableCategories.find(cat => cat !== 'Todas' && cat !== 'Todos') || availableCategories[0];
      setSelectedCategoryForSubcategory(defaultCategory);
    }
  }, [activeModal, promptMainCategories, toolCategories, selectedCategoryForSubcategory]);

  // Guardar tools, prompts e workflows no localStorage sempre que mudarem
  // Removida persistência local de tools/prompts/workflows. Supabase agora é a fonte de verdade para esses dados.

  const getCategoryCount = (category: string, type: 'tool' | 'prompt' | 'workflow') => {
    if (type === 'tool') {
      return tools.filter(tool => tool.category === category).length;
    } else if (type === 'prompt') {
      return prompts.filter(prompt => getPromptCategory(prompt) === category).length;
    } else {
      return workflows.filter(workflow => workflow.category === category).length;
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

  

  const executeWorkflow = (workflow: WorkflowType) => {
    const normalizedWorkflow = normalizeWorkflowWebhook(workflow);

    // Workflow especial: Brand Post Generator — mantém modal dedicado
    if (normalizedWorkflow.id === 'brand-post-generator') {
      setShowBrandGenerator(true);
      setExecutingWorkflow(normalizedWorkflow);
      return;
    }

    // Workflow com formulário n8n externo (abre em nova aba)
    if (normalizedWorkflow.id === '5') {
      window.open('https://ivannnnnn.app.n8n.cloud/webhook/generate-product-photo', '_blank');
      return;
    }

    // Para todos os outros: abre o WorkflowExecutor real
    setExecutingWorkflow(normalizedWorkflow);
  };

  const copyPromptToClipboard = (content: string) => {
    try {
      // Filtrar linhas: remover "Model:" e "Casos de Uso:"
      const lines = content.split('\n');
      const filteredLines = lines.filter(line => {
        const trimmed = line.trim();
        return !trimmed.startsWith('Model:') && !trimmed.startsWith('Casos de Uso:');
      });
      const filteredContent = filteredLines.join('\n').trim();

      // Método alternativo que funciona mesmo quando a API está bloqueada
      const textarea = document.createElement('textarea');
      textarea.value = filteredContent;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  // Upload de imagem para Supabase Storage
  const uploadImageToSupabase = async (base64Image: string): Promise<string | null> => {
    try {
      console.log('📤 Iniciando upload para Supabase...');

      // Converter base64 para Blob
      const base64Data = base64Image.split(',')[1];
      const mimeType = base64Image.split(',')[0].split(':')[1].split(';')[0];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      // Gerar nome único para o ficheiro
      const fileName = `prompt-${Date.now()}-${Math.random().toString(36).substring(7)}.${mimeType.split('/')[1]}`;

      console.log('📦 Tamanho do ficheiro:', (blob.size / 1024 / 1024).toFixed(2), 'MB');

      // Fazer upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from('prompt-images')
        .upload(fileName, blob, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Erro ao fazer upload:', error);
        return null;
      }

      // Obter URL pública da imagem
      const { data: publicUrlData } = supabase.storage
        .from('prompt-images')
        .getPublicUrl(fileName);

      console.log('✅ Imagem guardada:', publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('❌ Erro ao processar imagem:', error);
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

  const handleDelete = (type: 'tool' | 'prompt' | 'workflow', id: string) => {
    setShowDeleteConfirm({ type, id });
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;

    const { type, id } = showDeleteConfirm;

    if (type === 'tool') {
      const updatedTools = tools.filter(t => t.id !== id);
      setTools(updatedTools);
      await saveTools(updatedTools);
      // Limpar localStorage para evitar que reapareza após npm run dev
      localStorage.setItem('tools', JSON.stringify(updatedTools));
    } else if (type === 'prompt') {
      const updatedPrompts = prompts.filter(p => p.id !== id);
      setPrompts(updatedPrompts);
      await savePrompts(updatedPrompts);
      // Limpar localStorage para evitar que reapareza após npm run dev
      localStorage.setItem('prompts', JSON.stringify(updatedPrompts));
    } else if (type === 'workflow') {
      const updatedWorkflows = workflows.filter(w => w.id !== id);
      setWorkflows(updatedWorkflows);
      await saveWorkflows(updatedWorkflows);
      // Limpar localStorage para evitar que reapareza após npm run dev
      localStorage.setItem('workflows', JSON.stringify(updatedWorkflows));
    }

    setShowDeleteConfirm(null);
  };

  const handleEdit = (type: 'tool' | 'prompt' | 'workflow', id: string) => {
    setOpenMenuId(null);

    if (type === 'prompt') {
      const prompt = prompts.find(p => p.id === id);
      if (prompt) {
        setEditingPromptId(id);
        setNewPromptTitle(prompt.title);
        setNewPromptDescription(prompt.description);
        setNewPromptContent(prompt.content);
        setNewPromptImage(prompt.image || '');
        setNewPromptCategory(getPromptCategory(prompt));
        setNewPromptSubcategory(getPromptSubcategory(prompt) || getPromptCategorySubcategories(getPromptCategory(prompt))[0] || '');
        setNewPromptModels(prompt.models.join(', '));
        setActiveModal('prompt');
        setActiveTab('item');
      }
    } else if (type === 'workflow') {
      const workflow = workflows.find(w => w.id === id);
      if (workflow) {
        setEditingWorkflowId(id);
        setNewWorkflowTitle(workflow.title);
        setNewWorkflowDescription(workflow.description);
        setNewWorkflowImage(workflow.image || '');
        setNewWorkflowCategory(workflow.category);
        setNewWorkflowWebhookUrl(workflow.webhookUrl || '');
        setNewWorkflowInputs(workflow.inputs || []);
        setActiveModal('workflow');
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
    } else if (activeModal === 'workflow') {
      if (!workflowCategories.includes(categoryName)) {
        const updated = [...workflowCategories, categoryName];
        setWorkflowCategories(updated);
        await saveCategories('workflow', updated);
      }
    }

    setNewCategoryName('');
  };

  const handleDeleteCategory = async (type: 'tool' | 'prompt' | 'workflow', categoryName: string) => {
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
    } else if (type === 'workflow') {
      const updated = workflowCategories.filter(cat => cat !== categoryName);
      setWorkflowCategories(updated);
      await saveCategories('workflow', updated);
      if (selectedWorkflowCategory === categoryName) {
        setSelectedWorkflowCategory(null);
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
    if (!newToolName.trim() || !newToolDescription.trim()) {
      alert('Por favor, preencha o nome e a descrição');
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
    setNewToolCategory('Texto');
    setNewToolSubcategory('Copywriting');
    setNewToolIcon('sparkles');
    setNewToolBadges(['Free']);
    setNewToolTags('');
    setShowIconPicker(false);
    setEditingToolId(null);
    setActiveModal(null);
  };

  const handleAddPrompt = async () => {
    if (!newPromptTitle.trim() || !newPromptDescription.trim() || !newPromptContent.trim()) {
      alert('Por favor, preencha o título, descrição e conteúdo');
      return;
    }

    if (!newPromptModels.trim()) {
      alert('Por favor, indique pelo menos uma IA/modelo');
      return;
    }

    const modelsArray = newPromptModels.split(',').map(m => m.trim()).filter(m => m.length > 0);

    // Upload de imagem para Supabase se existir e for base64
    let imageUrl = newPromptImage;
    if (newPromptImage && newPromptImage.startsWith('data:')) {
      console.log('📸 Imagem detectada, enviando para Supabase Storage...');
      const uploadedUrl = await uploadImageToSupabase(newPromptImage);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
        console.log('✅ URL da imagem:', uploadedUrl);
      } else {
        console.warn('⚠️ Falha no upload. A imagem não será guardada.');
        alert('Erro ao fazer upload da imagem para o Supabase. Verifica se o bucket "prompt-images" foi criado e é público.');
        imageUrl = ''; // Limpar imagem se falhar
      }
    }

    let updatedPrompts;

    if (editingPromptId) {
      // Modo edição: atualizar prompt existente
      updatedPrompts = prompts.map(p =>
        p.id === editingPromptId
          ? {
            ...p,
            title: newPromptTitle,
            description: newPromptDescription,
            category: newPromptCategory,
            subcategory: newPromptSubcategory || undefined,
            models: modelsArray,
            content: newPromptContent,
            image: imageUrl || undefined
          }
          : p
      );
    } else {
      // Modo criação: adicionar novo prompt
      const newPrompt: Prompt = {
        id: Date.now().toString(),
        title: newPromptTitle,
        description: newPromptDescription,
        category: newPromptCategory,
        subcategory: newPromptSubcategory || undefined,
        models: modelsArray,
        content: newPromptContent,
        image: imageUrl || undefined,
        favorite: false
      };
      updatedPrompts = [...prompts, newPrompt];
    }

    setPrompts(updatedPrompts);
    await savePrompts(updatedPrompts);

    // Limpar form
    setNewPromptTitle('');
    setNewPromptDescription('');
    setNewPromptContent('');
    setNewPromptImage('');
    setNewPromptCategory(DEFAULT_PROMPT_CATEGORY);
    setNewPromptSubcategory('');
    setNewPromptModels('ChatGPT, Claude');
    setEditingPromptId(null);
    setActiveModal(null);
  };

  const handleAddWorkflow = async () => {
    if (!newWorkflowTitle.trim() || !newWorkflowDescription.trim()) {
      alert('Por favor, preencha o título e a descrição');
      return;
    }

    // Upload de imagem para Supabase se existir e for base64
    let imageUrl = newWorkflowImage;
    if (newWorkflowImage && newWorkflowImage.startsWith('data:')) {
      console.log('📸 Imagem detectada, enviando para Supabase Storage...');
      const uploadedUrl = await uploadImageToSupabase(newWorkflowImage);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
        console.log('✅ URL da imagem:', uploadedUrl);
      } else {
        console.warn('⚠️ Falha no upload. A imagem não será guardada.');
        alert('Erro ao fazer upload da imagem para o Supabase. Verifica se o bucket "prompt-images" foi criado e é público.');
        imageUrl = '';
      }
    }

    let updatedWorkflows;

    if (editingWorkflowId) {
      // Modo edição: atualizar workflow existente
      updatedWorkflows = workflows.map(w =>
        w.id === editingWorkflowId
          ? {
            ...w,
            title: newWorkflowTitle,
            description: newWorkflowDescription,
            category: newWorkflowCategory,
            webhookUrl: newWorkflowWebhookUrl.trim() || undefined,
            image: imageUrl || undefined,
            inputs: newWorkflowInputs.length > 0 ? newWorkflowInputs : undefined,
          }
          : w
      );
    } else {
      // Modo criação: adicionar novo workflow
      const newWorkflow: WorkflowType = {
        id: Date.now().toString(),
        title: newWorkflowTitle,
        description: newWorkflowDescription,
        category: newWorkflowCategory,
        steps: [],
        image: imageUrl || undefined,
        webhookUrl: newWorkflowWebhookUrl.trim() || undefined,
        inputs: newWorkflowInputs.length > 0 ? newWorkflowInputs : undefined,
        favorite: false
      };
      updatedWorkflows = [...workflows, newWorkflow];
    }

    setWorkflows(updatedWorkflows);
    await saveWorkflows(updatedWorkflows);

    // Limpar form
    setNewWorkflowTitle('');
    setNewWorkflowDescription('');
    setNewWorkflowImage('');
    setNewWorkflowCategory('Marketing');
    setNewWorkflowWebhookUrl('');
    setNewWorkflowInputs([]);
    setEditingWorkflowId(null);
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
          {/* Biblioteca de IAs */}
          {currentView === 'biblioteca' && (
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
                  {selectedSubcategory && (
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Pesquisar ferramentas..."
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
                    setNewToolCategory('Texto');
                    setNewToolSubcategory('Copywriting');
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

              {!selectedCategory && !searchTerm ? (
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

                      if (selectedCategory === 'Favoritos') {
                        // Removed debug logs for cleaner output
                      }

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
          {currentView === 'prompts' && (
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
                  {(selectedPromptSubcategory || selectedPromptCategory === 'Favoritos' || (selectedPromptCategory && getPromptCategorySubcategories(selectedPromptCategory).length === 0)) && (
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Pesquisar prompts..."
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

              {!selectedPromptCategory && !searchPromptTerm ? (
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
          {currentView === 'workflows' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-semibold mb-2">Workflows</h1>
                <p className="text-gray-400">Automatize tarefas combinando múltiplas ferramentas de IA em cadeia.</p>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2 items-center flex-1">
                  {selectedWorkflowCategory ? (
                    <button
                      onClick={() => {
                        setSelectedWorkflowCategory(null);
                        setSearchWorkflowTerm('');
                      }}
                      className="px-4 py-2 rounded-lg transition-colors bg-gray-800/50 text-gray-400 hover:bg-gray-800 flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedWorkflowCategory('Favoritos')}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedWorkflowCategory === 'Favoritos'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                        }`}
                    >
                      <Star className="w-4 h-4" />
                      Favoritos ({getFavoritesCount('workflow')})
                    </button>
                  )}
                  {selectedWorkflowCategory && (
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Pesquisar workflows..."
                        value={searchWorkflowTerm}
                        onChange={(e) => setSearchWorkflowTerm(e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors"
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setActiveModal('workflow');
                    setActiveTab('item');
                    setEditingWorkflowId(null);
                    setNewWorkflowTitle('');
                    setNewWorkflowDescription('');
                    setNewWorkflowImage('');
                    setNewWorkflowCategory('Marketing');
                    setNewWorkflowWebhookUrl('');
                    setNewWorkflowInputs([]);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap ml-4"
                >
                  <Plus className="w-4 h-4" />
                  Novo Workflow
                </button>
                <button
                  onClick={() => setShowN8nConfig(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
                  title="Configurar URL base do N8N para os 3 workflows"
                >
                  <Settings className="w-4 h-4" />
                  Configurar N8N
                </button>
              </div>

              {!selectedWorkflowCategory && !searchWorkflowTerm ? (
                <div className="grid grid-cols-4 gap-4">
                  {workflowCategories.filter(cat => cat !== 'Todos').map(category => (
                    <div
                      key={category}
                      onClick={() => setSelectedWorkflowCategory(category)}
                      className="bg-[#151921] border border-gray-800/50 rounded-lg p-6 hover:border-blue-600 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-300">
                          <Workflow className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-semibold text-gray-500">
                          {getCategoryCount(category, 'workflow')}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-lg">{category}</h3>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {workflows.filter(workflow => {
                    const categoryMatch = selectedWorkflowCategory === 'Favoritos' ? workflow.favorite === true : workflow.category === selectedWorkflowCategory;
                    const searchMatch = !searchWorkflowTerm ||
                      workflow.title.toLowerCase().includes(searchWorkflowTerm.toLowerCase()) ||
                      workflow.description.toLowerCase().includes(searchWorkflowTerm.toLowerCase());
                    return categoryMatch && searchMatch;
                  }).map(workflow => (
                    <div key={workflow.id} className="bg-[#151921] border border-gray-800/50 rounded-lg overflow-hidden hover:border-gray-700 transition-colors relative">
                      {workflow.image && (
                        <div className="w-full h-48 overflow-hidden bg-gray-800">
                          <img src={workflow.image} alt={workflow.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="mb-4 flex items-start justify-between">
                          <span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 text-xs rounded uppercase font-medium">
                            {workflow.category}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite('workflow', workflow.id);
                              }}
                              className="text-gray-500 hover:text-yellow-400 transition-colors"
                            >
                              <Star className={`w-5 h-5 ${workflow.favorite === true ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </button>
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === `workflow-${workflow.id}` ? null : `workflow-${workflow.id}`);
                                }}
                                className="text-gray-500 hover:text-gray-300 transition-colors p-1"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {openMenuId === `workflow-${workflow.id}` && (
                                <div className="absolute right-0 top-8 bg-[#1a1f2e] border border-gray-800 rounded-lg shadow-xl z-10 py-1 min-w-[140px]">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit('workflow', workflow.id);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete('workflow', workflow.id);
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
                        <h3 className="text-white font-semibold mb-2 text-base">{workflow.title}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed mb-6">{workflow.description}</p>
                        <div className="flex items-center gap-3 mb-6">
                          {workflow.steps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-400">
                                {getWorkflowIcon(step.icon, 'sm')}
                              </div>
                              {idx < workflow.steps.length - 1 && (
                                <ArrowRight className="w-3 h-3 text-gray-600" />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-500">Ativo</span>
                          </div>
                          <button
                            onClick={() => executeWorkflow(workflow)}
                            className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center gap-1"
                          >
                            Executar
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
                        {(activeModal === 'ferramenta' ? toolCategories :
                          activeModal === 'prompt' ? promptCategories : workflowCategories)
                          .filter(cat => cat !== 'Todas' && cat !== 'Todos')
                          .map(cat => (
                            <div key={cat} className="flex items-center justify-between bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2.5">
                              <span className="text-white">{cat}</span>
                              {isProtectedCategory('prompt', cat) ? (
                                <span className="text-xs text-gray-500">Base</span>
                              ) : (
                                <button
                                  onClick={() => handleDeleteCategory('prompt', cat)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        {(activeModal === 'ferramenta' ? toolCategories :
                          activeModal === 'prompt' ? promptCategories : workflowCategories)
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
              <button onClick={() => {
                setActiveModal(null);
                setNewPromptTitle('');
                setNewPromptDescription('');
                setNewPromptContent('');
                setNewPromptImage('');
                setNewPromptCategory(DEFAULT_PROMPT_CATEGORY);
                setNewPromptSubcategory('');
                setNewPromptModels('ChatGPT, Claude');
                setEditingPromptId(null);
              }} className="text-gray-400 hover:text-gray-300">
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
                  <label className="block text-sm text-gray-400 mb-1.5">Descrição</label>
                  <textarea
                    placeholder="Breve descrição do que este prompt faz..."
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
                  <label className="block text-sm text-gray-400 mb-1.5">Conteúdo do Prompt</label>
                  <div className="text-xs text-gray-500 mb-1">Use [VARIÁVEL] para criar campos dinâmicos</div>
                  <textarea
                    placeholder="Atue como um programador sênior. Refatore a seguinte função em Python para melhorar a legibilidade e performance: [CÓDIGO]"
                    rows={4}
                    value={newPromptContent}
                    onChange={(e) => setNewPromptContent(e.target.value)}
                    className="w-full bg-[#0f1420] border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 resize-none font-mono text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setNewPromptTitle('');
                      setNewPromptDescription('');
                      setNewPromptContent('');
                      setNewPromptImage('');
                      setNewPromptCategory(DEFAULT_PROMPT_CATEGORY);
                      setNewPromptSubcategory('');
                      setNewPromptModels('ChatGPT, Claude');
                      setEditingPromptId(null);
                    }}
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

      {/* Modal: Adicionar Workflow */}
      {activeModal === 'workflow' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Adicionar Novo</h2>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setNewWorkflowTitle('');
                  setNewWorkflowDescription('');
                  setNewWorkflowImage('');
                  setNewWorkflowCategory('Marketing');
                  setNewWorkflowWebhookUrl('');
                  setNewWorkflowInputs([]);
                  setEditingWorkflowId(null);
                }}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4 mb-6 border-b border-gray-800">
              <button
                onClick={() => setActiveTab('item')}
                className={`px-4 py-2 ${activeTab === 'item' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                Workflow
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
                  <label className="block text-sm text-gray-400 mb-1.5">Título</label>
                  <input
                    type="text"
                    placeholder="Ex: Análise de Dados Automatizada"
                    value={newWorkflowTitle}
                    onChange={(e) => setNewWorkflowTitle(e.target.value)}
                    className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Descrição</label>
                  <textarea
                    placeholder="Descreva o que este workflow faz..."
                    rows={2}
                    value={newWorkflowDescription}
                    onChange={(e) => setNewWorkflowDescription(e.target.value)}
                    className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Imagem (opcional)</label>
                  <ImageUpload
                    onImageUpload={setNewWorkflowImage}
                    currentImage={newWorkflowImage}
                    maxSizeMB={50}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Categoria</label>
                  <select
                    value={newWorkflowCategory}
                    onChange={(e) => setNewWorkflowCategory(e.target.value)}
                    className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 transition-colors">
                    {workflowCategories.filter(cat => cat !== 'Todos').map(cat => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Webhook URL n8n</label>
                  <input
                    type="url"
                    placeholder="https://ivannnnnn.app.n8n.cloud/webhook/e5fdf70f-c650-4822-9095-e86e1e8f9746"
                    value={newWorkflowWebhookUrl}
                    onChange={(e) => setNewWorkflowWebhookUrl(e.target.value)}
                    className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors font-mono text-sm"
                  />
                </div>

                <div className="rounded-2xl border border-gray-800/60 bg-[#141a2c] p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-white">Campos do formulário</p>
                      <p className="text-xs text-gray-500">Defina os campos que o webhook vai receber no POST.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewWorkflowInputs(prev => [...prev, { name: 'message', label: 'Mensagem', type: 'textarea', required: true }])}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                    >
                      + Adicionar campo
                    </button>
                  </div>

                  {newWorkflowInputs.length === 0 ? (
                    <p className="text-sm text-gray-500">Se deixar vazio, o workflow usará o campo padrão <code className="bg-gray-800 px-1 py-0.5 rounded">message</code>.</p>
                  ) : (
                    <div className="space-y-4">
                      {newWorkflowInputs.map((input, index) => (
                        <div key={`${input.name}-${index}`} className="rounded-xl border border-gray-800/50 bg-[#0f1420] p-4 space-y-3">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                            <div className="flex-1 space-y-3">
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Nome do campo</label>
                                <input
                                  type="text"
                                  value={input.name}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\s+/g, '_');
                                    setNewWorkflowInputs(prev => prev.map((item, idx) => idx === index ? { ...item, name: value } : item));
                                  }}
                                  className="w-full bg-[#141a2c] border border-gray-800/60 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600"
                                  placeholder="message"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Rótulo</label>
                                <input
                                  type="text"
                                  value={input.label}
                                  onChange={(e) => setNewWorkflowInputs(prev => prev.map((item, idx) => idx === index ? { ...item, label: e.target.value } : item))}
                                  className="w-full bg-[#141a2c] border border-gray-800/60 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600"
                                  placeholder="Mensagem"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Tipo</label>
                                <select
                                  value={input.type}
                                  onChange={(e) => setNewWorkflowInputs(prev => prev.map((item, idx) => idx === index ? { ...item, type: e.target.value as WorkflowInput['type'], options: e.target.value === 'select' ? item.options ?? [] : undefined, maxImages: e.target.value === 'image' ? item.maxImages ?? 1 : undefined } : item))}
                                  className="w-full bg-[#141a2c] border border-gray-800/60 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600"
                                >
                                  <option value="text">Texto</option>
                                  <option value="textarea">Texto longo</option>
                                  <option value="select">Seleção</option>
                                  <option value="email">Email</option>
                                  <option value="image">Imagem</option>
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  id={`required-${index}`}
                                  type="checkbox"
                                  checked={input.required || false}
                                  onChange={(e) => setNewWorkflowInputs(prev => prev.map((item, idx) => idx === index ? { ...item, required: e.target.checked } : item))}
                                  className="h-4 w-4 text-blue-600 rounded border-gray-600 bg-gray-900"
                                />
                                <label htmlFor={`required-${index}`} className="text-sm text-gray-300">Obrigatório</label>
                              </div>
                            </div>
                          </div>

                          {input.type === 'select' && (
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Opções (separadas por vírgula)</label>
                              <input
                                type="text"
                                value={(input.options || []).join(', ')}
                                onChange={(e) => setNewWorkflowInputs(prev => prev.map((item, idx) => idx === index ? { ...item, options: e.target.value.split(',').map(opt => opt.trim()).filter(Boolean) } : item))}
                                className="w-full bg-[#141a2c] border border-gray-800/60 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600"
                                placeholder="opção 1, opção 2"
                              />
                            </div>
                          )}

                          {input.type === 'image' && (
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Máx. imagens</label>
                              <input
                                type="number"
                                min={1}
                                max={10}
                                value={input.maxImages ?? 1}
                                onChange={(e) => setNewWorkflowInputs(prev => prev.map((item, idx) => idx === index ? { ...item, maxImages: Number(e.target.value) || 1 } : item))}
                                className="w-32 bg-[#141a2c] border border-gray-800/60 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600"
                              />
                            </div>
                          )}

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => setNewWorkflowInputs(prev => prev.filter((_, idx) => idx !== index))}
                              className="px-3 py-2 rounded-lg bg-red-700 text-white text-sm hover:bg-red-600 transition-colors"
                            >
                              Remover campo
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Ferramentas</label>
                  <div className="text-xs text-gray-500 mb-1">Selecione as ferramentas que compõem este workflow</div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-full flex items-center gap-1">
                      ChatGPT
                      <X className="w-3 h-3 cursor-pointer hover:text-gray-300" />
                    </span>
                    <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-sm rounded-full hover:bg-gray-700">
                      + Adicionar
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setNewWorkflowTitle('');
                      setNewWorkflowDescription('');
                      setNewWorkflowImage('');
                      setNewWorkflowCategory('Marketing');
                      setNewWorkflowWebhookUrl('');
                      setNewWorkflowInputs([]);
                      setEditingWorkflowId(null);
                    }}
                    className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddWorkflow}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editingWorkflowId ? 'Guardar Alterações' : 'Criar Workflow'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
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
                    {(activeModal === 'ferramenta' ? toolCategories :
                      activeModal === 'prompt' ? promptCategories : workflowCategories)
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
                    {(activeModal === 'ferramenta' ? toolCategories :
                      activeModal === 'prompt' ? promptCategories : workflowCategories)
                      .filter(cat => cat !== 'Todas' && cat !== 'Todos').length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">Nenhuma categoria adicionada</p>
                      )}
                  </div>
                </div>

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

      {/* Modal: Workflow Executor (n8n real) */}
      {executingWorkflow && !showBrandGenerator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <WorkflowExecutor
              workflow={executingWorkflow}
              onClose={() => setExecutingWorkflow(null)}
            />
          </div>
        </div>
      )}

      {/* Modal: Visualizar Prompt */}
      {selectedPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 text-xs rounded uppercase font-medium">
                      {getPromptSubcategory(selectedPrompt) || getPromptCategory(selectedPrompt)}
                    </span>
                    <div className="flex gap-2">
                      {selectedPrompt.models.map((model, idx) => (
                        <span key={idx} className="text-xs text-gray-500">{model}</span>
                      ))}
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-white">{selectedPrompt.title}</h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedPrompt(null);
                    setCopied(false);
                  }}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-3 text-xs text-gray-500 flex items-center gap-2">
                <span className="opacity-40 italic">Linhas a cinzento</span>
                <span>não são copiadas (apenas para referência)</span>
              </div>
              <div className="bg-[#0f1420] border border-gray-800 rounded-lg p-4">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {selectedPrompt.content.split('\n').map((line, index) => {
                    const isMetadata = line.trim().startsWith('Model:') || line.trim().startsWith('Casos de Uso:');
                    return (
                      <span key={index} className={isMetadata ? 'opacity-40 italic' : ''}>
                        {line}{index < selectedPrompt.content.split('\n').length - 1 ? '\n' : ''}
                      </span>
                    );
                  })}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  {selectedPrompt.content.length} caracteres
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedPrompt(null)}
                    className="px-4 py-2.5 bg-transparent text-gray-400 hover:text-white transition-colors"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => copyPromptToClipboard(selectedPrompt.content)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar Prompt
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
      {/* Modal: Brand Post Generator */}
      {showBrandGenerator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">🎨 Brand Post Generator</h2>
              <button
                onClick={() => setShowBrandGenerator(false)}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <BrandPostGenerator webhookUrl="https://ivannnnnn.app.n8n.cloud/webhook/brand-post-generator" />
          </div>
        </div>
      )}
      {/* Modal: N8N Configuration */}
      <N8nConfigModal isOpen={showN8nConfig} onClose={() => setShowN8nConfig(false)} />
    </div>
  );
}
