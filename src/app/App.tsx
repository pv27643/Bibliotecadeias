import { useState, useEffect } from 'react';
import { Zap, Workflow, FileText, Library, Plus, X, Sparkles, Layout, Box, Smartphone, ClipboardList, Linkedin, Mail, BarChart3, Edit, Trash2, Star, ArrowLeft, Search, MoreVertical, Clock, ArrowRight, CheckCircle2, MessageSquare, Circle, Video, Image, PenTool } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import ImageUpload from './components/ImageUpload';
import BrandPostGenerator from './components/BrandPostGenerator';
import WorkflowExecutor from './components/WorkflowExecutor';

type View = 'biblioteca' | 'prompts' | 'workflows';
type Modal = 'categoria' | 'ferramenta' | 'prompt' | 'workflow' | null;

interface Tool {
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

interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  models: string[];
  content: string;
  image?: string;
  favorite?: boolean;
}

interface WorkflowStep {
  tool: string;
  status: 'pending' | 'running' | 'completed';
  icon: string;
}

export interface WorkflowInput {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'email' | 'image';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  maxImages?: number;
}

interface WorkflowType {
  id: string;
  title: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  image?: string;
  favorite?: boolean;
  // n8n integration
  webhookUrl?: string;
  inputs?: WorkflowInput[];
}

const DEFAULT_N8N_WEBHOOK_URL = 'https://ivannnnnn.app.n8n.cloud/webhook/e5fdf70f-c650-4822-9095-e86e1e8f9746';

const normalizeN8nWebhookUrl = (url?: string) => {
  if (!url) return url;
  return url.replace('/webhook-test/', '/webhook/');
};

