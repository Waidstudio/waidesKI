-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Signals history table
CREATE TABLE public.signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signal_id TEXT NOT NULL UNIQUE,
  asset TEXT NOT NULL,
  bias TEXT NOT NULL,
  confidence TEXT NOT NULL,
  confidence_percent INTEGER NOT NULL,
  overall_score INTEGER NOT NULL,
  direction TEXT NOT NULL,
  action TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  soul_voice TEXT,
  confluence_summary TEXT,
  reasoning TEXT,
  time_window JSONB,
  entry_precision JSONB,
  macro JSONB,
  micro JSONB,
  psychological JSONB,
  temporal JSONB,
  liquidity JSONB,
  correlation JSONB,
  multi_timeframe_aligned BOOLEAN DEFAULT false,
  outcome TEXT DEFAULT 'pending',
  actual_result TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signals are viewable by everyone" ON public.signals FOR SELECT USING (true);
CREATE POLICY "Signals can be inserted by anyone" ON public.signals FOR INSERT WITH CHECK (true);
CREATE POLICY "Signals can be updated by anyone" ON public.signals FOR UPDATE USING (true);

-- Trade journal table
CREATE TABLE public.trade_journal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  asset TEXT NOT NULL,
  direction TEXT NOT NULL,
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC,
  pnl NUMERIC DEFAULT 0,
  pnl_percent NUMERIC DEFAULT 0,
  confidence TEXT,
  notes TEXT,
  signal_id TEXT,
  outcome TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trade_journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anonymous can view journal" ON public.trade_journal FOR SELECT USING (true);
CREATE POLICY "Anonymous can insert journal" ON public.trade_journal FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their journal" ON public.trade_journal FOR UPDATE USING (true);
CREATE POLICY "Users can delete journal entries" ON public.trade_journal FOR DELETE USING (true);

CREATE TRIGGER update_trade_journal_updated_at
BEFORE UPDATE ON public.trade_journal FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL DEFAULT 'default',
  role TEXT NOT NULL CHECK (role IN ('user', 'ki')),
  content TEXT NOT NULL,
  signal_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chat messages viewable" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Chat messages insertable" ON public.chat_messages FOR INSERT WITH CHECK (true);

-- Market data cache table
CREATE TABLE public.market_data_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  change_24h NUMERIC DEFAULT 0,
  volume_24h NUMERIC DEFAULT 0,
  high_24h NUMERIC,
  low_24h NUMERIC,
  market_cap NUMERIC,
  sparkline JSONB,
  source TEXT DEFAULT 'coingecko',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.market_data_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Market data viewable" ON public.market_data_cache FOR SELECT USING (true);
CREATE POLICY "Market data insertable" ON public.market_data_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Market data updatable" ON public.market_data_cache FOR UPDATE USING (true);

-- Signal memory for learning
CREATE TABLE public.signal_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signal_id TEXT NOT NULL,
  asset TEXT NOT NULL,
  prediction TEXT NOT NULL,
  confidence_percent INTEGER NOT NULL,
  outcome TEXT DEFAULT 'pending',
  actual_result TEXT,
  user_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.signal_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signal memory viewable" ON public.signal_memory FOR SELECT USING (true);
CREATE POLICY "Signal memory insertable" ON public.signal_memory FOR INSERT WITH CHECK (true);
CREATE POLICY "Signal memory updatable" ON public.signal_memory FOR UPDATE USING (true);

-- Indexes
CREATE INDEX idx_signals_asset ON public.signals(asset);
CREATE INDEX idx_signals_created ON public.signals(created_at DESC);
CREATE INDEX idx_trade_journal_user ON public.trade_journal(user_id);
CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX idx_market_data_symbol ON public.market_data_cache(symbol);
CREATE INDEX idx_signal_memory_asset ON public.signal_memory(asset);