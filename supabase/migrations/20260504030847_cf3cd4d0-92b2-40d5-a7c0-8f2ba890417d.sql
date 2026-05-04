
CREATE TABLE public.sandbox_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id text,
  asset text NOT NULL,
  asset_class text NOT NULL DEFAULT 'crypto',
  direction text NOT NULL,
  timeframe text NOT NULL DEFAULT '1h',
  entry_price numeric NOT NULL,
  stop_loss numeric NOT NULL,
  take_profit_1 numeric NOT NULL,
  take_profit_2 numeric,
  current_price numeric,
  position_size numeric NOT NULL DEFAULT 1000,
  leverage numeric NOT NULL DEFAULT 1,
  mode text NOT NULL DEFAULT 'long',
  status text NOT NULL DEFAULT 'open',
  outcome text,
  pnl numeric DEFAULT 0,
  pnl_percent numeric DEFAULT 0,
  confidence_percent integer,
  opened_by text NOT NULL DEFAULT 'waides_ki',
  reasoning text,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sandbox_trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sandbox view" ON public.sandbox_trades FOR SELECT USING (true);
CREATE POLICY "sandbox insert" ON public.sandbox_trades FOR INSERT WITH CHECK (true);
CREATE POLICY "sandbox update" ON public.sandbox_trades FOR UPDATE USING (true);
CREATE INDEX idx_sandbox_trades_status ON public.sandbox_trades(status);
CREATE INDEX idx_sandbox_trades_opened_at ON public.sandbox_trades(opened_at DESC);

CREATE TRIGGER sandbox_trades_updated_at
BEFORE UPDATE ON public.sandbox_trades
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ki_brain_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL DEFAULT 'default',
  kind text NOT NULL,
  key text,
  value jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ki_brain_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brain view" ON public.ki_brain_memory FOR SELECT USING (true);
CREATE POLICY "brain insert" ON public.ki_brain_memory FOR INSERT WITH CHECK (true);
CREATE POLICY "brain update" ON public.ki_brain_memory FOR UPDATE USING (true);
CREATE INDEX idx_brain_session_kind ON public.ki_brain_memory(session_id, kind);

CREATE TRIGGER ki_brain_updated_at
BEFORE UPDATE ON public.ki_brain_memory
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ki_accuracy_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset text NOT NULL,
  asset_class text,
  signal_id text,
  trade_id uuid REFERENCES public.sandbox_trades(id) ON DELETE SET NULL,
  predicted_direction text NOT NULL,
  confidence_percent integer NOT NULL,
  outcome text NOT NULL,
  pnl_percent numeric DEFAULT 0,
  resolved_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ki_accuracy_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "accuracy view" ON public.ki_accuracy_log FOR SELECT USING (true);
CREATE POLICY "accuracy insert" ON public.ki_accuracy_log FOR INSERT WITH CHECK (true);
CREATE INDEX idx_accuracy_resolved ON public.ki_accuracy_log(resolved_at DESC);
