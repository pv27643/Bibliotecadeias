import { Trash2 } from 'lucide-react';

interface CategoryModalProps {
  categories: string[];
  getSubcategories: (cat: string) => string[];
  newCategoryName: string;
  setNewCategoryName: (v: string) => void;
  newSubcategoryName: string;
  setNewSubcategoryName: (v: string) => void;
  categoryTab: 'categoria' | 'subcategoria';
  setCategoryTab: (t: 'categoria' | 'subcategoria') => void;
  selectedCategoryForSub: string;
  setSelectedCategoryForSub: (cat: string) => void;
  onAddCategory: () => void;
  onDeleteCategory: (cat: string) => void;
  onAddSubcategory: () => void;
  onDeleteSubcategory: (cat: string, sub: string) => void;
  onClose: () => void;
  isProtected?: (cat: string) => boolean;
}

export default function CategoryModal({
  categories,
  getSubcategories,
  newCategoryName,
  setNewCategoryName,
  newSubcategoryName,
  setNewSubcategoryName,
  categoryTab,
  setCategoryTab,
  selectedCategoryForSub,
  setSelectedCategoryForSub,
  onAddCategory,
  onDeleteCategory,
  onAddSubcategory,
  onDeleteSubcategory,
  onClose,
  isProtected,
}: CategoryModalProps) {
  return (
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
                    onAddCategory();
                  }
                }}
                className="flex-1 bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
              />
              <button
                onClick={onAddCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Adicionar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-3">Categorias Existentes</label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories
                .filter(cat => cat !== 'Todas' && cat !== 'Todos')
                .map(cat => (
                  <div key={cat} className="flex items-center justify-between bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2.5">
                    <span className="text-white">{cat}</span>
                    {isProtected && isProtected(cat) ? (
                      <span className="text-xs text-gray-500">Base</span>
                    ) : (
                      <button
                        onClick={() => onDeleteCategory(cat)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              {categories.filter(cat => cat !== 'Todas' && cat !== 'Todos').length === 0 && (
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
              value={selectedCategoryForSub}
              onChange={(e) => setSelectedCategoryForSub(e.target.value)}
              className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 transition-colors mb-4"
            >
              {categories.filter(cat => cat !== 'Todas').map(cat => (
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
                    onAddSubcategory();
                  }
                }}
                className="flex-1 bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
              />
              <button
                onClick={onAddSubcategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Adicionar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-3">Subcategorias de {selectedCategoryForSub}</label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {getSubcategories(selectedCategoryForSub).map(subcat => (
                <div key={subcat} className="flex items-center justify-between bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2.5">
                  <span className="text-white">{subcat}</span>
                  <button
                    onClick={() => onDeleteSubcategory(selectedCategoryForSub, subcat)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {getSubcategories(selectedCategoryForSub).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Nenhuma subcategoria adicionada</p>
              )}
            </div>
          </div>
        </>
      )}

      <div className="flex gap-3 pt-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
