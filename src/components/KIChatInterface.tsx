import { useState, useRef, useEffect } from 'react';
import { Send, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { kiRespond } from '@/lib/konsmia/soul-voice';
import type { ChatMessage, KIMode } from '@/lib/konsmia/types';
import ReactMarkdown from 'react-markdown';

interface Props {
  mode?: KIMode;
}

export function KIChatInterface({ mode = 'balanced' }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'ki',
      content: "I am Waides KI — your market intelligence companion. I observe, interpret, and guide. I don't chase signals, and I won't push you into trades. Ask me anything about the markets, and I will share what I see — with honesty and discipline.\n\nYou can ask me things like:\n- \"Should I trade BTC now?\"\n- \"What do you see in ETH?\"\n- \"When will BTC move?\"\n- \"Is this a good entry?\"",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate KI thinking time
    setTimeout(() => {
      const response = kiRespond(input.trim(), mode);
      const kiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ki`,
        role: 'ki',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, kiMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
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
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-secondary/30 border border-border/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5">
                <Brain className="h-3 w-3 text-primary animate-pulse" />
                <span className="font-mono text-[10px] text-primary">WAIDES KI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/50 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Waides KI..."
            className="flex-1 bg-secondary/30 border border-border/50 rounded px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
          <Button size="sm" onClick={sendMessage} disabled={!input.trim() || isTyping} className="bg-primary text-primary-foreground h-8 px-3">
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
