export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          asset: string | null
          created_at: string
          id: string
          kind: string
          message: string
          payload: Json | null
          read: boolean
          severity: string
          signal_id: string | null
          title: string
        }
        Insert: {
          asset?: string | null
          created_at?: string
          id?: string
          kind: string
          message: string
          payload?: Json | null
          read?: boolean
          severity?: string
          signal_id?: string | null
          title: string
        }
        Update: {
          asset?: string | null
          created_at?: string
          id?: string
          kind?: string
          message?: string
          payload?: Json | null
          read?: boolean
          severity?: string
          signal_id?: string | null
          title?: string
        }
        Relationships: []
      }
      candle_cache: {
        Row: {
          asset: string
          candles: Json
          source: string | null
          timeframe: string
          updated_at: string
        }
        Insert: {
          asset: string
          candles: Json
          source?: string | null
          timeframe: string
          updated_at?: string
        }
        Update: {
          asset?: string
          candles?: Json
          source?: string | null
          timeframe?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
          signal_data: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id?: string
          signal_data?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          signal_data?: Json | null
        }
        Relationships: []
      }
      ki_accuracy_log: {
        Row: {
          asset: string
          asset_class: string | null
          confidence_percent: number
          id: string
          outcome: string
          pnl_percent: number | null
          predicted_direction: string
          resolved_at: string
          signal_id: string | null
          trade_id: string | null
        }
        Insert: {
          asset: string
          asset_class?: string | null
          confidence_percent: number
          id?: string
          outcome: string
          pnl_percent?: number | null
          predicted_direction: string
          resolved_at?: string
          signal_id?: string | null
          trade_id?: string | null
        }
        Update: {
          asset?: string
          asset_class?: string | null
          confidence_percent?: number
          id?: string
          outcome?: string
          pnl_percent?: number | null
          predicted_direction?: string
          resolved_at?: string
          signal_id?: string | null
          trade_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ki_accuracy_log_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "sandbox_trades"
            referencedColumns: ["id"]
          },
        ]
      }
      ki_brain_memory: {
        Row: {
          created_at: string
          id: string
          key: string | null
          kind: string
          session_id: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key?: string | null
          kind: string
          session_id?: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string | null
          kind?: string
          session_id?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      market_data_cache: {
        Row: {
          change_24h: number | null
          high_24h: number | null
          id: string
          low_24h: number | null
          market_cap: number | null
          name: string
          price: number
          source: string | null
          sparkline: Json | null
          symbol: string
          updated_at: string
          volume_24h: number | null
        }
        Insert: {
          change_24h?: number | null
          high_24h?: number | null
          id?: string
          low_24h?: number | null
          market_cap?: number | null
          name: string
          price: number
          source?: string | null
          sparkline?: Json | null
          symbol: string
          updated_at?: string
          volume_24h?: number | null
        }
        Update: {
          change_24h?: number | null
          high_24h?: number | null
          id?: string
          low_24h?: number | null
          market_cap?: number | null
          name?: string
          price?: number
          source?: string | null
          sparkline?: Json | null
          symbol?: string
          updated_at?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      onyix_ledger: {
        Row: {
          accuracy_tier: string
          action: string
          amount: number
          balance_after: number
          created_at: string
          id: string
          meta: Json | null
        }
        Insert: {
          accuracy_tier?: string
          action: string
          amount: number
          balance_after: number
          created_at?: string
          id?: string
          meta?: Json | null
        }
        Update: {
          accuracy_tier?: string
          action?: string
          amount?: number
          balance_after?: number
          created_at?: string
          id?: string
          meta?: Json | null
        }
        Relationships: []
      }
      sandbox_trades: {
        Row: {
          asset: string
          asset_class: string
          closed_at: string | null
          confidence_percent: number | null
          current_price: number | null
          direction: string
          entry_price: number
          id: string
          leverage: number
          mode: string
          opened_at: string
          opened_by: string
          outcome: string | null
          pnl: number | null
          pnl_percent: number | null
          position_size: number
          reasoning: string | null
          signal_id: string | null
          status: string
          stop_loss: number
          take_profit_1: number
          take_profit_2: number | null
          timeframe: string
          updated_at: string
        }
        Insert: {
          asset: string
          asset_class?: string
          closed_at?: string | null
          confidence_percent?: number | null
          current_price?: number | null
          direction: string
          entry_price: number
          id?: string
          leverage?: number
          mode?: string
          opened_at?: string
          opened_by?: string
          outcome?: string | null
          pnl?: number | null
          pnl_percent?: number | null
          position_size?: number
          reasoning?: string | null
          signal_id?: string | null
          status?: string
          stop_loss: number
          take_profit_1: number
          take_profit_2?: number | null
          timeframe?: string
          updated_at?: string
        }
        Update: {
          asset?: string
          asset_class?: string
          closed_at?: string | null
          confidence_percent?: number | null
          current_price?: number | null
          direction?: string
          entry_price?: number
          id?: string
          leverage?: number
          mode?: string
          opened_at?: string
          opened_by?: string
          outcome?: string | null
          pnl?: number | null
          pnl_percent?: number | null
          position_size?: number
          reasoning?: string | null
          signal_id?: string | null
          status?: string
          stop_loss?: number
          take_profit_1?: number
          take_profit_2?: number | null
          timeframe?: string
          updated_at?: string
        }
        Relationships: []
      }
      signal_memory: {
        Row: {
          actual_result: string | null
          asset: string
          confidence_percent: number
          created_at: string
          id: string
          outcome: string | null
          prediction: string
          resolved_at: string | null
          signal_id: string
          user_feedback: string | null
        }
        Insert: {
          actual_result?: string | null
          asset: string
          confidence_percent: number
          created_at?: string
          id?: string
          outcome?: string | null
          prediction: string
          resolved_at?: string | null
          signal_id: string
          user_feedback?: string | null
        }
        Update: {
          actual_result?: string | null
          asset?: string
          confidence_percent?: number
          created_at?: string
          id?: string
          outcome?: string | null
          prediction?: string
          resolved_at?: string | null
          signal_id?: string
          user_feedback?: string | null
        }
        Relationships: []
      }
      signal_versions: {
        Row: {
          asset: string
          bias: string
          confidence_percent: number
          created_at: string
          id: string
          overall_score: number
          signal_id: string
          snapshot: Json
          version: number
        }
        Insert: {
          asset: string
          bias: string
          confidence_percent: number
          created_at?: string
          id?: string
          overall_score: number
          signal_id: string
          snapshot: Json
          version: number
        }
        Update: {
          asset?: string
          bias?: string
          confidence_percent?: number
          created_at?: string
          id?: string
          overall_score?: number
          signal_id?: string
          snapshot?: Json
          version?: number
        }
        Relationships: []
      }
      signals: {
        Row: {
          action: string
          actual_result: string | null
          asset: string
          bias: string
          confidence: string
          confidence_breakdown: Json | null
          confidence_percent: number
          confluence_summary: string | null
          correlation: Json | null
          created_at: string
          direction: string
          entry_precision: Json | null
          expires_at: string | null
          id: string
          lifecycle_state: string
          liquidity: Json | null
          live_price: number | null
          macro: Json | null
          micro: Json | null
          multi_timeframe_aligned: boolean | null
          outcome: string | null
          overall_score: number
          psychological: Json | null
          reasoning: string | null
          resolution_price: number | null
          resolved_at: string | null
          risk_level: string
          signal_id: string
          soul_voice: string | null
          temporal: Json | null
          time_window: Json | null
          trade_plans: Json | null
          version: number
        }
        Insert: {
          action: string
          actual_result?: string | null
          asset: string
          bias: string
          confidence: string
          confidence_breakdown?: Json | null
          confidence_percent: number
          confluence_summary?: string | null
          correlation?: Json | null
          created_at?: string
          direction: string
          entry_precision?: Json | null
          expires_at?: string | null
          id?: string
          lifecycle_state?: string
          liquidity?: Json | null
          live_price?: number | null
          macro?: Json | null
          micro?: Json | null
          multi_timeframe_aligned?: boolean | null
          outcome?: string | null
          overall_score: number
          psychological?: Json | null
          reasoning?: string | null
          resolution_price?: number | null
          resolved_at?: string | null
          risk_level: string
          signal_id: string
          soul_voice?: string | null
          temporal?: Json | null
          time_window?: Json | null
          trade_plans?: Json | null
          version?: number
        }
        Update: {
          action?: string
          actual_result?: string | null
          asset?: string
          bias?: string
          confidence?: string
          confidence_breakdown?: Json | null
          confidence_percent?: number
          confluence_summary?: string | null
          correlation?: Json | null
          created_at?: string
          direction?: string
          entry_precision?: Json | null
          expires_at?: string | null
          id?: string
          lifecycle_state?: string
          liquidity?: Json | null
          live_price?: number | null
          macro?: Json | null
          micro?: Json | null
          multi_timeframe_aligned?: boolean | null
          outcome?: string | null
          overall_score?: number
          psychological?: Json | null
          reasoning?: string | null
          resolution_price?: number | null
          resolved_at?: string | null
          risk_level?: string
          signal_id?: string
          soul_voice?: string | null
          temporal?: Json | null
          time_window?: Json | null
          trade_plans?: Json | null
          version?: number
        }
        Relationships: []
      }
      trade_journal: {
        Row: {
          asset: string
          confidence: string | null
          created_at: string
          direction: string
          entry_price: number
          exit_price: number | null
          id: string
          notes: string | null
          outcome: string | null
          pnl: number | null
          pnl_percent: number | null
          signal_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          asset: string
          confidence?: string | null
          created_at?: string
          direction: string
          entry_price: number
          exit_price?: number | null
          id?: string
          notes?: string | null
          outcome?: string | null
          pnl?: number | null
          pnl_percent?: number | null
          signal_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          asset?: string
          confidence?: string | null
          created_at?: string
          direction?: string
          entry_price?: number
          exit_price?: number | null
          id?: string
          notes?: string | null
          outcome?: string | null
          pnl?: number | null
          pnl_percent?: number | null
          signal_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tredbeing_signals: {
        Row: {
          asset: string
          bias: string
          confidence_percent: number
          created_at: string
          engine: string
          entry: number | null
          execution_status: string | null
          forecast_horizon: string | null
          historical_accuracy: number | null
          id: string
          ki_agreement: string | null
          konslang_statement: string | null
          liquidity: string | null
          market_structure: string | null
          momentum: string | null
          outputs: Json | null
          risk_reward: number | null
          sandbox_trade_id: string | null
          signal_id: string | null
          stop_loss: number | null
          take_profit: number | null
          timeframe: string
          trend: string | null
          updated_at: string
          volatility: string | null
        }
        Insert: {
          asset: string
          bias: string
          confidence_percent: number
          created_at?: string
          engine: string
          entry?: number | null
          execution_status?: string | null
          forecast_horizon?: string | null
          historical_accuracy?: number | null
          id?: string
          ki_agreement?: string | null
          konslang_statement?: string | null
          liquidity?: string | null
          market_structure?: string | null
          momentum?: string | null
          outputs?: Json | null
          risk_reward?: number | null
          sandbox_trade_id?: string | null
          signal_id?: string | null
          stop_loss?: number | null
          take_profit?: number | null
          timeframe: string
          trend?: string | null
          updated_at?: string
          volatility?: string | null
        }
        Update: {
          asset?: string
          bias?: string
          confidence_percent?: number
          created_at?: string
          engine?: string
          entry?: number | null
          execution_status?: string | null
          forecast_horizon?: string | null
          historical_accuracy?: number | null
          id?: string
          ki_agreement?: string | null
          konslang_statement?: string | null
          liquidity?: string | null
          market_structure?: string | null
          momentum?: string | null
          outputs?: Json | null
          risk_reward?: number | null
          sandbox_trade_id?: string | null
          signal_id?: string | null
          stop_loss?: number | null
          take_profit?: number | null
          timeframe?: string
          trend?: string | null
          updated_at?: string
          volatility?: string | null
        }
        Relationships: []
      }
      womb_layer: {
        Row: {
          asset: string | null
          created_at: string
          engine: string | null
          id: string
          layer: string
          payload: Json
          ref_id: string | null
          timeframe: string | null
        }
        Insert: {
          asset?: string | null
          created_at?: string
          engine?: string | null
          id?: string
          layer: string
          payload: Json
          ref_id?: string | null
          timeframe?: string | null
        }
        Update: {
          asset?: string | null
          created_at?: string
          engine?: string | null
          id?: string
          layer?: string
          payload?: Json
          ref_id?: string | null
          timeframe?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
