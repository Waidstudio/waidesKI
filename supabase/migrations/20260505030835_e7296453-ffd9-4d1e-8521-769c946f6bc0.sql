
CREATE TABLE public.onyix_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  amount numeric NOT NULL,
  balance_after numeric NOT NULL,
  accuracy_tier text NOT NULL DEFAULT 'medium',
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.onyix_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "onyix view" ON public.onyix_ledger FOR SELECT USING (true);
CREATE POLICY "onyix insert" ON public.onyix_ledger FOR INSERT WITH CHECK (true);

CREATE TABLE public.tredbeing_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id text,
  engine text NOT NULL,
  asset text NOT NULL,
  timeframe text NOT NULL,
  bias text NOT NULL,
  confidence_percent integer NOT NULL,
  entry numeric,
  stop_loss numeric,
  take_profit numeric,
  risk_reward numeric,
  trend text,
  momentum text,
  volatility text,
  liquidity text,
  market_structure text,
  forecast_horizon text,
  historical_accuracy numeric,
  execution_status text DEFAULT 'pending',
  ki_agreement text,
  konslang_statement text,
  outputs jsonb,
  sandbox_trade_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tredbeing_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tb view" ON public.tredbeing_signals FOR SELECT USING (true);
CREATE POLICY "tb insert" ON public.tredbeing_signals FOR INSERT WITH CHECK (true);
CREATE POLICY "tb update" ON public.tredbeing_signals FOR UPDATE USING (true);

CREATE TABLE public.womb_layer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  layer text NOT NULL,
  ref_id text,
  asset text,
  timeframe text,
  engine text,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.womb_layer ENABLE ROW LEVEL SECURITY;
CREATE POLICY "womb view" ON public.womb_layer FOR SELECT USING (true);
CREATE POLICY "womb insert" ON public.womb_layer FOR INSERT WITH CHECK (true);

CREATE TRIGGER trg_tb_updated BEFORE UPDATE ON public.tredbeing_signals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