const normalizeWorkflowWebhook = (workflow: WorkflowType): WorkflowType => {
  const legacyWebhookId = (workflow as WorkflowType & { webhookId?: string }).webhookId;

  return {
    ...workflow,
    webhookUrl: normalizeN8nWebhookUrl(
      workflow.webhookUrl || legacyWebhookId || (workflow.id === '5' ? DEFAULT_N8N_WEBHOOK_URL : undefined)
    ),
  };
};

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-d8505aef`;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');

  const [currentView, setCurrentView] = useState<View>('biblioteca');
  const [activeModal, setActiveModal] = useState<Modal>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPromptCategory, setSelectedPromptCategory] = useState<string | null>(null);
  const [searchPromptTerm, setSearchPromptTerm] = useState<string>('');
  const [selectedWorkflowCategory, setSelectedWorkflowCategory] = useState<string | null>(null);
  const [searchWorkflowTerm, setSearchWorkflowTerm] = useState<string>('');
  const [executingWorkflow, setExecutingWorkflow] = useState<WorkflowType | null>(null);
  const [workflowLogs, setWorkflowLogs] = useState<string[]>([]);
  const [showBrandGenerator, setShowBrandGenerator] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [copied, setCopied] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'tool' | 'prompt' | 'workflow', id: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'item' | 'categoria'>('item');
  const [categoryTab, setCategoryTab] = useState<'categoria' | 'subcategoria'>('categoria');
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newSubcategoryName, setNewSubcategoryName] = useState<string>('');
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] = useState<string>('Texto');

  // Form states para nova ferramenta
  const [newToolName, setNewToolName] = useState<string>('');
  const [newToolDescription, setNewToolDescription] = useState<string>('');
  const [newToolLink, setNewToolLink] = useState<string>('');
  const [newToolCategory, setNewToolCategory] = useState<string>('Texto');
  const [newToolSubcategory, setNewToolSubcategory] = useState<string>('Copywriting');
  const [newToolIcon, setNewToolIcon] = useState<string>('sparkles');
  const [newToolBadges, setNewToolBadges] = useState<string[]>(['Free']);
  const [newToolTags, setNewToolTags] = useState<string>('');
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Form states para novo prompt
  const [newPromptTitle, setNewPromptTitle] = useState<string>('');
  const [newPromptDescription, setNewPromptDescription] = useState<string>('');
  const [newPromptContent, setNewPromptContent] = useState<string>('');
  const [newPromptImage, setNewPromptImage] = useState<string>('');
  const [newPromptCategory, setNewPromptCategory] = useState<string>('Marketing');
  const [newPromptModels, setNewPromptModels] = useState<string>('ChatGPT, Claude');
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);

  // Form states para novo workflow
  const [newWorkflowTitle, setNewWorkflowTitle] = useState<string>('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState<string>('');
  const [newWorkflowImage, setNewWorkflowImage] = useState<string>('');
  const [newWorkflowCategory, setNewWorkflowCategory] = useState<string>('Marketing');
  const [newWorkflowWebhookUrl, setNewWorkflowWebhookUrl] = useState<string>('');
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);

  // Carregar do localStorage ou usar defaults
  const [toolCategories, setToolCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('toolCategories');
    let categories = ['Todas', 'Texto', 'Negócios', '3D', 'Audio', 'Outros', 'Vídeo', 'Código', 'Imagem', 'Prompts'];
    if (saved && saved !== 'undefined' && saved !== 'null') {
      try {
        categories = JSON.parse(saved);
      } catch (e) {
        console.warn('Erro ao carregar toolCategories:', e);
      }
    }
    // Migração automática: adicionar "Prompts" se não existir
    if (!categories.includes('Prompts')) {
      categories.push('Prompts');
    }
    return categories;
  });
  const [promptCategories, setPromptCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('promptCategories');
    let categories = ['Todos', 'Engenharia de Prompts', 'Aspect Ratio & Frame', 'Backgrounds & Surfaces', 'Camera Profiles', 'Lighting Setups', 'UGC Poses & Scenes', 'Hands & Models', 'Atmospheric Effects', 'Director Signatures', 'Motion & Camera Verbs'];
    if (saved && saved !== 'undefined' && saved !== 'null') {
      try {
        categories = JSON.parse(saved);
      } catch (e) {
        console.warn('Erro ao carregar promptCategories:', e);
      }
    }
    // Migração automática: adicionar categorias se não existirem
    if (!categories.includes('Aspect Ratio & Frame')) {
      categories.push('Aspect Ratio & Frame');
    }
    if (!categories.includes('Backgrounds & Surfaces')) {
      categories.push('Backgrounds & Surfaces');
    }
    if (!categories.includes('Camera Profiles')) {
      categories.push('Camera Profiles');
    }
    if (!categories.includes('Lighting Setups')) {
      categories.push('Lighting Setups');
    }
    if (!categories.includes('UGC Poses & Scenes')) {
      categories.push('UGC Poses & Scenes');
    }
    if (!categories.includes('Hands & Models')) {
      categories.push('Hands & Models');
    }
    if (!categories.includes('Atmospheric Effects')) {
      categories.push('Atmospheric Effects');
    }
    if (!categories.includes('Director Signatures')) {
      categories.push('Director Signatures');
    }
    if (!categories.includes('Motion & Camera Verbs')) {
      categories.push('Motion & Camera Verbs');
    }
    return categories;
  });
  const [workflowCategories, setWorkflowCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('workflowCategories');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Erro ao carregar workflowCategories:', e);
      }
    }
    return ['Todos', 'Marketing', 'Operações', 'Vendas'];
  });

  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('subcategoriesMap');
    let map = {
      'Texto': ['Copywriting', 'SEO', 'Tradução', 'Resumo', 'Redação'],
      'Negócios': ['CRM', 'Analytics', 'Automação', 'Produtividade', 'Finanças'],
      '3D': ['Geração de Modelos 3D & WebGL', 'Fotogrametria & Ambientes 360º', 'Captura de Movimento & Animação', 'Texturas & Materiais'],
      'Audio': ['Geração de Voz', 'Música', 'Edição', 'Transcrição'],
      'Outros': ['Geral', 'Educação', 'Saúde', 'Lifestyle'],
      'Vídeo': ['Geração', 'Edição', 'Animação', 'Legendas', 'Personalização'],
      'Código': ['Geração', 'Revisão', 'Debugging', 'Documentação', 'SQL', 'Planilhas', 'Assistente de Código', 'Low-Code & Integrações', 'Desenvolvimento Elite'],
      'Imagem': ['Geração', 'Edição', 'Upscaling', 'Avatar', 'Logo', 'Assistente Design'],
      'Prompts': ['Gestão & Produção', 'Biblioteca & Pesquisa', 'Observabilidade']
    };

    if (saved && saved !== 'undefined' && saved !== 'null') {
      try {
        map = JSON.parse(saved);
      } catch (e) {
        console.warn('Erro ao carregar subcategoriesMap:', e);
      }
    }

    // Migração automática: adicionar subcategorias de "Prompts" se não existir
    if (!map['Prompts']) {
      map['Prompts'] = ['Gestão & Produção', 'Biblioteca & Pesquisa', 'Observabilidade'];
    }
    return map;
  });

  // Carregar dados da base de dados Supabase com fallback para localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('📡 Carregando dados da base de dados...');
        const response = await fetch(`${API_BASE}/data`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('✅ Dados carregados com sucesso da base de dados:', data);

        // Sincronizar dados carregados da cloud com localStorage
        if (data.tools && data.tools.length > 0) {
          setTools(data.tools);
          localStorage.setItem('tools', JSON.stringify(data.tools));
        }
        if (data.prompts && data.prompts.length > 0) {
          setPrompts(data.prompts);
          localStorage.setItem('prompts', JSON.stringify(data.prompts));
        }
        if (data.workflows && data.workflows.length > 0) {
          setWorkflows(data.workflows);
          localStorage.setItem('workflows', JSON.stringify(data.workflows));
        }
        if (data.toolCategories && data.toolCategories.length > 0) {
          setToolCategories(data.toolCategories);
        }
        if (data.promptCategories && data.promptCategories.length > 0) {
          setPromptCategories(data.promptCategories);
        }
        if (data.workflowCategories && data.workflowCategories.length > 0) {
          setWorkflowCategories(data.workflowCategories);
        }
        if (data.subcategories && Object.keys(data.subcategories).length > 0) {
          setSubcategoriesMap(data.subcategories);
        }
      } catch (error) {
        console.warn('⚠️ Erro ao carregar da base de dados. A usar dados locais.', error);
        // Fallback para localStorage - já carregado no useState
      }
    };
    loadData();
  }, []);

  // Guardar dados no localStorage e na base de dados
  useEffect(() => {
    localStorage.setItem('toolCategories', JSON.stringify(toolCategories));
    // Sincronizar com Supabase
    fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ type: 'tool', categories: toolCategories })
    }).catch(err => console.warn('Erro ao sincronizar toolCategories:', err));
  }, [toolCategories]);

  useEffect(() => {
    localStorage.setItem('promptCategories', JSON.stringify(promptCategories));
    fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ type: 'prompt', categories: promptCategories })
    }).catch(err => console.warn('Erro ao sincronizar promptCategories:', err));
  }, [promptCategories]);

  useEffect(() => {
    localStorage.setItem('workflowCategories', JSON.stringify(workflowCategories));
    fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ type: 'workflow', categories: workflowCategories })
    }).catch(err => console.warn('Erro ao sincronizar workflowCategories:', err));
  }, [workflowCategories]);

  useEffect(() => {
    localStorage.setItem('subcategoriesMap', JSON.stringify(subcategoriesMap));
    fetch(`${API_BASE}/subcategories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ subcategories: subcategoriesMap })
    }).catch(err => console.warn('Erro ao sincronizar subcategories:', err));
  }, [subcategoriesMap]);

  // Funções para salvar dados (localStorage + Supabase com retry)
  const savePrompts = async (newPrompts: Prompt[]) => {
    // 1. Salvar SEMPRE no localStorage primeiro
    localStorage.setItem('prompts', JSON.stringify(newPrompts));
    console.log('💾 Prompts guardados em localStorage');

    // 2. Tentar sincronizar com Supabase em background (com retry)
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${API_BASE}/prompts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(newPrompts)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        console.log('✅ Prompts sincronizados com sucesso na base de dados');
        return; // Sucesso!
      } catch (err) {
        attempts++;
        console.warn(`⚠️ Tentativa ${attempts}/${maxAttempts} falhou. Erro:`, err);
        if (attempts < maxAttempts) {
          // Esperar 1 segundo antes de retry
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
    console.warn('⚠️ Falha ao sincronizar prompts com Supabase após 3 tentativas, mas dados guardados em localStorage');
  };

  const saveTools = async (newTools: Tool[]) => {
    localStorage.setItem('tools', JSON.stringify(newTools));
    console.log('💾 Tools guardadas em localStorage');

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${API_BASE}/tools`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(newTools)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        console.log('✅ Tools sincronizadas com sucesso na base de dados');
        return;
      } catch (err) {
        attempts++;
        console.warn(`⚠️ Tentativa ${attempts}/${maxAttempts} falhou:`, err);
        if (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
    console.warn('⚠️ Falha ao sincronizar tools, mas dados guardados em localStorage');
  };

  const saveWorkflows = async (newWorkflows: WorkflowType[]) => {
    localStorage.setItem('workflows', JSON.stringify(newWorkflows));
    console.log('💾 Workflows guardados em localStorage');

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${API_BASE}/workflows`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(newWorkflows)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        console.log('✅ Workflows sincronizados com sucesso na base de dados');
        return;
      } catch (err) {
        attempts++;
        console.warn(`⚠️ Tentativa ${attempts}/${maxAttempts} falhou:`, err);
        if (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
    console.warn('⚠️ Falha ao sincronizar workflows, mas dados guardados em localStorage');
  };

  const saveCategories = async (type: 'tool' | 'prompt' | 'workflow', categories: string[]) => {
    try {
      const response = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ type, categories })
      });
      if (!response.ok) throw new Error('Erro ao sincronizar categorias');
      console.log(`✅ Categorias ${type} sincronizadas com sucesso`);
    } catch (err) {
      console.warn(`⚠️ Erro ao salvar categorias na base de dados:`, err);
    }
  };

  const saveSubcategories = async (subcategories: Record<string, string[]>) => {
    try {
      const response = await fetch(`${API_BASE}/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ subcategories })
      });
      if (!response.ok) throw new Error('Erro ao sincronizar subcategorias');
      console.log('✅ Subcategorias sincronizadas com sucesso');
    } catch (err) {
      console.warn('⚠️ Erro ao salvar subcategorias na base de dados:', err);
    }
  };

  const [tools, setTools] = useState<Tool[]>(() => {
    const saved = localStorage.getItem('tools');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Erro ao carregar tools do localStorage:', e);
      }
    }
    return [
      { id: '1', name: 'Jasper', description: 'Crie textos de marketing, artigos para blogues e campanhas de ads completas.', category: 'Texto', subcategory: 'Copywriting', badges: ['Freemium', 'Pago'], tags: ['Texto'], icon: 'pen-tool', link: 'https://www.jasper.ai', favorite: false },
      { id: '2', name: 'Midjourney', description: 'Geração de imagens fotorrealistas e ilustrações a partir de texto (text-to-image) com a mais alta qualidade artística do mercado.', category: 'Imagem', subcategory: 'Geração', badges: ['Pago'], tags: ['Imagem', 'Gerador'], icon: 'image', link: 'https://midjourney.com', favorite: false },
      { id: '3', name: 'Runway', description: 'O padrão da indústria criativa para geração de vídeo a partir de texto (text-to-video) e imagem (image-to-video) com a mais alta fidelidade e controle. Inclui ferramentas de remoção de fundo e interpolação.', category: 'Vídeo', subcategory: 'Animação', badges: ['Freemium'], tags: ['Vídeo', 'Text-to-Video', 'VFX'], icon: 'video', link: 'https://runwayml.com', favorite: false },
      { id: '5', name: 'ChatGPT', description: 'IA de conversação avançada para pesquisa, produtividade e muito mais.', category: 'Texto', subcategory: 'Redação', badges: ['Free', 'Pago'], tags: ['Chatbot', 'Text'], icon: 'message-square', link: 'https://chat.openai.com', favorite: false },
      { id: '7', name: 'Nano Banana 2', description: 'Geração de imagens a partir de texto, edição avançada (combinando imagem e comandos de texto) e composição ou transferência de estilo a partir de múltiplas imagens.', category: 'Imagem', subcategory: 'Geração', badges: ['Freemium'], tags: ['Imagem', 'Edição'], icon: 'image', link: 'https://gemini.google.com', favorite: false },
      { id: '8', name: 'Adobe Firefly', description: 'Geração de imagens e preenchimento/remoção generativa de elementos seguro para uso comercial, com integração no ecossistema Adobe.', category: 'Imagem', subcategory: 'Geração', badges: ['Pago'], tags: ['Imagem', 'Adobe'], icon: 'image', link: 'https://adobe.com/sensei/generative-ai/firefly.html', favorite: false },
      { id: '9', name: 'Stable Diffusion', description: 'Modelo base de código aberto para geração de imagens, que permite controlo total e execução local ou na nuvem.', category: 'Imagem', subcategory: 'Geração', badges: ['Free'], tags: ['Imagem', 'Open Source'], icon: 'image', link: 'https://stability.ai', favorite: false },
      { id: '10', name: 'Leonardo.ai', description: 'Geração de imagens a partir de texto e treino de modelos visuais personalizados com uma interface altamente controlável.', category: 'Imagem', subcategory: 'Geração', badges: ['Freemium'], tags: ['Imagem', 'Custom Models'], icon: 'image', link: 'https://leonardo.ai', favorite: false },
      { id: '11', name: 'Magnific.ai', description: 'Aumento da resolução (upscaler) e adição de detalhes fotorrealistas e texturas a imagens de baixa qualidade.', category: 'Imagem', subcategory: 'Upscaling', badges: ['Pago'], tags: ['Imagem', 'Upscaling'], icon: 'image', link: 'https://magnific.ai', favorite: false },
      { id: '12', name: 'Krea.ai', description: 'Geração de imagens em tempo real a partir de esboços (sketch-to-image) e aumento de resolução (upscale) instantâneo.', category: 'Imagem', subcategory: 'Geração', badges: ['Freemium'], tags: ['Imagem', 'Tempo Real'], icon: 'image', link: 'https://krea.ai', favorite: false },
      { id: '13', name: 'Canva Magic Media', description: 'Geração rápida de imagens a partir de texto integrada diretamente na plataforma de design gráfico para redes sociais.', category: 'Imagem', subcategory: 'Geração', badges: ['Freemium'], tags: ['Imagem', 'Design'], icon: 'image', link: 'https://canva.com', favorite: false },
      { id: '14', name: 'Getalpaca', description: 'Plugin para Photoshop que permite gerar e editar imagens com IA diretamente no software, mantendo o fluxo de trabalho do designer.', category: 'Imagem', subcategory: 'Edição', badges: ['Pago'], tags: ['Imagem', 'Photoshop'], icon: 'image', link: 'https://getalpaca.io', favorite: false },
      { id: '15', name: 'Bing Image Creator', description: 'Geração de imagens a partir de texto utilizando o modelo DALL-E 3 de forma simples e direta.', category: 'Imagem', subcategory: 'Geração', badges: ['Free'], tags: ['Imagem', 'DALL-E'], icon: 'image', link: 'https://bing.com/create', favorite: false },
      { id: '16', name: 'ProductShots', description: 'Geração de cenários e fundos fotorrealistas focada em imagens de produtos para e-commerce.', category: 'Imagem', subcategory: 'Geração', badges: ['Pago'], tags: ['Imagem', 'E-commerce'], icon: 'image', link: 'https://productshots.ai', favorite: false },
      { id: '17', name: 'Assembo AI', description: 'Geração de cenários de marketing virtuais para fotografias de produtos inseridas pelo utilizador.', category: 'Imagem', subcategory: 'Geração', badges: ['Freemium'], tags: ['Imagem', 'Marketing'], icon: 'image', link: 'https://app.assembo.ai', favorite: false },
      { id: '18', name: 'Dyvo', description: 'Inserção de recortes de produtos em cenários virtuais gerados por IA para lojas online.', category: 'Imagem', subcategory: 'Geração', badges: ['Pago'], tags: ['Imagem', 'E-commerce'], icon: 'image', link: 'https://dyvo.ai/business', favorite: false },
      { id: '19', name: 'Pew AI', description: 'Geração instantânea de imagens de produto simulando iluminação de estúdio profissional.', category: 'Imagem', subcategory: 'Geração', badges: ['Freemium'], tags: ['Imagem', 'Produto'], icon: 'image', link: 'https://pew.ai', favorite: false },
      { id: '20', name: 'Zeg AI', description: 'Renderização de imagens e vídeos de produtos em ambientes virtuais 3D.', category: 'Imagem', subcategory: 'Geração', badges: ['Freemium'], tags: ['Imagem', '3D'], icon: 'image', link: 'https://zeg.ai', favorite: false },
      { id: '21', name: 'Stylized', description: 'Criação de fundos virtuais em estilo de estúdio para fotos de produtos.', category: 'Imagem', subcategory: 'Geração', badges: ['Freemium'], tags: ['Imagem', 'Produto'], icon: 'image', link: 'https://stylized.ai', favorite: false },
      { id: '22', name: 'Unfake.png', description: 'Remoção de fundo falso (quadriculado) de imagens da web, convertendo-as em ficheiros com transparência real.', category: 'Imagem', subcategory: 'Edição', badges: ['Freemium'], tags: ['Imagem', 'Background'], icon: 'image', link: 'https://unfakepng.com', favorite: false },
      { id: '23', name: 'BgRem', description: 'Remoção e substituição automática de fundos em ficheiros de imagem e vídeo.', category: 'Imagem', subcategory: 'Edição', badges: ['Freemium'], tags: ['Imagem', 'Background'], icon: 'image', link: 'https://bgrem.ai', favorite: false },
      { id: '24', name: 'Cutout Pro', description: 'Recorte automático de elementos, remoção de fundos e melhoria de qualidade de fotos.', category: 'Imagem', subcategory: 'Edição', badges: ['Freemium'], tags: ['Imagem', 'Edição'], icon: 'image', link: 'https://cutout.pro', favorite: false },
      { id: '25', name: 'Synthesys X', description: 'Extensão de navegador que clona e gera variações originais de imagens encontradas na web para contornar direitos de autor.', category: 'Imagem', subcategory: 'Geração', badges: ['Freemium'], tags: ['Imagem', 'Clone'], icon: 'image', link: 'https://synthesys.io/x/', favorite: false },
      { id: '26', name: 'MagicStock', description: 'Geração de imagens a partir de texto já com o fundo transparente por defeito (ideal para assets de design).', category: 'Imagem', subcategory: 'Geração', badges: ['Freemium'], tags: ['Imagem', 'Transparência'], icon: 'image', link: 'https://tensorpix.ai/MagicStock', favorite: false },
      { id: '27', name: 'Generated Photos', description: 'Gerador de rostos e figuras humanas artificiais (pessoas inexistentes) para evitar pagamentos de direitos de imagem.', category: 'Imagem', subcategory: 'Avatar', badges: ['Freemium'], tags: ['Imagem', 'Rostos'], icon: 'image', link: 'https://generated.photos', favorite: false },
      { id: '28', name: 'AdswithAI', description: 'Geração combinada de imagens promocionais e redação de legendas otimizadas para anúncios digitais.', category: 'Imagem', subcategory: 'Geração', badges: ['Pago'], tags: ['Imagem', 'Anúncios'], icon: 'image', link: 'https://adswithai.io', favorite: false },
      { id: '29', name: 'BestBanner', description: 'Geração de banners visuais baseados na leitura e interpretação de um texto ou artigo de blog.', category: 'Imagem', subcategory: 'Geração', badges: ['Freemium'], tags: ['Imagem', 'Banner'], icon: 'image', link: 'https://bestbanner.jina.ai', favorite: false },
      { id: '30', name: 'RunDiffusion', description: 'Interface de nuvem que permite correr modelos pesados de geração de imagem sem necessitar de hardware local potente.', category: 'Imagem', subcategory: 'Geração', badges: ['Freemium'], tags: ['Imagem', 'Cloud'], icon: 'image', link: 'https://rundiffusion.com', favorite: false },
      { id: '31', name: 'OmniInfer', description: 'Fornecimento de API para programadores integrarem a função de geração de imagens rápida em software de terceiros.', category: 'Imagem', subcategory: 'Geração', badges: ['Pago'], tags: ['Imagem', 'API'], icon: 'image', link: 'https://omniinfer.io', favorite: false },
      { id: '32', name: 'Monster API', description: 'Fornecimento de API escalável para programadores implementarem modelos de IA generativa.', category: 'Imagem', subcategory: 'Geração', badges: ['Freemium'], tags: ['Imagem', 'API'], icon: 'image', link: 'https://monsterapi.ai', favorite: false },
      { id: '33', name: 'Midjourney for Slack', description: 'Bot de chat que integra os comandos de geração de imagens do Midjourney diretamente na plataforma Slack da empresa.', category: 'Imagem', subcategory: 'Geração', badges: ['Freemium'], tags: ['Imagem', 'Slack'], icon: 'image', link: 'https://mjslackbot.com', favorite: false },
      { id: '34', name: 'PixelPet', description: 'Plugin alternativo para Photoshop focado em gerar imagens e elementos diretamente na área de trabalho.', category: 'Imagem', subcategory: 'Edição', badges: ['Pago'], tags: ['Imagem', 'Photoshop'], icon: 'image', link: 'https://brain.pet', favorite: false },
      { id: '35', name: 'Scribble Diffusion', description: 'Conversão de desenhos ou rabiscos simples em imagens fotorrealistas ou ilustrações detalhadas.', category: 'Imagem', subcategory: 'Geração', badges: ['Free'], tags: ['Imagem', 'Sketch'], icon: 'image', link: 'https://scribblediffusion.com', favorite: false },
      { id: '36', name: 'QRBTF AI', description: 'Geração de QR Codes funcionais camuflados de forma invisível dentro de imagens e ilustrações.', category: 'Imagem', subcategory: 'Geração', badges: ['Free'], tags: ['Imagem', 'QR Code'], icon: 'image', link: 'https://qrbtf.com', favorite: false },
      { id: '37', name: 'QR-ART', description: 'Mistura de código QR funcional com arte gerada por IA (mais básico).', category: 'Imagem', subcategory: 'Geração', badges: ['Pago'], tags: ['Imagem', 'QR Code'], icon: 'image', link: 'https://qr-art.xyz', favorite: false },
      { id: '38', name: 'Icon Maker', description: 'Geração básica de ícones vetoriais e gráficos de interface para aplicações e websites.', category: 'Imagem', subcategory: 'Logo', badges: ['Freemium'], tags: ['Imagem', 'Ícones'], icon: 'image', link: 'https://iconmaker.app', favorite: false },
      { id: '39', name: 'Recraft.ai', description: 'Geração e edição avançada de arte vetorial, logótipos e ilustrações com exportação direta em formato SVG (essencial para designers).', category: 'Imagem', subcategory: 'Logo', badges: ['Freemium'], tags: ['Imagem', 'SVG', 'Vetorial'], icon: 'image', link: 'https://recraft.ai', favorite: false },
      { id: '40', name: 'Vectorizer.ai', description: 'Conversão automática de imagens geradas por IA (pixels/raster) em vetores (SVG) limpos e escaláveis, permitindo usar imagens do Midjourney como logótipos reais.', category: 'Imagem', subcategory: 'Logo', badges: ['Pago'], tags: ['Imagem', 'SVG', 'Conversão'], icon: 'image', link: 'https://vectorizer.ai', favorite: false },
      { id: '41', name: 'Logodiffusion', description: 'Geração de logótipos através de modelos de difusão, permitindo transformar esboços simples da equipa em designs gráficos finais.', category: 'Imagem', subcategory: 'Logo', badges: ['Freemium'], tags: ['Imagem', 'Logótipo'], icon: 'image', link: 'https://logodiffusion.com', favorite: false },
      { id: '42', name: 'Looka', description: 'Geração rápida de logótipos e criação automática de kits de marca completos (brandbooks, cartões de visita, paletas) para projetos rápidos.', category: 'Imagem', subcategory: 'Logo', badges: ['Freemium'], tags: ['Imagem', 'Branding'], icon: 'image', link: 'https://looka.com', favorite: false },
      { id: '43', name: 'Brandmark', description: 'Criação de identidades visuais completas e aplicação instantânea do logótipo gerado em dezenas de mockups profissionais.', category: 'Imagem', subcategory: 'Logo', badges: ['Freemium'], tags: ['Imagem', 'Branding'], icon: 'image', link: 'https://brandmark.io', favorite: false },
      { id: '44', name: 'Logoai', description: 'Gerador prático de design de marca focado em testar rapidamente tipografias e ícones para materiais de marketing.', category: 'Imagem', subcategory: 'Logo', badges: ['Pago'], tags: ['Imagem', 'Tipografia'], icon: 'image', link: 'https://logoai.com', favorite: false },
      { id: '45', name: 'Luminar Neo', description: 'Software profissional completo (alternativa ao Lightroom) que utiliza algoritmos de IA locais para otimização de cor, substituição de céus e retoque avançado de retrato e paisagem.', category: 'Imagem', subcategory: 'Edição', badges: ['Pago'], tags: ['Imagem', 'Retoque', 'Fotografia'], icon: 'image', link: 'https://skylum.com/luminar-ai', favorite: false },
      { id: '46', name: 'Photoroom', description: 'O padrão da indústria para e-commerce: remoção de fundo com precisão cirúrgica, adição de sombras realistas e inserção do produto em cenários gerados por IA.', category: 'Imagem', subcategory: 'Edição', badges: ['Freemium'], tags: ['Imagem', 'Background', 'E-commerce'], icon: 'image', link: 'https://photoroom.com', favorite: false },
      { id: '47', name: 'Pebblely', description: 'Geração de cenários fotorrealistas e otimização de iluminação focada estritamente na fotografia de produtos para redes sociais e lojas online.', category: 'Imagem', subcategory: 'Edição', badges: ['Freemium'], tags: ['Imagem', 'Produto', 'E-commerce'], icon: 'image', link: 'https://app.pebblely.com', favorite: false },
      { id: '48', name: 'Upscayl', description: 'Software de aumento de resolução (upscaler) de código aberto e totalmente gratuito que corre localmente na máquina do utilizador (excelente para a agência poupar em subscrições).', category: 'Imagem', subcategory: 'Upscaling', badges: ['Free'], tags: ['Imagem', 'Upscaling', 'Open Source'], icon: 'image', link: 'https://upscayl.org', favorite: false },
      { id: '49', name: 'Remove.bg', description: 'O motor clássico e mais fiável do mercado para remoção de fundos em 5 segundos, muito utilizado pelas agências através da sua integração via API.', category: 'Imagem', subcategory: 'Edição', badges: ['Freemium'], tags: ['Imagem', 'Background', 'API'], icon: 'image', link: 'https://remove.bg', favorite: false },
      { id: '50', name: 'autoRetouch', description: 'Plataforma de processamento em lote para e-commerce de moda, automatizando a edição de centenas de imagens de roupas e manequins de uma só vez.', category: 'Imagem', subcategory: 'Edição', badges: ['Pago'], tags: ['Imagem', 'Batch', 'Moda'], icon: 'image', link: 'https://autoretouch.com', favorite: false },
      { id: '51', name: 'ZMO.ai', description: 'Geração de modelos humanos virtuais a vestir peças de roupa reais, eliminando a necessidade de contratar modelos físicos para marcas de moda.', category: 'Imagem', subcategory: 'Edição', badges: ['Freemium'], tags: ['Imagem', 'Moda', 'Modelos'], icon: 'image', link: 'https://zmo.ai', favorite: false },
      { id: '52', name: "Let's Enhance", description: 'Aumento de resolução de imagem e melhoria de nitidez na nuvem, ideal para imprimir ficheiros de baixa qualidade em grandes formatos (mupis, outdoors).', category: 'Imagem', subcategory: 'Upscaling', badges: ['Freemium'], tags: ['Imagem', 'Upscaling', 'Print'], icon: 'image', link: 'https://letsenhance.io', favorite: false },
      { id: '53', name: 'Bria', description: 'Fornecimento de API comercial "segura para empresas" (sem problemas de direitos autorais) para automatizar a criação e edição de imagens à escala em aplicações.', category: 'Imagem', subcategory: 'Edição', badges: ['Freemium'], tags: ['Imagem', 'API', 'Enterprise'], icon: 'image', link: 'https://bria.ai', favorite: false },
      { id: '54', name: 'Wondershare VirtuLook', description: 'Ferramenta de substituição de fundo e geração de cenários visuais para melhorar fotografias de catálogos de produtos.', category: 'Imagem', subcategory: 'Edição', badges: ['Freemium'], tags: ['Imagem', 'Produto', 'Background'], icon: 'image', link: 'https://virtulook.wondershare.com', favorite: false },
      { id: '55', name: 'Raster', description: 'Galeria inteligente para gestão de ativos digitais (DAM) que aloja fotografias e permite edição e organização com assistência de IA para equipas criativas.', category: 'Imagem', subcategory: 'Edição', badges: ['Freemium'], tags: ['Imagem', 'DAM', 'Gestão'], icon: 'image', link: 'https://raster.app', favorite: false },
      { id: '56', name: 'Kombai', description: 'Converte automaticamente designs do Figma em código Front-End (HTML/CSS/React) limpo e pronto a ser usado por programadores.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Pago'], tags: ['Design', 'Figma', 'Código'], icon: 'layout', link: 'https://kombai.com', favorite: false },
      { id: '57', name: 'Relume', description: 'Gera sitemaps e wireframes estruturados em segundos para Web Design, com exportação direta para Figma e Webflow.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Freemium'], tags: ['Design', 'Wireframe', 'Figma'], icon: 'layout', link: 'https://relume.io', favorite: false },
      { id: '58', name: 'Locofy', description: 'Transforma designs do Figma ou Adobe XD em código funcional (React, Vue, HTML) de alta fidelidade para produção.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Freemium'], tags: ['Design', 'Figma', 'Código'], icon: 'layout', link: 'https://locofy.ai', favorite: false },
      { id: '59', name: 'Framer AI', description: 'Gera sites completos, com design moderno e animações profissionais, a partir de uma simples descrição de texto.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Freemium'], tags: ['Design', 'Website', 'Animação'], icon: 'layout', link: 'https://framer.com', favorite: false },
      { id: '60', name: 'Magician', description: 'Plugin "tudo em um" para Figma que gera ícones vetoriais, imagens e textos de interface (copy) sem sair da ferramenta.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Pago'], tags: ['Design', 'Figma', 'Plugin'], icon: 'layout', link: 'https://magician.design', favorite: false },
      { id: '61', name: 'Galileo AI', description: 'Cria designs de interface (UI) editáveis no Figma a partir de prompts de texto, ideal para prototipagem rápida de apps.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Pago'], tags: ['Design', 'UI', 'Figma'], icon: 'layout', link: 'https://usegalileo.ai', favorite: false },
      { id: '62', name: 'Uizard', description: 'Transforma esboços desenhados à mão em papel em ecrãs digitais de alta fidelidade e protótipos editáveis.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Freemium'], tags: ['Design', 'Protótipo', 'Sketch'], icon: 'layout', link: 'https://uizard.io', favorite: false },
      { id: '63', name: 'Visily AI', description: 'Assistente de wireframing que permite criar fluxos de apps e sites de forma ultrarrápida com componentes inteligentes.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Free'], tags: ['Design', 'Wireframe', 'App'], icon: 'layout', link: 'https://visily.ai', favorite: false },
      { id: '64', name: 'Kittl', description: 'Plataforma de design avançada com ferramentas de IA para criar tipografias complexas, ilustrações e mockups profissionais.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Freemium'], tags: ['Design', 'Tipografia', 'Mockup'], icon: 'layout', link: 'https://kittl.com', favorite: false },
      { id: '65', name: 'Vizcom', description: 'Renderiza esboços técnicos ou artísticos em imagens fotorrealistas de produtos em tempo real.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Free'], tags: ['Design', 'Render', 'Produto'], icon: 'layout', link: 'https://vizcom.ai', favorite: false },
      { id: '66', name: 'Autoname', description: 'Organiza e renomeia automaticamente todas as camadas (layers) do Figma para manter o ficheiro profissional.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Free'], tags: ['Design', 'Figma', 'Organização'], icon: 'layout', link: 'https://autoname.org', favorite: false },
      { id: '67', name: 'Khroma', description: 'Utiliza aprendizagem de máquina para gerar paletas de cores personalizadas com base nas preferências do designer.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Free'], tags: ['Design', 'Cores', 'Paleta'], icon: 'layout', link: 'https://khroma.co', favorite: false },
      { id: '68', name: 'Kive.ai', description: 'Biblioteca visual inteligente que organiza e etiqueta referências e moodboards automaticamente para diretores de arte.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Freemium'], tags: ['Design', 'Moodboard', 'Referências'], icon: 'layout', link: 'https://kive.ai', favorite: false },
      { id: '69', name: 'Illustroke', description: 'Gera ilustrações únicas diretamente em formato vetorial (SVG) a partir de descrições de texto.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Freemium'], tags: ['Design', 'Ilustração', 'SVG'], icon: 'layout', link: 'https://illustroke.com', favorite: false },
      { id: '70', name: 'UX Brain', description: 'Analisa e resume entrevistas de utilizadores e testes de usabilidade, facilitando a extração de insights de UX.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Free'], tags: ['Design', 'UX', 'Research'], icon: 'layout', link: 'https://uxbrain.co', favorite: false },
      { id: '71', name: 'WPTurbo', description: 'Gera snippets de código e ajuda na automação de desenvolvimento para sites em WordPress.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Freemium'], tags: ['Design', 'WordPress', 'Código'], icon: 'layout', link: 'https://wpturbo.dev', favorite: false },
      { id: '72', name: 'Whimsical AI', description: 'Assistente para criação rápida de mapas mentais e fluxogramas de navegação para projetos web.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Freemium'], tags: ['Design', 'Fluxograma', 'Mapa Mental'], icon: 'layout', link: 'https://whimsical.com', favorite: false },
      { id: '73', name: 'Tagbox', description: 'Gestor de ativos digitais que utiliza IA para organizar e encontrar instantaneamente imagens e ficheiros de design.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Freemium'], tags: ['Design', 'DAM', 'Gestão'], icon: 'layout', link: 'https://tagbox.io', favorite: false },
      { id: '74', name: 'What Font Is', description: 'Identifica instantaneamente qualquer fonte tipográfica a partir de uma imagem ou screenshot.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Freemium'], tags: ['Design', 'Tipografia', 'Fonte'], icon: 'layout', link: 'https://whatfontis.com', favorite: false },
      { id: '75', name: 'VisualizeAI', description: 'Converte wireframes básicos ou desenhos de arquitetura em renderizações visuais detalhadas.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Freemium'], tags: ['Design', 'Render', 'Arquitetura'], icon: 'layout', link: 'https://visualizeai.pro', favorite: false },
      { id: '76', name: 'Magify.design', description: 'Gera protótipos de interfaces que respeitam o sistema de design (design system) específico da marca.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Free'], tags: ['Design', 'Protótipo', 'Design System'], icon: 'layout', link: 'https://magify.design', favorite: false },
      { id: '77', name: 'Microsoft Designer', description: 'Ferramenta de design rápido para criar layouts e posts de redes sociais com composição automática.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Free'], tags: ['Design', 'Redes Sociais', 'Layout'], icon: 'layout', link: 'https://designer.microsoft.com', favorite: false },
      { id: '78', name: 'Autodraw', description: 'Ferramenta do Google que transforma rabiscos manuais em ícones e desenhos vetoriais limpos.', category: 'Imagem', subcategory: 'Assistente Design', badges: ['Free'], tags: ['Design', 'Ícones', 'Vetorial'], icon: 'layout', link: 'https://autodraw.com', favorite: false },
      { id: '79', name: 'HeyGen', description: 'O líder de mercado na criação de vídeos com avatares humanos hiper-realistas, sincronização labial perfeita e tradução de voz para dezenas de idiomas (ideal para marketing e redes sociais).', category: 'Imagem', subcategory: 'Avatar', badges: ['Freemium'], tags: ['Imagem', 'Avatar', 'Vídeo'], icon: 'image', link: 'https://heygen.com', favorite: false },
      { id: '80', name: 'Synthesia', description: 'O padrão corporativo para vídeos de formação empresarial, tutoriais e comunicação interna com avatares de IA altamente profissionais.', category: 'Imagem', subcategory: 'Avatar', badges: ['Pago'], tags: ['Imagem', 'Avatar', 'Vídeo'], icon: 'image', link: 'https://synthesia.io', favorite: false },
      { id: '81', name: 'Aragon AI', description: 'A melhor ferramenta atual para gerar retratos corporativos (headshots) fotorrealistas. Excelente para a agência padronizar as fotos da secção "A Nossa Equipa" no site, sem precisar de contratar um fotógrafo.', category: 'Imagem', subcategory: 'Avatar', badges: ['Pago'], tags: ['Imagem', 'Avatar', 'Retratos'], icon: 'image', link: 'https://aragon.ai', favorite: false },
      { id: '82', name: 'DeepAgency', description: 'Estúdio fotográfico virtual e "agência de modelos de IA". Permite gerar modelos humanos fotorrealistas em várias poses para ilustrar campanhas de moda, web design ou publicidade sem pagar direitos de imagem.', category: 'Imagem', subcategory: 'Avatar', badges: ['Freemium'], tags: ['Imagem', 'Avatar', 'Modelos'], icon: 'image', link: 'https://deepagency.com', favorite: false },
      { id: '83', name: 'Ready Player Me', description: 'Plataforma padrão de mercado para criação de avatares 3D otimizados. Excelente ferramenta para a equipa de programação (Devs) integrar personagens jogáveis em Web3, apps e experiências de Realidade Virtual.', category: 'Imagem', subcategory: 'Avatar', badges: ['Freemium'], tags: ['Imagem', 'Avatar', '3D'], icon: 'image', link: 'https://readyplayer.me', favorite: false },
      { id: '84', name: 'Inworld', description: 'Motor avançado de criação de personagens de IA com personalidades, memória e emoções complexas. Ideal para devs integrarem assistentes virtuais inteligentes e NPCs em aplicações de clientes.', category: 'Imagem', subcategory: 'Avatar', badges: ['Freemium'], tags: ['Imagem', 'Avatar', 'NPCs'], icon: 'image', link: 'https://inworld.ai', favorite: false },
      { id: '85', name: 'LiveReacting AI', description: 'Apresentador virtual gerado por IA capaz de conduzir transmissões ao vivo (livestreams) nas redes sociais de forma autónoma, interagindo com os comentários do público em tempo real.', category: 'Imagem', subcategory: 'Avatar', badges: ['Pago'], tags: ['Imagem', 'Avatar', 'Livestream'], icon: 'image', link: 'https://livereacting.com/ai-live-stream', favorite: false },
      { id: '86', name: 'Character AI', description: 'Criação de personas conversacionais avançadas. Muito útil para os copywriters testarem o "tom de voz" de uma marca, criando um bot com a personalidade do cliente e dialogando com ele.', category: 'Imagem', subcategory: 'Avatar', badges: ['Free'], tags: ['Imagem', 'Avatar', 'Chatbot'], icon: 'image', link: 'https://character.ai', favorite: false },
      { id: '87', name: 'SpiritMe', description: 'Produção instantânea de vídeo utilizando avatares digitais que replicam as expressões faciais exatas de pessoas reais, ótimo para criação em massa de conteúdo para YouTube/TikTok.', category: 'Imagem', subcategory: 'Avatar', badges: ['Freemium'], tags: ['Imagem', 'Avatar', 'Vídeo'], icon: 'image', link: 'https://spiritme.tech', favorite: false },
      { id: '88', name: 'Avaturn', description: 'Converte fotos 2D comuns num avatar 3D altamente realista e totalmente animável, muito útil para integração rápida em protótipos de design interativo.', category: 'Imagem', subcategory: 'Avatar', badges: ['Free'], tags: ['Imagem', 'Avatar', '3D'], icon: 'image', link: 'https://avaturn.me', favorite: false },
      { id: '89', name: 'Xpression Camera', description: 'Aplicação de câmara virtual que mapeia o rosto do utilizador e o transforma num avatar interativo em tempo real durante videochamadas de equipa ou apresentações online.', category: 'Imagem', subcategory: 'Avatar', badges: ['Freemium'], tags: ['Imagem', 'Avatar', 'Tempo Real'], icon: 'image', link: 'https://xpressioncamera.com', favorite: false },
      { id: '90', name: 'Remini', description: 'Embora o seu foco principal seja B2C, o seu algoritmo de reconstrução facial (para melhorar fotos antigas, muito pequenas ou desfocadas) é tão forte que muitos designers o usam para "salvar" imagens enviadas por clientes com má qualidade.', category: 'Imagem', subcategory: 'Avatar', badges: ['Freemium'], tags: ['Imagem', 'Avatar', 'Restauração'], icon: 'image', link: 'https://remini.ai', favorite: false },
      { id: '91', name: 'Veo', description: 'O modelo de estado da arte do Google para gerar vídeos de alta fidelidade que já incluem áudio nativo (efeitos sonoros gerados com a ação). Excelente para direção de arte e controlo cinemático.', category: 'Vídeo', subcategory: 'Geração', badges: ['Freemium'], tags: ['Vídeo', 'Google', 'Áudio'], icon: 'video', link: 'https://gemini.google.com', favorite: false },
      { id: '92', name: 'Wonder Dynamics', description: 'Autêntica magia para a equipa de vídeo: deteta automaticamente atores reais num vídeo e substitui-os por personagens 3D, mapeando iluminação, sombras e animação na perfeição (VFX num clique).', category: 'Vídeo', subcategory: 'Animação', badges: ['Pago'], tags: ['Vídeo', '3D', 'VFX'], icon: 'video', link: 'https://wonderdynamics.com', favorite: false },
      { id: '93', name: 'Luma Dream Machine', description: 'Capaz de gerar animações complexas e fotorrealistas a partir de imagens ou texto, com foco no movimento da câmera e realismo. Uma ferramenta indispensável para direção de arte.', category: 'Vídeo', subcategory: 'Animação', badges: ['Freemium'], tags: ['Vídeo', 'Animação', 'Realismo'], icon: 'video', link: 'https://lumalabs.ai/dream-machine', favorite: false },
      { id: '94', name: 'Opus Clip', description: 'Ferramenta obrigatória para Gestores de Redes Sociais. Analisa horas de vídeo (podcasts, entrevistas) e recorta automaticamente os momentos mais virais para TikTok/Reels, adicionando legendas dinâmicas.', category: 'Vídeo', subcategory: 'Geração', badges: ['Freemium'], tags: ['Vídeo', 'Redes Sociais', 'Legendas'], icon: 'video', link: 'https://opus.pro', favorite: false },
      { id: '95', name: 'Kaiber.ai', description: 'Focado em estilos artísticos e visuais únicos, é muito utilizado por agências para criar telediscos, visualizers de Spotify e animações 3D estilizadas a partir de imagens ou vídeos de referência.', category: 'Vídeo', subcategory: 'Animação', badges: ['Pago'], tags: ['Vídeo', 'Música', 'Animação'], icon: 'video', link: 'https://kaiber.ai', favorite: false },
      { id: '96', name: 'Klap', description: 'Excelente alternativa ao Opus Clip. Transforma links longos do YouTube em vídeos curtos virais (Shorts/Reels) com reenquadramento automático de rosto.', category: 'Vídeo', subcategory: 'Geração', badges: ['Pago'], tags: ['Vídeo', 'YouTube', 'Shorts'], icon: 'video', link: 'https://klap.app', favorite: false },
      { id: '97', name: 'Guidde', description: 'Um autêntico salva-vidas para criar documentação de software. Grava o teu ecrã enquanto navegas num site/app e a IA transforma isso num tutorial em vídeo profissional com locução automática.', category: 'Vídeo', subcategory: 'Geração', badges: ['Freemium'], tags: ['Vídeo', 'Tutorial', 'Screen Recording'], icon: 'video', link: 'https://guidde.com', favorite: false },
      { id: '98', name: 'Creative Reality Studio', description: 'A referência para animar rostos estáticos. Dá vida a fotografias de pessoas ou avatares gerados (como os do Midjourney) com sincronização labial quase perfeita para apresentações.', category: 'Vídeo', subcategory: 'Geração', badges: ['Freemium'], tags: ['Vídeo', 'Avatar', 'Animação'], icon: 'video', link: 'https://studio.d-id.com', favorite: false },
      { id: '99', name: 'Waymark', description: 'Criador de anúncios comerciais focado em agências. Gera rapidamente vídeos promocionais localizados para negócios, combinando texto, imagens e locuções prontas a emitir.', category: 'Vídeo', subcategory: 'Geração', badges: ['Pago'], tags: ['Vídeo', 'Anúncios', 'Marketing'], icon: 'video', link: 'https://waymark.com', favorite: false },
      { id: '100', name: 'Lumiere 3D', description: 'Focado no E-commerce: gera vídeos imersivos e dinâmicos em 3D de produtos (como sapatilhas ou frascos) sem necessidade de filmagens físicas.', category: 'Vídeo', subcategory: 'Geração', badges: ['Pago'], tags: ['Vídeo', '3D', 'E-commerce'], icon: 'video', link: 'https://lumiere3d.ai', favorite: false },
      { id: '101', name: 'DeepBrain', description: 'Uma alternativa sólida e corporativa ao Synthesia/HeyGen para gerar vídeos explicativos com avatares humanos sintéticos e locução.', category: 'Vídeo', subcategory: 'Geração', badges: ['Pago'], tags: ['Vídeo', 'Avatar', 'Corporativo'], icon: 'video', link: 'https://deepbrain.io/aistudios', favorite: false },
      { id: '102', name: 'Lumen5', description: 'Transforma conteúdos escritos (como posts do blog do cliente ou artigos) em vídeos dinâmicos de texto e imagem para publicar no LinkedIn e Instagram.', category: 'Vídeo', subcategory: 'Geração', badges: ['Freemium'], tags: ['Vídeo', 'Conteúdo', 'Redes Sociais'], icon: 'video', link: 'https://lumen5.com', favorite: false },
      { id: '103', name: 'FILM', description: 'Ferramenta de nicho muito útil para criativos: gera uma transição/animação perfeitamente fluida (interpolação) entre duas imagens completamente diferentes.', category: 'Vídeo', subcategory: 'Geração', badges: ['Free'], tags: ['Vídeo', 'Interpolação', 'Animação'], icon: 'video', link: 'https://replicate.com', favorite: false },
      { id: '104', name: 'Descript', description: 'A ferramenta de legendagem baseada em texto mais avançada do mercado. Transcreve o áudio automaticamente e permite editar o vídeo simplesmente apagando palavras no texto. Inclui legendagem dinâmica e tradução para vários idiomas.', category: 'Vídeo', subcategory: 'Legendas', badges: ['Freemium'], tags: ['Vídeo', 'Legendas', 'Tradução'], icon: 'video', link: 'https://descript.com', favorite: false },
      { id: '105', name: 'Topaz Video AI', description: 'O padrão ouro absoluto para aprimoramento de vídeo. Utiliza redes neuronais locais para fazer upscale de vídeos de baixa resolução (ex: 720p para 4K), remover ruído de ISO alto e criar câmara lenta fluida (interpolação de frames).', category: 'Vídeo', subcategory: 'Edição', badges: ['Pago'], tags: ['Vídeo', 'Upscaling', '4K'], icon: 'video', link: 'https://topazlabs.com/topaz-video-ai', favorite: false },
      { id: '106', name: 'AutoPod', description: 'Um plugin obrigatório para quem edita no Adobe Premiere Pro. Edita automaticamente podcasts multicâmara de horas em minutos, cortando para a pessoa que está a falar de forma inteligente. Poupa dias de trabalho à equipa.', category: 'Vídeo', subcategory: 'Edição', badges: ['Freemium'], tags: ['Vídeo', 'Podcast', 'Premiere'], icon: 'video', link: 'https://autopod.fm', favorite: false },
      { id: '107', name: 'Veed.io', description: 'Suite de edição online completa com uma ferramenta de legendagem automática extremamente robusta e fácil de personalizar para Social Media. Excelente para a equipa de marketing criar vídeos curtos e legendados rapidamente.', category: 'Vídeo', subcategory: 'Legendas', badges: ['Freemium'], tags: ['Vídeo', 'Legendas', 'Social Media'], icon: 'video', link: 'https://veed.io', favorite: false },
      { id: '108', name: 'Captions', description: 'A melhor ferramenta para criar aquelas legendas dinâmicas, coloridas e "virais" (estilo "Alex Hormozi") para Shorts e Reels. Inclui também contacto visual automático para locutores que estão a ler um guião.', category: 'Vídeo', subcategory: 'Legendas', badges: ['Freemium'], tags: ['Vídeo', 'Legendas', 'Shorts'], icon: 'video', link: 'https://captions.ai', favorite: false },
      { id: '109', name: 'Vidyo.ai', description: 'Plataforma fantástica de repurposing. A equipa de Social Media faz upload de um podcast ou webinar do cliente (vídeo longo), e a IA corta automaticamente os momentos mais virais em pequenos clipes verticais prontos para o TikTok/Reels.', category: 'Vídeo', subcategory: 'Edição', badges: ['Freemium'], tags: ['Vídeo', 'Repurposing', 'TikTok'], icon: 'video', link: 'https://vidyo.ai', favorite: false },
      { id: '110', name: 'Colourlab AI', description: 'Assistente de correção de cor de nível de Hollywood. Se tiverem filmado com três câmaras diferentes, a IA faz o color matching (iguala as cores) de todas as câmaras num clique, poupando horas aos coloristas.', category: 'Vídeo', subcategory: 'Edição', badges: ['Freemium'], tags: ['Vídeo', 'Cor', 'Grading'], icon: 'video', link: 'https://colourlab.ai', favorite: false },
      { id: '111', name: 'Pictory', description: 'Cria vídeos dinâmicos automaticamente a partir de guiões ou artigos de blog do cliente. A IA lê o texto, seleciona vídeos de stock (b-roll) que combinem com o tema, adiciona locuções e legendas.', category: 'Vídeo', subcategory: 'Edição', badges: ['Freemium'], tags: ['Vídeo', 'Blog', 'Stock'], icon: 'video', link: 'https://pictory.ai', favorite: false },
      { id: '112', name: 'Papercup', description: 'Ferramenta de dobragem/dublagem empresarial. Permite traduzir um vídeo institucional de um cliente para vários idiomas, gerando vozes sintéticas altamente realistas e sincronizadas.', category: 'Vídeo', subcategory: 'Edição', badges: ['Pago'], tags: ['Vídeo', 'Dublagem', 'Tradução'], icon: 'video', link: 'https://papercup.com', favorite: false },
      { id: '113', name: 'Rokoko Video', description: 'Captura de movimento (Motion Capture) alimentada por IA. A equipa de animação/3D pode usar um vídeo normal de uma pessoa a dançar, e a IA extrai os movimentos para aplicar num boneco 3D, sem precisar daqueles fatos com sensores caros.', category: 'Vídeo', subcategory: 'Edição', badges: ['Freemium'], tags: ['Vídeo', 'Motion Capture', '3D'], icon: 'video', link: 'https://rokoko.com/products/video', favorite: false },
      { id: '114', name: 'Flawless AI', description: 'Ferramenta de edição de diálogos avançada (Hollywood 2.0). Se o cliente se enganou numa palavra durante a gravação e não há tempo para regravar, a IA altera o movimento dos lábios no vídeo para combinar com a nova palavra gravada em estúdio.', category: 'Vídeo', subcategory: 'Edição', badges: ['Pago'], tags: ['Vídeo', 'Lábios', 'Diálogo'], icon: 'video', link: 'https://flawlessai.com', favorite: false },
      { id: '115', name: 'Krock.io', description: 'Plataforma de colaboração para equipas de vídeo e animação. Permite partilhar o vídeo com o cliente, que pode desenhar no ecrã e deixar comentários exatos no frame (segundo) específico onde quer a alteração.', category: 'Vídeo', subcategory: 'Edição', badges: ['Freemium'], tags: ['Vídeo', 'Colaboração', 'Feedback'], icon: 'video', link: 'https://krock.io', favorite: false },
      { id: '116', name: 'Gling', description: 'Focado em YouTubers e criadores de conteúdo. Lê o vídeo bruto e corta automaticamente todos os silêncios e "takes" falhados (quando o locutor se engana e repete a frase), entregando uma timeline limpa.', category: 'Vídeo', subcategory: 'Edição', badges: ['Free'], tags: ['Vídeo', 'YouTube', 'Corte'], icon: 'video', link: 'https://gling.ai', favorite: false },
      { id: '117', name: 'Kapwing AI', description: 'Um estúdio criativo online muito completo e colaborativo, excelente alternativa ao Veed.io para criação rápida de memes, edição de vídeos curtos e redimensionamento para redes sociais.', category: 'Vídeo', subcategory: 'Edição', badges: ['Freemium'], tags: ['Vídeo', 'Memes', 'Redes Sociais'], icon: 'video', link: 'https://kapwing.com', favorite: false },
      { id: '118', name: 'Pixop', description: 'Serviço baseado na nuvem (cloud) para remasterização e melhoramento de vídeos pesados, ideal para quando os computadores da agência não têm potência gráfica suficiente para rodar o Topaz Video AI localmente.', category: 'Vídeo', subcategory: 'Edição', badges: ['Pago'], tags: ['Vídeo', 'Cloud', 'Upscaling'], icon: 'video', link: 'https://pixop.com', favorite: false },
      { id: '119', name: 'Tavus', description: 'O líder em vídeos hiper-personalizados em massa. Gravas um vídeo uma vez e a plataforma altera os teus lábios e voz de forma fotorrealista para dizer o nome, a empresa ou outros dados de milhares de clientes diferentes.', category: 'Vídeo', subcategory: 'Personalização', badges: ['Freemium'], tags: ['Vídeo', 'Personalização', 'Marketing'], icon: 'video', link: 'https://tavus.io', favorite: false },
      { id: '120', name: 'BHuman', description: 'Concorrente direto do Tavus, com um foco muito forte em E-commerce e Lojas Online. Excelente para automatizar o envio de vídeos de boas-vindas ou recuperação de carrinhos abandonados com o nome de cada comprador.', category: 'Vídeo', subcategory: 'Personalização', badges: ['Freemium'], tags: ['Vídeo', 'E-commerce', 'Personalização'], icon: 'video', link: 'https://bhuman.ai', favorite: false },
      { id: '121', name: 'Windsor', description: 'Plataforma dedicada à fidelização de clientes. Integra-se nativamente com CRMs (como o Klaviyo ou Shopify) para enviar vídeos gravados pelos fundadores da marca, personalizados para milhões de clientes.', category: 'Vídeo', subcategory: 'Personalização', badges: ['Pago'], tags: ['Vídeo', 'CRM', 'Fidelização'], icon: 'video', link: 'https://windsor.io', favorite: false },
      { id: '122', name: 'ReachOut.AI', description: 'Focado inteiramente na prospecção B2B (Cold Email/LinkedIn). Gera e anexa vídeos 1:1 em campanhas de vendas, aumentando drasticamente as taxas de resposta em comparação com e-mails tradicionais de texto.', category: 'Vídeo', subcategory: 'Personalização', badges: ['Freemium'], tags: ['Vídeo', 'B2B', 'Vendas'], icon: 'video', link: 'https://reachout.ai', favorite: false },
      { id: '123', name: 'Colossyan', description: 'Excelente criador de vídeos corporativos com atores reais/avatares. Destaca-se por permitir a localização em escala: cria um vídeo de treino e a IA adapta-o automaticamente para dezenas de idiomas com sincronização labial.', category: 'Vídeo', subcategory: 'Personalização', badges: ['Pago'], tags: ['Vídeo', 'Localização', 'Corporativo'], icon: 'video', link: 'https://colossyan.com', favorite: false },
      { id: '124', name: 'Rephrase.ai', description: 'Especializado em campanhas de marketing de vídeo hiper-personalizadas. Permite às marcas usar embaixadores ou influenciadores (com autorização) para gerar vídeos únicos para cada utilizador de uma campanha.', category: 'Vídeo', subcategory: 'Personalização', badges: ['Pago'], tags: ['Vídeo', 'Influenciadores', 'Marketing'], icon: 'video', link: 'https://rephrase.ai', favorite: false },
      { id: '125', name: 'InVideo', description: 'Uma suite robusta para a agência produzir conteúdo em escala. Embora não altere rostos, permite gerar centenas de variações de anúncios de vídeo (A/B testing) rapidamente a partir de guiões de texto e templates.', category: 'Vídeo', subcategory: 'Personalização', badges: ['Freemium'], tags: ['Vídeo', 'A/B Testing', 'Anúncios'], icon: 'video', link: 'https://invideo.io', favorite: false },
      { id: '126', name: 'Shuffll', description: 'Acelera a produção de conteúdo corporativo. A IA escreve o guião, sugere a arte e guia a gravação num estúdio virtual, ideal para equipas de marketing que precisam de lançar vídeos promocionais em tempo recorde.', category: 'Vídeo', subcategory: 'Personalização', badges: ['Pago'], tags: ['Vídeo', 'Corporativo', 'Produção'], icon: 'video', link: 'https://shuffll.com', favorite: false },
      { id: '127', name: 'Scribe', description: 'Uma ferramenta absolutamente obrigatória para os processos internos da tua agência. Ao ligares a extensão, ela regista os teus cliques e transforma qualquer processo num site ou software num guia visual passo-a-passo (com capturas de ecrã e texto) em segundos.', category: 'Vídeo', subcategory: 'Personalização', badges: ['Freemium'], tags: ['Vídeo', 'Tutorial', 'Documentação'], icon: 'video', link: 'https://scribehow.com', favorite: false },
      { id: '128', name: 'Trint', description: 'Focada em transcrição profissional e legendagem para jornalistas e produtores de conteúdo, com alta precisão e ferramentas de colaboração para equipas.', category: 'Vídeo', subcategory: 'Legendas', badges: ['Pago'], tags: ['Vídeo', 'Transcrição', 'Legendas'], icon: 'video', link: 'https://trint.com', favorite: false },
      { id: '129', name: 'Nova A.I.', description: 'Plataforma simples e eficiente para adicionar legendas automáticas, traduzir e personalizar vídeos para várias plataformas de Redes Sociais, com foco na acessibilidade.', category: 'Vídeo', subcategory: 'Legendas', badges: ['Freemium'], tags: ['Vídeo', 'Legendas', 'Acessibilidade'], icon: 'video', link: 'https://novai.co', favorite: false },
      { id: '130', name: 'Pika Labs', description: 'Uma ferramenta poderosa de geração de vídeo a partir de texto e imagem, com uma comunidade ativa e bons resultados para animações curtas e criativas.', category: 'Vídeo', subcategory: 'Animação', badges: ['Free'], tags: ['Vídeo', 'Animação', 'Text-to-Video'], icon: 'video', link: 'https://pika.art', favorite: false },
      { id: '131', name: 'ElevenLabs', description: 'O líder absoluto do mercado em realismo. Gera vozes que expressam emoção genuína, respiração natural e entoação perfeita a partir de texto. A sua ferramenta de clonagem de voz é a mais avançada e assustadoramente precisa que existe.', category: 'Audio', subcategory: 'Geração de Voz', badges: ['Freemium'], tags: ['Audio', 'TTS', 'Clonagem Vocal'], icon: 'message-square', link: 'https://elevenlabs.io', favorite: false },
      { id: '132', name: 'Adobe Podcast', description: 'Um autêntico salva-vidas. Transforma o áudio amador gravado num telemóvel no meio da rua (com vento e ruído) numa gravação limpa com qualidade de estúdio em apenas um clique.', category: 'Audio', subcategory: 'Edição', badges: ['Free'], tags: ['Audio', 'Enhance', 'Podcast'], icon: 'message-square', link: 'https://podcast.adobe.com/enhance', favorite: false },
      { id: '133', name: 'Rask.ai', description: 'Ferramenta brutal para internacionalização de campanhas. Traduz e dobra vídeos para dezenas de idiomas, clonando o tom de voz original do locutor para que a tradução soe natural.', category: 'Audio', subcategory: 'Edição', badges: ['Pago'], tags: ['Audio', 'Tradução', 'Dublagem'], icon: 'message-square', link: 'https://rask.ai', favorite: false },
      { id: '134', name: 'Lyria 3', description: 'O meu modelo multimodal nativo de geração de música de alta fidelidade. Cria faixas originais de 30 segundos (livres de problemas de direitos autorais para campanhas), com controlo granular sobre o tempo, género e emoção. (Todas as faixas incluem marca de água SynthID).', category: 'Audio', subcategory: 'Edição', badges: ['Freemium'], tags: ['Audio', 'Música', 'Gemini'], icon: 'message-square', link: 'https://gemini.google.com', favorite: false },
      { id: '135', name: 'Lalal.ai', description: 'A melhor ferramenta do mercado para extração de stems (faixas separadas). Permite isolar a voz humana de um ficheiro e remover completamente a música de fundo ou os instrumentos, com precisão cirúrgica.', category: 'Audio', subcategory: 'Edição', badges: ['Pago'], tags: ['Audio', 'Stems', 'Isolamento'], icon: 'message-square', link: 'https://lalal.ai', favorite: false },
      { id: '136', name: 'Cleanvoice AI', description: 'Essencial para edição de podcasts. Remove automaticamente sons de respiração pesada, gaguejos ("eh", "hum"), estalidos de boca e silêncios mortos, poupando horas de edição manual.', category: 'Audio', subcategory: 'Edição', badges: ['Freemium'], tags: ['Audio', 'Podcast', 'Limpeza'], icon: 'message-square', link: 'https://cleanvoice.ai', favorite: false },
      { id: '137', name: 'Respeecher', description: 'Clonagem de voz de nível de Hollywood (tecnologia usada pela Disney/Lucasfilm). Perfeito para campanhas publicitárias de alto orçamento que exigem manipulação vocal perfeita ou recriação de vozes com autorização legal.', category: 'Audio', subcategory: 'Edição', badges: ['Freemium'], tags: ['Audio', 'Clonagem', 'Hollywood'], icon: 'message-square', link: 'https://marketplace.respeecher.com', favorite: false },
      { id: '138', name: 'Krisp', description: 'Aplicação de fundo obrigatória para a produtividade da agência. Cancela o ruído de fundo, vozes de outras pessoas no escritório e o eco em tempo real durante chamadas de briefing no Zoom/Teams com clientes.', category: 'Audio', subcategory: 'Edição', badges: ['Freemium'], tags: ['Audio', 'Ruído', 'Zoom'], icon: 'message-square', link: 'https://krisp.ai', favorite: false },
      { id: '139', name: 'Podcastle', description: 'Estúdio de gravação e edição de áudio online. Ideal para a agência gravar entrevistas remotas de alta qualidade para podcasts de clientes, com processamento de áudio integrado na cloud.', category: 'Audio', subcategory: 'Edição', badges: ['Freemium'], tags: ['Audio', 'Podcast', 'Gravação'], icon: 'message-square', link: 'https://podcastle.ai', favorite: false },
      { id: '140', name: 'Beatoven.ai', description: 'Excelente alternativa para gerar música de fundo contínua e adaptável a moods (estados de espírito) específicos, desenhada à medida para acompanhar vídeos de YouTube ou Redes Sociais.', category: 'Audio', subcategory: 'Edição', badges: ['Freemium'], tags: ['Audio', 'Música', 'Background'], icon: 'message-square', link: 'https://beatoven.ai', favorite: false },
      { id: '141', name: 'Gladia', description: 'API de transcrição e tradução de áudio ultrarrápida. Excelente para a equipa de Devs integrar funcionalidades de transcrição de voz em aplicações ou sites desenvolvidos para clientes.', category: 'Audio', subcategory: 'Edição', badges: ['Freemium'], tags: ['Audio', 'API', 'Transcrição'], icon: 'message-square', link: 'https://gladia.io', favorite: false },
      { id: '142', name: 'AudioNotes', description: 'Ferramenta de produtividade fantástica. Grava as reuniões de trabalho da equipa, transcreve o áudio e gera instantaneamente um resumo estruturado em formato de texto com os próximos passos e tarefas atribuídas.', category: 'Audio', subcategory: 'Edição', badges: ['Freemium'], tags: ['Audio', 'Reuniões', 'Resumo'], icon: 'message-square', link: 'https://audionotes.app', favorite: false },
      { id: '143', name: 'Suno AI', description: 'O "Midjourney" da música. Gera canções completas de altíssima qualidade em qualquer género musical (com vozes super realistas e instrumentos) a partir de um simples comando de texto. (No plano pago, a agência detém os direitos comerciais).', category: 'Audio', subcategory: 'Música', badges: ['Freemium'], tags: ['Audio', 'Música', 'Text-to-Music'], icon: 'message-square', link: 'https://suno.com', favorite: false },
      { id: '144', name: 'Udio', description: 'O grande concorrente do Suno. Oferece uma qualidade de áudio cristalina (nível de rádio) e dá um controlo absurdo sobre a estrutura da música (adicionar intros, solos de guitarra, refrões).', category: 'Audio', subcategory: 'Música', badges: ['Freemium'], tags: ['Audio', 'Música', 'Geração'], icon: 'message-square', link: 'https://udio.com', favorite: false },
      { id: '145', name: 'Soundraw', description: 'A ferramenta de música B2B mais segura para criadores de vídeo. Em vez de gerar vozes, gera música de fundo (instrumental) onde tu escolhes a duração exata, o ritmo (mood) e o género, para encaixar perfeitamente na edição do vídeo promocional.', category: 'Audio', subcategory: 'Música', badges: ['Freemium'], tags: ['Audio', 'Música', 'Instrumental'], icon: 'message-square', link: 'https://soundraw.io', favorite: false },
      { id: '146', name: 'Synthesizer V', description: 'O software de topo para síntese vocal (canto). A equipa de áudio escreve a letra, insere as notas MIDI, e a IA canta com vozes hiper-realistas (com respirações e vibratos). Perfeito para criar jingles publicitários sem contratar cantores.', category: 'Audio', subcategory: 'Música', badges: ['Freemium'], tags: ['Audio', 'Música', 'Canto'], icon: 'message-square', link: 'https://dreamtonics.com/synthesizerv', favorite: false },
      { id: '147', name: 'Landr', description: 'O padrão da indústria para masterização de áudio automatizada. A agência faz o upload da faixa de áudio de um podcast ou anúncio, e a IA masteriza o som com qualidade de estúdio, pronto para TV, Spotify ou YouTube.', category: 'Audio', subcategory: 'Música', badges: ['Pago'], tags: ['Audio', 'Masterização', 'Estúdio'], icon: 'message-square', link: 'https://landr.com', favorite: false },
      { id: '148', name: 'Soundful', description: 'Excelente alternativa ao Soundraw para gerar faixas musicais royalty-free de alta qualidade com um simples clique, muito focada em produtores de conteúdo e agências digitais.', category: 'Audio', subcategory: 'Música', badges: ['Freemium'], tags: ['Audio', 'Música', 'Royalty-Free'], icon: 'message-square', link: 'https://soundful.com', favorite: false },
      { id: '149', name: 'Kits AI', description: 'Plataforma para criadores musicais que permite treinar modelos de voz ou usar vozes de artistas parceiros de forma legal e licenciada (ao contrário dos clones piratas), promovendo a colaboração com os detentores dos direitos.', category: 'Audio', subcategory: 'Música', badges: ['Freemium'], tags: ['Audio', 'Música', 'Voz'], icon: 'message-square', link: 'https://app.kits.ai', favorite: false },
      { id: '150', name: 'AudioShake', description: 'Ferramenta de nível empresarial para separar faixas de áudio (stems). Permite pegar numa música completa e isolar perfeitamente a bateria, o baixo, a guitarra e a voz para usar em remixes de campanhas.', category: 'Audio', subcategory: 'Música', badges: ['Freemium'], tags: ['Audio', 'Stems', 'Remix'], icon: 'message-square', link: 'https://indie.audioshake.ai', favorite: false },
      { id: '151', name: 'WavTool', description: 'Uma Estação de Trabalho de Áudio Digital (DAW) completa que corre diretamente no browser do computador. Tem um assistente de IA integrado (chatbot) que ajuda a compor acordes, criar batidas e misturar a faixa para quem não tem formação musical avançada.', category: 'Audio', subcategory: 'Música', badges: ['Freemium'], tags: ['Audio', 'DAW', 'Composição'], icon: 'message-square', link: 'https://wavtool.com', favorite: false },
      { id: '152', name: 'A.V. Mapping', description: 'Ferramenta genial para videógrafos. Fazes upload do vídeo do cliente e a IA analisa o conteúdo visual, recomendando automaticamente a melhor música licenciada para sincronizar com a imagem.', category: 'Audio', subcategory: 'Música', badges: ['Freemium'], tags: ['Audio', 'Música', 'Vídeo'], icon: 'message-square', link: 'https://avmapping.co', favorite: false },
      { id: '153', name: 'Orb Producer', description: 'Um plugin indispensável para os produtores musicais da agência. Ajuda a criar padrões musicais profissionais, sugerindo infinitas progressões de acordes, linhas de baixo e melodias.', category: 'Audio', subcategory: 'Música', badges: ['Pago'], tags: ['Audio', 'Música', 'Plugin'], icon: 'message-square', link: 'https://orbplugins.com', favorite: false },
      { id: '154', name: 'Loudly', description: 'Biblioteca de música royalty-free e gerador rápido de faixas, excelente para a equipa de Social Media encontrar o som de fundo perfeito para um Reel ou TikTok em segundos.', category: 'Audio', subcategory: 'Música', badges: ['Freemium'], tags: ['Audio', 'Música', 'Royalty-Free'], icon: 'message-square', link: 'https://loudly.com', favorite: false },
      { id: '155', name: 'Fireflies.ai', description: 'O melhor assistente de reuniões para a agência. O bot entra automaticamente nas vossas chamadas de Zoom/Teams com clientes, grava, transcreve tudo com alta precisão e gera um resumo inteligente com os "próximos passos" e tarefas atribuídas a cada membro da equipa.', category: 'Audio', subcategory: 'Transcrição', badges: ['Freemium'], tags: ['Audio', 'Transcrição', 'Reuniões'], icon: 'message-square', link: 'https://fireflies.ai', favorite: false },
      { id: '156', name: 'MacWhisper', description: 'O motor de transcrição mais preciso do mundo (da OpenAI). O MacWhisper é essencial porque corre localmente no computador: ou seja, se tiverem áudios confidenciais de clientes, podem transcrevê-los sem que os ficheiros vão parar à internet.', category: 'Audio', subcategory: 'Transcrição', badges: ['Free', 'Freemium'], tags: ['Audio', 'Transcrição', 'Privacidade'], icon: 'message-square', link: 'https://goodsnooze.gumroad.com/l/macwhisper', favorite: false },
      { id: '157', name: 'Sonix', description: 'A plataforma de topo para transcrição e tradução em mais de 38 idiomas. O seu editor de texto sincronizado com o áudio é o padrão da indústria para equipas que precisam de transcrever documentários ou entrevistas longas.', category: 'Audio', subcategory: 'Transcrição', badges: ['Pago'], tags: ['Audio', 'Transcrição', 'Tradução'], icon: 'message-square', link: 'https://sonix.ai', favorite: false },
      { id: '158', name: 'Podsqueeze', description: 'Um verdadeiro "funcionário de IA" para agências que gerem podcasts. Fazes upload do áudio e ele gera automaticamente as Show Notes (notas do episódio), os timestamps (tempos dos temas), títulos e até a newsletter para enviar aos ouvintes.', category: 'Audio', subcategory: 'Transcrição', badges: ['Freemium'], tags: ['Audio', 'Podcast', 'Show Notes'], icon: 'message-square', link: 'https://podsqueeze.com', favorite: false },
      { id: '159', name: 'Speechmatics', description: 'Tecnologia de voz-para-texto de nível empresarial (Enterprise). É a melhor ferramenta do mercado a entender sotaques pesados, calão e vozes sobrepostas. Excelente para os programadores (Devs) integrarem via API em projetos exigentes.', category: 'Audio', subcategory: 'Transcrição', badges: ['Pago'], tags: ['Audio', 'Transcrição', 'Enterprise'], icon: 'message-square', link: 'https://speechmatics.com', favorite: false },
      { id: '160', name: 'Riverside AI', description: 'Se a agência grava podcasts remotos em vídeo/áudio para clientes, o Riverside é obrigatório. Além de gravar em alta qualidade local, a sua transcrição nativa é incrivelmente rápida e fiável.', category: 'Audio', subcategory: 'Transcrição', badges: ['Freemium'], tags: ['Audio', 'Podcast', 'Gravação'], icon: 'message-square', link: 'https://riverside.fm', favorite: false },
      { id: '161', name: 'AudioPen', description: 'Ferramenta de produtividade fantástica para criativos e copywriters. Podes gravar um áudio enquanto caminhas a falar de forma caótica sobre uma ideia para uma campanha, e a IA transcreve e reescreve tudo num texto limpo, estruturado e profissional.', category: 'Audio', subcategory: 'Transcrição', badges: ['Freemium'], tags: ['Audio', 'Transcrição', 'Produtividade'], icon: 'message-square', link: 'https://audiopen.ai', favorite: false },
      { id: '162', name: 'Supertranslate', description: 'Uma "bala de prata" para campanhas internacionais. Adiciona as legendas originais a um vídeo e converte-as para qualquer outro idioma do mundo com apenas um clique, mantendo os tempos perfeitos.', category: 'Audio', subcategory: 'Transcrição', badges: ['Freemium'], tags: ['Audio', 'Tradução', 'Legendas'], icon: 'message-square', link: 'https://supertranslate.ai', favorite: false },
      { id: '163', name: 'Cogram', description: 'Excelente alternativa focada em privacidade e equipas B2B. Resume reuniões, extrai insights e sincroniza as tarefas diretamente com o CRM da agência (como o Salesforce ou Hubspot).', category: 'Audio', subcategory: 'Transcrição', badges: ['Pago'], tags: ['Audio', 'Reuniões', 'CRM'], icon: 'message-square', link: 'https://cogram.com', favorite: false },
      { id: '164', name: 'Murf.ai', description: 'A principal escolha para o mercado corporativo. Oferece uma biblioteca massiva de mais de 120 vozes de atores profissionais (com opções para diferentes tons de voz, do "autoritário" ao "amigável"), sendo ideal para apresentações empresariais e vídeos de e-learning.', category: 'Audio', subcategory: 'Geração de Voz', badges: ['Freemium'], tags: ['Audio', 'TTS', 'Corporativo'], icon: 'message-square', link: 'https://murf.ai', favorite: false },
      { id: '165', name: 'Play.ht', description: 'Uma plataforma incrível para criadores de vídeo. O grande diferencial do Play.ht (além das vozes ultra-realistas) é a sua API robusta e o suporte para pronunciar jargão técnico e nomes de marcas de forma impecável, o que é crucial em vídeos de B2B.', category: 'Audio', subcategory: 'Geração de Voz', badges: ['Freemium'], tags: ['Audio', 'TTS', 'API'], icon: 'message-square', link: 'https://play.ht', favorite: false },
      { id: '166', name: 'WellSaid Labs', description: 'Concorrente de peso do Murf, muito focado na qualidade de estúdio. É frequentemente usado por grandes marcas para criar locuções para publicidade digital, devido à sua interface altamente colaborativa para equipas de marketing.', category: 'Audio', subcategory: 'Geração de Voz', badges: ['Freemium'], tags: ['Audio', 'TTS', 'Marketing'], icon: 'message-square', link: 'https://wellsaidlabs.com', favorite: false },
      { id: '167', name: 'Resemble AI', description: 'Muito mais focado na criação de avatares sintéticos baseados em atores reais e na clonagem vocal profunda. É a ferramenta certa se a agência precisar de criar um "embaixador da marca" virtual e exclusivo que fale através de texto.', category: 'Audio', subcategory: 'Geração de Voz', badges: ['Pago'], tags: ['Audio', 'Clonagem', 'Avatar'], icon: 'message-square', link: 'https://resemble.ai', favorite: false },
      { id: '168', name: 'Lovo.ai', description: 'Uma suite bastante completa que inclui não só um gerador de texto-para-voz muito capaz, mas também um gerador de guiões por IA e uma interface de edição de vídeo básica, facilitando a produção de criativos rápidos para redes sociais.', category: 'Audio', subcategory: 'Geração de Voz', badges: ['Freemium'], tags: ['Audio', 'TTS', 'Redes Sociais'], icon: 'message-square', link: 'https://lovo.ai', favorite: false },
      { id: '169', name: 'Speechify', description: 'Um dos geradores mais populares, especialmente bom a converter textos muito longos (como artigos de blog de clientes ou manuais de produto) em áudios fluidos para podcasts ou versões em áudio do próprio artigo.', category: 'Audio', subcategory: 'Geração de Voz', badges: ['Freemium'], tags: ['Audio', 'TTS', 'Artigos'], icon: 'message-square', link: 'https://speechify.com', favorite: false },
      { id: '170', name: 'Voicemaker', description: 'Oferece vozes neuronais padrão de alta qualidade e integrações fáceis para desenvolvedores através de uma API em conta, sendo uma boa opção de backup para projetos com menor orçamento.', category: 'Audio', subcategory: 'Geração de Voz', badges: ['Freemium'], tags: ['Audio', 'TTS', 'API'], icon: 'message-square', link: 'https://voicemaker.in', favorite: false },
      { id: '171', name: 'MetaVoice', description: 'Destaca-se na clonagem de voz e na alteração de identidade vocal em tempo real. Muito útil para a equipa criativa que quer gravar um guião com a sua própria voz e depois, com um clique, transformar essa gravação na voz do locutor pretendido.', category: 'Audio', subcategory: 'Geração de Voz', badges: ['Freemium'], tags: ['Audio', 'Clonagem', 'Tempo Real'], icon: 'message-square', link: 'https://themetavoice.xyz', favorite: false },

      // Categoria: 3D & Animação - Geração de Modelos 3D & WebGL
      { id: '172', name: 'Meshy AI', description: 'Cria ativos 3D fotorrealistas ou estilizados a partir de texto ou imagens, com otimização automática da malha (mesh) e texturas UV.', category: '3D', subcategory: 'Geração de Modelos 3D & WebGL', badges: ['Freemium'], tags: ['3D', 'Modelação', 'Texturas'], icon: 'box', link: 'https://meshy.ai', favorite: false },
      { id: '173', name: 'Tripo3D', description: 'Gerador ultrarrápido que cria modelos 3D complexos e detalhados em segundos a partir de uma única fotografia do produto.', category: '3D', subcategory: 'Geração de Modelos 3D & WebGL', badges: ['Freemium'], tags: ['3D', 'Fotografia', 'Modelação'], icon: 'box', link: 'https://tripo3d.ai', favorite: false },
      { id: '174', name: 'Spline AI', description: 'A plataforma de eleição para Web Designers criarem sites interativos. Permite gerar objetos e aplicar materiais 3D através de comandos de texto.', category: '3D', subcategory: 'Geração de Modelos 3D & WebGL', badges: ['Freemium'], tags: ['3D', 'Web Design', 'Interativo'], icon: 'box', link: 'https://spline.design/ai', favorite: false },
      { id: '175', name: 'Kaedim', description: 'Especializada em converter Concept Art (desenhos 2D) em modelos 3D de alta precisão com topologia limpa para produção profissional.', category: '3D', subcategory: 'Geração de Modelos 3D & WebGL', badges: ['Pago'], tags: ['3D', 'Concept Art', 'Produção'], icon: 'box', link: 'https://kaedim3d.com', favorite: false },
      { id: '176', name: 'CSM.ai', description: 'Simplifica a conversão de imagens para 3D. Muito útil para e-commerce, robótica e prototipagem em Realidade Aumentada (AR).', category: '3D', subcategory: 'Geração de Modelos 3D & WebGL', badges: ['Freemium'], tags: ['3D', 'E-commerce', 'AR'], icon: 'box', link: 'https://csm.ai', favorite: false },

      // Categoria: 3D & Animação - Fotogrametria & Ambientes 360º
      { id: '177', name: 'Polycam', description: 'App de fotogrametria que transforma o telemóvel num scanner 3D. Filma objetos reais e a IA entrega modelos 3D texturizados perfeitos.', category: '3D', subcategory: 'Fotogrametria & Ambientes 360º', badges: ['Freemium'], tags: ['3D', 'Fotogrametria', 'Scanner'], icon: 'box', link: 'https://poly.cam', favorite: false },
      { id: '178', name: 'Luma AI', description: 'O padrão para fotorrealismo e Gaussian Splatting. Transforma vídeos normais capturados com o telemóvel em ambientes 3D hiper-realistas e navegáveis.', category: '3D', subcategory: 'Fotogrametria & Ambientes 360º', badges: ['Freemium'], tags: ['3D', 'Fotorrealismo', 'Gaussian Splatting'], icon: 'box', link: 'https://lumalabs.ai', favorite: false },
      { id: '179', name: 'Skybox Lab', description: 'Gera ambientes panorâmicos 360º fotorrealistas a partir de texto. Perfeito para usar como fundo HDRI em motores de renderização.', category: '3D', subcategory: 'Fotogrametria & Ambientes 360º', badges: ['Freemium'], tags: ['3D', 'HDRI', '360º'], icon: 'box', link: 'https://skybox.blockadelabs.com', favorite: false },

      // Categoria: 3D & Animação - Captura de Movimento & Animação
      { id: '180', name: 'DeepMotion', description: 'Extrai a captura de movimento de um simples vídeo 2D de uma pessoa e aplica a animação diretamente num personagem 3D.', category: '3D', subcategory: 'Captura de Movimento & Animação', badges: ['Freemium'], tags: ['3D', 'Mocap', 'Animação'], icon: 'box', link: 'https://deepmotion.com', favorite: false },
      { id: '181', name: 'Plask', description: 'Ferramenta baseada no browser para animação de personagens via vídeo. Ideal para animadores que precisam de prototipar movimentos rapidamente.', category: '3D', subcategory: 'Captura de Movimento & Animação', badges: ['Freemium'], tags: ['3D', 'Browser', 'Animação'], icon: 'box', link: 'https://plask.ai', favorite: false },
      { id: '182', name: 'AccuRIG', description: 'Faz Auto-Rigging. Deteta automaticamente braços, pernas e articulações num modelo 3D estático e cria o esqueleto funcional num minuto.', category: '3D', subcategory: 'Captura de Movimento & Animação', badges: ['Free'], tags: ['3D', 'Rigging', 'Automação'], icon: 'box', link: 'https://actorcore.reallusion.com/auto-rig', favorite: false },
      { id: '183', name: 'NVIDIA Audio2Face', description: 'Anima o rosto e os lábios de um personagem 3D automaticamente em tempo real, baseando-se apenas num ficheiro de áudio com a locução.', category: '3D', subcategory: 'Captura de Movimento & Animação', badges: ['Free'], tags: ['3D', 'Facial', 'Áudio'], icon: 'box', link: 'https://nvidia.com/omniverse/apps/audio2face', favorite: false },

      // Categoria: 3D & Animação - Texturas & Materiais
      { id: '184', name: 'Polyhive', description: 'Gera texturas adaptadas especificamente a malhas 3D (meshes), mantendo a consistência do estilo visual em toda a campanha.', category: '3D', subcategory: 'Texturas & Materiais', badges: ['Freemium'], tags: ['3D', 'Texturas', 'PBR'], icon: 'box', link: 'https://polyhive.ai', favorite: false },
      { id: '185', name: 'Texture Lab', description: 'Gerador rápido de texturas 3D PBR prontas a usar (incluindo mapas de normais, altura e reflexo) a partir de descrições de texto.', category: '3D', subcategory: 'Texturas & Materiais', badges: ['Freemium'], tags: ['3D', 'PBR', 'Materiais'], icon: 'box', link: 'https://texturelab.xyz', favorite: false },

      // Categoria: Código - SQL & Análise de Banco de Dados
      { id: '186', name: 'Ai2sql', description: 'O padrão para democratizar o acesso aos dados. Permite que não engenheiros escrevam consultas SQL eficientes sem saber SQL. Excelente para a equipa de Marketing extrair dados de campanhas autonomamente.', category: 'Código', subcategory: 'SQL', badges: ['Freemium'], tags: ['SQL', 'Queries', 'Linguagem Natural'], icon: 'sparkles', link: 'https://ai2sql.io', favorite: false },
      { id: '187', name: 'EverSQL', description: 'Ferramenta indispensável para Backend. Explica automaticamente e de forma simples o que a consulta SQL faz, gratuitamente. Incrivelmente útil para otimizar queries lentas que estejam a travar o site de um cliente.', category: 'Código', subcategory: 'SQL', badges: ['Free'], tags: ['SQL', 'Otimização', 'Performance'], icon: 'sparkles', link: 'https://eversql.com/sql-query-text', favorite: false },
      { id: '188', name: 'MindsDB', description: 'Plataforma avançada que traz NLP dentro do banco de dados. Permite criar, treinar e implantar modelos de Machine Learning diretamente usando código SQL padrão, sem precisar de mudar dados de sítio.', category: 'Código', subcategory: 'SQL', badges: ['Freemium'], tags: ['SQL', 'Machine Learning', 'NLP'], icon: 'sparkles', link: 'https://mindsdb.com', favorite: false },
      { id: '189', name: 'Olli.ai', description: 'Analista de dados de IA. Responde a perguntas e cria gráficos 10 vezes mais rápido. Ideal para gerar relatórios visuais complexos para clientes a partir de bases de dados brutas.', category: 'Código', subcategory: 'SQL', badges: ['Pago'], tags: ['SQL', 'Analytics', 'Gráficos'], icon: 'sparkles', link: 'https://olli.ai', favorite: false },
      { id: '190', name: 'OtterTune', description: 'Ferramenta de ajuste de banco de dados que otimiza o desempenho e reduz os custos para bancos de dados PostgreSQL e MySQL. Excelente adição para DevOps.', category: 'Código', subcategory: 'SQL', badges: ['Freemium'], tags: ['SQL', 'Performance', 'PostgreSQL', 'MySQL'], icon: 'sparkles', link: 'https://ottertune.com', favorite: false },
      { id: '191', name: 'Outerbase', description: 'Interface de banco de dados amigável para explorar dados. Combina geração de SQL por IA (assistente EZQL) com interface visual intuitiva, substituindo ferramentas antigas de gestão de bases de dados.', category: 'Código', subcategory: 'SQL', badges: ['Freemium'], tags: ['SQL', 'Interface', 'EZQL'], icon: 'sparkles', link: 'https://outerbase.com', favorite: false },
      { id: '192', name: 'Text2SQL', description: 'Solução simples, direta e popular para tarefas rápidas do dia a dia. Transforma Linguagem Natural em Consultas SQL com Facilidade. Ideal para snippets rápidos.', category: 'Código', subcategory: 'SQL', badges: ['Free'], tags: ['SQL', 'Linguagem Natural', 'Snippets'], icon: 'sparkles', link: 'https://toolske.com/text2sql', favorite: false },
      { id: '193', name: 'Coginiti', description: 'Plataforma colaborativa desenhada para equipas de dados. Simplifica o Desenvolvimento SQL e aumenta a Produtividade de Dados e Análise com Capacidades de IA Generativa Responsável.', category: 'Código', subcategory: 'SQL', badges: ['Freemium'], tags: ['SQL', 'Colaboração', 'Equipas'], icon: 'sparkles', link: 'https://coginiti.co', favorite: false },
      { id: '194', name: 'AI Query', description: 'Uma das formas mais limpas e diretas do mercado para criar código a partir de texto. Premissa simples: Gere SQL sem erros em segundos.', category: 'Código', subcategory: 'SQL', badges: ['Pago'], tags: ['SQL', 'Geração', 'Texto'], icon: 'sparkles', link: 'https://aiquery.co', favorite: false },

      // Categoria: Código - Planilhas (Excel & Sheets)
      { id: '195', name: 'GPT for Sheets (and Docs)', description: 'O verdadeiro canivete suíço. Traz a IA diretamente para dentro das células do Google Sheets. Perfeito para SEO limpar palavras-chave, traduzir milhares de linhas ou categorizar sentimentos de feedbacks usando a fórmula =GPT().', category: 'Código', subcategory: 'Planilhas', badges: ['Freemium'], tags: ['Google Sheets', 'Excel', 'GPT'], icon: 'sparkles', link: 'https://workspace.google.com', favorite: false },
      { id: '196', name: 'Excel Formula Bot', description: 'O padrão ouro da indústria. Escreves o que queres em linguagem natural e gera a fórmula de Excel ou Google Sheets perfeita. Acaba com as horas perdidas a tentar perceber o que está errado num código.', category: 'Código', subcategory: 'Planilhas', badges: ['Freemium'], tags: ['Excel', 'Fórmulas', 'Linguagem Natural'], icon: 'sparkles', link: 'https://excelformulabot.com', favorite: false },
      { id: '197', name: 'Coefficient', description: 'Ferramenta de nível corporativo. Liga o Google Sheets diretamente aos CRMs (Salesforce, HubSpot, SQL). A IA ajuda a construir relatórios visuais complexos, atualizar dados de vendas em tempo real e detetar anomalias.', category: 'Código', subcategory: 'Planilhas', badges: ['Pago'], tags: ['Google Sheets', 'CRM', 'Enterprise'], icon: 'sparkles', link: 'https://coefficient.io', favorite: false },
      { id: '198', name: 'Numerous.ai', description: 'Motor de processamento em lote. Permite treinar a IA para classificar dados repetitivos e arrastar a célula para aplicar a inteligência a milhares de linhas instantaneamente. Excelente para limpar listas de leads.', category: 'Código', subcategory: 'Planilhas', badges: ['Freemium'], tags: ['Excel', 'Processamento', 'Automação'], icon: 'sparkles', link: 'https://numerous.ai', favorite: false },
      { id: '199', name: 'Ajelix', description: 'Salvador da equipa de contabilidade. Especialista em gerar e explicar código VBA (Macros). Permite automatizar processos inteiros e rotinas pesadas dentro do Microsoft Excel sem precisar de saber programar.', category: 'Código', subcategory: 'Planilhas', badges: ['Freemium'], tags: ['Excel', 'VBA', 'Macros'], icon: 'sparkles', link: 'https://ajelix.com', favorite: false },
      { id: '200', name: 'PromptLoop', description: 'Revoluciona a pesquisa de mercado. Transforma qualquer folha de cálculo num motor de extração de IA. Podes dar uma lista de 500 sites e pedir à IA para extrair e-mail, CEO e preços automaticamente.', category: 'Código', subcategory: 'Planilhas', badges: ['Freemium'], tags: ['Excel', 'Web Scraping', 'Extração'], icon: 'sparkles', link: 'https://promptloop.com', favorite: false },
      { id: '201', name: 'Parseur', description: 'Automação e redução de erro humano. Lê centenas de PDFs, faturas ou e-mails, extrai os dados estruturados através de IA e insere-os diretamente numa folha de cálculo pronta a analisar.', category: 'Código', subcategory: 'Planilhas', badges: ['Freemium'], tags: ['PDF', 'Extração', 'Automação'], icon: 'sparkles', link: 'https://parseur.com', favorite: false },
      { id: '202', name: 'Arcwise AI', description: 'Verdadeiro assistente integrado. Ajuda a compreender e a limpar "esparguete" de dados. Consegue perceber a intenção por trás de tabelas enormes e confusas, e formata, cruza e gera resumos estatísticos com comandos de texto.', category: 'Código', subcategory: 'Planilhas', badges: ['Free'], tags: ['Google Sheets', 'Limpeza', 'Copilot'], icon: 'sparkles', link: 'https://arcwise.app', favorite: false },

      // Categoria: Código - Assistente de Código
      { id: '203', name: 'GitHub Copilot', description: 'O standard absoluto da indústria. Imprescindível para qualquer equipa de desenvolvimento moderno, reduzindo drasticamente o tempo gasto em código boilerplate e funções rotineiras.', category: 'Código', subcategory: 'Assistente de Código', badges: ['Freemium', 'Pago'], tags: ['IDE', 'Autocompletar', 'GitHub'], icon: 'sparkles', link: 'https://github.com/features/copilot', favorite: false },
      { id: '204', name: 'Refact AI', description: 'A grande vantagem para agências que lidam com clientes corporativos ou código sensível: é um assistente de IA self-hosted (alojado localmente), garantindo total privacidade do código fonte.', category: 'Código', subcategory: 'Assistente de Código', badges: ['Freemium'], tags: ['Self-hosted', 'Privacidade', 'IDE'], icon: 'sparkles', link: 'https://refact.ai', favorite: false },
      { id: '205', name: 'Codeium', description: 'Alternativa de peso de nível empresarial com um foco brutal em rapidez e suporte a múltiplas IDEs. Excelente para escalar operações e manter a fluidez de código em equipas ágeis.', category: 'Código', subcategory: 'Assistente de Código', badges: ['Free', 'Pago'], tags: ['IDE', 'Enterprise', 'Rapidez'], icon: 'sparkles', link: 'https://codeium.com', favorite: false },
      { id: '206', name: 'Coderabbit.ai', description: 'Revisão de Pull Requests automatizada linha a linha. Poupa dezenas de horas semanais aos Tech Leads, sugerindo melhorias de arquitetura e detetando bugs antes de qualquer merge.', category: 'Código', subcategory: 'Assistente de Código', badges: ['Freemium'], tags: ['Code Review', 'Pull Request', 'Automação'], icon: 'sparkles', link: 'https://coderabbit.ai', favorite: false },
      { id: '207', name: 'CodiumAI', description: 'Focado exclusivamente na geração de testes significativos. Para equipas de QA e developers, analisa o código e cria testes unitários robustos, garantindo maior cobertura com uma fração do esforço manual.', category: 'Código', subcategory: 'Assistente de Código', badges: ['Free', 'Pago'], tags: ['Testes', 'QA', 'Unit Tests'], icon: 'sparkles', link: 'https://codium.ai', favorite: false },
      { id: '208', name: 'Checksum', description: 'Automação de testes ponta-a-ponta (E2E) gerados por IA. Um autêntico game-changer para garantir a estabilidade de aplicações web em produção, escrevendo e mantendo os testes por si.', category: 'Código', subcategory: 'Assistente de Código', badges: ['Pago'], tags: ['E2E', 'Testes', 'Automação'], icon: 'sparkles', link: 'https://checksum.ai', favorite: false },
      { id: '209', name: 'Codacy', description: 'Plataforma de excelência (agora infundida com IA) para análise de código estático. Fundamental para impor standards de qualidade em toda a agência e corrigir vulnerabilidades automaticamente em múltiplas linguagens.', category: 'Código', subcategory: 'Assistente de Código', badges: ['Free', 'Pago'], tags: ['Análise Estática', 'Qualidade', 'Segurança'], icon: 'sparkles', link: 'https://ai.codacy.com', favorite: false },
      { id: '210', name: 'Warp AI', description: 'Um terminal reconstruído do zero para o século 21. Construído em Rust e com IA integrada nativamente, aumenta a velocidade de navegação, debug e execução de comandos para qualquer engenheiro da equipa.', category: 'Código', subcategory: 'Assistente de Código', badges: ['Free', 'Pago'], tags: ['Terminal', 'CLI', 'Rust'], icon: 'sparkles', link: 'https://warp.dev', favorite: false },
      { id: '211', name: 'Phind', description: 'O motor de busca desenhado especificamente para developers seniores. Lê documentação técnica profunda e responde a problemas complexos de infraestrutura, superando largamente modelos genéricos em contexto de engenharia.', category: 'Código', subcategory: 'Assistente de Código', badges: ['Free', 'Pago'], tags: ['Pesquisa', 'Documentação', 'Developer'], icon: 'sparkles', link: 'https://phind.com', favorite: false },
      { id: '212', name: 'Fix My Code', description: 'Um nicho incrivelmente valioso para agências web: foca-se em otimizar o código para cumprir as rigorosas normas de Acessibilidade (WCAG 2.1 AA), mitigando o risco legal para os clientes finais.', category: 'Código', subcategory: 'Assistente de Código', badges: ['Free'], tags: ['Acessibilidade', 'WCAG', 'A11y'], icon: 'sparkles', link: 'https://userway.org/fixmycode', favorite: false },
      { id: '213', name: 'FlutterFlow AI Gen', description: 'Acelera exponencialmente a criação de aplicações mobile e web. Permite que equipas estruturem componentes visuais e lógicos complexos rapidamente, exportando código de produção limpo e pronto a escalar.', category: 'Código', subcategory: 'Assistente de Código', badges: ['Freemium'], tags: ['Flutter', 'Mobile', 'Low-Code'], icon: 'sparkles', link: 'https://flutterflow.io/ai-gen', favorite: false },

      // Categoria: Código - Low-Code, No-Code & Integrações
      { id: '214', name: 'Make', description: 'O verdadeiro peso-pesado da automação visual (iPaaS). Permite à agência construir arquiteturas de integração complexas e adicionar nós de IA no meio dos fluxos para processar dados de clientes e automatizar o back-office.', category: 'Código', subcategory: 'Low-Code & Integrações', badges: ['Freemium'], tags: ['Automação', 'iPaaS', 'Integrações'], icon: 'sparkles', link: 'https://make.com', favorite: false },
      { id: '215', name: 'Retool AI', description: 'O standard absoluto para construir ferramentas internas. Com os blocos de IA, permite às equipas operacionais criar dashboards e painéis de controlo ligados a bases de dados numa fração do tempo.', category: 'Código', subcategory: 'Low-Code & Integrações', badges: ['Freemium'], tags: ['Low-Code', 'Dashboards', 'Internal Tools'], icon: 'sparkles', link: 'https://retool.com', favorite: false },
      { id: '216', name: 'Bardeen AI', description: 'Automação de fluxos de trabalho diretamente no browser. Poupa centenas de horas à equipa de operações ao extrair dados (scraping) e conectar aplicações sem depender de integrações lentas por API.', category: 'Código', subcategory: 'Low-Code & Integrações', badges: ['Free'], tags: ['Automação', 'Browser', 'Scraping'], icon: 'sparkles', link: 'https://bardeen.ai', favorite: false },
      { id: '217', name: 'Mutiny', description: 'Uma arma secreta para agências de Growth Marketing. Plataforma que personaliza sites B2B em tempo real com base no visitante, gerando aumentos drásticos na conversão e receita dos clientes.', category: 'Código', subcategory: 'Low-Code & Integrações', badges: ['Pago'], tags: ['Marketing', 'Personalização', 'B2B'], icon: 'sparkles', link: 'https://mutinyhq.com', favorite: false },
      { id: '218', name: 'Nanonets', description: 'Plataforma avançada de OCR baseada em IA. Transforma a entrada manual de dados, automatizando o processamento de faturas, documentos estruturados e recibos para a equipa financeira.', category: 'Código', subcategory: 'Low-Code & Integrações', badges: ['Freemium'], tags: ['OCR', 'Automação', 'Documentos'], icon: 'sparkles', link: 'https://nanonets.com', favorite: false },

      // Categoria: Código - Desenvolvimento e Engenharia de Elite
      { id: '219', name: 'Cursor', description: 'A IDE que está a revolucionar o desenvolvimento. É um fork do VS Code com IA integrada no núcleo, capaz de ler e compreender todo o repositório para realizar refatorações em massa e encontrar bugs escondidos.', category: 'Código', subcategory: 'Desenvolvimento Elite', badges: ['Freemium'], tags: ['IDE', 'VS Code', 'Refatoração'], icon: 'sparkles', link: 'https://cursor.com', favorite: false },
      { id: '220', name: 'Claude.ai (Sonnet 3.5)', description: 'Atualmente o modelo de linguagem superior para lógica de programação pura. Pela sua capacidade de raciocínio e o recurso Artifacts, é a ferramenta de eleição para criar protótipos funcionais e resolver algoritmos complexos.', category: 'Código', subcategory: 'Desenvolvimento Elite', badges: ['Freemium'], tags: ['LLM', 'Algoritmos', 'Protótipos'], icon: 'sparkles', link: 'https://claude.ai', favorite: false },
      { id: '221', name: 'Sentry (AI Debugging)', description: 'Indispensável para operações de agência. Utiliza IA para analisar erros em tempo real, agrupar incidências semelhantes e sugerir a correção exata, reduzindo o MTTR (Mean Time to Recovery) drasticamente.', category: 'Código', subcategory: 'Desenvolvimento Elite', badges: ['Freemium'], tags: ['Debugging', 'Monitorização', 'Erros'], icon: 'sparkles', link: 'https://sentry.io', favorite: false },
      { id: '222', name: 'Supermaven', description: 'O assistente de código mais rápido do mundo. Com uma janela de contexto de 1 milhão de tokens e latência quase nula, permite trabalhar em projetos gigantescos sem que a IA perca o fio à meada.', category: 'Código', subcategory: 'Desenvolvimento Elite', badges: ['Freemium'], tags: ['Autocompletar', 'Performance', 'Contexto'], icon: 'sparkles', link: 'https://supermaven.com', favorite: false },
      { id: '223', name: 'Pieces for Developers', description: 'O "segundo cérebro" do programador. Organiza snippets, documentação e contexto de reuniões de forma inteligente, permitindo que a equipa recupere lógica complexa meses depois sem esforço.', category: 'Código', subcategory: 'Desenvolvimento Elite', badges: ['Free'], tags: ['Snippets', 'Organização', 'Documentação'], icon: 'sparkles', link: 'https://pieces.app', favorite: false },
      { id: '224', name: 'Tabnine', description: 'A solução de topo para privacidade corporativa. Permite treinar modelos personalizados baseados no código privado da agência e pode ser executado em servidores locais (On-premises).', category: 'Código', subcategory: 'Desenvolvimento Elite', badges: ['Pago'], tags: ['Privacidade', 'On-premises', 'Enterprise'], icon: 'sparkles', link: 'https://tabnine.com', favorite: false },
      { id: '225', name: 'Mintlify', description: 'Automação de documentação de código. Lê o repositório e gera documentação técnica legível e profissional automaticamente, garantindo que o conhecimento não morre quando um developer sai do projeto.', category: 'Código', subcategory: 'Desenvolvimento Elite', badges: ['Freemium'], tags: ['Documentação', 'Automação', 'Repositório'], icon: 'sparkles', link: 'https://mintlify.com', favorite: false },

      // Categoria: Prompts - Gestão & Produção
      { id: '226', name: 'Vellum', description: 'O standard de ouro para levar prompts para produção. Permite à equipa comparar a mesma instrução em múltiplos modelos (GPT-4, Claude, Gemini) lado a lado e fazer testes de regressão antes de lançar qualquer ferramenta para o cliente.', category: 'Prompts', subcategory: 'Gestão & Produção', badges: ['Pago'], tags: ['Prompts', 'Testes', 'Produção'], icon: 'file-text', link: 'https://vellum.ai', favorite: false },
      { id: '227', name: 'PromptLayer', description: 'O middleware essencial para a equipa de engenharia. Interceta e regista cada requisição feita à IA, permitindo à direção monitorizar custos exatos por projeto, analisar alucinações e atualizar prompts sem ter de reescrever o código da aplicação.', category: 'Prompts', subcategory: 'Gestão & Produção', badges: ['Freemium'], tags: ['Prompts', 'Middleware', 'Monitorização'], icon: 'file-text', link: 'https://promptlayer.com', favorite: false },
      { id: '228', name: 'TypingMind', description: 'A interface definitiva para unificar o uso de IA na equipa não-técnica (copywriters, account managers). Permite criar e partilhar bibliotecas de prompts corporativos padronizados, garantindo que todos usam as melhores práticas e o tom de voz correto.', category: 'Prompts', subcategory: 'Gestão & Produção', badges: ['Pago'], tags: ['Prompts', 'Interface', 'Colaboração'], icon: 'file-text', link: 'https://typingmind.com', favorite: false },
      { id: '229', name: 'PromptHero', description: 'A maior base de dados de engenharia de prompts visuais. Indispensável para a direção de arte; poupa horas na pesquisa dos parâmetros e pesos exatos para Midjourney ou Stable Diffusion na geração de assets publicitários de alta fidelidade.', category: 'Prompts', subcategory: 'Biblioteca & Pesquisa', badges: ['Freemium'], tags: ['Prompts', 'Midjourney', 'Stable Diffusion'], icon: 'file-text', link: 'https://prompthero.com', favorite: false },
      { id: '230', name: 'Langfuse', description: 'Ferramenta de observabilidade open-source. Se a agência criar chatbots ou fluxos de IA para clientes, esta plataforma monitoriza em tempo real a eficácia dos prompts, detetando onde a IA está a falhar ou a demorar demasiado a responder.', category: 'Prompts', subcategory: 'Observabilidade', badges: ['Freemium'], tags: ['Observabilidade', 'Chatbots', 'Open Source'], icon: 'file-text', link: 'https://langfuse.com', favorite: false },
    ];
  });

  const getToolIcon = (iconName: string, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
    const iconProps = { className: sizeClass, strokeWidth: 2 };

    switch (iconName) {
      case 'layout':
        return <Layout {...iconProps} />;
      case 'image':
        return <Image {...iconProps} />;
      case 'pen-tool':
        return <PenTool {...iconProps} />;
      case 'video':
        return <Video {...iconProps} />;
      case 'box':
        return <Box {...iconProps} />;
      case 'message-square':
        return <MessageSquare {...iconProps} />;
      default:
        return <Sparkles {...iconProps} />;
    }
  };

  const getWorkflowIcon = (iconName: string, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
    const iconProps = { className: sizeClass, strokeWidth: 2 };

    switch (iconName) {
      case 'message-square':
        return <MessageSquare {...iconProps} />;
      case 'image':
        return <Image {...iconProps} />;
      case 'smartphone':
        return <Smartphone {...iconProps} />;
      case 'clipboard-list':
        return <ClipboardList {...iconProps} />;
      case 'linkedin':
        return <Linkedin {...iconProps} />;
      case 'mail':
        return <Mail {...iconProps} />;
      case 'bar-chart-3':
        return <BarChart3 {...iconProps} />;
      case 'file-text':
        return <FileText {...iconProps} />;
      default:
        return <Circle {...iconProps} />;
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const iconProps = { className: 'w-6 h-6', strokeWidth: 2 };

    switch (categoryName) {
      case 'Texto':
        return <FileText {...iconProps} />;
      case 'Negócios':
        return <BarChart3 {...iconProps} />;
      case '3D':
        return <Box {...iconProps} />;
      case 'Audio':
        return <MessageSquare {...iconProps} />;
      case 'Outros':
        return <Circle {...iconProps} />;
      case 'Vídeo':
        return <Video {...iconProps} />;
      case 'Código':
        return <Sparkles {...iconProps} />;
      case 'Imagem':
        return <Image {...iconProps} />;
      case 'Prompts':
        return <FileText {...iconProps} />;
      default:
        return <Library {...iconProps} />;
    }
  };

  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    const defaultPrompts: Prompt[] = [
      {
        id: '6',
        title: 'Panorâmico Anamórfico 2.39:1',
        description: 'Rácio épico dos blockbusters com compressão horizontal, bokeh oval e flares característicos para sequências de ação e grande formato.',
        category: 'Aspect Ratio & Frame',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 2.39:1
Scene: [SUBJECT] framed for widescreen action or grand scale. Horizontal composition with clear left and right zones.
Lens: Anamorphic 40mm at f/2.8. T2.8 equivalent, horizontal squeeze ratio 2x, characteristic oval bokeh.
Key: Strong directional source from camera-left or right at an angle that catches the anamorphic lens. Produces subtle horizontal flares and breathing.
Stock feel: Kodak Vision3 500T or clean digital cinema.

Casos de Uso: Sequências de perseguição/ação, planos de estabelecimento épicos (estilo Villeneuve) ou grande formato (Nolan).`,
        favorite: false
      },
      {
        id: '7',
        title: 'Ultra Panorâmico 2.76:1',
        description: 'Rácio de extremo épico (Ben-Hur, The Hateful Eight) onde a largura domina completamente, ideal para batalhas e paisagens impossíveis.',
        category: 'Aspect Ratio & Frame',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 2.76:1
Scene: [SUBJECT] in an extreme horizontal composition where the width dominates and vertical information is scarce.
Lens: 25mm anamorphic at f/4. Wide spherical equivalent, catches the full horizontal field.
Stock feel: Kodak Vision3 500T pushed for epic warmth, or 70mm emulation.
Aspect-specific feel: Spectacle over intimacy. Horizontal action, processions, landscapes, or multiple subjects arrayed in a line.

Casos de Uso: Batalhas, grandes multidões ou paisagens de largura impossível.`,
        favorite: false
      },
      {
        id: '8',
        title: 'Cinema Padrão 1.85:1',
        description: 'Padrão das salas de cinema modernas com equilíbrio clássico entre cinema e ecrã doméstico, ideal para dramas e realismo contemporâneo.',
        category: 'Aspect Ratio & Frame',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 1.85:1
Scene: [SUBJECT] in a classically-balanced composition. Wider than 16:9 but not blockbuster-compressed.
Lens: 50mm at f/2.8. The workhorse focal length, natural perspective.
Stock feel: Kodak Vision3 500T or Fuji Eterna.
Aspect-specific feel: Frame reads neutral. Allows both landscape width and portrait intimacy.

Casos de Uso: Dramas, obras focadas em diálogos e realismo contemporâneo.`,
        favorite: false
      },
      {
        id: '9',
        title: 'Formato Academy 1.37:1',
        description: 'Formato clássico da era dourada de Hollywood, quase quadrado, promove composição formal estilizada ao estilo Wes Anderson.',
        category: 'Aspect Ratio & Frame',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 1.37:1
Scene: [SUBJECT] in a near-square composition reminiscent of pre-1953 Hollywood or Wes Anderson's stylized period work.
Lens: 40mm at f/4. Slightly wide, flat symmetrical blocking-friendly.
Stock feel: Kodak Vision3 250D for contemporary look, or emulate vintage stocks (Tri-X / Plus-X grain).
Aspect-specific feel: Formal, presentational, stage-like.

Casos de Uso: Peças de época, enquadramentos íntimos ou simetria ao estilo Wes Anderson.`,
        favorite: false
      },
      {
        id: '10',
        title: 'TV Vintage 4:3',
        description: 'Nostalgia televisiva pré-1953 ou estética VHS com foco central, ideal para found footage e vídeo caseiro.',
        category: 'Aspect Ratio & Frame',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 4:3
Scene: [SUBJECT] framed for the squarer 4:3 ratio. Common in early cinema, pre-widescreen television, and VHS home video.
Lens: 35mm at f/4 for contemporary clean look, or emulated VHS camcorder.
Stock feel: Fuji Velvia 50 for vintage richness, or VHS simulation (softness, chromatic aberration).

Casos de Uso: Enquadramentos de época, "found footage" ou estética de vídeo caseiro.`,
        favorite: false
      },
      {
        id: '11',
        title: 'Cinema Vertical 9:16',
        description: 'Cinema pensado para telemóvel com composição vertical para TikTok, Reels, Stories e conteúdo mobile-first.',
        category: 'Aspect Ratio & Frame',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 9:16
Scene: [SUBJECT] composed for vertical reading. Vertical center axis, top-to-bottom compositional flow.
Lens: 35mm at f/2.8. Wide enough for vertical elements, shallow enough for focus hierarchy.
Aspect-specific moves: Subject often fills the center-vertical column. Architecture and figures read as vertical pillars.

Casos de Uso: Conteúdo para redes sociais (TikTok/Reels), Stories ou videoclipes mobile-first.`,
        favorite: false
      },
      {
        id: '12',
        title: 'Estúdio Branco Puro',
        description: 'Fundo branco impecável para e-commerce. Ideal para catálogos e listagens de produtos que exigem um aspeto limpo e profissional.',
        category: 'Backgrounds & Surfaces',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 1:1
Backdrop: Seamless #FFFFFF paper infinity cove, no visible seam line.
Surface: Invisible white sweep, [PRODUCT] sits 18in from the backdrop.
Key: Large gridded softbox camera-left, 45° elevation, 5500K daylight.
Lens: 85mm at f/8, tripod.
Stock feel: Fujifilm Eterna. Neutral, precise material rendering.

Casos de Uso: Listagens de lojas online, catálogos de produtos.`,
        favorite: false
      },
      {
        id: '13',
        title: 'Superfície de Mármore Branco',
        description: 'Bancada de mármore elegante. Transmite luxo e sofisticação, ideal para produtos premium.',
        category: 'Backgrounds & Surfaces',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 3:4
Surface: Polished Carrara marble, visible gray veining with individual crystal reflections.
Key: Single large window source camera-left, 5600K diffused through sheer curtain.
Stock feel: CineStill 800T. Warm halation bloom on the brightest reflections.
Physical detail: One faint fingerprint smudge on the marble corner. Wiped but not gone.

Casos de Uso: Beleza de luxo, joalharia, produtos premium.`,
        favorite: false
      },
      {
        id: '14',
        title: 'Fundo de Luxo Escuro',
        description: 'Fundo dramático e escuro. O produto emerge das sombras, criando uma aura de exclusividade e mistério.',
        category: 'Backgrounds & Surfaces',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 1:1
Backdrop: Deep charcoal #1A1A1C gradient collapsing to pure black #0A0A0A at the edges.
Key: Single hard rim light behind-right at 15° elevation, 3200K tungsten-warm.
Stock feel: Kodak Vision3 500T. Warm cinema tungsten palette, organic highlight halation.
Physical detail: One single gold dust particle suspended in the rim light.

Casos de Uso: Fragrâncias premium, artigos de luxo de alta gama.`,
        favorite: false
      },
      {
        id: '15',
        title: 'Cenário de Bancada de Cozinha',
        description: 'Cenário de cozinha real e vivido. Evita o aspeto de "showroom" para focar numa estética de "preparação em curso".',
        category: 'Backgrounds & Surfaces',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 3:4
Setting: Modern home kitchen, quartz or Carrara countertop filling the lower half; subway tile backsplash defocused.
Key: Natural window light camera-right, 5200K afternoon, slightly directional.
Stock feel: Kodak Ektar 100. Vivid, clean, saturated without cartoon.
Physical detail: A single crumb or a pinch of spilled sea salt on the counter near the product.

Casos de Uso: Produtos alimentares, utensílios de cozinha, suplementos.`,
        favorite: false
      },
      {
        id: '16',
        title: 'Gradiente Creme Quente',
        description: 'Gradiente suave em tons creme. Uma alternativa luxuosa e quente ao branco puro, evocando rituais de cuidado e tranquilidade.',
        category: 'Backgrounds & Surfaces',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 3:4
Backdrop: Hand-painted gradient, #F5F0E8 warm cream at the bottom fading to #FFFFFF at the top.
Lens: 85mm at f/5.6.
Stock feel: Kodak Portra 400. Warm highlight rolloff, organic color rendering.
Mood: Premium ritual, sophisticated quiet. Never "Instagram clean."

Casos de Uso: Skincare premium, produtos de bem-estar.`,
        favorite: false
      },
      {
        id: '17',
        title: 'Textura de Tecido de Linho',
        description: 'Fundo de textura têxtil orgânica. O linho confere um toque artesanal e natural à composição.',
        category: 'Backgrounds & Surfaces',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 1:1
Surface: Natural undyed linen weave, #F0E9D9 cream-beige, visible warp/weft texture.
Key: Soft overhead window light, 5000K morning.
Stock feel: Kodak Portra 400 for the warm organic palette.
Physical detail: One single thread loose at frame edge, catching the key.

Casos de Uso: Wellness, produtos biológicos/orgânicos.`,
        favorite: false
      },
      {
        id: '18',
        title: 'Ambiente de Quarto',
        description: 'Cenário matinal aconchegante. Focado no conforto e no autocuidado autêntico.',
        category: 'Backgrounds & Surfaces',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 3:4
Setting: Quiet bedroom nightstand or the linen edge of a made bed.
Key: Large window source camera-right, diffused by the sheer. Motivated single-source.
Depth: Shallow. Product sharp, the rest falls into soft warm defocus.
Physical detail: One pillow corner visible with a subtle imprint dent.

Casos de Uso: Suplementos para sono, self-care, têxteis de casa.`,
        favorite: false
      },
      {
        id: '19',
        title: 'Plano Macro de Textura',
        description: 'Plano de pormenor extremo focado na textura. Transforma o detalhe do material numa composição abstrata e tátil.',
        category: 'Camera Profiles',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 1:1
Subject: Extreme close-up on [FOCUS_SUBJECT]. Fills the entire frame, abstract composition.
Lens: Macro at f/2.8, 1:1 magnification.
Key: Raking side light from camera-left at 10° elevation. Skims the surface, reveals every micro-texture.
Stock feel: Kodak Ektar 100. Vivid, precise material rendering.
Physical detail: One tiny imperfection. A loose thread, a pore, a micro-crack, a fingerprint ridge.

Casos de Uso: Texturas de tecido, pormenores de ingredientes, foco em artesanato.`,
        favorite: false
      },
      {
        id: '20',
        title: 'Flatlay Padrão 50mm',
        description: 'O padrão para fotografias de topo (flatlays). Oferece uma visão organizada e simétrica, com foco nítido em todos os elementos.',
        category: 'Camera Profiles',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 1:1
Angle: Perfect 90° top-down, camera plane parallel to surface. No distortion.
Lens: 50mm at f/8.
Key: Large 4ft overhead softbox centered, 5500K daylight. Soft shadowless fill.
Physical detail: One element slightly off the symmetric grid. A leaf angled 8° off axis. Keeps it hand-styled.

Casos de Uso: Conjuntos de oferta, arranjos de vários produtos.`,
        favorite: false
      },
      {
        id: '21',
        title: 'Plano Herói 85mm',
        description: 'O plano "herói" clássico. A lente de 85mm lisonjeia a silhueta do produto, eliminando distorções e focando na sua forma ideal.',
        category: 'Camera Profiles',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 4:5
Subject: [PRODUCT] centered, fills ~70% of frame width.
Angle: 3/4 front view, elevated 12° above product.
Lens: 85mm at f/8.
Stock feel: Fujifilm Eterna. Neutral, precise color rendering.
Shadow: Soft gradient contact shadow directly beneath, slight bias toward fill side.

Casos de Uso: Imagens principais de produto, capas de catálogo.`,
        favorite: false
      },
      {
        id: '22',
        title: 'Grande Angular Ambiente 35mm',
        description: 'Plano aberto que mostra o produto inserido no seu contexto real. Transmite uma sensação de "momento vivido" e não apenas encenado.',
        category: 'Camera Profiles',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 3:2
Frame: Wide environmental. [PRODUCT] occupies ~40% of the frame.
Lens: 35mm at f/4.
Key: Natural daylight from a window or skylight, 5200K, falling at ~30° from upper-left.
Stock feel: Kodak Portra 400. Warm lifestyle, organic palette.
Physical detail: One element that suggests a person lives here. A jacket on a chair back or a half-drunk mug.

Casos de Uso: Cenas de lifestyle, ambientação em divisões da casa.`,
        favorite: false
      },
      {
        id: '23',
        title: 'Ângulo Baixo Heroico',
        description: 'Uma perspetiva poderosa, de baixo para cima, que confere autoridade e um ar monumental ao produto.',
        category: 'Camera Profiles',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 4:5
Angle: Low, 25° below product center, looking up. Hero perspective.
Lens: 50mm at f/4.
Key: Single hard directional source camera-right, 4200K, at product eye level.
Stock feel: Kodak Vision3 500T. Cinematic tungsten-warm with organic highlight bloom.
Mood: Monument. The product is the subject of a Kubrick one-point composition.

Casos de Uso: Branding de autoridade, produtos premium, estética dramática.`,
        favorite: false
      },
      {
        id: '24',
        title: 'Softbox Três Pontos',
        description: 'O padrão de ouro da iluminação comercial. Proporciona uma definição de forma perfeita, ideal para catálogos profissionais onde a clareza é prioritária.',
        category: 'Lighting Setups',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 4:5
Key: Large 4x6ft softbox camera-left at 45° elevation, 5500K daylight.
Fill: Medium 2x3ft softbox camera-right at 45°, 50% power.
Rim: Narrow strip softbox behind product at 30° offset.
Stock feel: Fujifilm Eterna. Neutral, slightly cool, precise material rendering.

Casos de Uso: E-commerce, catálogos, fotografia de produto profissional.`,
        favorite: false
      },
      {
        id: '25',
        title: 'Luz Natural de Janela',
        description: 'Iluminação autêntica e orgânica proveniente de uma única janela. Evita o aspeto artificial de estúdio, focando-se numa estética de estilo de vida real.',
        category: 'Lighting Setups',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 3:4
Lighting: Single window as the only source. Motivated, not studio.
Quality: Diffused through a sheer curtain or frosted pane. Soft directional.
Stock feel: Kodak Portra 400. Warm lifestyle, skin-safe palette.
Physical detail: One dust mote floating in the window light beam. Confirms the light is real.

Casos de Uso: Fotografias de lifestyle, ambientes domésticos, estética autêntica.`,
        favorite: false
      },
      {
        id: '26',
        title: 'Calor da Hora Dourada',
        description: 'A luz cinematográfica do pôr-do-sol. Tons quentes e âmbar que criam uma atmosfera aspiracional e acolhedora.',
        category: 'Lighting Setups',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 3:2
Lighting: Low-angle sunset / sunrise directional sun.
Color: 3400-3800K rich golden. Amber highlights, warm shadow tone.
Accent: A small subtle lens flare bleeding in from the sun direction.
Stock feel: CineStill 800T for halation bloom on the warm highlights.

Casos de Uso: Campanhas de verão, lifestyle caloroso, vibrações aconchegantes.`,
        favorite: false
      },
      {
        id: '27',
        title: 'Luz Lateral Dramática',
        description: 'Iluminação lateral ousada de fonte única. Cria um contraste forte (6:1) que revela todas as micro-texturas do material.',
        category: 'Lighting Setups',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 4:5
Key: Hard-edged fresnel or small softbox, 4200K neutral-warm.
Fill: Minimal. 10-15% bounce only. The deep opposite-side shadow is the point.
Contrast: 6:1. The shadow side collapses into structural darkness.
Mood: Noir product portraiture. Deakins single-source discipline.

Casos de Uso: Produtos premium, fotografias artísticas, imagens "hero" dramáticas.`,
        favorite: false
      },
      {
        id: '28',
        title: 'Branco Clínico Limpo',
        description: 'Iluminação de alta chave (high-key), brilhante e uniforme. Transmite confiança, precisão e higiene total.',
        category: 'Lighting Setups',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 1:1
Key: Two large overhead softboxes at 30° left/right of camera axis, 6500K cool daylight.
Fill: Underfill from below via white bounce at 70%. Kills base shadow completely.
Stock feel: Fujifilm Velvia 50 or Eterna.
Mood: Pharmacy shelf meets Apple Store. Precise, trustworthy.

Casos de Uso: Produtos médicos, suplementos, branding clínico.`,
        favorite: false
      },
      {
        id: '29',
        title: 'Atmosférico Sombrio',
        description: 'Iluminação de baixa chave (low-key) inspirada no cinema. O produto emerge das sombras com uma aura de luxo e mistério.',
        category: 'Lighting Setups',
        models: ['Midjourney', 'Nano Banana Pro'],
        content: `Model: Nano Banana Pro · Aspect: 4:5
Key: Small soft narrow source from upper-right at 35° elevation, 3200K tungsten-warm.
Atmospheric: Subtle haze or soft fog in the mid-ground. Light has texture.
Backdrop: Matte charcoal #1A1A1C to black gradient.
Mood: After-hours fragrance campaign. Villeneuve atmospheric discipline.

Casos de Uso: Perfumaria, artigos de luxo, campanhas noturnas.`,
        favorite: false
      },
      {
        id: '30',
        title: 'Depoimento Falado',
        description: 'O formato clássico de depoimento direto para a câmara. Foca-se na autenticidade, com uma aparência natural e imperfeições que transmitem honestidade.',
        category: 'UGC Poses & Scenes',
        models: ['Seedance 2.0', 'Nano Banana 2'],
        content: `Model: Seedance 2.0 · Aspect: 9:16 · Duration: 6s
Subject: Relatable [GENDER], [AGE_RANGE], natural appearance. Real skin, real hair.
Action: Subject speaks mid-sentence. Lips in motion, one hand gesturing lightly.
Setting: Real home background. Softly blurred at f/2.8-equivalent.
Stock feel: Phone camera. Slight compression artifacts, limited dynamic range.

Casos de Uso: Vídeos de testemunhos, reviews, conteúdo nativo para TikTok.`,
        favorite: false
      },
      {
        id: '31',
        title: 'Selfie ao Espelho',
        description: 'Uma fotografia casual em frente ao espelho. O cenário deve parecer vivido e ligeiramente "desarrumado" para reforçar que é uma pessoa real a usar o produto.',
        category: 'UGC Poses & Scenes',
        models: ['Nano Banana 2', 'Midjourney'],
        content: `Model: Nano Banana 2 · Aspect: 9:16
Scene: A person taking a mirror selfie in [LOCATION], holding [PRODUCT] in the non-phone hand.
Environment: The [LOCATION] is real and messy at the edges. A hair tie, a crumpled towel.
Lighting: Mixed color temperature. Natural window mixing with warm ~2800K overhead.
Imperfections: One smudge on the mirror; a stray hair.

Casos de Uso: Instagram Stories, TikTok, provas de produto autênticas.`,
        favorite: false
      },
      {
        id: '32',
        title: 'Reação em Uso',
        description: 'Captura o momento exato de surpresa ou satisfação ao usar o produto. A chave aqui é a expressão não posada e o ambiente doméstico.',
        category: 'UGC Poses & Scenes',
        models: ['Nano Banana 2', 'Midjourney'],
        content: `Model: Nano Banana 2 · Aspect: 9:16
Expression: Mid-reaction. Eyes slightly widened, mouth caught between words, not a held smile.
Environment: Living room couch, a throw blanket half-kicked off, a coffee mug nearby.
Physical detail: One grounding detail. A pet hair on the blanket or a crumb on the shirt.

Casos de Uso: Conteúdo de reação, revelação de produto, reviews espontâneas.`,
        favorite: false
      },
      {
        id: '33',
        title: 'Montagem Antes/Depois',
        description: 'Comparação de transformação com ecrã dividido. A credibilidade vem de manter o mesmo ângulo e iluminação, com uma melhoria visível mas realista.',
        category: 'UGC Poses & Scenes',
        models: ['Nano Banana 2', 'Midjourney'],
        content: `Model: Nano Banana 2 · Aspect: 9:16
Composition: Vertical split frame, clean center dividing line.
LEFT (BEFORE): Flat bathroom overhead at 2800K. Slightly unflattering but believable.
RIGHT (AFTER): Visibly improved. Glow is subtle, not extreme. Healthy, not photoshopped.
Credibility: 60-70% improvement. Noticeable at thumbnail, not extreme.

Casos de Uso: Resultados de tratamento, demonstração de eficácia, transformações.`,
        favorite: false
      },
      {
        id: '34',
        title: 'Momento de Revelação do Produto',
        description: 'O momento do unboxing. Foca-se apenas nas mãos e no produto a emergir da embalagem, criando antecipação.',
        category: 'UGC Poses & Scenes',
        models: ['Seedance 2.0', 'Nano Banana 2'],
        content: `Model: Seedance 2.0 · Aspect: 9:16 · Duration: 5s
Subject: Hands only. Identity off-frame. Real hands, one visible freckle, not model hands.
Action: Tissue paper being pushed aside; [PRODUCT] emerging from the packaging.
Lighting: Soft natural daylight from camera-right at 5200K.
Physical detail: A single thread from the tissue paper clings to the product.

Casos de Uso: Unboxing, primeiras impressões, lançamentos.`,
        favorite: false
      },
      {
        id: '35',
        title: 'Segurar com Mãos Femininas',
        description: 'Mãos femininas elegantes a segurar o produto. Foco na delicadeza, com texturas de pele reais (poros e veias subtis) para evitar um aspeto artificial.',
        category: 'Hands & Models',
        models: ['Nano Banana Pro', 'Midjourney'],
        content: `Model: Nano Banana Pro · Aspect: 4:5
Subject: Feminine hands, [SKIN_TONE] skin with real pore texture, fine natural lines at the knuckles.
Pose: Relaxed elegant grip. Product held at ~35° toward camera, weight balanced on the fingertips.
Lighting: Large softbox camera-left at 5500K, 45° elevation. Motivated daylight.
Stock feel: Kodak Portra 400. Skin-safe warm palette.

Casos de Uso: Produtos de beleza, skincare, apresentações de luxo.`,
        favorite: false
      },
      {
        id: '36',
        title: 'Segurar com Mãos Masculinas',
        description: 'Mãos masculinas com preensão firme. A iluminação é mais contrastada para definir a estrutura óssea e muscular, transmitindo força e confiança.',
        category: 'Hands & Models',
        models: ['Nano Banana Pro', 'Midjourney'],
        content: `Model: Nano Banana Pro · Aspect: 4:5
Subject: Masculine hands, [SKIN_TONE] skin with visible knuckle definition, subtle vein structure.
Lighting: Harder key from camera-left at 5200K with a 4:1 contrast ratio.
Physical detail: One small visible scar, callus, or shorter healing cut. Confirms the hand works for a living.
Stock feel: Kodak Vision3 500T. Tungsten-warm cinema palette.

Casos de Uso: Higiene masculina (grooming), ferramentas, produtos tecnológicos.`,
        favorite: false
      },
      {
        id: '37',
        title: 'Movimento de Aplicação',
        description: 'Captura o momento da aplicação do produto (creme, sérum). O movimento é deliberado e a pele mantém a sua textura natural, com poros e pequenas linhas de expressão.',
        category: 'Hands & Models',
        models: ['Seedance 2.0', 'Nano Banana Pro'],
        content: `Model: Seedance 2.0 · Aspect: 4:5 · Duration: 4s
Action: [APPLICATION_ACTION]. Mid-motion. Fingers beginning the spread / massage / stroke.
Skin: Healthy glow with visible natural texture. NOT airbrushed beauty skin.
Motion: Slight natural motion blur on the moving fingertips. 1/60s shutter equivalent.
Lens: 50mm macro at f/2.8.

Casos de Uso: Tutoriais de skincare, vídeos de "como usar", planos de uso real.`,
        favorite: false
      },
      {
        id: '38',
        title: 'Mãos a Revelar Unboxing',
        description: 'As mãos a retirar o produto da embalagem premium. O foco está no ritual de abertura, com o produto a emergir do papel de seda.',
        category: 'Hands & Models',
        models: ['Nano Banana Pro', 'Midjourney'],
        content: `Model: Nano Banana Pro · Aspect: 4:5
Scene: Hands mid-action lifting [PRODUCT] from a premium gift box.
Pose: Product emerging from tissue paper, held between thumb and first two fingers at 35° from vertical.
Packaging: Open cream or ivory gift box, gold or blush tissue paper displaced at a natural angle.
Physical detail: One single strand of tissue paper catches on the product's surface as it lifts.

Casos de Uso: Conteúdo de unboxing, revelações premium, momentos de oferta.`,
        favorite: false
      },
      {
        id: '39',
        title: 'Camada de Nevoeiro Denso',
        description: 'Nevoeiro volumétrico denso que "engole" as silhuetas. Cria uma sensação de mistério e escala, onde o nevoeiro funciona como a própria fonte de luz difusa.',
        category: 'Atmospheric Effects',
        models: ['Nano Banana Pro', 'Midjourney'],
        content: `Model: Nano Banana Pro · Aspect: 2.39:1
Scene: [SUBJECT] as a small silhouette against vast dense fog bank, 70% negative space above.
Key: Single hard hidden sun behind the fog at 20° elevation, 4800K neutral daylight.
Atmospheric: Fog density is textural. You can see layers at 10m, 50m, 100m. Closer fog has visible particulate drift.

Casos de Uso: Paisagens estilo Arrakis (Dune), revelações de mistério, exteriores melancólicos.`,
        favorite: false
      },
      {
        id: '40',
        title: 'Lençol de Chuva',
        description: 'Chuva em "lençóis" visíveis, inspirada em Blade Runner 2049. A chuva só é visível quando atravessa os cones de luz, criando um ambiente neo-noir autêntico.',
        category: 'Atmospheric Effects',
        models: ['Nano Banana Pro', 'Midjourney'],
        content: `Model: Nano Banana Pro · Aspect: 2.39:1
Scene: [SUBJECT] in wet exterior at night, rain falling in visible sheets.
Key: Single hard overhead streetlight, 2800K sodium-vapor amber, rain falls THROUGH the beam.
Stock feel: CineStill 800T. Halation on the amber highlights.
Physical detail: One splash pattern frozen mid-air where a droplet just hit the asphalt.

Casos de Uso: Exteriores neo-noir, cenas de perseguição dramáticas, revelações à noite.`,
        favorite: false
      },
      {
        id: '41',
        title: 'Partículas de Pó na Luz',
        description: 'Partículas de pó suspensas num feixe de luz. Uma técnica clássica de cinematografia contemplativa que confere uma alma orgânica aos interiores.',
        category: 'Atmospheric Effects',
        models: ['Nano Banana Pro', 'Midjourney'],
        content: `Model: Nano Banana Pro · Aspect: 4:3
Key: One window source camera-right at 3800K warm afternoon, raking across the room.
Atmospheric: Dust particulate at roughly 1 mote per cubic foot, drifting slowly. Motes only visible INSIDE the shaft.
Physical detail: One specific mote catching a hot reflection on [SUBJECT]'s sleeve.

Casos de Uso: Interiores contemplativos, revelações de espaços antigos (estilo Tarkovsky/Malick).`,
        favorite: false
      },
      {
        id: '42',
        title: 'Feixes de Fumo Volumétrico',
        description: 'Fumo denso que corta a luz de fundo em feixes definidos. Cria silhuetas dramáticas e uma forte compressão de escala.',
        category: 'Atmospheric Effects',
        models: ['Nano Banana Pro', 'Midjourney'],
        content: `Model: Nano Banana Pro · Aspect: 2.39:1
Scene: [SUBJECT] silhouetted against heavy smoke with visible shafts of backlight cutting through.
Key: Single hard backlight source behind the smoke at 30° elevation, 5200K.
Atmospheric: Smoke density heavy enough that light shafts are visible as discrete beams, not diffuse wash.

Casos de Uso: Atmosferas pesadas, campos de batalha (estilo Ridley Scott), palcos de concertos.`,
        favorite: false
      },
      {
        id: '43',
        title: 'Névoa da Hora Dourada',
        description: 'Saturação atmosférica suave durante a "hora mágica". A névoa comprime o fundo, fazendo com que o sujeito se destaque num brilho âmbar.',
        category: 'Atmospheric Effects',
        models: ['Nano Banana Pro', 'Midjourney'],
        content: `Model: Nano Banana Pro · Aspect: 3:2
Lens: 85mm at f/2.8 (compression reads as "long lens golden hour").
Stock feel: Kodak Portra 400. Warm pastel rendering, organic highlight rolloff.
Atmospheric: Soft haze density. Far-ground at 100m+ dissolved into golden-amber wash.

Casos de Uso: Paisagens românticas ou nostálgicas, revelações ao pôr-do-sol.`,
        favorite: false
      },
      {
        id: '44',
        title: 'Queda de Neve Ambiente',
        description: 'Queda de neve suave e silenciosa. A neve funciona como um refletor natural gigante, suavizando as sombras em toda a cena.',
        category: 'Atmospheric Effects',
        models: ['Nano Banana Pro', 'Midjourney'],
        content: `Model: Nano Banana Pro · Aspect: 4:5
Key: Single warm practical camera-left (window or streetlamp), 2800K tungsten.
Atmospheric: Snow density 1/4 of frame. Individual flakes visible within 3m, blurring into a softer wash at distance.
Physical detail: One snowflake caught on [SUBJECT]'s eyelash or shoulder, still crystalline.

Casos de Uso: Narrativas de inverno, exteriores íntimos, peças de época.`,
        favorite: false
      },
      {
        id: '45',
        title: 'Monólito Villeneuve',
        description: 'Inspirado em Dune e Arrival. Uma silhueta minúscula contra uma arquitetura monumental, transmitindo uma escala épica e desoladora através de névoa atmosférica e tons monocromáticos.',
        category: 'Director Signatures',
        models: ['Nano Banana Pro', 'Midjourney'],
        content: `Model: Nano Banana Pro · Aspect: 2.39:1
Scene: [SUBJECT] rendered as a tiny silhouette (3-5% of frame height) against a monumental geometric structure.
Key: Hard directional hidden source (behind the monolith or above), 4800K neutral.
Palette: Monochromatic. ONE dominant hue (amber / teal / rust / cobalt) as environmental wash.

Casos de Uso: Planos de estabelecimento à escala de Arrakis, revelações monumentais, épicos de deserto.`,
        favorite: false
      },
      {
        id: '46',
        title: 'Luz Prática Única Deakins',
        description: 'A essência do minimalismo de Roger Deakins (1917, Skyfall). Uma única fonte de luz motivada no cenário (lâmpada, vela ou janela), sem qualquer luz de preenchimento artificial.',
        category: 'Director Signatures',
        models: ['Nano Banana Pro', 'Midjourney'],
        content: `Model: Nano Banana Pro · Aspect: 2.39:1
Scene: [SUBJECT] in interior lit by exactly ONE practical light source (lamp / window / fire / candle).
Fill: NONE. Shadow side falls off naturally. Contrast: 8:1 ratio.
Stock feel: ARRI Alexa digital clean or Kodak Vision3 for a filmic feel.

Casos de Uso: Interiores dramáticos, silhuetas de noir clássico, retratos de contenção emocional.`,
        favorite: false
      },
      {
        id: '47',
        title: 'Enquadramento de Porta Park Chan-wook',
        description: 'Simetria perfeita e cores ricas (esmeralda e carmesim) inspiradas em The Handmaiden. O enquadramento através de portas cria uma sensação de voyeurismo e opulência.',
        category: 'Director Signatures',
        models: ['Nano Banana Pro', 'Midjourney'],
        content: `Model: Nano Banana Pro · Aspect: 16:9
Scene: [SUBJECT] centered in a doorway or architectural frame. Central symmetry.
Palette: Saturated jewel tones. Emerald green wallpaper, crimson accents, gold metal hardware.
Textural emphasis: Silk / embroidery / lacquered wood textures rendered with fine detail.

Casos de Uso: Interiores ornamentados, simetria de época, cenas com tons de joia saturados.`,
        favorite: false
      },
      {
        id: '48',
        title: 'Retrato à Luz de Vela Sciamma·Mathon',
        description: 'Inspirado em Portrait of a Lady on Fire. Um retrato íntimo iluminado apenas por velas, com uma qualidade pictórica que remete para os mestres da pintura holandesa.',
        category: 'Director Signatures',
        models: ['Nano Banana Pro', 'Midjourney'],
        content: `Model: Nano Banana Pro · Aspect: 4:3
Scene: Two figures in interior lit ONLY by a single candle or fireplace.
Key: Candle/firelight at 1800K deep amber. No studio fill.
Composition: Dutch Masters / Vermeer style. Subjects positioned with quiet dignity.

Casos de Uso: Interiores de época, conversas íntimas, estética de pintura a óleo.`,
        favorite: false
      },
      {
        id: '49',
        title: 'Sala Vermelha Lynch',
        description: 'O surrealismo de Twin Peaks. Cortinas de veludo carmesim, chão em ziguezague (chevron) e uma iluminação que cria uma atmosfera onírica e inquietante.',
        category: 'Director Signatures',
        models: ['Nano Banana Pro', 'Midjourney'],
        content: `Model: Nano Banana Pro · Aspect: 16:9
Scene: [SUBJECT] in a deep crimson interior with red velvet curtains on all walls. Black-and-white chevron floor.
Palette: Dominant crimson + black-and-white chevron floor + pale skin tone.
Temporal uncanniness: [SUBJECT]'s pose or expression should feel slightly off or frozen mid-motion.

Casos de Uso: Sonhos surreais, revelações oníricas, estética de estranheza visual.`,
        favorite: false
      },
      {
        id: '50',
        title: 'Grande Plano Extremo Leone (Olhos)',
        description: 'O clímax do Western de Sergio Leone. Um plano ultra-aproximado focado apenas nos olhos, com textura de suor, pó e distorção por calor.',
        category: 'Director Signatures',
        models: ['Nano Banana Pro', 'Midjourney'],
        content: `Model: Nano Banana Pro · Aspect: 2.39:1
Scene: Extreme close-up of [SUBJECT]'s eyes only. iris pattern visible.
Key: Hard low-angle sun at 10° elevation, 3400K deep amber.
Atmospheric: Subtle heat shimmer distortion; dust particulate visible on eyelashes.

Casos de Uso: Duelos de tensão máxima, confrontos míticos, picos de suspense.`,
        favorite: false
      },
      {
        id: '51',
        title: 'Aproximação Lenta',
        description: 'A câmara move-se lentamente em direção ao sujeito. Cria uma sensação de realização, tensão crescente ou foco narrativo profundo.',
        category: 'Motion & Camera Verbs',
        models: ['Seedance 2.0', 'Runway'],
        content: `Model: Seedance 2.0 · Aspect: 2.39:1 · Duration: 6s
Camera move: Slow push-in on a direct linear axis toward [SUBJECT]. Travel distance ~2 meters.
Speed: Constant, unhurried. No acceleration.
Motion emphasis: [SUBJECT] remains still. The MOTION is the camera's attention closing in.

Casos de Uso: Momentos de revelação de personagem, detalhe narrativo importante.`,
        favorite: false
      },
      {
        id: '52',
        title: 'Trilha Lateral de Dolly',
        description: 'A câmara desliza lateralmente, passando pelo sujeito. Este movimento elegante revela a profundidade do cenário através do efeito de paralaxe.',
        category: 'Motion & Camera Verbs',
        models: ['Seedance 2.0', 'Runway'],
        content: `Model: Seedance 2.0 · Aspect: 2.39:1 · Duration: 8s
Camera move: Linear lateral dolly, constant speed. Camera stays at the same distance from [SUBJECT].
Parallax: Foreground and background elements move at different rates relative to the camera.
Stock feel: Kodak Vision3 500T.

Casos de Uso: Estabelecer relações espaciais, acompanhamento de diálogos, revelações laterais.`,
        favorite: false
      },
      {
        id: '53',
        title: 'Mudança de Foco',
        description: 'A focagem muda de um plano para outro (do fundo para a frente ou vice-versa) dentro de um plano estático, transferindo a atenção do espetador.',
        category: 'Motion & Camera Verbs',
        models: ['Seedance 2.0', 'Runway'],
        content: `Model: Seedance 2.0 · Aspect: 16:9 · Duration: 5s
Camera: Static tripod lock-off, no movement.
Lens: 85mm at f/2. Shallow enough for crisp focal separation.
Focus move: Transition smoothly from [SUBJECT_FOREGROUND] to [SUBJECT_BACKGROUND] (under 1 second).

Casos de Uso: Revelar a importância de um elemento em segundo plano, trocas de foco em conversas.`,
        favorite: false
      },
      {
        id: '54',
        title: 'Seguimento Flutuante Steadicam',
        description: 'A câmara flutua suavemente acompanhando o movimento do sujeito pelo espaço. Um estilo imersivo que remete para a cinematografia de Malick ou Lubezki.',
        category: 'Motion & Camera Verbs',
        models: ['Seedance 2.0', 'Runway'],
        content: `Model: Seedance 2.0 · Aspect: 2.39:1 · Duration: 10s
Camera move: Steadicam-smooth glide, matching subject's pace. Matches walking speed.
Lens: 35mm at f/2.8. Wide enough to include environmental context.
Parallax: Rich. Foreground and background move at different rates as the subject walks past.

Casos de Uso: Introdução de personagens em movimento, planos de acompanhamento longos e fluídos.`,
        favorite: false
      },
      {
        id: '55',
        title: 'Revelação em Grua',
        description: 'A câmara sobe, desce ou faz um arco para revelar o contexto envolvente, passando de um plano fechado para um plano de grande escala.',
        category: 'Motion & Camera Verbs',
        models: ['Seedance 2.0', 'Runway'],
        content: `Model: Seedance 2.0 · Aspect: 2.39:1 · Duration: 10s
Camera move: Smooth crane or aerial arc. Rising or descending.
Action: Starts tight on [SUBJECT], then pulls back to show the larger surrounding context.
Physical detail: A previously-hidden environmental element enters the frame as the new focal point.

Casos de Uso: Mudanças de escala, revelação de cenários, planos de estabelecimento épicos.`,
        favorite: false
      },
      {
        id: '56',
        title: 'Transição em Chicote',
        description: 'Uma rotação rápida da câmara que cria um rasto de movimento (motion blur), ideal para transições energéticas entre cenas ou sujeitos.',
        category: 'Motion & Camera Verbs',
        models: ['Seedance 2.0', 'Runway'],
        content: `Model: Seedance 2.0 · Aspect: 2.39:1 · Duration: 4s
Camera move: Rapid rotation of the camera axis (~180°/second).
Motion blur: Heavy during the whip phase. The frame becomes a horizontal streak of color.
Audio: Whoosh / woosh sound effect synchronized with the motion.

Casos de Uso: Transições rápidas, momentos de caos, timing cómico ou mudança de cena dinâmica.`,
        favorite: false
      },
    ];

    // Merge: carregar prompts do localStorage e adicionar novos defaults que não existem
    const saved = localStorage.getItem('prompts');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      try {
        const savedPrompts: Prompt[] = JSON.parse(saved);
        console.log('📂 Carregando prompts do localStorage. Total favoritos:', savedPrompts.filter(p => p.favorite === true).length);
        const savedIds = new Set(savedPrompts.map(p => p.id));

        // Adicionar novos prompts defaults que não existem no localStorage
        const newPrompts = defaultPrompts.filter(p => !savedIds.has(p.id));
        const merged = [...savedPrompts, ...newPrompts];
        console.log('✅ Total de prompts após merge:', merged.length, 'Favoritos:', merged.filter(p => p.favorite === true).length);
        return merged;
      } catch (e) {
        console.warn('Erro ao carregar prompts do localStorage:', e);
        return defaultPrompts;
      }
    }

    console.log('🆕 Usando prompts padrão (primeira vez)');
    return defaultPrompts;
  });

  const [workflows, setWorkflows] = useState<WorkflowType[]>(() => {
    const defaultWorkflows: WorkflowType[] = [
      {
        id: '1',
        title: 'Criação de Conteúdo End-to-End',
        description: 'Gere títulos, escreva conteúdo otimizado para uma história de página e uma imagem para o...',
        category: 'Marketing',
        steps: [
          { tool: 'ChatGPT', status: 'pending', icon: 'message-square' },
          { tool: 'Midjourney', status: 'pending', icon: 'image' },
          { tool: 'Buffer', status: 'pending', icon: 'smartphone' }
        ],
        favorite: false
      },
      {
        id: '2',
        title: 'Análise Automática de Feedback',
        description: 'Recolha feedback de clientes, categorize problemas e envie a notíf...',
        category: 'Operações',
        steps: [
          { tool: 'Typeform', status: 'pending', icon: 'clipboard-list' },
          { tool: 'ChatGPT', status: 'pending', icon: 'message-square' },
          { tool: 'Slack', status: 'pending', icon: 'message-square' }
        ],
        favorite: false
      },
      {
        id: '3',
        title: 'Pesquisa de Leads Automatizada',
        description: 'Encontre prospects no LinkedIn, enriqueça os cidadãos, teste contácto e escreva um email de...',
        category: 'Vendas',
        steps: [
          { tool: 'LinkedIn', status: 'pending', icon: 'linkedin' },
          { tool: 'ChatGPT', status: 'pending', icon: 'message-square' },
          { tool: 'Gmail', status: 'pending', icon: 'mail' }
        ],
        favorite: false
      },
      {
        id: '4',
        title: 'Geração de Relatórios Semanais',
        description: 'Excel dados de planilhas, sumariza com IA, formata com PDF e envia para os chefes...',
        category: 'Operações',
        steps: [
          { tool: 'Excel', status: 'pending', icon: 'bar-chart-3' },
          { tool: 'ChatGPT', status: 'pending', icon: 'message-square' },
          { tool: 'PDF', status: 'pending', icon: 'file-text' }
        ],
        favorite: false
      },
      {
        id: '5',
        title: 'Brand DNA → Social Media Posts ren',
        description: 'Workflow n8n que recebe referência da marca, extrai o Brand DNA e gera posts sociais a partir do fluxo real.',
        category: 'Marketing',
        webhookUrl: DEFAULT_N8N_WEBHOOK_URL,
        inputs: [
          { name: 'images', label: 'Imagens de Referência', type: 'image' as const, required: true, maxImages: 6 },
          { name: 'brandName', label: 'Nome da Marca', type: 'text' as const, required: true, placeholder: 'Ex: TechBrand' }
        ],
        steps: [
          { tool: 'Webhook Trigger', status: 'pending', icon: 'layout' },
          { tool: 'Agente Brand DNA', status: 'pending', icon: 'sparkles' },
          { tool: 'Gerar_Posts_Sociais', status: 'pending', icon: 'image' }
        ],
        favorite: false
      },
      {
        id: 'brand-post-generator',
        title: '🎨 Brand Post Generator',
        description: 'Gera posts de redes sociais mantendo a identidade visual da sua marca. Integração com n8n para análise automática.',
        category: 'Marketing',
        webhookUrl: 'https://ivannnnnn.app.n8n.cloud/webhook/brand-post-generator',
        inputs: [
          { name: 'brandName', label: 'Nome da Marca', type: 'text' as const, required: true, placeholder: 'Ex: TechBrand' },
          { name: 'postType', label: 'Tipo de Post', type: 'select' as const, required: true, options: ['Quote Post', 'Announcement', 'Carousel Cover', 'Feature Post', 'Story Post'] },
          { name: 'topic', label: 'Tópico', type: 'text' as const, required: true, placeholder: 'Ex: New Product Launch' },
          { name: 'mainMessage', label: 'Mensagem Principal', type: 'textarea' as const, required: true, placeholder: 'Descreve a mensagem principal...' },
          { name: 'headline', label: 'Headline', type: 'text' as const, required: true, placeholder: 'Ex: Revolucionando a indústria' },
          { name: 'secondaryText', label: 'Texto Secundário (opcional)', type: 'textarea' as const, placeholder: 'Texto complementar...' },
          { name: 'format', label: 'Formato', type: 'select' as const, options: ['1:1', '9:16', '16:9'] },
          { name: 'images', label: 'Imagens de Referência', type: 'image' as const, maxImages: 6 },
        ],
        steps: [
          { tool: 'Análise Visual', status: 'pending', icon: 'image' },
          { tool: 'GPT-4o Vision', status: 'pending', icon: 'sparkles' },
          { tool: 'DALL-E 3', status: 'pending', icon: 'image' }
        ],
        favorite: false
      },
    ];

    // Merge: carregar workflows do localStorage e adicionar novos defaults que não existem
    const saved = localStorage.getItem('workflows');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      try {
        const savedWorkflows: WorkflowType[] = JSON.parse(saved);
        const normalizedSavedWorkflows = savedWorkflows.map(w => {
          const wNormal = normalizeWorkflowWebhook(w);
          const defaultW = defaultWorkflows.find(dw => dw.id === w.id);
          if (defaultW && defaultW.inputs) {
            wNormal.inputs = defaultW.inputs;
          }
          return wNormal;
        });
        console.log('📂 Carregando workflows do localStorage. Total:', normalizedSavedWorkflows.length);
        const savedIds = new Set(normalizedSavedWorkflows.map(w => w.id));

        // Adicionar novos workflows defaults que não existem no localStorage
        const newWorkflows = defaultWorkflows.filter(w => !savedIds.has(w.id));
        const merged = [...normalizedSavedWorkflows, ...newWorkflows.map(normalizeWorkflowWebhook)];
        console.log('✅ Total de workflows após merge:', merged.length);
        return merged;
      } catch (e) {
        console.warn('Erro ao carregar workflows do localStorage:', e);
        return defaultWorkflows.map(normalizeWorkflowWebhook);
      }
    }

    console.log('🆕 Usando workflows padrão (primeira vez)');
    return defaultWorkflows.map(normalizeWorkflowWebhook);
  });

  // Guardar tools, prompts e workflows no localStorage sempre que mudarem
  useEffect(() => {
    try {
      console.log('💾 Salvando tools no localStorage. Total favoritos:', tools.filter(t => t.favorite === true).length);
      localStorage.setItem('tools', JSON.stringify(tools));
    } catch (e) {
      console.warn('Erro ao salvar tools no localStorage:', e);
    }
  }, [tools]);

  useEffect(() => {
    try {
      // Remover imagens base64 antes de salvar (manter URLs do Supabase)
      const promptsToSave = prompts.map(p => ({
        ...p,
        image: p.image && !p.image.startsWith('data:') ? p.image : undefined
      }));
      console.log('💾 Salvando prompts no localStorage. Total favoritos:', promptsToSave.filter(p => p.favorite === true).length);
      localStorage.setItem('prompts', JSON.stringify(promptsToSave));
    } catch (e: any) {
      console.error('Erro ao salvar prompts:', e);
    }
  }, [prompts]);

  useEffect(() => {
    try {
      console.log('💾 Salvando workflows no localStorage. Total favoritos:', workflows.filter(w => w.favorite === true).length);
      localStorage.setItem('workflows', JSON.stringify(workflows));
    } catch (e) {
      console.warn('Erro ao salvar workflows no localStorage:', e);
    }
  }, [workflows]);

  const getCategoryCount = (category: string, type: 'tool' | 'prompt' | 'workflow') => {
    if (type === 'tool') {
      return tools.filter(tool => tool.category === category).length;
    } else if (type === 'prompt') {
      return prompts.filter(prompt => prompt.category === category).length;
    } else {
      return workflows.filter(workflow => workflow.category === category).length;
    }
  };

  const getSubcategoryCount = (category: string, subcategory: string) => {
    return tools.filter(tool => tool.category === category && tool.subcategory === subcategory).length;
  };

  const getFavoritesCount = (type: 'tool' | 'prompt' | 'workflow') => {
    if (type === 'tool') {
      return tools.filter(tool => tool.favorite === true).length;
    } else if (type === 'prompt') {
      return prompts.filter(prompt => prompt.favorite === true).length;
    } else {
      return workflows.filter(workflow => workflow.favorite === true).length;
    }
  };

  const toggleFavorite = (type: 'tool' | 'prompt' | 'workflow', id: string) => {
    const updateItem = <T extends { id: string; favorite?: boolean }>(item: T) =>
      item.id === id ? { ...item, favorite: !item.favorite } : item;

    if (type === 'tool') {
      setTools(tools.map(updateItem));
    } else if (type === 'prompt') {
      setPrompts(prompts.map(updateItem));
    } else {
      setWorkflows(workflows.map(updateItem));
    }
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
    } else if (type === 'prompt') {
      const updatedPrompts = prompts.filter(p => p.id !== id);
      setPrompts(updatedPrompts);
      await savePrompts(updatedPrompts);
    } else if (type === 'workflow') {
      const updatedWorkflows = workflows.filter(w => w.id !== id);
      setWorkflows(updatedWorkflows);
      await saveWorkflows(updatedWorkflows);
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
        setNewPromptCategory(prompt.category);
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
        setActiveModal('workflow');
        setActiveTab('item');
      }
    } else {
      console.log(`Editar ${type} com id ${id}`);
      alert(`Funcionalidade de editar ${type} em desenvolvimento`);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    if (activeModal === 'ferramenta') {
      if (!toolCategories.includes(newCategoryName)) {
        const updated = [...toolCategories, newCategoryName];
        setToolCategories(updated);
        await saveCategories('tool', updated);
        // Inicializar subcategorias vazias para nova categoria
        if (!subcategoriesMap[newCategoryName]) {
          const updatedSubcategories = {
            ...subcategoriesMap,
            [newCategoryName]: []
          };
          setSubcategoriesMap(updatedSubcategories);
          await saveSubcategories(updatedSubcategories);
        }
      }
    } else if (activeModal === 'prompt') {
      if (!promptCategories.includes(newCategoryName)) {
        const updated = [...promptCategories, newCategoryName];
        setPromptCategories(updated);
        await saveCategories('prompt', updated);
      }
    } else if (activeModal === 'workflow') {
      if (!workflowCategories.includes(newCategoryName)) {
        const updated = [...workflowCategories, newCategoryName];
        setWorkflowCategories(updated);
        await saveCategories('workflow', updated);
      }
    }

    setNewCategoryName('');
  };

  const handleDeleteCategory = async (type: 'tool' | 'prompt' | 'workflow', categoryName: string) => {
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
      if (selectedPromptCategory === categoryName) {
        setSelectedPromptCategory(null);
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
    if (!newSubcategoryName.trim()) return;

    const currentSubcategories = subcategoriesMap[selectedCategoryForSubcategory] || [];
    if (!currentSubcategories.includes(newSubcategoryName)) {
      const updated = {
        ...subcategoriesMap,
        [selectedCategoryForSubcategory]: [...currentSubcategories, newSubcategoryName]
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
    if (selectedSubcategory === subcategoryName) {
      setSelectedSubcategory(null);
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

    const newTool: Tool = {
      id: Date.now().toString(),
      name: newToolName,
      description: newToolDescription,
      category: newToolCategory,
      subcategory: newToolSubcategory,
      badges: newToolBadges,
      tags: tagsArray,
      icon: newToolIcon,
      link: newToolLink || undefined,
      favorite: false
    };

    const updatedTools = [...tools, newTool];
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
    setNewPromptCategory('Marketing');
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
            image: imageUrl || undefined
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

  const handleLogin = () => {
    if (passwordInput.toLowerCase() === 'ivan') {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      setPasswordInput('');
    } else {
      alert('Senha incorreta!');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('isAuthenticated', 'false');
    setPasswordInput('');
  };

  // Tela de Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-[#0f1420] border border-gray-800 rounded-lg p-8">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Zap className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold">Celeuma IA</h1>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Senha</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Digite a senha para desbloquear"
                  className="w-full px-4 py-2 bg-[#0a0e1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Desbloquear
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-400 transition-colors p-1"
            title="Sair"
          >
            <X className="w-5 h-5" />
          </button>
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
                        setSelectedPromptCategory(null);
                        setSearchPromptTerm('');
                      }}
                      className="px-4 py-2 rounded-lg transition-colors bg-gray-800/50 text-gray-400 hover:bg-gray-800 flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedPromptCategory('Favoritos')}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedPromptCategory === 'Favoritos'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                        }`}
                    >
                      <Star className="w-4 h-4" />
                      Favoritos ({getFavoritesCount('prompt')})
                    </button>
                  )}
                  {selectedPromptCategory && (
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
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap ml-4"
                >
                  <Plus className="w-4 h-4" />
                  Novo Prompt
                </button>
              </div>

              {!selectedPromptCategory && !searchPromptTerm ? (
                <div className="grid grid-cols-4 gap-4">
                  {promptCategories.filter(cat => cat !== 'Todos').map(category => (
                    <div
                      key={category}
                      onClick={() => setSelectedPromptCategory(category)}
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
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {prompts.filter(prompt => {
                    const categoryMatch = selectedPromptCategory === 'Favoritos' ? prompt.favorite === true : prompt.category === selectedPromptCategory;
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
                            {prompt.category}
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
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap ml-4"
                >
                  <Plus className="w-4 h-4" />
                  Novo Workflow
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
              <h2 className="text-xl font-semibold">Adicionar Novo</h2>
              <button onClick={() => {
                setActiveModal(null);
                setNewToolName('');
                setNewToolDescription('');
                setNewToolLink('');
                setNewToolBadges(['Free']);
                setNewToolTags('');
                setShowIconPicker(false);
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
                    Adicionar Ferramenta
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

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Categoria</label>
                  <select
                    value={newPromptCategory}
                    onChange={(e) => setNewPromptCategory(e.target.value)}
                    className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 transition-colors"
                  >
                    {promptCategories.filter(cat => cat !== 'Todos').map(cat => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
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

      {/* Modal: Adicionar Workflow */}
      {activeModal === 'workflow' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Adicionar Novo</h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-300">
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
                      {selectedPrompt.category}
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
    </div>
  );
}
