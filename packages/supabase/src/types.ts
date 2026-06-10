export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'partner' | 'preacher' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'partner' | 'preacher' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'partner' | 'preacher' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      preachers: {
        Row: {
          id: string
          slug: string
          display_name: string
          bio: string | null
          church: string | null
          city: string | null
          photo_url: string | null
          instagram: string | null
          whatsapp: string | null
          pix_key: string | null
          status: 'pending' | 'active' | 'disabled'
          auto_publish: boolean
          created_at: string
        }
        Insert: {
          id: string
          slug: string
          display_name: string
          bio?: string | null
          church?: string | null
          city?: string | null
          photo_url?: string | null
          instagram?: string | null
          whatsapp?: string | null
          pix_key?: string | null
          status?: 'pending' | 'active' | 'disabled'
          auto_publish?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          display_name?: string
          bio?: string | null
          church?: string | null
          city?: string | null
          photo_url?: string | null
          instagram?: string | null
          whatsapp?: string | null
          pix_key?: string | null
          status?: 'pending' | 'active' | 'disabled'
          auto_publish?: boolean
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string | null
          type: 'theme' | 'occasion' | 'book'
          sort_order: number
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          color?: string | null
          type?: 'theme' | 'occasion' | 'book'
          sort_order?: number
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          type?: 'theme' | 'occasion' | 'book'
          sort_order?: number
          active?: boolean
          created_at?: string
        }
      }
      studies: {
        Row: {
          id: string
          preacher_id: string | null
          category_id: string | null
          title: string
          slug: string
          body: string | null
          youtube_url: string | null
          cover_url: string | null
          content_type: string | null
          read_time_min: number | null
          view_count: number
          status: 'draft' | 'pending' | 'published' | 'rejected'
          is_featured: boolean
          featured_until: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          preacher_id?: string | null
          category_id?: string | null
          title: string
          slug: string
          body?: string | null
          youtube_url?: string | null
          cover_url?: string | null
          content_type?: string | null
          read_time_min?: number | null
          view_count?: number
          status?: 'draft' | 'pending' | 'published' | 'rejected'
          is_featured?: boolean
          featured_until?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          preacher_id?: string | null
          category_id?: string | null
          title?: string
          slug?: string
          body?: string | null
          youtube_url?: string | null
          cover_url?: string | null
          content_type?: string | null
          read_time_min?: number | null
          view_count?: number
          status?: 'draft' | 'pending' | 'published' | 'rejected'
          is_featured?: boolean
          featured_until?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      daily_devotionals: {
        Row: {
          id: string
          study_id: string | null
          title: string
          verse: string
          verse_reference: string
          reflection: string
          prayer: string | null
          scheduled_date: string
          published: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          study_id?: string | null
          title: string
          verse: string
          verse_reference: string
          reflection: string
          prayer?: string | null
          scheduled_date: string
          published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          study_id?: string | null
          title?: string
          verse?: string
          verse_reference?: string
          reflection?: string
          prayer?: string | null
          scheduled_date?: string
          published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          study_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          study_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          study_id?: string
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: 'active' | 'canceled' | 'past_due' | 'trialing'
          plan: 'monthly' | 'yearly'
          price_brl: number
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          payment_provider: string | null
          payment_provider_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          plan: 'monthly' | 'yearly'
          price_brl: number
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          payment_provider?: string | null
          payment_provider_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          plan?: 'monthly' | 'yearly'
          price_brl?: number
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          payment_provider?: string | null
          payment_provider_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ad_campaigns: {
        Row: {
          id: string
          title: string
          advertiser: string
          image_url: string | null
          destination_url: string
          placement: 'banner' | 'interstitial' | 'native'
          active: boolean
          starts_at: string | null
          ends_at: string | null
          budget_impressions: number | null
          total_impressions: number
          total_clicks: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          advertiser: string
          image_url?: string | null
          destination_url: string
          placement?: 'banner' | 'interstitial' | 'native'
          active?: boolean
          starts_at?: string | null
          ends_at?: string | null
          budget_impressions?: number | null
          total_impressions?: number
          total_clicks?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          advertiser?: string
          image_url?: string | null
          destination_url?: string
          placement?: 'banner' | 'interstitial' | 'native'
          active?: boolean
          starts_at?: string | null
          ends_at?: string | null
          budget_impressions?: number | null
          total_impressions?: number
          total_clicks?: number
          created_at?: string
          updated_at?: string
        }
      }
      ad_impressions: {
        Row: {
          id: string
          campaign_id: string
          user_id: string | null
          device_id: string | null
          recorded_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          user_id?: string | null
          device_id?: string | null
          recorded_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          user_id?: string | null
          device_id?: string | null
          recorded_at?: string
        }
      }
      ad_clicks: {
        Row: {
          id: string
          campaign_id: string
          user_id: string | null
          device_id: string | null
          recorded_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          user_id?: string | null
          device_id?: string | null
          recorded_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          user_id?: string | null
          device_id?: string | null
          recorded_at?: string
        }
      }
      whatsapp_subscribers: {
        Row: {
          id: string
          phone: string
          name: string | null
          subscribed: boolean
          opted_in_at: string
          opted_out_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          phone: string
          name?: string | null
          subscribed?: boolean
          opted_in_at?: string
          opted_out_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          phone?: string
          name?: string | null
          subscribed?: boolean
          opted_in_at?: string
          opted_out_at?: string | null
          created_at?: string
        }
      }
      whatsapp_sends_log: {
        Row: {
          id: string
          devotional_id: string | null
          message_text: string
          total_recipients: number
          sent_count: number
          failed_count: number
          status: 'pending' | 'sending' | 'completed' | 'failed'
          triggered_by: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          devotional_id?: string | null
          message_text: string
          total_recipients?: number
          sent_count?: number
          failed_count?: number
          status?: 'pending' | 'sending' | 'completed' | 'failed'
          triggered_by?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          devotional_id?: string | null
          message_text?: string
          total_recipients?: number
          sent_count?: number
          failed_count?: number
          status?: 'pending' | 'sending' | 'completed' | 'failed'
          triggered_by?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          event_name: string
          properties: Json | null
          platform: 'android' | 'ios' | 'web' | null
          app_version: string | null
          recorded_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          event_name: string
          properties?: Json | null
          platform?: 'android' | 'ios' | 'web' | null
          app_version?: string | null
          recorded_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          event_name?: string
          properties?: Json | null
          platform?: 'android' | 'ios' | 'web' | null
          app_version?: string | null
          recorded_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_study_view: {
        Args: { p_study_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
