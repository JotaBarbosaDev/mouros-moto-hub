export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          district: string
          id: string
          member_id: string
          number: string
          postal_code: string
          street: string
          updated_at: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          district: string
          id?: string
          member_id: string
          number: string
          postal_code: string
          street: string
          updated_at?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          district?: string
          id?: string
          member_id?: string
          number?: string
          postal_code?: string
          street?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      administration: {
        Row: {
          created_at: string
          id: string
          member_id: string
          role: Database["public"]["Enums"]["admin_role"]
          status: Database["public"]["Enums"]["admin_status"]
          term: string
          term_end: string
          term_start: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_id: string
          role: Database["public"]["Enums"]["admin_role"]
          status?: Database["public"]["Enums"]["admin_status"]
          term: string
          term_end: string
          term_start: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          status?: Database["public"]["Enums"]["admin_status"]
          term?: string
          term_end?: string
          term_start?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "administration_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      bar_products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          inventory_id: string | null
          min_stock: number
          name: string
          price: number
          stock: number
          unit_of_measure: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          inventory_id?: string | null
          min_stock?: number
          name: string
          price: number
          stock?: number
          unit_of_measure: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          inventory_id?: string | null
          min_stock?: number
          name?: string
          price?: number
          stock?: number
          unit_of_measure?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bar_products_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      bar_sale_items: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          price: number
          product_id: string
          product_name: string
          quantity: number
          sale_id: string
          total: number
          unit_of_measure: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          price: number
          product_id: string
          product_name: string
          quantity: number
          sale_id: string
          total: number
          unit_of_measure: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          price?: number
          product_id?: string
          product_name?: string
          quantity?: number
          sale_id?: string
          total?: number
          unit_of_measure?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bar_sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "bar_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bar_sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "bar_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      bar_sales: {
        Row: {
          amount_paid: number
          change: number
          created_at: string
          id: string
          seller_id: string
          seller_name: string
          timestamp: string
          total: number
          updated_at: string
        }
        Insert: {
          amount_paid: number
          change: number
          created_at?: string
          id?: string
          seller_id: string
          seller_name: string
          timestamp?: string
          total: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          change?: number
          created_at?: string
          id?: string
          seller_id?: string
          seller_name?: string
          timestamp?: string
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      bar_schedules: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      bar_shifts: {
        Row: {
          created_at: string
          end_time: string
          id: string
          member_id: string
          notes: string | null
          schedule_id: string | null
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          member_id: string
          notes?: string | null
          schedule_id?: string | null
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          member_id?: string
          notes?: string | null
          schedule_id?: string | null
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bar_shifts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bar_shifts_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "bar_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      dues_payments: {
        Row: {
          created_at: string
          exempt: boolean
          id: string
          member_id: string
          paid: boolean
          payment_date: string | null
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          exempt?: boolean
          id?: string
          member_id: string
          paid?: boolean
          payment_date?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          exempt?: boolean
          id?: string
          member_id?: string
          paid?: boolean
          payment_date?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "dues_payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          created_at: string
          event_id: string
          external_email: string | null
          external_name: string | null
          external_phone: string | null
          id: string
          member_id: string | null
          notes: string | null
          registration_date: string
          status: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          external_email?: string | null
          external_name?: string | null
          external_phone?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          registration_date?: string
          status?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          external_email?: string | null
          external_name?: string | null
          external_phone?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          registration_date?: string
          status?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_schedule: {
        Row: {
          created_at: string
          description: string | null
          end_time: string | null
          event_id: string
          id: string
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_id: string
          id?: string
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_id?: string
          id?: string
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_schedule_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_stops: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          location: string
          name: string
          order_index: number
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          location: string
          name: string
          order_index: number
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          location?: string
          name?: string
          order_index?: number
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_stops_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string
          end_date: string
          id: string
          location: string
          maximum_participants: number | null
          members_only: boolean
          minimum_participants: number | null
          poster_url: string | null
          published: boolean
          registration_open: boolean
          start_date: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          end_date: string
          id?: string
          location: string
          maximum_participants?: number | null
          members_only?: boolean
          minimum_participants?: number | null
          poster_url?: string | null
          published?: boolean
          registration_open?: boolean
          start_date: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          location?: string
          maximum_participants?: number | null
          members_only?: boolean
          minimum_participants?: number | null
          poster_url?: string | null
          published?: boolean
          registration_open?: boolean
          start_date?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          created_at: string
          id: string
          name: string
          quantity: number
          unit_of_measure: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          quantity?: number
          unit_of_measure: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          quantity?: number
          unit_of_measure?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_log: {
        Row: {
          change_reason: string | null
          created_at: string
          id: string
          inventory_id: string | null
          new_quantity: number
          previous_quantity: number
          user_id: string | null
        }
        Insert: {
          change_reason?: string | null
          created_at?: string
          id?: string
          inventory_id?: string | null
          new_quantity: number
          previous_quantity: number
          user_id?: string | null
        }
        Update: {
          change_reason?: string | null
          created_at?: string
          id?: string
          inventory_id?: string | null
          new_quantity?: number
          previous_quantity?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_log_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          blood_type: Database["public"]["Enums"]["blood_type"] | null
          created_at: string
          email: string
          honorary_member: boolean
          id: string
          in_whatsapp_group: boolean
          is_active: boolean
          is_admin: boolean
          join_date: string
          legacy_member: boolean
          member_number: string
          member_type: Database["public"]["Enums"]["member_type"]
          name: string
          nickname: string | null
          phone_alternative: string | null
          phone_main: string
          photo_url: string | null
          received_member_kit: boolean
          registration_fee_exempt: boolean
          registration_fee_paid: boolean
          updated_at: string
        }
        Insert: {
          blood_type?: Database["public"]["Enums"]["blood_type"] | null
          created_at?: string
          email: string
          honorary_member?: boolean
          id?: string
          in_whatsapp_group?: boolean
          is_active?: boolean
          is_admin?: boolean
          join_date: string
          legacy_member?: boolean
          member_number: string
          member_type: Database["public"]["Enums"]["member_type"]
          name: string
          nickname?: string | null
          phone_alternative?: string | null
          phone_main: string
          photo_url?: string | null
          received_member_kit?: boolean
          registration_fee_exempt?: boolean
          registration_fee_paid?: boolean
          updated_at?: string
        }
        Update: {
          blood_type?: Database["public"]["Enums"]["blood_type"] | null
          created_at?: string
          email?: string
          honorary_member?: boolean
          id?: string
          in_whatsapp_group?: boolean
          is_active?: boolean
          is_admin?: boolean
          join_date?: string
          legacy_member?: boolean
          member_number?: string
          member_type?: Database["public"]["Enums"]["member_type"]
          name?: string
          nickname?: string | null
          phone_alternative?: string | null
          phone_main?: string
          photo_url?: string | null
          received_member_kit?: boolean
          registration_fee_exempt?: boolean
          registration_fee_paid?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      store_products: {
        Row: {
          color: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          members_only: boolean
          name: string
          price: number
          published_on_landing_page: boolean
          size: Database["public"]["Enums"]["product_size"] | null
          stock: number
          type: Database["public"]["Enums"]["product_type"]
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          members_only?: boolean
          name: string
          price: number
          published_on_landing_page?: boolean
          size?: Database["public"]["Enums"]["product_size"] | null
          stock?: number
          type: Database["public"]["Enums"]["product_type"]
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          members_only?: boolean
          name?: string
          price?: number
          published_on_landing_page?: boolean
          size?: Database["public"]["Enums"]["product_size"] | null
          stock?: number
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string
          created_at: string
          displacement: number
          id: string
          member_id: string
          model: string
          nickname: string | null
          photo_url: string | null
          type: Database["public"]["Enums"]["vehicle_type"]
          updated_at: string
        }
        Insert: {
          brand: string
          created_at?: string
          displacement: number
          id?: string
          member_id: string
          model: string
          nickname?: string | null
          photo_url?: string | null
          type: Database["public"]["Enums"]["vehicle_type"]
          updated_at?: string
        }
        Update: {
          brand?: string
          created_at?: string
          displacement?: number
          id?: string
          member_id?: string
          model?: string
          nickname?: string | null
          photo_url?: string | null
          type?: Database["public"]["Enums"]["vehicle_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      admin_role:
        | "Presidente"
        | "Vice-Presidente"
        | "Tesoureiro"
        | "Secretária"
        | "Dir. Eventos"
        | "Dir. Marketing"
        | "Dir. Patrimônio"
      admin_status: "Ativo" | "Inativo" | "Licença"
      blood_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
      member_type:
        | "Sócio Adulto"
        | "Sócio Criança"
        | "Administração"
        | "Convidado"
      product_size: "S" | "M" | "L" | "XL" | "XXL" | "Único"
      product_type:
        | "T-Shirt"
        | "Caneca"
        | "Boné"
        | "Pin"
        | "Patch"
        | "Adesivo"
        | "Outro"
      user_role: "admin" | "member" | "pending"
      vehicle_type: "Mota" | "Moto-quatro" | "Buggy"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: [
        "Presidente",
        "Vice-Presidente",
        "Tesoureiro",
        "Secretária",
        "Dir. Eventos",
        "Dir. Marketing",
        "Dir. Patrimônio",
      ],
      admin_status: ["Ativo", "Inativo", "Licença"],
      blood_type: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      member_type: [
        "Sócio Adulto",
        "Sócio Criança",
        "Administração",
        "Convidado",
      ],
      product_size: ["S", "M", "L", "XL", "XXL", "Único"],
      product_type: [
        "T-Shirt",
        "Caneca",
        "Boné",
        "Pin",
        "Patch",
        "Adesivo",
        "Outro",
      ],
      user_role: ["admin", "member", "pending"],
      vehicle_type: ["Mota", "Moto-quatro", "Buggy"],
    },
  },
} as const
