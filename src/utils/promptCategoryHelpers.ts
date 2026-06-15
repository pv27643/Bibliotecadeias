import {
  DEFAULT_PROMPT_SUBCATEGORIES,
  PROMPT_ROOT_CATEGORY
} from '../data/categories';

export interface PromptCategoryItem {
  category: string;
  subcategory?: string;
}

export type SubcategoriesMap = Record<string, string[]>;

export const getPromptRootSubcategories = (
  promptCategories: string[],
  subcategoriesMap: SubcategoriesMap
) => {
  const legacyCategoriesStillStored = promptCategories.filter(category =>
    DEFAULT_PROMPT_SUBCATEGORIES.includes(category)
  );

  return Array.from(new Set([
    ...(subcategoriesMap[PROMPT_ROOT_CATEGORY] || []),
    ...legacyCategoriesStillStored
  ]));
};

export const getPromptCategorySubcategories = (
  category: string,
  promptRootSubcategories: string[],
  subcategoriesMap: SubcategoriesMap
) => (
  category === PROMPT_ROOT_CATEGORY
    ? promptRootSubcategories
    : (subcategoriesMap[category] || [])
);

export const getPromptSubcategory = (prompt: PromptCategoryItem) => (
  prompt.subcategory ||
  (DEFAULT_PROMPT_SUBCATEGORIES.includes(prompt.category) ? prompt.category : undefined)
);

export const getPromptCategory = (prompt: PromptCategoryItem) => (
  getPromptSubcategory(prompt) ? PROMPT_ROOT_CATEGORY : prompt.category
);

export const getPromptMainCategories = (
  promptCategories: string[],
  promptRootSubcategories: string[]
) => {
  const storedCategories = promptCategories.filter(category => category !== 'Todos');
  const needsLegacyRoot = storedCategories.some(category =>
    category === PROMPT_ROOT_CATEGORY || promptRootSubcategories.includes(category)
  );

  return Array.from(new Set([
    ...(needsLegacyRoot ? [PROMPT_ROOT_CATEGORY] : []),
    ...storedCategories.filter(category =>
      category !== PROMPT_ROOT_CATEGORY && !promptRootSubcategories.includes(category)
    )
  ]));
};
