export interface BrandStyleProfile {
  id: string;
  brand_name: string;
  source: { type: 'url' | 'images' | 'manual'; ref?: string };
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    background: string;
    text: string;
    extra?: string[];
  };
  typography: {
    heading_font: string;
    body_font: string;
    weights: string[];
    scale?: string;
  };
  logo: { url?: string; variants?: string[]; clear_space?: string };
  tone_of_voice: {
    adjectives: string[];
    do: string[];
    dont: string[];
    sample_phrases: string[];
  };
  imagery_style: {
    description: string;
    composition_rules: string[];
    filters?: string;
  };
  layout_patterns: {
    grid?: string;
    spacing?: string;
    alignment?: string;
    recurring_elements?: string[];
  };
  platforms: {
    instagram?: { aspect_ratios: string[]; post_types: string[] };
    linkedin?: { aspect_ratios: string[]; post_types: string[] };
    [k: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  brand_id: string;
  workflow_id: string;
  workflow_name: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  created_at: string;
}

export type BrandStyleProfileDraft = Omit<BrandStyleProfile, 'id' | 'created_at' | 'updated_at'>;
