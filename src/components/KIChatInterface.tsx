import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, Sparkles, Plus, Smile, ThumbsUp } from 'lucide-react';
import { kiRespond } from '@/lib/konsmia/soul-voice';
import { supabase } from '@/integrations/supabase/client';
import type { ChatMessage, KIMode } from '@/lib/konsmia/types';
import ReactMarkdown from 'react-markdown';
import { buildBrainContext, rememberPreference } from '@/lib/konsmia/ki-brain';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Props {
  mode?: KIMode;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ki-chat`;

export function KIChatInterface({ mode = 'balanced' }: Props) {
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'ki',
      content: "I am **Waides KI** — your market intelligence companion.\n\nI observe, interpret, and guide. I don't chase signals, and I won't push you into trades.\n\nAsk me anything about the markets:\n- \"Should I trade BTC now?\"\n- \"What do you see in ETH?\"\n- \"When will the market move?\"\n- \"How should I manage risk?\"",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-grow textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = '0px';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [input]);

  // Load chat history from DB
  useEffect(() => {
    async function loadHistory() {
      try {
        const { data } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', 'default')
          .order('created_at', { ascending: true })
          .limit(100);
        if (data && data.length > 0) {
          setMessages(prev => [
            prev[0], // Keep welcome message
            ...data.map(m => ({
              id: m.id,
              role: m.role as 'user' | 'ki',
              content: m.content,
              timestamp: m.created_at,
            })),
          ]);
        }
      } catch (e) {
        console.warn('Failed to load chat history:', e);
      }
    }
    loadHistory();
  }, []);

  const persistMessage = useCallback(async (role: string, content: string) => {
    try {
      await supabase.from('chat_messages').insert({
        session_id: 'default',
        role,
        content,
      });
    } catch (e) {
      console.warn('Failed to persist message:', e);
    }
  }, []);

  const streamFromAI = useCallback(async (userMessage: string, allMessages: ChatMessage[]) => {
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const apiMessages = allMessages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role === 'ki' ? 'assistant' : 'user', content: m.content }));
      apiMessages.push({ role: 'user', content: userMessage });

      // Detect simple preference statements and persist them so KI remembers
      const lower = userMessage.toLowerCase();
      if (/\b(long[- ]?term|swing|hodl)\b/.test(lower)) rememberPreference('horizon', 'long_term');
      else if (/\b(spot|short[- ]?term|scalp|day trade)\b/.test(lower)) rememberPreference('horizon', 'short_term');
      if (/\b(crypto|btc|eth|sol)\b/.test(lower)) rememberPreference('asset_class', 'crypto');
      else if (/\b(forex|fx|eur\/usd|gbp\/usd)\b/.test(lower)) rememberPreference('asset_class', 'forex');
      else if (/\b(stock|equit|aapl|tsla|nvda)\b/.test(lower)) rememberPreference('asset_class', 'stock');

      const brain_context = await buildBrainContext(location.pathname).catch(() => null);

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, brain_context, current_route: location.pathname }),
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
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: fullResponse } : m);
                }
                return [...prev, { id: 'streaming', role: 'ki', content: fullResponse, timestamp: new Date().toISOString() }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Finalize streaming message with proper ID
      setMessages(prev =>
        prev.map(m => m.id === 'streaming' ? { ...m, id: `msg-${Date.now()}-ki` } : m)
      );
      persistMessage('ki', fullResponse);
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      console.error('AI streaming failed:', e);
      // Fallback to local soul-voice
      const fallback = kiRespond(userMessage, mode);
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== 'streaming');
        return [...filtered, {
          id: `msg-${Date.now()}-ki`,
          role: 'ki',
          content: fallback + '\n\n*— Local intelligence (AI gateway unavailable)*',
          timestamp: new Date().toISOString(),
        }];
      });
      persistMessage('ki', fallback);
    }
  }, [mode, persistMessage, location.pathname]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    const text = input.trim();

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    persistMessage('user', text);

    if (useAI) {
      await streamFromAI(text, messages);
    } else {
      // Local fallback
      setTimeout(() => {
        const response = kiRespond(text, mode);
        const kiMsg: ChatMessage = {
          id: `msg-${Date.now()}-ki`,
          role: 'ki',
          content: response,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, kiMsg]);
        persistMessage('ki', response);
      }, 800);
    }
    setIsStreaming(false);
  }, [input, isStreaming, messages, mode, useAI, streamFromAI, persistMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Group messages so consecutive same-author bubbles stack tightly (Messenger style)
  const grouped = useMemo(() => {
    return messages.map((m, i) => {
      const prev = messages[i - 1];
      const next = messages[i + 1];
      const samePrev = prev && prev.role === m.role;
      const sameNext = next && next.role === m.role;
      return { msg: m, samePrev: !!samePrev, sameNext: !!sameNext };
    });
  }, [messages]);

  const quickPrompts = ['What do you see in BTC?', 'Risk for today?', 'Best setup now?'];

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Messenger-style header */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-[hsl(0_0%_12%)] bg-black/95">
        <div className="relative">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-[hsl(185_100%_55%/0.25)] to-[hsl(280_90%_65%/0.25)] border border-[hsl(185_100%_55%/0.4)]">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-black shadow-[0_0_6px_hsl(185_100%_55%)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground leading-tight truncate">Waides KI</div>
          <div className="text-[10px] text-primary/80 font-mono leading-tight">
            {useAI ? 'Active now · AI intelligence' : 'Active · Local intelligence'}
          </div>
        </div>
        <button
          onClick={() => setUseAI(!useAI)}
          className={cn(
            'font-mono text-[9px] px-2 py-1 rounded-full border transition-colors',
            useAI
              ? 'border-primary/40 text-primary bg-primary/5'
              : 'border-border text-muted-foreground'
          )}
          aria-label="Toggle AI mode"
        >
          {useAI ? 'AI ON' : 'AI OFF'}
        </button>
      </div>

      {/* Messages — Messenger feed */}
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
                      <Sparkles className="h-3 w-3 text-primary" />
                    </div>
                  )}
                </div>
              )}
              <div className={cn('flex flex-col max-w-[78%]', isUser ? 'items-end' : 'items-start')}>
                {showName && (
                  <span className="text-[10px] text-muted-foreground font-mono mb-1 ml-1">Waides KI</span>
                )}
                <div
                  className={cn(
                    'px-3.5 py-2 text-[13px] leading-relaxed break-words',
                    isUser
                      ? 'bg-primary text-primary-foreground shadow-[0_0_12px_-4px_hsl(185_100%_55%/0.55)]'
                      : 'bg-[hsl(0_0%_8%)] text-foreground border border-[hsl(0_0%_14%)]',
                    // Bubble corner radii based on grouping (messenger style)
                    isUser
                      ? cn(
                          'rounded-2xl rounded-br-md',
                          samePrev && 'rounded-tr-md',
                          sameNext && 'rounded-br-md'
                        )
                      : cn(
                          'rounded-2xl rounded-bl-md',
                          samePrev && 'rounded-tl-md',
                          sameNext && 'rounded-bl-md'
                        )
                  )}
                >
                  <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_strong]:text-foreground">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                {!sameNext && (
                  <span className="text-[9px] text-muted-foreground mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {isStreaming && messages[messages.length - 1]?.role !== 'ki' && (
          <div className="flex items-end gap-2 justify-start mt-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-[hsl(185_100%_55%/0.25)] to-[hsl(280_90%_65%/0.25)] border border-[hsl(185_100%_55%/0.35)]">
              <Sparkles className="h-3 w-3 text-primary" />
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

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {quickPrompts.map(q => (
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

      {/* Messenger-style input bar */}
      <div className="border-t border-[hsl(0_0%_12%)] bg-black px-2 pt-2 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:pb-2">
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
              placeholder="Aa"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none max-h-[120px] py-1.5 leading-snug"
            />
            <button
              type="button"
              aria-label="Emoji"
              className="shrink-0 ml-1 h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            >
              <Smile className="h-4 w-4" />
            </button>
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
