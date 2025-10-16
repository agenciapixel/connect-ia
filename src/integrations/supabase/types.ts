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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agent_conversations: {
        Row: {
          agent_id: string | null
          assigned_to_human: string | null
          contact_id: string | null
          created_at: string | null
          id: string
          status: string
          transferred_at: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          assigned_to_human?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          status?: string
          transferred_at?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          assigned_to_human?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          status?: string
          transferred_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          max_tokens: number | null
          model: string
          name: string
          status: Database["public"]["Enums"]["agent_status"]
          system_prompt: string
          temperature: number | null
          type: Database["public"]["Enums"]["agent_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          max_tokens?: number | null
          model?: string
          name: string
          status?: Database["public"]["Enums"]["agent_status"]
          system_prompt: string
          temperature?: number | null
          type: Database["public"]["Enums"]["agent_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          max_tokens?: number | null
          model?: string
          name?: string
          status?: Database["public"]["Enums"]["agent_status"]
          system_prompt?: string
          temperature?: number | null
          type?: Database["public"]["Enums"]["agent_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      attendant_availability: {
        Row: {
          attendant_id: string | null
          auto_accept: boolean | null
          created_at: string | null
          date: string
          end_time: string
          id: string
          is_available: boolean | null
          max_concurrent: number | null
          org_id: string | null
          reason: string | null
          start_time: string
        }
        Insert: {
          attendant_id?: string | null
          auto_accept?: boolean | null
          created_at?: string | null
          date: string
          end_time: string
          id?: string
          is_available?: boolean | null
          max_concurrent?: number | null
          org_id?: string | null
          reason?: string | null
          start_time: string
        }
        Update: {
          attendant_id?: string | null
          auto_accept?: boolean | null
          created_at?: string | null
          date?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          max_concurrent?: number | null
          org_id?: string | null
          reason?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendant_availability_attendant_id_fkey"
            columns: ["attendant_id"]
            isOneToOne: false
            referencedRelation: "attendants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendant_availability_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      attendant_metrics: {
        Row: {
          abandoned_chats: number | null
          attendant_id: string | null
          avg_resolution_time: number | null
          avg_response_time: number | null
          created_at: string | null
          first_contact_resolution: number | null
          id: string
          messages_sent: number | null
          org_id: string | null
          period_end: string
          period_start: string
          period_type: Database["public"]["Enums"]["metric_period"] | null
          resolved_chats: number | null
          satisfaction_avg: number | null
          satisfaction_count: number | null
          total_chats: number | null
          total_work_time: number | null
          transferred_chats: number | null
        }
        Insert: {
          abandoned_chats?: number | null
          attendant_id?: string | null
          avg_resolution_time?: number | null
          avg_response_time?: number | null
          created_at?: string | null
          first_contact_resolution?: number | null
          id?: string
          messages_sent?: number | null
          org_id?: string | null
          period_end: string
          period_start: string
          period_type?: Database["public"]["Enums"]["metric_period"] | null
          resolved_chats?: number | null
          satisfaction_avg?: number | null
          satisfaction_count?: number | null
          total_chats?: number | null
          total_work_time?: number | null
          transferred_chats?: number | null
        }
        Update: {
          abandoned_chats?: number | null
          attendant_id?: string | null
          avg_resolution_time?: number | null
          avg_response_time?: number | null
          created_at?: string | null
          first_contact_resolution?: number | null
          id?: string
          messages_sent?: number | null
          org_id?: string | null
          period_end?: string
          period_start?: string
          period_type?: Database["public"]["Enums"]["metric_period"] | null
          resolved_chats?: number | null
          satisfaction_avg?: number | null
          satisfaction_count?: number | null
          total_chats?: number | null
          total_work_time?: number | null
          transferred_chats?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendant_metrics_attendant_id_fkey"
            columns: ["attendant_id"]
            isOneToOne: false
            referencedRelation: "attendants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendant_metrics_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      attendant_notes: {
        Row: {
          attendant_id: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          org_id: string | null
          title: string
          type: Database["public"]["Enums"]["note_type"] | null
          updated_at: string | null
        }
        Insert: {
          attendant_id?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          org_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["note_type"] | null
          updated_at?: string | null
        }
        Update: {
          attendant_id?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          org_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["note_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendant_notes_attendant_id_fkey"
            columns: ["attendant_id"]
            isOneToOne: false
            referencedRelation: "attendants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendant_notes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      attendant_sessions: {
        Row: {
          attendant_id: string | null
          avg_response_time: number | null
          chats_handled: number | null
          created_at: string | null
          ended_at: string | null
          id: string
          messages_sent: number | null
          notes: string | null
          org_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["session_status"] | null
        }
        Insert: {
          attendant_id?: string | null
          avg_response_time?: number | null
          chats_handled?: number | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          messages_sent?: number | null
          notes?: string | null
          org_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
        }
        Update: {
          attendant_id?: string | null
          avg_response_time?: number | null
          chats_handled?: number | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          messages_sent?: number | null
          notes?: string | null
          org_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "attendant_sessions_attendant_id_fkey"
            columns: ["attendant_id"]
            isOneToOne: false
            referencedRelation: "attendants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendant_sessions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      attendant_templates: {
        Row: {
          attendant_id: string | null
          category: string | null
          content: string
          created_at: string | null
          id: string
          is_public: boolean | null
          name: string
          org_id: string | null
          tags: string[] | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          attendant_id?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          org_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          attendant_id?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          org_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendant_templates_attendant_id_fkey"
            columns: ["attendant_id"]
            isOneToOne: false
            referencedRelation: "attendants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendant_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      attendants: {
        Row: {
          auto_accept: boolean | null
          avatar_url: string | null
          avg_response_time: number | null
          created_at: string | null
          created_by: string | null
          department: string | null
          email: string
          employee_id: string | null
          full_name: string
          id: string
          languages: string[] | null
          last_activity_at: string | null
          max_concurrent_chats: number | null
          notifications: Json | null
          org_id: string | null
          phone: string | null
          position: string | null
          satisfaction_score: number | null
          skills: string[] | null
          specializations: string[] | null
          status: Database["public"]["Enums"]["attendants_status"] | null
          total_chats: number | null
          updated_at: string | null
          user_id: string | null
          working_hours: Json | null
        }
        Insert: {
          auto_accept?: boolean | null
          avatar_url?: string | null
          avg_response_time?: number | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          email: string
          employee_id?: string | null
          full_name: string
          id?: string
          languages?: string[] | null
          last_activity_at?: string | null
          max_concurrent_chats?: number | null
          notifications?: Json | null
          org_id?: string | null
          phone?: string | null
          position?: string | null
          satisfaction_score?: number | null
          skills?: string[] | null
          specializations?: string[] | null
          status?: Database["public"]["Enums"]["attendants_status"] | null
          total_chats?: number | null
          updated_at?: string | null
          user_id?: string | null
          working_hours?: Json | null
        }
        Update: {
          auto_accept?: boolean | null
          avatar_url?: string | null
          avg_response_time?: number | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          email?: string
          employee_id?: string | null
          full_name?: string
          id?: string
          languages?: string[] | null
          last_activity_at?: string | null
          max_concurrent_chats?: number | null
          notifications?: Json | null
          org_id?: string | null
          phone?: string | null
          position?: string | null
          satisfaction_score?: number | null
          skills?: string[] | null
          specializations?: string[] | null
          status?: Database["public"]["Enums"]["attendants_status"] | null
          total_chats?: number | null
          updated_at?: string | null
          user_id?: string | null
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "attendants_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_messages: {
        Row: {
          attempt_count: number | null
          campaign_id: string
          contact_id: string
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          attempt_count?: number | null
          campaign_id: string
          contact_id: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          attempt_count?: number | null
          campaign_id?: string
          contact_id?: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          audience_query: Json | null
          channel_type: Database["public"]["Enums"]["channel_type"]
          created_at: string | null
          id: string
          name: string
          org_id: string
          schedule_at: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          audience_query?: Json | null
          channel_type: Database["public"]["Enums"]["channel_type"]
          created_at?: string | null
          id?: string
          name: string
          org_id: string
          schedule_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          audience_query?: Json | null
          channel_type?: Database["public"]["Enums"]["channel_type"]
          created_at?: string | null
          id?: string
          name?: string
          org_id?: string
          schedule_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_accounts: {
        Row: {
          channel_type: Database["public"]["Enums"]["channel_type"]
          created_at: string | null
          credentials_json: Json | null
          id: string
          name: string
          org_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          channel_type: Database["public"]["Enums"]["channel_type"]
          created_at?: string | null
          credentials_json?: Json | null
          id?: string
          name: string
          org_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          channel_type?: Database["public"]["Enums"]["channel_type"]
          created_at?: string | null
          credentials_json?: Json | null
          id?: string
          name?: string
          org_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_accounts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          channel_type: Database["public"]["Enums"]["channel_type"]
          contact_id: string
          id: string
          org_id: string
          source: string | null
          status: Database["public"]["Enums"]["consent_status"]
          timestamp: string | null
        }
        Insert: {
          channel_type: Database["public"]["Enums"]["channel_type"]
          contact_id: string
          id?: string
          org_id: string
          source?: string | null
          status?: Database["public"]["Enums"]["consent_status"]
          timestamp?: string | null
        }
        Update: {
          channel_type?: Database["public"]["Enums"]["channel_type"]
          contact_id?: string
          id?: string
          org_id?: string
          source?: string | null
          status?: Database["public"]["Enums"]["consent_status"]
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string | null
          email: string | null
          external_id: string | null
          full_name: string | null
          id: string
          metadata: Json | null
          org_id: string
          phone_e164: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          external_id?: string | null
          full_name?: string | null
          id?: string
          metadata?: Json | null
          org_id: string
          phone_e164?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          external_id?: string | null
          full_name?: string | null
          id?: string
          metadata?: Json | null
          org_id?: string
          phone_e164?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          attendant_id: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          org_id: string | null
          resolution_time: number | null
          response_time: number | null
          satisfaction_rating: number | null
          status: Database["public"]["Enums"]["assignment_status"] | null
          transfer_reason: string | null
          unassigned_at: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          attendant_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          org_id?: string | null
          resolution_time?: number | null
          response_time?: number | null
          satisfaction_rating?: number | null
          status?: Database["public"]["Enums"]["assignment_status"] | null
          transfer_reason?: string | null
          unassigned_at?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          attendant_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          org_id?: string | null
          resolution_time?: number | null
          response_time?: number | null
          satisfaction_rating?: number | null
          status?: Database["public"]["Enums"]["assignment_status"] | null
          transfer_reason?: string | null
          unassigned_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_assignments_attendant_id_fkey"
            columns: ["attendant_id"]
            isOneToOne: false
            referencedRelation: "attendants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_assignments_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_assignments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_agent_id: string | null
          channel_account_id: string
          contact_id: string
          created_at: string | null
          id: string
          last_message_at: string | null
          org_id: string
          priority: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          assigned_agent_id?: string | null
          channel_account_id: string
          contact_id: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          org_id: string
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          assigned_agent_id?: string | null
          channel_account_id?: string
          contact_id?: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          org_id?: string
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_channel_account_id_fkey"
            columns: ["channel_account_id"]
            isOneToOne: false
            referencedRelation: "channel_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string | null
          id: string
          org_id: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          channel_type: string | null
          content: string | null
          conversation_id: string
          created_at: string | null
          direction: string
          external_id: string | null
          id: string
          media_url: string | null
          message_type: string | null
          metadata: Json | null
          sender_type: string
          status: string | null
        }
        Insert: {
          channel_type?: string | null
          content?: string | null
          conversation_id: string
          created_at?: string | null
          direction: string
          external_id?: string | null
          id?: string
          media_url?: string | null
          message_type?: string | null
          metadata?: Json | null
          sender_type?: string
          status?: string | null
        }
        Update: {
          channel_type?: string | null
          content?: string | null
          conversation_id?: string
          created_at?: string | null
          direction?: string
          external_id?: string | null
          id?: string
          media_url?: string | null
          message_type?: string | null
          metadata?: Json | null
          sender_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      orgs: {
        Row: {
          created_at: string | null
          id: string
          name: string
          plan: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          plan?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          plan?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      places: {
        Row: {
          formatted_address: string | null
          id: string
          location: Json | null
          name: string | null
          phone_number: string | null
          place_id: string
          raw_json: Json | null
          source_ts: string | null
          ttl_ts: string | null
          types: string[] | null
          website: string | null
        }
        Insert: {
          formatted_address?: string | null
          id?: string
          location?: Json | null
          name?: string | null
          phone_number?: string | null
          place_id: string
          raw_json?: Json | null
          source_ts?: string | null
          ttl_ts?: string | null
          types?: string[] | null
          website?: string | null
        }
        Update: {
          formatted_address?: string | null
          id?: string
          location?: Json | null
          name?: string | null
          phone_number?: string | null
          place_id?: string
          raw_json?: Json | null
          source_ts?: string | null
          ttl_ts?: string | null
          types?: string[] | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      prospect_activities: {
        Row: {
          activity_type: string
          completed: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          prospect_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          activity_type: string
          completed?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          prospect_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          activity_type?: string
          completed?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          prospect_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_activities_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          deal_value: number | null
          expected_revenue: number | null
          id: string
          last_activity: string | null
          next_followup: string | null
          notes: string | null
          org_id: string
          pipeline_position: number | null
          pipeline_stage: string | null
          place_id: string | null
          probability: number | null
          source: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          deal_value?: number | null
          expected_revenue?: number | null
          id?: string
          last_activity?: string | null
          next_followup?: string | null
          notes?: string | null
          org_id: string
          pipeline_position?: number | null
          pipeline_stage?: string | null
          place_id?: string | null
          probability?: number | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          deal_value?: number | null
          expected_revenue?: number | null
          id?: string
          last_activity?: string | null
          next_followup?: string | null
          notes?: string | null
          org_id?: string
          pipeline_position?: number | null
          pipeline_stage?: string | null
          place_id?: string | null
          probability?: number | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospects_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          channel_type: Database["public"]["Enums"]["channel_type"]
          content_json: Json
          created_at: string | null
          id: string
          name: string
          org_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          channel_type: Database["public"]["Enums"]["channel_type"]
          content_json: Json
          created_at?: string | null
          id?: string
          name: string
          org_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          channel_type?: Database["public"]["Enums"]["channel_type"]
          content_json?: Json
          created_at?: string | null
          id?: string
          name?: string
          org_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_assign_conversation: {
        Args: { p_conversation_id: string }
        Returns: string
      }
      create_org_with_owner: {
        Args: { p_name: string; p_slug: string; p_user: string }
        Returns: string
      }
      get_available_attendants: {
        Args: { p_org_id: string }
        Returns: {
          avg_response_time: number
          current_chats: number
          full_name: string
          id: string
          max_concurrent: number
          skills: string[]
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_message: {
        Args: {
          p_channel_type: string
          p_content: string
          p_conversation_id: string
          p_direction: string
          p_external_id: string
          p_media_url: string
          p_message_type: string
          p_metadata: string
          p_sender_type: string
          p_status: string
        }
        Returns: string
      }
      is_org_member: {
        Args: { check_org_id: string }
        Returns: boolean
      }
      orgs_for_user: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      agent_status: "ativo" | "inativo" | "treinamento"
      agent_type: "sdr" | "atendimento" | "suporte" | "vendas" | "outros"
      app_role: "admin" | "member" | "viewer"
      assignment_status:
        | "assigned"
        | "active"
        | "transferred"
        | "resolved"
        | "abandoned"
      attendants_status:
        | "online"
        | "busy"
        | "away"
        | "offline"
        | "break"
        | "training"
      campaign_status: "draft" | "scheduled" | "active" | "paused" | "completed"
      channel_type: "whatsapp" | "instagram" | "telegram" | "messenger"
      consent_status: "opt_in" | "opt_out" | "pending"
      conversation_status: "open" | "assigned" | "resolved" | "closed"
      member_role: "admin" | "member" | "viewer"
      message_direction: "inbound" | "outbound"
      message_sender: "contact" | "agent" | "system"
      metric_period: "daily" | "weekly" | "monthly"
      note_type:
        | "general"
        | "training"
        | "feedback"
        | "performance"
        | "incident"
      prospect_status: "new" | "validated" | "imported" | "opted_out"
      session_status: "active" | "ended" | "paused"
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
      agent_status: ["ativo", "inativo", "treinamento"],
      agent_type: ["sdr", "atendimento", "suporte", "vendas", "outros"],
      app_role: ["admin", "member", "viewer"],
      assignment_status: [
        "assigned",
        "active",
        "transferred",
        "resolved",
        "abandoned",
      ],
      attendants_status: [
        "online",
        "busy",
        "away",
        "offline",
        "break",
        "training",
      ],
      campaign_status: ["draft", "scheduled", "active", "paused", "completed"],
      channel_type: ["whatsapp", "instagram", "telegram", "messenger"],
      consent_status: ["opt_in", "opt_out", "pending"],
      conversation_status: ["open", "assigned", "resolved", "closed"],
      member_role: ["admin", "member", "viewer"],
      message_direction: ["inbound", "outbound"],
      message_sender: ["contact", "agent", "system"],
      metric_period: ["daily", "weekly", "monthly"],
      note_type: ["general", "training", "feedback", "performance", "incident"],
      prospect_status: ["new", "validated", "imported", "opted_out"],
      session_status: ["active", "ended", "paused"],
    },
  },
} as const
