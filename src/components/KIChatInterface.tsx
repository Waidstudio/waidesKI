import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { kiRespond } from '@/lib/konsmia/soul-voice';
import { supabase } from '@/integrations/supabase/client';
import type { ChatMessage, KIMode } from '@/lib/konsmia/types';
import ReactMarkdown from 'react-markdown';

interface Props {
  mode?: KIMode;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ki-chat`;

export function KIChatInterface({ mode = 'balanced' }: Props) {
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
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
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
  }, [mode, persistMessage]);

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

  return (
    <div className="flex flex-col h-full">
      {/* AI toggle */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30 bg-secondary/10">
        <span className="font-mono text-[10px] text-muted-foreground">
          {useAI ? '🧠 AI Intelligence Active' : '⚡ Local Intelligence'}
        </span>
        <button
          onClick={() => setUseAI(!useAI)}
          className={`font-mono text-[10px] px-2 py-0.5 rounded border transition-colors ${
            useAI ? 'border-primary/30 text-primary bg-primary/5' : 'border-border text-muted-foreground'
          }`}
        >
          {useAI ? 'AI ON' : 'AI OFF'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 min-h-0">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 ${
              msg.role === 'user'
                ? 'bg-primary/10 border border-primary/20'
                : 'bg-secondary/30 border border-border/50'
            }`}>
              {msg.role === 'ki' && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Brain className="h-3 w-3 text-primary" />
                  <span className="font-mono text-[10px] text-primary">WAIDES KI</span>
                </div>
              )}
              <div className="text-xs text-foreground/90 leading-relaxed prose prose-invert prose-xs max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isStreaming && messages[messages.length - 1]?.role !== 'ki' && (
          <div className="flex justify-start">
            <div className="bg-secondary/30 border border-border/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 text-primary animate-spin" />
                <span className="font-mono text-[10px] text-primary">WAIDES KI is analyzing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/50 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Waides KI anything..."
            className="flex-1 bg-secondary/30 border border-border/50 rounded px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
          <Button size="sm" onClick={sendMessage} disabled={!input.trim() || isStreaming} className="bg-primary text-primary-foreground h-8 px-3">
            {isStreaming ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
