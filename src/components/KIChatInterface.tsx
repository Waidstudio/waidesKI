import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, Sparkles, Plus, ThumbsUp, ArrowLeft, ChevronDown, Brain, Atom, Activity, Trash2, MessageSquarePlus } from 'lucide-react';
import { kiRespond } from '@/lib/konsmia/soul-voice';
import { supabase } from '@/integrations/supabase/client';
import type { ChatMessage, KIMode } from '@/lib/konsmia/types';
import ReactMarkdown from 'react-markdown';
import { buildBrainContext, rememberPreference } from '@/lib/konsmia/ki-brain';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Props {
  mode?: KIMode;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ki-chat`;

type EntityId = 'waides' | 'chinnikstah' | 'tredbeings' | 'konsai';

interface Entity {
  id: EntityId;
  name: string;
  tagline: string;
  icon: typeof Sparkles;
  welcome: string;
  quickPrompts: string[];
}

const ENTITIES: Record<EntityId, Entity> = {
  waides: {
    id: 'waides',
    name: 'Waides KI',
    tagline: 'Autonomous market intelligence',
    icon: Sparkles,
    welcome:
      "I am **Waides KI**.\n\nI observe markets, weigh evidence, and guide you with discipline.\n\nAsk me anything — a setup, a risk question, or an overview.",
    quickPrompts: ['What do you see in BTC?', 'Risk for today?', 'Best setup now?'],
  },
  chinnikstah: {
    id: 'chinnikstah',
    name: 'Smai Chinnikstah',
    tagline: '12-family unified indicator',
    icon: Activity,
    welcome:
      "I am **Smai Chinnikstah** — the unified indicator.\n\nI synthesize 12 indicator families plus the Adaptive KI Core. Ask me why I'm leaning a direction, what my volatility regime is, or what my confidence means.",
    quickPrompts: ['Why are you bearish?', 'What increased volatility?', 'Explain current squeeze'],
  },
  tredbeings: {
    id: 'tredbeings',
    name: 'TredBeings',
    tagline: 'Trading entity collective',
    icon: Atom,
    welcome:
      "We are the **TredBeings** — autonomous trading entities.\n\nEach of us watches one asset on one timeframe. Ask which of us is firing, our open positions, or our recent verdicts.",
    quickPrompts: ['Who is firing now?', 'Show open positions', 'Recent verdicts'],
  },
  konsai: {
    id: 'konsai',
    name: 'KonsAi',
    tagline: 'Strategic companion · adaptive',
    icon: Brain,
    welcome:
      "Hey — I'm **KonsAi**.\n\nThink of me as your trading friend. We can plan strategies together, review your screenshots, talk through ideas — whatever you need. Drop a chart or just tell me what's on your mind.",
    quickPrompts: ['Help me plan a swing strategy', "Let's review a chart", 'Talk through my last trade'],
  },
};

const ENTITY_ORDER: EntityId[] = ['waides', 'chinnikstah', 'tredbeings', 'konsai'];

export function KIChatInterface({ mode = 'balanced' }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [entityId, setEntityId] = useState<EntityId>('waides');
  const [entityMenuOpen, setEntityMenuOpen] = useState(false);
  const entity = ENTITIES[entityId];

  // Per-entity active session id (allows "new chat")
  const [sessionByEntity, setSessionByEntity] = useState<Record<EntityId, string>>(() =>
    ENTITY_ORDER.reduce((acc, id) => {
      acc[id] = `entity-${id}`;
      return acc;
    }, {} as Record<EntityId, string>)
  );
  const sessionId = sessionByEntity[entityId];

  const [messagesByEntity, setMessagesByEntity] = useState<Record<EntityId, ChatMessage[]>>(() =>
    ENTITY_ORDER.reduce((acc, id) => {
      acc[id] = [
        {
          id: `welcome-${id}`,
          role: 'ki',
          content: ENTITIES[id].welcome,
          timestamp: new Date().toISOString(),
        },
      ];
      return acc;
    }, {} as Record<EntityId, ChatMessage[]>)
  );
  const messages = messagesByEntity[entityId];
  const setMessages = useCallback(
    (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
      setMessagesByEntity(prev => ({ ...prev, [entityId]: updater(prev[entityId]) }));
    },
    [entityId]
  );

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadedEntities = useRef<Set<string>>(new Set());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = '0px';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [input]);

  // Load history per entity once
  useEffect(() => {
    const key = `${entityId}::${sessionId}`;
    if (loadedEntities.current.has(key)) return;
    loadedEntities.current.add(key);
    (async () => {
      try {
        const { data } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })
          .limit(100);
        if (data && data.length > 0) {
          setMessagesByEntity(prev => ({
            ...prev,
            [entityId]: [
              prev[entityId][0],
              ...data.map(m => ({
                id: m.id,
                role: m.role as 'user' | 'ki',
                content: m.content,
                timestamp: m.created_at,
              })),
            ],
          }));
        }
      } catch (e) {
        console.warn('Failed to load chat history:', e);
      }
    })();
  }, [entityId, sessionId]);

  const persistMessage = useCallback(
    async (role: string, content: string) => {
      try {
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role,
          content,
        });
      } catch (e) {
        console.warn('Failed to persist message:', e);
      }
    },
    [sessionId]
  );

  const startNewChat = useCallback(() => {
    const newId = `entity-${entityId}-${Date.now()}`;
    setSessionByEntity(prev => ({ ...prev, [entityId]: newId }));
    setMessagesByEntity(prev => ({
      ...prev,
      [entityId]: [
        {
          id: `welcome-${entityId}-${Date.now()}`,
          role: 'ki',
          content: entity.welcome,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  }, [entityId, entity.welcome]);

  const deleteCurrentChat = useCallback(async () => {
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    try {
      await supabase.from('chat_messages').delete().eq('session_id', sessionId);
    } catch (e) {
      console.warn('Failed to delete chat:', e);
    }
    startNewChat();
  }, [sessionId, startNewChat]);

  const streamFromAI = useCallback(
    async (userMessage: string, history: ChatMessage[]) => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const apiMessages = history
          .filter(m => !m.id.startsWith('welcome'))
          .map(m => ({ role: m.role === 'ki' ? 'assistant' : 'user', content: m.content }));
        apiMessages.push({ role: 'user', content: userMessage });

        const lower = userMessage.toLowerCase();
        if (/\b(long[- ]?term|swing|hodl)\b/.test(lower)) rememberPreference('horizon', 'long_term');
        else if (/\b(spot|short[- ]?term|scalp|day trade)\b/.test(lower)) rememberPreference('horizon', 'short_term');
        if (/\b(crypto|btc|eth|sol)\b/.test(lower)) rememberPreference('asset_class', 'crypto');
        else if (/\b(forex|fx|eur\/usd|gbp\/usd)\b/.test(lower)) rememberPreference('asset_class', 'forex');

        const brain_context = await buildBrainContext(location.pathname).catch(() => null);

        const resp = await fetch(CHAT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: apiMessages,
            brain_context,
            current_route: location.pathname,
            entity: entityId,
          }),
          signal: controller.signal,
        });

        if (!resp.ok || !resp.body) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error || `AI error: ${resp.status}`);
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = '';
        let fullResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (line.startsWith(':') || line.trim() === '') continue;
            if (!line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last?.role === 'ki' && last.id === 'streaming') {
                    return prev.map((m, i) =>
                      i === prev.length - 1 ? { ...m, content: fullResponse } : m
                    );
                  }
                  return [
                    ...prev,
                    {
                      id: 'streaming',
                      role: 'ki',
                      content: fullResponse,
                      timestamp: new Date().toISOString(),
                    },
                  ];
                });
              }
            } catch {
              textBuffer = line + '\n' + textBuffer;
              break;
            }
          }
        }

        setMessages(prev =>
          prev.map(m => (m.id === 'streaming' ? { ...m, id: `msg-${Date.now()}-ki` } : m))
        );
        persistMessage('ki', fullResponse);
      } catch (e: any) {
        if (e.name === 'AbortError') return;
        console.error('AI streaming failed:', e);
        const fallback = kiRespond(userMessage, mode);
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== 'streaming');
          return [
            ...filtered,
            {
              id: `msg-${Date.now()}-ki`,
              role: 'ki',
              content: fallback + '\n\n*— Local intelligence (AI gateway unavailable)*',
              timestamp: new Date().toISOString(),
            },
          ];
        });
        persistMessage('ki', fallback);
      }
    },
    [mode, persistMessage, location.pathname, entityId, setMessages]
  );

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    const historyForAI = [...messages, userMsg];
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    persistMessage('user', text);
    await streamFromAI(text, historyForAI);
    setIsStreaming(false);
  }, [input, isStreaming, messages, streamFromAI, persistMessage, setMessages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const grouped = useMemo(() => {
    return messages.map((m, i) => {
      const prev = messages[i - 1];
      const next = messages[i + 1];
      const samePrev = prev && prev.role === m.role;
      const sameNext = next && next.role === m.role;
      return { msg: m, samePrev: !!samePrev, sameNext: !!sameNext };
    });
  }, [messages]);

  const EntityIcon = entity.icon;

  return (
    <div
      className="flex flex-col h-full bg-black"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Compact chat header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[hsl(0_0%_12%)] bg-gradient-to-b from-black to-[hsl(0_0%_4%)] shrink-0 shadow-[0_1px_0_hsl(185_100%_55%/0.1)]">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="h-9 w-9 rounded-full flex items-center justify-center text-foreground/80 hover:bg-white/5 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="relative">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-[hsl(185_100%_55%/0.3)] to-[hsl(280_90%_65%/0.3)] border border-[hsl(185_100%_55%/0.5)] shadow-[0_0_10px_-3px_hsl(185_100%_55%/0.6)]">
            <EntityIcon className="h-4 w-4 text-primary" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary border-2 border-black shadow-[0_0_4px_hsl(185_100%_55%)]" />
        </div>
        <button
          onClick={() => setEntityMenuOpen(o => !o)}
          className="flex-1 min-w-0 flex items-center gap-1 text-left active:opacity-70 transition-opacity rounded-lg px-1 py-0.5 hover:bg-white/5"
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground leading-tight truncate">
              {entity.name}
            </div>
            <div className="text-[10px] text-primary/80 font-mono leading-tight truncate">
              {entity.tagline}
            </div>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform shrink-0',
              entityMenuOpen && 'rotate-180'
            )}
          />
        </button>
        <button
          onClick={startNewChat}
          aria-label="New chat"
          title="New chat"
          className="h-9 w-9 rounded-full flex items-center justify-center text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <MessageSquarePlus className="h-4 w-4" />
        </button>
        <button
          onClick={deleteCurrentChat}
          aria-label="Delete chat"
          title="Delete chat"
          className="h-9 w-9 rounded-full flex items-center justify-center text-foreground/80 hover:bg-danger/10 hover:text-danger transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Entity dropdown */}
      {entityMenuOpen && (
        <div className="border-b border-[hsl(0_0%_12%)] bg-black/95 shrink-0">
          {ENTITY_ORDER.map(id => {
            const e = ENTITIES[id];
            const Icon = e.icon;
            const active = id === entityId;
            return (
              <button
                key={id}
                onClick={() => {
                  setEntityId(id);
                  setEntityMenuOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                  active ? 'bg-primary/10' : 'hover:bg-white/5'
                )}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-[hsl(185_100%_55%/0.2)] to-[hsl(280_90%_65%/0.2)] border border-[hsl(185_100%_55%/0.3)]">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn('text-sm font-medium leading-tight', active ? 'text-primary' : 'text-foreground')}>
                    {e.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono leading-tight truncate">
                    {e.tagline}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0 [scrollbar-width:thin]">
        {grouped.map(({ msg, samePrev, sameNext }) => {
          const isUser = msg.role === 'user';
          const showAvatar = !isUser && !sameNext;
          const showName = !isUser && !samePrev;
          return (
            <div
              key={msg.id}
              className={cn(
                'flex items-end gap-2',
                isUser ? 'justify-end' : 'justify-start',
                samePrev ? 'mt-0.5' : 'mt-3'
              )}
            >
              {!isUser && (
                <div className="w-7 shrink-0">
                  {showAvatar && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-[hsl(185_100%_55%/0.25)] to-[hsl(280_90%_65%/0.25)] border border-[hsl(185_100%_55%/0.35)]">
                      <EntityIcon className="h-3 w-3 text-primary" />
                    </div>
                  )}
                </div>
              )}
              <div className={cn('flex flex-col max-w-[82%]', isUser ? 'items-end' : 'items-start')}>
                {showName && (
                  <span className="text-[10px] text-muted-foreground font-mono mb-1 ml-1">
                    {entity.name}
                  </span>
                )}
                <div
                  className={cn(
                    'px-3.5 py-2 text-[13px] leading-relaxed break-words',
                    isUser
                      ? 'bg-primary text-primary-foreground shadow-[0_0_12px_-4px_hsl(185_100%_55%/0.55)]'
                      : 'bg-[hsl(0_0%_8%)] text-foreground border border-[hsl(0_0%_14%)]',
                    isUser
                      ? cn('rounded-2xl rounded-br-md', samePrev && 'rounded-tr-md')
                      : cn('rounded-2xl rounded-bl-md', samePrev && 'rounded-tl-md')
                  )}
                >
                  <div
                    className={cn(
                      'prose prose-invert prose-sm max-w-none',
                      // Structured rendering — tight, readable, mobile-first
                      '[&_p]:my-1 [&_p]:leading-relaxed',
                      '[&_h1]:text-[13px] [&_h1]:font-bold [&_h1]:text-primary [&_h1]:uppercase [&_h1]:tracking-wider [&_h1]:mt-3 [&_h1]:mb-1.5 [&_h1]:first:mt-0',
                      '[&_h2]:text-[12px] [&_h2]:font-bold [&_h2]:text-primary [&_h2]:uppercase [&_h2]:tracking-wider [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h2]:first:mt-0',
                      '[&_h3]:text-[11px] [&_h3]:font-bold [&_h3]:text-primary/90 [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:mt-2.5 [&_h3]:mb-1 [&_h3]:first:mt-0',
                      '[&_ul]:my-1.5 [&_ul]:pl-4 [&_ol]:my-1.5 [&_ol]:pl-4',
                      '[&_li]:my-0.5 [&_li]:marker:text-primary/60',
                      '[&_strong]:text-foreground [&_strong]:font-semibold',
                      '[&_code]:text-[11px] [&_code]:bg-white/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded',
                      '[&_table]:my-2 [&_table]:text-[11px] [&_th]:text-primary [&_th]:font-semibold [&_th]:text-left [&_th]:pr-3 [&_td]:pr-3 [&_td]:py-0.5',
                      '[&_hr]:my-2 [&_hr]:border-white/10',
                      '[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-2 [&_blockquote]:italic [&_blockquote]:text-foreground/80'
                    )}
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                {!sameNext && (
                  <span className="text-[9px] text-muted-foreground mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {isStreaming && messages[messages.length - 1]?.role !== 'ki' && (
          <div className="flex items-end gap-2 justify-start mt-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-[hsl(185_100%_55%/0.25)] to-[hsl(280_90%_65%/0.25)] border border-[hsl(185_100%_55%/0.35)]">
              <EntityIcon className="h-3 w-3 text-primary" />
            </div>
            <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_14%)] rounded-2xl rounded-bl-md px-3 py-2.5">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts when fresh */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
          {entity.quickPrompts.map(q => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="shrink-0 text-[11px] px-3 py-1.5 rounded-full border border-[hsl(0_0%_18%)] text-foreground/80 hover:border-primary/50 hover:text-primary transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Composer — no extra bottom gap */}
      <div className="border-t border-[hsl(0_0%_12%)] bg-black px-2 py-2 shrink-0">
        <div className="flex items-end gap-1.5">
          <button
            type="button"
            aria-label="Add"
            className="shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-end bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_16%)] rounded-3xl px-3 py-1.5 focus-within:border-primary/50 transition-colors">
            <textarea
              ref={taRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${entity.name}…`}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none max-h-[120px] py-1.5 leading-snug"
            />
          </div>
          {input.trim() ? (
            <button
              onClick={sendMessage}
              disabled={isStreaming}
              aria-label="Send"
              className="shrink-0 h-9 w-9 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-[0_0_10px_-2px_hsl(185_100%_55%/0.7)] active:scale-95 transition-transform disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Like"
              className="shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
            >
              <ThumbsUp className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}