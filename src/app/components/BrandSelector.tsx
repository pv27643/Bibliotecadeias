import { useState, useEffect } from 'react';
import { ChevronDown, Plus, Palette, Trash2, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import type { BrandStyleProfile } from '@/types/brand';

interface BrandSelectorProps {
  value: BrandStyleProfile | null;
  onChange: (brand: BrandStyleProfile | null) => void;
  onCreateNew: () => void;
}

export default function BrandSelector({ value, onChange, onCreateNew }: BrandSelectorProps) {
  const [brands, setBrands] = useState<BrandStyleProfile[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('brand_profiles')
        .select('*')
        .order('updated_at', { ascending: false });
      if (err) throw err;
      setBrands(data ?? []);
      if (data?.length && !value) {
        onChange(data[0]);
      }
    } catch (e: any) {
      setError('Não foi possível carregar as marcas.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteBrand(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Eliminar esta marca e todo o seu histórico?')) return;
    await supabase.from('brand_profiles').delete().eq('id', id);
    const updated = brands.filter(b => b.id !== id);
    setBrands(updated);
    if (value?.id === id) onChange(updated[0] ?? null);
  }

  return (
    <div className="relative">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Marca ativa</p>

      {loading ? (
        <div className="flex items-center gap-2 h-10 text-gray-500">
          <Loader className="w-4 h-4 animate-spin" />
          <span className="text-sm">A carregar marcas...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(o => !o)}
            className="flex-1 flex items-center gap-2 bg-[#151921] border border-gray-800/50 hover:border-gray-700 rounded-lg px-3 py-2 text-left transition-colors"
          >
            <div className="w-7 h-7 rounded bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Palette className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="flex-1 text-sm text-white truncate">
              {value ? value.brand_name : <span className="text-gray-500">Seleciona uma marca...</span>}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={onCreateNew}
            title="Nova marca"
            className="w-9 h-9 flex items-center justify-center bg-[#151921] border border-gray-800/50 hover:border-violet-500 rounded-lg transition-colors text-gray-400 hover:text-violet-400"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {open && !loading && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 left-0 right-9 z-20 bg-[#1a1f2e] border border-gray-800 rounded-lg shadow-xl overflow-hidden">
            {brands.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-gray-500 mb-3">Nenhuma marca criada ainda.</p>
                <button
                  onClick={() => { setOpen(false); onCreateNew(); }}
                  className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 mx-auto"
                >
                  <Plus className="w-3.5 h-3.5" /> Criar primeira marca
                </button>
              </div>
            ) : (
              <ul className="py-1 max-h-60 overflow-y-auto">
                {brands.map(brand => (
                  <li
                    key={brand.id}
                    onClick={() => { onChange(brand); setOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-white/5 transition-colors group ${value?.id === brand.id ? 'bg-white/5' : ''}`}
                  >
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Palette className="w-3 h-3 text-white" />
                    </div>
                    <span className="flex-1 text-sm text-white truncate">{brand.brand_name}</span>
                    {value?.id === brand.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                    )}
                    <button
                      onClick={e => deleteBrand(brand.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
