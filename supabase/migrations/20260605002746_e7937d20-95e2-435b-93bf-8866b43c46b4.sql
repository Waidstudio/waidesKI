
-- 1. Extend signals with lifecycle + breakdown + plans
ALTER TABLE public.signals
  ADD COLUMN IF NOT EXISTS lifecycle_state text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS confidence_breakdown jsonb,
  ADD COLUMN IF NOT EXISTS trade_plans jsonb,
  ADD COLUMN IF NOT EXISTS live_price numeric,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolution_price numeric,
  ADD COLUMN IF NOT EXISTS version int NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_signals_lifecycle ON public.signals(lifecycle_state);
CREATE INDEX IF NOT EXISTS idx_signals_expires ON public.signals(expires_at);

-- 2. Append-only signal version history
CREATE TABLE IF NOT EXISTS public.signal_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id text NOT NULL,
  asset text NOT NULL,
  version int NOT NULL,
  bias text NOT NULL,
  confidence_percent int NOT NULL,
  overall_score int NOT NULL,
  snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.signal_versions TO anon, authenticated;
GRANT ALL ON public.signal_versions TO service_role;
ALTER TABLE public.signal_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "versions viewable" ON public.signal_versions FOR SELECT USING (true);
CREATE POLICY "versions insertable" ON public.signal_versions FOR INSERT WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_versions_signal ON public.signal_versions(signal_id, version DESC);

-- 3. Realtime in-app alerts
CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,             -- signal_fired | signal_won | signal_lost | risk | system
  severity text NOT NULL DEFAULT 'info', -- info | warning | critical
  asset text,
  signal_id text,
  title text NOT NULL,
  message text NOT NULL,
  payload jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.alerts TO anon, authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts viewable" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "alerts insertable" ON public.alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "alerts updatable" ON public.alerts FOR UPDATE USING (true);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON public.alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_unread ON public.alerts(read, created_at DESC);

-- 4. Candle cache (server-side OHLCV per asset/timeframe)
CREATE TABLE IF NOT EXISTS public.candle_cache (
  asset text NOT NULL,
  timeframe text NOT NULL,
  candles jsonb NOT NULL,
  source text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (asset, timeframe)
);
GRANT SELECT, INSERT, UPDATE ON public.candle_cache TO anon, authenticated;
GRANT ALL ON public.candle_cache TO service_role;
ALTER TABLE public.candle_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "candles viewable" ON public.candle_cache FOR SELECT USING (true);
CREATE POLICY "candles insertable" ON public.candle_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "candles updatable" ON public.candle_cache FOR UPDATE USING (true);

-- 5. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.signals;
