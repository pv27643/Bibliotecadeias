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
