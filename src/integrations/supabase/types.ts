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
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          consultation_fee: number
          created_at: string
          doctor_image: string | null
          doctor_name: string
          doctor_specialty: string | null
          hospital_location: string | null
          hospital_name: string
          id: string
          payment_method: string
          payment_status: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          consultation_fee: number
          created_at?: string
          doctor_image?: string | null
          doctor_name: string
          doctor_specialty?: string | null
          hospital_location?: string | null
          hospital_name: string
          id?: string
          payment_method?: string
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          consultation_fee?: number
          created_at?: string
          doctor_image?: string | null
          doctor_name?: string
          doctor_specialty?: string | null
          hospital_location?: string | null
          hospital_name?: string
          id?: string
          payment_method?: string
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          hospital_id: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hospital_id: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hospital_id?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          available_days: string[] | null
          available_slots: string[] | null
          consultation_fee: number
          created_at: string
          department_id: string | null
          experience_years: number | null
          hospital_id: string
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          qualification: string | null
          rating: number | null
          reviews_count: number | null
          specialty: string
          updated_at: string
        }
        Insert: {
          available_days?: string[] | null
          available_slots?: string[] | null
          consultation_fee?: number
          created_at?: string
          department_id?: string | null
          experience_years?: number | null
          hospital_id: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          qualification?: string | null
          rating?: number | null
          reviews_count?: number | null
          specialty: string
          updated_at?: string
        }
        Update: {
          available_days?: string[] | null
          available_slots?: string[] | null
          consultation_fee?: number
          created_at?: string
          department_id?: string | null
          experience_years?: number | null
          hospital_id?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          qualification?: string | null
          rating?: number | null
          reviews_count?: number | null
          specialty?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_services: {
        Row: {
          created_at: string
          description: string | null
          hospital_id: string
          id: string
          is_active: boolean | null
          name: string
          price: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          hospital_id: string
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          hospital_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hospital_services_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          accreditations: string[] | null
          address: string
          beds_count: number | null
          city: string
          commission_percentage: number | null
          country: string
          created_at: string
          description: string | null
          email: string | null
          established_year: number | null
          facilities: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          opening_hours: string | null
          phone: string | null
          pincode: string | null
          rating: number | null
          reviews_count: number | null
          state: string
          updated_at: string
          website: string | null
        }
        Insert: {
          accreditations?: string[] | null
          address: string
          beds_count?: number | null
          city: string
          commission_percentage?: number | null
          country?: string
          created_at?: string
          description?: string | null
          email?: string | null
          established_year?: number | null
          facilities?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          opening_hours?: string | null
          phone?: string | null
          pincode?: string | null
          rating?: number | null
          reviews_count?: number | null
          state: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          accreditations?: string[] | null
          address?: string
          beds_count?: number | null
          city?: string
          commission_percentage?: number | null
          country?: string
          created_at?: string
          description?: string | null
          email?: string | null
          established_year?: number | null
          facilities?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          opening_hours?: string | null
          phone?: string | null
          pincode?: string | null
          rating?: number | null
          reviews_count?: number | null
          state?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      membership_plans: {
        Row: {
          created_at: string
          description: string | null
          discount_percentage: number
          features: string[]
          id: string
          is_active: boolean
          is_popular: boolean
          modules: string[]
          name: string
          price_monthly: number
          price_yearly: number
          updated_at: string
          validity_days: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_percentage?: number
          features?: string[]
          id?: string
          is_active?: boolean
          is_popular?: boolean
          modules?: string[]
          name: string
          price_monthly: number
          price_yearly: number
          updated_at?: string
          validity_days?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_percentage?: number
          features?: string[]
          id?: string
          is_active?: boolean
          is_popular?: boolean
          modules?: string[]
          name?: string
          price_monthly?: number
          price_yearly?: number
          updated_at?: string
          validity_days?: number
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_popular: boolean | null
          is_veg: boolean | null
          name: string
          price: number
          restaurant_id: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_popular?: boolean | null
          is_veg?: boolean | null
          name: string
          price?: number
          restaurant_id: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_popular?: boolean | null
          is_veg?: boolean | null
          name?: string
          price?: number
          restaurant_id?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_name: string
          item_price: number
          menu_item_id: string
          notes: string | null
          order_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          item_price: number
          menu_item_id: string
          notes?: string | null
          order_id: string
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          item_price?: number
          menu_item_id?: string
          notes?: string | null
          order_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_name: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          restaurant_id: string
          status: string
          table_id: string
          table_number: number
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          restaurant_id: string
          status?: string
          table_id: string
          table_number: number
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          restaurant_id?: string
          status?: string
          table_id?: string
          table_number?: number
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payment_method: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referee_id: string
          referee_reward: number
          referrer_id: string
          referrer_reward: number
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referee_id: string
          referee_reward?: number
          referrer_id: string
          referrer_reward?: number
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referee_id?: string
          referee_reward?: number
          referrer_id?: string
          referrer_reward?: number
          status?: string
        }
        Relationships: []
      }
      restaurant_tables: {
        Row: {
          capacity: number | null
          created_at: string
          id: string
          is_active: boolean | null
          qr_code: string | null
          restaurant_id: string
          status: string
          table_number: number
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          qr_code?: string | null
          restaurant_id: string
          status?: string
          table_number: number
        }
        Update: {
          capacity?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          qr_code?: string | null
          restaurant_id?: string
          status?: string
          table_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          closing_time: string | null
          created_at: string
          cuisine_type: string | null
          description: string | null
          hotel_id: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          opening_time: string | null
          updated_at: string
        }
        Insert: {
          closing_time?: string | null
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          hotel_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          opening_time?: string | null
          updated_at?: string
        }
        Update: {
          closing_time?: string | null
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          hotel_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          opening_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string
          discount_percentage: number | null
          end_date: string
          id: string
          plan_name: string
          plan_price: number
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          discount_percentage?: number | null
          end_date: string
          id?: string
          plan_name: string
          plan_price: number
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          discount_percentage?: number | null
          end_date?: string
          id?: string
          plan_name?: string
          plan_price?: number
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      table_bookings: {
        Row: {
          booking_date: string
          booking_time: string
          created_at: string
          customer_name: string
          customer_phone: string | null
          guest_count: number | null
          id: string
          notes: string | null
          restaurant_id: string
          status: string
          table_id: string
          user_id: string | null
        }
        Insert: {
          booking_date: string
          booking_time: string
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          restaurant_id: string
          status?: string
          table_id: string
          user_id?: string | null
        }
        Update: {
          booking_date?: string
          booking_time?: string
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          restaurant_id?: string
          status?: string
          table_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "table_bookings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_bookings_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      two_factor_auth: {
        Row: {
          created_at: string | null
          id: string
          is_enabled: boolean | null
          otp_code: string | null
          otp_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          otp_code?: string | null
          otp_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          otp_code?: string | null
          otp_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: string
          type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          referral_coins: number
          total_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          referral_coins?: number
          total_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          referral_coins?: number
          total_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          account_holder_name: string
          account_number: string
          admin_notes: string | null
          amount: number
          bank_name: string
          created_at: string
          id: string
          ifsc_code: string
          processed_at: string | null
          status: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          account_holder_name: string
          account_number: string
          admin_notes?: string | null
          amount: number
          bank_name: string
          created_at?: string
          id?: string
          ifsc_code: string
          processed_at?: string | null
          status?: string
          user_id: string
          wallet_id: string
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          admin_notes?: string | null
          amount?: number
          bank_name?: string
          created_at?: string
          id?: string
          ifsc_code?: string
          processed_at?: string | null
          status?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "agent" | "user" | "super_admin" | "supervisor"
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
    Enums: {
      app_role: ["admin", "agent", "user", "super_admin", "supervisor"],
    },
  },
} as const
