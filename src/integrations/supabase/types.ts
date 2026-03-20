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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      deposit_requests: {
        Row: {
          amount: number
          created_at: string
          id: string
          screenshot_url: string | null
          status: string
          updated_at: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          screenshot_url?: string | null
          status?: string
          updated_at?: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          screenshot_url?: string | null
          status?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          name: string
          rank_position: number
          updated_at: string | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          id?: string
          name: string
          rank_position?: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          name?: string
          rank_position?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          match_key: string
          start_time: string
          status: string
          team_a_id: string
          team_a_name: string
          team_a_short: string
          team_b_id: string
          team_b_name: string
          team_b_short: string
          winner_team_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_key: string
          start_time?: string
          status?: string
          team_a_id: string
          team_a_name: string
          team_a_short: string
          team_b_id: string
          team_b_name: string
          team_b_short: string
          winner_team_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          match_key?: string
          start_time?: string
          status?: string
          team_a_id?: string
          team_a_name?: string
          team_a_short?: string
          team_b_id?: string
          team_b_name?: string
          team_b_short?: string
          winner_team_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          commission: number | null
          created_at: string
          id: string
          match_id: string
          matched_at: string | null
          matched_with: string | null
          opponent_name: string
          payout: number | null
          status: string
          team_id: string
          team_name: string
          user_id: string
        }
        Insert: {
          amount: number
          commission?: number | null
          created_at?: string
          id?: string
          match_id: string
          matched_at?: string | null
          matched_with?: string | null
          opponent_name: string
          payout?: number | null
          status?: string
          team_id: string
          team_name: string
          user_id: string
        }
        Update: {
          amount?: number
          commission?: number | null
          created_at?: string
          id?: string
          match_id?: string
          matched_at?: string | null
          matched_with?: string | null
          opponent_name?: string
          payout?: number | null
          status?: string
          team_id?: string
          team_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_matched_with_fkey"
            columns: ["matched_with"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
          username: string
          wallet: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          username?: string
          wallet?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          username?: string
          wallet?: number
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          label: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          label?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          label?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      withdraw_requests: {
        Row: {
          account_holder_name: string | null
          account_number: string | null
          amount: number
          bank_name: string | null
          created_at: string
          id: string
          ifsc_code: string | null
          method: string
          status: string
          updated_at: string
          upi_id: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          account_holder_name?: string | null
          account_number?: string | null
          amount: number
          bank_name?: string | null
          created_at?: string
          id?: string
          ifsc_code?: string | null
          method?: string
          status?: string
          updated_at?: string
          upi_id?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          account_holder_name?: string | null
          account_number?: string | null
          amount?: number
          bank_name?: string | null
          created_at?: string
          id?: string
          ifsc_code?: string | null
          method?: string
          status?: string
          updated_at?: string
          upi_id?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      place_order: {
        Args: {
          p_amount: number
          p_match_id: string
          p_opponent_name: string
          p_team_id: string
          p_team_name: string
        }
        Returns: Json
      }
      settle_match: {
        Args: { p_match_id: string; p_winner_team_id: string }
        Returns: Json
      }
      wallet_deposit: { Args: { p_amount: number }; Returns: Json }
      wallet_withdraw: { Args: { p_amount: number }; Returns: Json }
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
