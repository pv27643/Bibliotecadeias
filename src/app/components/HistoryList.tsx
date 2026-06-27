import { useState, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import type { Generation } from '@/types/brand';

interface HistoryListProps {
  brandId: string;
}

export default function HistoryList({ brandId }: HistoryListProps) {
  const [items, setItems] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!brandId) return;
    setLoading(true);
    supabase
      .from('generations')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setItems(data ?? []);
        setLoading(false);
      });
  }, [brandId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-gray-500">
        <Loader className="w-4 h-4 animate-spin" />
        <span className="text-sm">A carregar histórico...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-6 text-center">
        <Clock className="w-8 h-8 text-gray-700 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Sem histórico ainda.<br />Executa um workflow para começar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className="rounded-lg border border-white/5 bg-black/20 overflow-hidden">
          <button
            onClick={() => setExpanded(e => e === item.id ? null : item.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{item.workflow_name}</p>
              <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString('pt-PT')}</p>
            </div>
            {expanded === item.id ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
          </button>

          {expanded === item.id && (
            <div className="px-3 pb-3 space-y-2 border-t border-white/5">
              <div className="mt-2">
                <p className="text-[11px] uppercase tracking-wide text-gray-600 mb-1">Inputs</p>
                <pre className="text-xs text-gray-400 bg-black/30 rounded p-2 overflow-x-auto">
                  {JSON.stringify(item.inputs, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-600 mb-1">Output</p>
                {item.outputs?.caption && (
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{item.outputs.caption}</p>
                )}
                {item.outputs?.image_url && (
                  <img src={item.outputs.image_url} alt="output" className="w-full max-h-40 object-contain rounded mt-1" />
                )}
                {!item.outputs?.caption && !item.outputs?.image_url && (
                  <pre className="text-xs text-gray-400 bg-black/30 rounded p-2 overflow-x-auto">
                    {JSON.stringify(item.outputs, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
