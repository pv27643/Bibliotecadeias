import { useState, useEffect } from 'react';
import { Zap, Workflow, FileText, Library, Plus, X, Sparkles, Video, Pencil, Image, MessageSquare, Clock, Play, Circle, CheckCircle2, ArrowRight, MoreVertical, Copy, Check, Layout, Box, PenTool, Smartphone, ClipboardList, Linkedin, Mail, BarChart3, Edit, Trash2, Star, ArrowLeft, Search } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

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

interface WorkflowType {
  id: string;
  title: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  favorite?: boolean;
}

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-d8505aef`;

export default function App() {
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
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [copied, setCopied] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{type: 'tool' | 'prompt' | 'workflow', id: string} | null>(null);
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

  const [toolCategories, setToolCategories] = useState<string[]>(['Todas', 'Texto', 'Negócios', '3D', 'Audio', 'Outros', 'Vídeo', 'Código', 'Imagem']);
  const [promptCategories, setPromptCategories] = useState<string[]>(['Todos', 'Marketing', 'Desenvolvimento', 'Design', 'Produtividade']);
  const [workflowCategories, setWorkflowCategories] = useState<string[]>(['Todos', 'Marketing', 'Operações', 'Vendas']);

  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, string[]>>({
    'Texto': ['Copywriting', 'SEO', 'Tradução', 'Resumo', 'Redação'],
    'Negócios': ['CRM', 'Analytics', 'Automação', 'Produtividade', 'Finanças'],
    '3D': ['Modelação', 'Renderização', 'Animação', 'Texturas'],
    'Audio': ['Geração de Voz', 'Música', 'Edição', 'Transcrição'],
    'Outros': ['Geral', 'Educação', 'Saúde', 'Lifestyle'],
    'Vídeo': ['Geração', 'Edição', 'Animação', 'Legendas', 'Personalização'],
    'Código': ['Geração', 'Revisão', 'Debugging', 'Documentação'],
    'Imagem': ['Geração', 'Edição', 'Upscaling', 'Avatar', 'Logo', 'Assistente Design']
  });

  // Load data from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${API_BASE}/data`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Comentado temporariamente para usar dados locais atualizados
        // if (data.tools && data.tools.length > 0) setTools(data.tools.map(t => ({ ...t, favorite: t.favorite || false })));
        if (data.prompts && data.prompts.length > 0) setPrompts(data.prompts.map(p => ({ ...p, favorite: p.favorite || false })));
        if (data.workflows && data.workflows.length > 0) setWorkflows(data.workflows.map(w => ({ ...w, favorite: w.favorite || false })));
        if (data.toolCategories && data.toolCategories.length > 0) setToolCategories(data.toolCategories);
        if (data.promptCategories && data.promptCategories.length > 0) setPromptCategories(data.promptCategories);
        if (data.workflowCategories && data.workflowCategories.length > 0) setWorkflowCategories(data.workflowCategories);
        if (data.subcategories && Object.keys(data.subcategories).length > 0) setSubcategoriesMap(data.subcategories);

        console.log('Dados carregados com sucesso da base de dados');
      } catch (error) {
        console.warn('Servidor Supabase ainda não foi deployado. A usar dados locais.', error);
        // Continua com os dados iniciais já definidos no estado
      }
    };
    loadData();
  }, []);

  // Save data helpers
  const saveTools = async (newTools: Tool[]) => {
    try {
      const response = await fetch(`${API_BASE}/tools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(newTools)
      });
      if (response.ok) {
        console.log('Ferramentas guardadas na base de dados');
      }
    } catch (error) {
      console.warn('Servidor Supabase ainda não deployado. Faça deploy para persistir dados.', error);
    }
  };

  const savePrompts = async (newPrompts: Prompt[]) => {
    try {
      const response = await fetch(`${API_BASE}/prompts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(newPrompts)
      });
      if (response.ok) {
        console.log('Prompts guardados na base de dados');
      }
    } catch (error) {
      console.warn('Servidor Supabase ainda não deployado. Faça deploy para persistir dados.', error);
    }
  };

  const saveWorkflows = async (newWorkflows: WorkflowType[]) => {
    try {
      const response = await fetch(`${API_BASE}/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(newWorkflows)
      });
      if (response.ok) {
        console.log('Workflows guardados na base de dados');
      }
    } catch (error) {
      console.warn('Servidor Supabase ainda não deployado. Faça deploy para persistir dados.', error);
    }
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
      if (response.ok) {
        console.log('Categorias guardadas na base de dados');
      }
    } catch (error) {
      console.warn('Servidor Supabase ainda não deployado. Faça deploy para persistir dados.', error);
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
      if (response.ok) {
        console.log('Subcategorias guardadas na base de dados');
      }
    } catch (error) {
      console.warn('Servidor Supabase ainda não deployado. Faça deploy para persistir dados.', error);
    }
  };

  const [tools, setTools] = useState<Tool[]>([
    { id: '1', name: 'Jasper', description: 'Crie textos de marketing, artigos para blogues e campanhas de ads completas.', category: 'Texto', subcategory: 'Copywriting', badges: ['Freemium', 'Pago'], tags: ['Texto'], icon: 'pen-tool', link: 'https://www.jasper.ai', favorite: false },
    { id: '2', name: 'Midjourney', description: 'Geração de imagens fotorrealistas e ilustrações a partir de texto (text-to-image) com a mais alta qualidade artística do mercado.', category: 'Imagem', subcategory: 'Geração', badges: ['Pago'], tags: ['Imagem', 'Gerador'], icon: 'image', link: 'https://midjourney.com', favorite: false },
    { id: '3', name: 'Runway', description: 'O padrão da indústria criativa para geração de vídeo a partir de texto (text-to-video) e imagem (image-to-video) com a mais alta fidelidade e controle. Inclui ferramentas de remoção de fundo e interpolação.', category: 'Vídeo', subcategory: 'Animação', badges: ['Freemium'], tags: ['Vídeo', 'Text-to-Video', 'VFX'], icon: 'video', link: 'https://runwayml.com', favorite: false },
    { id: '4', name: 'Spline AI', description: 'Gere cenas 3D usando comandos em texto.', category: '3D', subcategory: 'Modelação', badges: ['Freemium'], tags: ['3D'], icon: 'box', link: 'https://spline.design', favorite: false },
    { id: '5', name: 'ChatGPT', description: 'IA de conversação avançada para pesquisa, produtividade e muito mais.', category: 'Texto', subcategory: 'Redação', badges: ['Free', 'Pago'], tags: ['Chatbot', 'Text'], icon: 'message-square', link: 'https://chat.openai.com', favorite: false },
    { id: '6', name: 'GitHub Copilot', description: 'Assistente de programação com IA para autocompletar código.', category: 'Código', subcategory: 'Geração', badges: ['Pago'], tags: ['Código', 'Programação'], icon: 'sparkles', link: 'https://github.com/features/copilot', favorite: false },
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
  ]);

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
      default:
        return <Library {...iconProps} />;
    }
  };

  const [prompts, setPrompts] = useState<Prompt[]>([
    {
      id: '1',
      title: 'Artigo de Blogue Otimizado SEO',
      description: 'Cria artigos de blogue completos e otimizados para SEO com estrutura profissional, meta descrição e estratégia de palavras-chave.',
      category: 'Marketing',
      models: ['ChatGPT', 'Claude'],
      content: `Atue como um especialista em SEO e redator profissional. Escreva um artigo de blogue detalhado sobre [TEMA] focando-se na palavra-chave [KEYWORD]. O artigo deve ter entre 1500-2000 palavras e incluir:

1. Título chamativo com a palavra-chave principal
2. Meta descrição otimizada (150-160 caracteres)
3. Introdução que capte a atenção do leitor
4. Subtítulos H2 e H3 estratégicos com variações da palavra-chave
5. Conteúdo informativo e de valor para o leitor
6. Exemplos práticos e dados relevantes
7. Call-to-action no final
8. Sugestões de links internos e externos

Tom de voz: [PROFISSIONAL/CASUAL/TÉCNICO]
Público-alvo: [DESCREVA O PÚBLICO]`,
      favorite: false
    },
    {
      id: '2',
      title: 'Revisão de Código em React',
      description: 'Análise profunda de código React com foco em performance, segurança, acessibilidade e boas práticas modernas de desenvolvimento.',
      category: 'Desenvolvimento',
      models: ['GitHub Copilot', 'ChatGPT'],
      content: `Atue como um programador sênior especializado em React. Revise o seguinte código e forneça sugestões de melhoria focando em:

1. Performance (memoização, lazy loading, code splitting)
2. Boas práticas e padrões modernos do React
3. Acessibilidade (ARIA labels, navegação por teclado)
4. Segurança (XSS, validação de inputs)
5. Legibilidade e manutenibilidade do código
6. Testes unitários recomendados
7. Otimizações específicas

Para cada sugestão, explique:
- O problema identificado
- Por que é importante corrigir
- Como implementar a solução
- Impacto esperado

CÓDIGO:
[CÓDIGO]`,
      favorite: false
    },
    {
      id: '3',
      title: 'Geração de Imagens Estilo Cyberpunk',
      description: 'Prompt otimizado para criar imagens cyberpunk fotorrealistas com ambientação futurista, luzes neon e estética Blade Runner.',
      category: 'Design',
      models: ['Midjourney'],
      content: `Uma rua chuvosa em Tóquio à noite com luzes neon vibrantes em tons de rosa, azul e roxo, anúncios holográficos flutuantes com caracteres japoneses, carros futuristas voadores, pessoas com implantes cibernéticos e roupas high-tech caminhando pelas calçadas molhadas que refletem as luzes da cidade. Arranha-céus gigantescos ao fundo cobertos de telas digitais. Névoa cyberpunk, atmosfera noir, chuva intensa, fotorrealista, alta qualidade, 8k, iluminação cinematográfica, estilo Blade Runner --ar 16:9 --v 6`,
      favorite: false
    },
    {
      id: '4',
      title: 'Resumo Executivo de Reuniões',
      description: 'Transforma transcrições de reuniões em resumos executivos estruturados com decisões, ações, responsáveis e prazos organizados.',
      category: 'Produtividade',
      models: ['ChatGPT', 'Notion AI'],
      content: `Analise a seguinte transcrição de reunião e crie um resumo executivo estruturado seguindo este formato:

## RESUMO EXECUTIVO DE REUNIÃO

**Data:** [DATA]
**Participantes:** [LISTA]
**Duração:** [TEMPO]

### 📋 TÓPICOS DISCUTIDOS
- [Ponto 1]
- [Ponto 2]
- [Ponto 3]

### ✅ DECISÕES TOMADAS
1. [Decisão com contexto]
2. [Decisão com contexto]

### 🎯 AÇÕES A EXECUTAR
| Ação | Responsável | Prazo |
|------|-------------|-------|
| [Ação] | [Nome] | [Data] |

### 📌 PRÓXIMOS PASSOS
- [Próximo passo 1]
- [Próximo passo 2]

### ⚠️ BLOQUEIOS/RISCOS
- [Se aplicável]

TRANSCRIÇÃO:
[TRANSCRIÇÃO DA REUNIÃO]`,
      favorite: false
    },
    {
      id: '5',
      title: 'E-mail de Vendas (Cold Outreach)',
      description: 'Cria emails de prospecção personalizados usando o método RAR (Razão-Atenção-Resultado) com call-to-action eficaz e prova social.',
      category: 'Marketing',
      models: ['Jasper', 'ChatGPT'],
      content: `Escreva um e-mail de prospecção fria (cold outreach) seguindo o método RAR:

**R - RAZÃO (Motivo do contato)**
**A - ATENÇÃO (Valor/Benefício)**
**R - RESULTADO (Call-to-Action)**

Contexto:
- Empresa alvo: [NOME DA EMPRESA]
- Pessoa de contato: [NOME E CARGO]
- Produto/Serviço: [DESCRIÇÃO]
- Benefício principal: [BENEFÍCIO]

Diretrizes:
1. Assunto: Curto, personalizado e intrigante (máx. 50 caracteres)
2. Abertura: Personalizada com pesquisa sobre a empresa/pessoa
3. Corpo: Foque no problema que você resolve, não no produto
4. Prova social: Mencione caso de sucesso relevante
5. CTA: Simples e de baixo compromisso (ex: reunião de 15min)
6. Assinatura: Profissional com links relevantes

Tom: Profissional mas amigável, consultivo, não agressivo
Tamanho: 100-150 palavras máximo`,
      favorite: false
    },
  ]);

  const [workflows, setWorkflows] = useState<WorkflowType[]>([
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
  ]);

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

  const toggleToolFavorite = async (id: string) => {
    const tool = tools.find(t => t.id === id);
    if (!tool) return;

    const newFavoriteValue = !tool.favorite;
    const updatedTools = tools.map(t =>
      t.id === id ? { ...t, favorite: newFavoriteValue } : t
    );

    console.log('Toggle favorite:', tool.name);
    console.log('Before:', tool.favorite, 'After:', newFavoriteValue);
    console.log('Total favorites after toggle:', updatedTools.filter(t => t.favorite === true).length);

    setTools(updatedTools);
    await saveTools(updatedTools);
  };

  const togglePromptFavorite = async (id: string) => {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;

    const newFavoriteValue = !prompt.favorite;
    const updatedPrompts = prompts.map(p =>
      p.id === id ? { ...p, favorite: newFavoriteValue } : p
    );

    setPrompts(updatedPrompts);
    await savePrompts(updatedPrompts);
  };

  const toggleWorkflowFavorite = async (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    if (!workflow) return;

    const newFavoriteValue = !workflow.favorite;
    const updatedWorkflows = workflows.map(w =>
      w.id === id ? { ...w, favorite: newFavoriteValue } : w
    );

    setWorkflows(updatedWorkflows);
    await saveWorkflows(updatedWorkflows);
  };

  const executeWorkflow = (workflow: WorkflowType) => {
    setExecutingWorkflow(workflow);
    setWorkflowLogs([
      `[18:42:01] Iniciando workflow "${workflow.title}"...`,
      `[18:42:02] Conectado ao ChatGPT (API v1)...`,
      `[18:42:13] Artigo gerado com sucesso (458 palavras).`,
      `[18:42:14] Extraindo prompt de imagem do artigo...`,
      `[18:42:15] Enviando pedido para Midjourney API...`,
      `[18:42:33] A aguardar geração de imagem (aprox. 30s)...`,
    ]);
  };

  const copyPromptToClipboard = (content: string) => {
    try {
      // Método alternativo que funciona mesmo quando a API está bloqueada
      const textarea = document.createElement('textarea');
      textarea.value = content;
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
    // Aqui você pode abrir um modal de edição ou navegar para uma página de edição
    console.log(`Editar ${type} com id ${id}`);
    // Por enquanto, apenas mostramos no console
    alert(`Funcionalidade de editar ${type} em desenvolvimento`);
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

    const newPrompt: Prompt = {
      id: Date.now().toString(),
      title: newPromptTitle,
      description: newPromptDescription,
      category: newPromptCategory,
      models: modelsArray,
      content: newPromptContent,
      image: newPromptImage || undefined,
      favorite: false
    };

    const updatedPrompts = [...prompts, newPrompt];
    setPrompts(updatedPrompts);
    await savePrompts(updatedPrompts);

    // Limpar form
    setNewPromptTitle('');
    setNewPromptDescription('');
    setNewPromptContent('');
    setNewPromptImage('');
    setNewPromptCategory('Marketing');
    setNewPromptModels('ChatGPT, Claude');
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
        <div className="flex items-center gap-2 mb-8 px-2">
          <Zap className="w-6 h-6 text-blue-500" />
          <span className="font-semibold text-lg">Celeuma IA</span>
        </div>

        <nav className="space-y-1 flex-1">
          <button
            onClick={() => setCurrentView('workflows')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              currentView === 'workflows' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50'
            }`}
          >
            <Workflow className="w-5 h-5" />
            <span>Workflows</span>
          </button>

          <button
            onClick={() => setCurrentView('prompts')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              currentView === 'prompts' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Prompts</span>
          </button>

          <button
            onClick={() => setCurrentView('biblioteca')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              currentView === 'biblioteca' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50'
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
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedCategory === 'Favoritos'
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
              ) : selectedCategory && !selectedSubcategory ? (
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
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        !selectedBadge
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      Todos os Preços
                    </button>
                    <button
                      onClick={() => setSelectedBadge('Free')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedBadge === 'Free'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      Free
                    </button>
                    <button
                      onClick={() => setSelectedBadge('Freemium')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedBadge === 'Freemium'
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      Freemium
                    </button>
                    <button
                      onClick={() => setSelectedBadge('Pago')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedBadge === 'Pago'
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
                        console.log('=== FAVORITOS DEBUG ===');
                        console.log('Selected category:', selectedCategory);
                        console.log('Total tools:', tools.length);
                        console.log('Tools with favorite=true:', tools.filter(t => t.favorite === true).map(t => ({ id: t.id, name: t.name, favorite: t.favorite })));
                        console.log('Filtered favorites:', filtered.map(t => ({ id: t.id, name: t.name, favorite: t.favorite })));
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
                                toggleToolFavorite(tool.id);
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
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedPromptCategory === 'Favoritos'
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
                              togglePromptFavorite(prompt.id);
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
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedWorkflowCategory === 'Favoritos'
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
                  <div key={workflow.id} className="bg-[#151921] border border-gray-800/50 rounded-lg p-5 hover:border-gray-700 transition-colors relative">
                    <div className="mb-4 flex items-start justify-between">
                      <span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 text-xs rounded uppercase font-medium">
                        {workflow.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWorkflowFavorite(workflow.id);
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
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        newToolBadges.includes(badge)
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
              <h2 className="text-xl font-semibold">Adicionar Novo</h2>
              <button onClick={() => {
                setActiveModal(null);
                setNewPromptTitle('');
                setNewPromptDescription('');
                setNewPromptContent('');
                setNewPromptImage('');
                setNewPromptModels('ChatGPT, Claude');
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
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewPromptImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2.5 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  {newPromptImage && (
                    <div className="relative w-full h-32 bg-gray-800/50 rounded-lg overflow-hidden">
                      <img src={newPromptImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setNewPromptImage('')}
                        className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
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
                  }}
                  className="px-4 py-2.5 bg-transparent text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddPrompt}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Guardar Prompt
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
                  className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Descrição</label>
                <textarea
                  placeholder="Descreva o que este workflow faz..."
                  rows={2}
                  className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Categoria</label>
                <select className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 transition-colors">
                  {workflowCategories.filter(cat => cat !== 'Todos').map(cat => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
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
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Criar Workflow
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

      {/* Modal: Workflow Executando */}
      {executingWorkflow && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-400">A EXECUTAR</span>
              </div>
              <button onClick={() => setExecutingWorkflow(null)} className="text-gray-400 hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl font-semibold mb-6">{executingWorkflow.title}</h2>

            <div className="flex items-center justify-between mb-8">
              {executingWorkflow.steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      idx === 0 ? 'bg-blue-600 text-white' : idx === 1 ? 'bg-gray-800 text-gray-400' : 'bg-gray-800/50 text-gray-500'
                    }`}>
                      {idx === 0 ? <CheckCircle2 className="w-6 h-6" /> : getWorkflowIcon(step.icon, 'lg')}
                    </div>
                    <span className="text-xs text-gray-400 mt-2">{step.tool}</span>
                  </div>
                  {idx < executingWorkflow.steps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-gray-600 mb-6" />
                  )}
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Logs de Execução</span>
              </div>
              <div className="bg-[#0a0e1a] border border-gray-800 rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs">
                {workflowLogs.map((log, idx) => (
                  <div key={idx} className={
                    log.includes('sucesso') ? 'text-green-400' :
                    log.includes('Erro') ? 'text-red-400' :
                    log.includes('aguardar') ? 'text-yellow-400' :
                    'text-gray-400'
                  }>
                    {log}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Tempo decorrido: 0m 18s</span>
              </div>
              <button
                onClick={() => setExecutingWorkflow(null)}
                className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors"
              >
                Cancelar Execução
              </button>
            </div>
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
              <div className="bg-[#0f1420] border border-gray-800 rounded-lg p-4">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {selectedPrompt.content}
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
    </div>
  );
}
