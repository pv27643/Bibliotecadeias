import { Library, Sparkles, MessageSquare, Image, Video, BarChart3, FileText, Box, Smartphone, ClipboardList, Linkedin, Mail } from 'lucide-react';

interface IconProps {
  className: string;
  strokeWidth: number;
}

export const getToolIcon = (iconName: string, size: 'sm' | 'md' = 'md') => {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  const iconProps: IconProps = { className: sizeClass, strokeWidth: 2 };

  const iconMap: Record<string, React.ReactNode> = {
    'layout': <Library {...iconProps} />,
    'image': <Image {...iconProps} />,
    'pen-tool': <Sparkles {...iconProps} />,
    'video': <Video {...iconProps} />,
    'box': <Box {...iconProps} />,
    'message-square': <MessageSquare {...iconProps} />,
  };

  return iconMap[iconName] || <Sparkles {...iconProps} />;
};

export const getWorkflowIcon = (iconName: string, size: 'sm' | 'md' | 'lg' = 'sm') => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
  const iconProps: IconProps = { className: sizeClass, strokeWidth: 2 };

  const iconMap: Record<string, React.ReactNode> = {
    'message-square': <MessageSquare {...iconProps} />,
    'image': <Image {...iconProps} />,
    'smartphone': <Smartphone {...iconProps} />,
    'clipboard-list': <ClipboardList {...iconProps} />,
    'linkedin': <Linkedin {...iconProps} />,
    'mail': <Mail {...iconProps} />,
    'bar-chart-3': <BarChart3 {...iconProps} />,
    'file-text': <FileText {...iconProps} />,
  };

  return iconMap[iconName] || <Box {...iconProps} />;
};

export const getCategoryIcon = (categoryName: string) => {
  const iconProps: IconProps = { className: 'w-6 h-6', strokeWidth: 2 };

  const iconMap: Record<string, React.ReactNode> = {
    'Texto': <FileText {...iconProps} />,
    'Negócios': <BarChart3 {...iconProps} />,
    '3D': <Box {...iconProps} />,
    'Audio': <MessageSquare {...iconProps} />,
    'Outros': <Library {...iconProps} />,
    'Vídeo': <Video {...iconProps} />,
    'Código': <Sparkles {...iconProps} />,
    'Imagem': <Image {...iconProps} />,
    'Prompts': <FileText {...iconProps} />,
  };

  return iconMap[categoryName] || <Library {...iconProps} />;
};

export const getBadgeColor = (badge: string): string => {
  switch (badge) {
    case 'Free':
      return 'bg-green-600 text-white';
    case 'Freemium':
      return 'bg-orange-600 text-white';
    case 'Pago':
      return 'bg-red-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
};
