import { useRef, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import type { BrandStyleProfile } from '../../types/brand';
import ResultPanel, { type WorkflowOutput } from './ResultPanel';
import { getWebhookUrl } from '../../config/workflows.config';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: Array<{ workflowId: string; output: WorkflowOutput }>;
  loading?: boolean;
}

interface Props {
  activeBrand: BrandStyleProfile | null;
}

export default function DesignAgentChat({ activeBrand }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);

  const getHistory = (msgs: ChatMessage[]) =>
    msgs.filter(m => !m.loading).map(m => ({ role: m.role, content: m.content }));

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text };
    const loadingMsg: ChatMessage = { id: 'loading', role: 'assistant', content: '', loading: true };

    setMessages(prev => {
      const next = [...prev, userMsg, loadingMsg];
      return next;
    });
    setLoading(true);
    scrollBottom();

    try {
      const res = await fetch(getWebhookUrl({ webhookPath: 'design-agent' }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          brand_id: activeBrand?.id ?? '',
          session_id: sessionId,
          history: getHistory([...messages, userMsg]),
        }),
        signal: AbortSignal.timeout(120_000),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply || '...',
        actions: data.actions?.length ? data.actions : undefined,
      };
      setMessages(prev => [...prev.filter(m => m.id !== 'loading'), assistantMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isTimeout = msg.includes('timeout') || msg.includes('Timeout');
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: isTimeout
          ? 'O gerador está a demorar mais do esperado (>2 min). Verifica se o n8n está ativo e tenta de novo.'
          : `Erro: ${msg}`,
      };
      setMessages(prev => [...prev.filter(m => m.id !== 'loading'), errorMsg]);
    } finally {
      setLoading(false);
      scrollBottom();
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col" style={{ height: '680px' }}>
      {/* Brand badge */}
      <div className="px-5 py-3 border-b border-gray-800/50 flex items-center gap-2 flex-shrink-0">
        {activeBrand ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
            <span className="text-xs text-gray-400">Marca ativa:</span>
            <span className="text-xs bg-violet-600/15 border border-violet-600/25 text-violet-400 px-2 py-0.5 rounded-full font-medium">
              {activeBrand.brand_name}
            </span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            <span className="text-xs text-amber-500/80">
              Sem marca ativa — alguns geradores precisam de uma marca selecionada.
            </span>
          </>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-violet-600/20">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Descreve o que queres criar</p>
            <p className="text-gray-600 text-xs">
              Ex: "Gera um post para o Instagram sobre produtividade"
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-[#1a1f2e] border border-gray-800/50 text-gray-200 rounded-bl-sm'
              }`}
            >
              {msg.loading ? (
                <div className="flex gap-1.5 items-center py-1">
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              )}

              {msg.actions?.map((action, i) => (
                <div key={i} className="mt-4 border-t border-white/10 pt-3">
                  <p className="text-[11px] text-gray-500 mb-2 uppercase tracking-wide">Resultado</p>
                  <ResultPanel
                    output={action.output}
                    workflowId={action.workflowId}
                    onRunAgain={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-5 py-4 border-t border-gray-800/50 flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Descreve o que queres criar..."
            rows={1}
            disabled={loading}
            className="flex-1 bg-[#0f1420] border border-gray-800/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-violet-600/50 resize-none text-sm disabled:opacity-50 leading-relaxed"
            style={{ minHeight: '42px', maxHeight: '120px' }}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-500 disabled:bg-gray-800 disabled:text-gray-600 transition-colors flex-shrink-0"
            title="Enviar (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-gray-700 mt-1.5 px-1">Enter para enviar · Shift+Enter para nova linha</p>
      </div>
    </div>
  );
}
