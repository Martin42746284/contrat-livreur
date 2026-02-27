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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      contracts: {
        Row: {
          created_at: string
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery_audit_log: {
        Row: {
          action: string
          contract_id: string
          created_at: string
          details: string | null
          id: string
        }
        Insert: {
          action: string
          contract_id: string
          created_at?: string
          details?: string | null
          id?: string
        }
        Update: {
          action?: string
          contract_id?: string
          created_at?: string
          details?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_audit_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "delivery_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_blacklist: {
        Row: {
          admin_cleared: boolean
          contract_id: string | null
          created_at: string
          id: string
          livreur_cin: string
          livreur_nom: string
          reason: string
        }
        Insert: {
          admin_cleared?: boolean
          contract_id?: string | null
          created_at?: string
          id?: string
          livreur_cin: string
          livreur_nom: string
          reason: string
        }
        Update: {
          admin_cleared?: boolean
          contract_id?: string | null
          created_at?: string
          id?: string
          livreur_cin?: string
          livreur_nom?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_blacklist_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "delivery_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_contracts: {
        Row: {
          contract_number: string
          created_at: string
          date_contrat: string
          id: string
          lieu: string
          livreur_adresse: string
          livreur_cin: string
          livreur_cin_recto: string | null
          livreur_cin_recto_status: string
          livreur_cin_verso: string | null
          livreur_cin_verso_status: string
          livreur_nom_complet: string
          livreur_telephone: string
          motif_resiliation: string | null
          partie_adresse: string
          partie_cin: string
          partie_cin_recto: string | null
          partie_cin_recto_status: string
          partie_cin_verso: string | null
          partie_cin_verso_status: string
          partie_nom_complet: string
          partie_telephone: string
          status: string
          terminated_at: string | null
          type_partie: string
          updated_at: string
          validated_at: string | null
          validation_livreur: boolean
          validation_partie: boolean
        }
        Insert: {
          contract_number?: string
          created_at?: string
          date_contrat?: string
          id?: string
          lieu?: string
          livreur_adresse?: string
          livreur_cin?: string
          livreur_cin_recto?: string | null
          livreur_cin_recto_status?: string
          livreur_cin_verso?: string | null
          livreur_cin_verso_status?: string
          livreur_nom_complet?: string
          livreur_telephone?: string
          motif_resiliation?: string | null
          partie_adresse?: string
          partie_cin?: string
          partie_cin_recto?: string | null
          partie_cin_recto_status?: string
          partie_cin_verso?: string | null
          partie_cin_verso_status?: string
          partie_nom_complet?: string
          partie_telephone?: string
          status?: string
          terminated_at?: string | null
          type_partie: string
          updated_at?: string
          validated_at?: string | null
          validation_livreur?: boolean
          validation_partie?: boolean
        }
        Update: {
          contract_number?: string
          created_at?: string
          date_contrat?: string
          id?: string
          lieu?: string
          livreur_adresse?: string
          livreur_cin?: string
          livreur_cin_recto?: string | null
          livreur_cin_recto_status?: string
          livreur_cin_verso?: string | null
          livreur_cin_verso_status?: string
          livreur_nom_complet?: string
          livreur_telephone?: string
          motif_resiliation?: string | null
          partie_adresse?: string
          partie_cin?: string
          partie_cin_recto?: string | null
          partie_cin_recto_status?: string
          partie_cin_verso?: string | null
          partie_cin_verso_status?: string
          partie_nom_complet?: string
          partie_telephone?: string
          status?: string
          terminated_at?: string | null
          type_partie?: string
          updated_at?: string
          validated_at?: string | null
          validation_livreur?: boolean
          validation_partie?: boolean
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
