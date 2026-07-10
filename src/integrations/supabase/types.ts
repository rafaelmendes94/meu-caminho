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
      action_plan_tasks: {
        Row: {
          action_plan_id: string
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          action_plan_id: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          action_plan_id?: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_plan_tasks_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "action_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      action_plans: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          organization_id: string
          owner_id: string | null
          priority: string
          source_id: string | null
          source_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id: string
          owner_id?: string | null
          priority?: string
          source_id?: string | null
          source_type?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string
          owner_id?: string | null
          priority?: string
          source_id?: string | null
          source_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          evidence: Json
          id: string
          message: string
          organization_id: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          evidence?: Json
          id?: string
          message: string
          organization_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          evidence?: Json
          id?: string
          message?: string
          organization_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_events: {
        Row: {
          action: string
          consent_type: string
          created_at: string
          id: string
          ip_hash: string | null
          metadata: Json
          organization_id: string | null
          source: string | null
          user_agent: string | null
          user_id: string
          version: string
        }
        Insert: {
          action: string
          consent_type: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          metadata?: Json
          organization_id?: string | null
          source?: string | null
          user_agent?: string | null
          user_id: string
          version: string
        }
        Update: {
          action?: string
          consent_type?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          metadata?: Json
          organization_id?: string | null
          source?: string | null
          user_agent?: string | null
          user_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      content_authors: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          mini_bio: string | null
          name: string
          photo_url: string | null
          slug: string
          specialty: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          mini_bio?: string | null
          name: string
          photo_url?: string | null
          slug: string
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          mini_bio?: string | null
          name?: string
          photo_url?: string | null
          slug?: string
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      content_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      content_collection_items: {
        Row: {
          collection_id: string
          created_at: string
          item_id: string
          sort_order: number
        }
        Insert: {
          collection_id: string
          created_at?: string
          item_id: string
          sort_order?: number
        }
        Update: {
          collection_id?: string
          created_at?: string
          item_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "content_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_collection_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_collections: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_downloads: {
        Row: {
          created_at: string
          downloaded_at: string
          id: string
          item_id: string
          organization_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          downloaded_at?: string
          id?: string
          item_id: string
          organization_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          downloaded_at?: string
          id?: string
          item_id?: string
          organization_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_downloads_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_item_authors: {
        Row: {
          author_id: string
          created_at: string
          item_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          author_id: string
          created_at?: string
          item_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          item_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_item_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "content_authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_item_authors_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_item_tags: {
        Row: {
          created_at: string
          item_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          item_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          item_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "content_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          banner_url: string | null
          category_id: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          duration_minutes: number | null
          file_url: string | null
          id: string
          is_featured: boolean
          is_premium: boolean
          language: string | null
          level: string | null
          long_description: string | null
          media_url: string | null
          metadata: Json
          published_at: string | null
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          subtitle: string | null
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          file_url?: string | null
          id?: string
          is_featured?: boolean
          is_premium?: boolean
          language?: string | null
          level?: string | null
          long_description?: string | null
          media_url?: string | null
          metadata?: Json
          published_at?: string | null
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          subtitle?: string | null
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          file_url?: string | null
          id?: string
          is_featured?: boolean
          is_premium?: boolean
          language?: string | null
          level?: string | null
          long_description?: string | null
          media_url?: string | null
          metadata?: Json
          published_at?: string | null
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          subtitle?: string | null
          title?: string
          type?: Database["public"]["Enums"]["content_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      content_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_views: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          item_id: string
          organization_id: string | null
          user_id: string
          viewed_at: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          item_id: string
          organization_id?: string | null
          user_id: string
          viewed_at?: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          item_id?: string
          organization_id?: string | null
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_views_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          content: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          is_published: boolean
          lesson_type: Database["public"]["Enums"]["lesson_type"]
          media_url: string | null
          module_id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          media_url?: string | null
          module_id: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          media_url?: string | null
          module_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      data_deletion_requests: {
        Row: {
          canceled_at: string | null
          completed_at: string | null
          id: string
          organization_id: string | null
          reason: string | null
          requested_at: string
          scheduled_for: string | null
          status: string
          user_id: string
        }
        Insert: {
          canceled_at?: string | null
          completed_at?: string | null
          id?: string
          organization_id?: string | null
          reason?: string | null
          requested_at?: string
          scheduled_for?: string | null
          status?: string
          user_id: string
        }
        Update: {
          canceled_at?: string | null
          completed_at?: string | null
          id?: string
          organization_id?: string | null
          reason?: string | null
          requested_at?: string
          scheduled_for?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_deletion_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_export_requests: {
        Row: {
          completed_at: string | null
          error: string | null
          expires_at: string | null
          file_path: string | null
          file_size_bytes: number | null
          id: string
          organization_id: string | null
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          error?: string | null
          expires_at?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          organization_id?: string | null
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          error?: string | null
          expires_at?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          organization_id?: string | null
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_export_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          id: string
          leader_id: string | null
          name: string
          organization_id: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          leader_id?: string | null
          name: string
          organization_id: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          leader_id?: string | null
          name?: string
          organization_id?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      emotional_checkins: {
        Row: {
          created_at: string
          energy_score: number
          id: string
          mood_score: number
          notes: string | null
          organization_id: string | null
          stress_score: number
          tags: string[] | null
          user_id: string
          week_of: string | null
        }
        Insert: {
          created_at?: string
          energy_score: number
          id?: string
          mood_score: number
          notes?: string | null
          organization_id?: string | null
          stress_score: number
          tags?: string[] | null
          user_id: string
          week_of?: string | null
        }
        Update: {
          created_at?: string
          energy_score?: number
          id?: string
          mood_score?: number
          notes?: string | null
          organization_id?: string | null
          stress_score?: number
          tags?: string[] | null
          user_id?: string
          week_of?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emotional_checkins_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_profiles: {
        Row: {
          confidence: string
          generated_at: string
          generated_by_model: string | null
          id: string
          organization_id: string | null
          profile_communication: Json
          profile_development: Json
          profile_energy: Json
          profile_engagement: Json
          profile_leadership: Json
          profile_professional: Json
          summary: string | null
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          confidence?: string
          generated_at?: string
          generated_by_model?: string | null
          id?: string
          organization_id?: string | null
          profile_communication?: Json
          profile_development?: Json
          profile_energy?: Json
          profile_engagement?: Json
          profile_leadership?: Json
          profile_professional?: Json
          summary?: string | null
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          confidence?: string
          generated_at?: string
          generated_by_model?: string | null
          id?: string
          organization_id?: string | null
          profile_communication?: Json
          profile_development?: Json
          profile_energy?: Json
          profile_engagement?: Json
          profile_leadership?: Json
          profile_professional?: Json
          summary?: string | null
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_invites: {
        Row: {
          accepted_at: string | null
          canceled_at: string | null
          canceled_by: string | null
          created_at: string
          declined_at: string | null
          department: string | null
          department_id: string | null
          email: string
          expires_at: string
          full_name: string | null
          id: string
          invited_by: string | null
          job_title: string | null
          last_resent_at: string | null
          manager_id: string | null
          organization_id: string
          resent_count: number
          role: Database["public"]["Enums"]["app_role"]
          token_hash: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          canceled_at?: string | null
          canceled_by?: string | null
          created_at?: string
          declined_at?: string | null
          department?: string | null
          department_id?: string | null
          email: string
          expires_at?: string
          full_name?: string | null
          id?: string
          invited_by?: string | null
          job_title?: string | null
          last_resent_at?: string | null
          manager_id?: string | null
          organization_id: string
          resent_count?: number
          role?: Database["public"]["Enums"]["app_role"]
          token_hash: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          canceled_at?: string | null
          canceled_by?: string | null
          created_at?: string
          declined_at?: string | null
          department?: string | null
          department_id?: string | null
          email?: string
          expires_at?: string
          full_name?: string | null
          id?: string
          invited_by?: string | null
          job_title?: string | null
          last_resent_at?: string | null
          manager_id?: string | null
          organization_id?: string
          resent_count?: number
          role?: Database["public"]["Enums"]["app_role"]
          token_hash?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_invites_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enterprise_invites_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enterprise_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enterprise_invites_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_ai_conversations: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_ai_conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_ai_messages: {
        Row: {
          content: string
          context_snapshot: Json
          conversation_id: string
          created_at: string
          id: string
          role: string
          tokens_in: number | null
          tokens_out: number | null
        }
        Insert: {
          content: string
          context_snapshot?: Json
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          tokens_in?: number | null
          tokens_out?: number | null
        }
        Update: {
          content?: string
          context_snapshot?: Json
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          tokens_in?: number | null
          tokens_out?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "executive_ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "executive_ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_measurements: {
        Row: {
          baseline_score: number | null
          confidence: number | null
          current_score: number | null
          evidence: Json
          id: string
          impact_score: number | null
          measured_at: string
          organization_id: string
          source_id: string
          source_type: string
          summary: string | null
        }
        Insert: {
          baseline_score?: number | null
          confidence?: number | null
          current_score?: number | null
          evidence?: Json
          id?: string
          impact_score?: number | null
          measured_at?: string
          organization_id: string
          source_id: string
          source_type: string
          summary?: string | null
        }
        Update: {
          baseline_score?: number | null
          confidence?: number | null
          current_score?: number | null
          evidence?: Json
          id?: string
          impact_score?: number | null
          measured_at?: string
          organization_id?: string
          source_id?: string
          source_type?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_measurements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_timelines: {
        Row: {
          created_at: string
          delta: number | null
          event_date: string
          event_id: string | null
          event_type: string
          id: string
          organization_id: string
          score_after: number | null
          score_before: number | null
        }
        Insert: {
          created_at?: string
          delta?: number | null
          event_date?: string
          event_id?: string | null
          event_type: string
          id?: string
          organization_id: string
          score_after?: number | null
          score_before?: number | null
        }
        Update: {
          created_at?: string
          delta?: number | null
          event_date?: string
          event_id?: string | null
          event_type?: string
          id?: string
          organization_id?: string
          score_after?: number | null
          score_before?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_timelines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligent_rituals: {
        Row: {
          audience: string
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number
          expected_outcome: string | null
          generated_by_ai: boolean
          id: string
          instructions: Json
          organization_id: string
          ritual_type: string
          scheduled_at: string | null
          source_id: string | null
          source_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          expected_outcome?: string | null
          generated_by_ai?: boolean
          id?: string
          instructions?: Json
          organization_id: string
          ritual_type?: string
          scheduled_at?: string | null
          source_id?: string | null
          source_type?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          expected_outcome?: string | null
          generated_by_ai?: boolean
          id?: string
          instructions?: Json
          organization_id?: string
          ritual_type?: string
          scheduled_at?: string | null
          source_id?: string | null
          source_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligent_rituals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_interviews: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          message_count: number
          model_used: string | null
          organization_id: string | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          message_count?: number
          model_used?: string | null
          organization_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          message_count?: number
          model_used?: string | null
          organization_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_interviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_messages: {
        Row: {
          content: string
          created_at: string
          dimension_tags: string[] | null
          id: string
          interview_id: string
          organization_id: string | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          dimension_tags?: string[] | null
          id?: string
          interview_id: string
          organization_id?: string | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          dimension_tags?: string[] | null
          id?: string
          interview_id?: string
          organization_id?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_messages_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "onboarding_interviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_chart_snapshots: {
        Row: {
          id: string
          organization_id: string
          snapshot_at: string
          tree: Json
        }
        Insert: {
          id?: string
          organization_id: string
          snapshot_at?: string
          tree: Json
        }
        Update: {
          id?: string
          organization_id?: string
          snapshot_at?: string
          tree?: Json
        }
        Relationships: [
          {
            foreignKeyName: "org_chart_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          organization_id: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          organization_id: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_contracts: {
        Row: {
          ai_limits_override: Json
          billing_cycle: string
          contract_end: string | null
          contract_start: string | null
          contract_type: string
          created_at: string
          currency: string
          custom_terms: string | null
          discount_percent: number
          enabled_modules: Json
          grace_period_ends_at: string | null
          id: string
          licenses_total: number
          notes: string | null
          organization_id: string
          plan_id: string | null
          price_monthly_cents: number
          price_yearly_cents: number
          status: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          ai_limits_override?: Json
          billing_cycle?: string
          contract_end?: string | null
          contract_start?: string | null
          contract_type?: string
          created_at?: string
          currency?: string
          custom_terms?: string | null
          discount_percent?: number
          enabled_modules?: Json
          grace_period_ends_at?: string | null
          id?: string
          licenses_total?: number
          notes?: string | null
          organization_id: string
          plan_id?: string | null
          price_monthly_cents?: number
          price_yearly_cents?: number
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          ai_limits_override?: Json
          billing_cycle?: string
          contract_end?: string | null
          contract_start?: string | null
          contract_type?: string
          created_at?: string
          currency?: string
          custom_terms?: string | null
          discount_percent?: number
          enabled_modules?: Json
          grace_period_ends_at?: string | null
          id?: string
          licenses_total?: number
          notes?: string | null
          organization_id?: string
          plan_id?: string | null
          price_monthly_cents?: number
          price_yearly_cents?: number
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_contracts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_contracts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "platform_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          organization_id: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          organization_id: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          organization_id?: string
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizational_dna_reports: {
        Row: {
          collaboration_score: number | null
          communication_score: number | null
          created_at: string
          culture_score: number | null
          energy_score: number | null
          engagement_score: number | null
          evidence: Json
          generated_at: string
          generated_by: string | null
          id: string
          leadership_score: number | null
          opportunities: Json
          organization_id: string
          overall_score: number | null
          period_end: string | null
          period_start: string | null
          psychological_safety_score: number | null
          recommendations: Json
          recovery_score: number | null
          status: string
          strengths: Json
          summary: string | null
          updated_at: string
          version: number
        }
        Insert: {
          collaboration_score?: number | null
          communication_score?: number | null
          created_at?: string
          culture_score?: number | null
          energy_score?: number | null
          engagement_score?: number | null
          evidence?: Json
          generated_at?: string
          generated_by?: string | null
          id?: string
          leadership_score?: number | null
          opportunities?: Json
          organization_id: string
          overall_score?: number | null
          period_end?: string | null
          period_start?: string | null
          psychological_safety_score?: number | null
          recommendations?: Json
          recovery_score?: number | null
          status?: string
          strengths?: Json
          summary?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          collaboration_score?: number | null
          communication_score?: number | null
          created_at?: string
          culture_score?: number | null
          energy_score?: number | null
          engagement_score?: number | null
          evidence?: Json
          generated_at?: string
          generated_by?: string | null
          id?: string
          leadership_score?: number | null
          opportunities?: Json
          organization_id?: string
          overall_score?: number | null
          period_end?: string | null
          period_start?: string | null
          psychological_safety_score?: number | null
          recommendations?: Json
          recovery_score?: number | null
          status?: string
          strengths?: Json
          summary?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "organizational_dna_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizational_scores: {
        Row: {
          communication_score: number | null
          confidence: number
          created_at: string
          energy_score: number | null
          engagement_score: number | null
          equilibrium_score: number | null
          evidence: Json
          id: string
          organization_id: string
          overall_score: number | null
          participation_score: number | null
          recovery_score: number | null
          risk_penalty: number
          score_date: string
        }
        Insert: {
          communication_score?: number | null
          confidence?: number
          created_at?: string
          energy_score?: number | null
          engagement_score?: number | null
          equilibrium_score?: number | null
          evidence?: Json
          id?: string
          organization_id: string
          overall_score?: number | null
          participation_score?: number | null
          recovery_score?: number | null
          risk_penalty?: number
          score_date?: string
        }
        Update: {
          communication_score?: number | null
          confidence?: number
          created_at?: string
          energy_score?: number | null
          engagement_score?: number | null
          equilibrium_score?: number | null
          evidence?: Json
          id?: string
          organization_id?: string
          overall_score?: number | null
          participation_score?: number | null
          recovery_score?: number | null
          risk_penalty?: number
          score_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizational_scores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          archived_at: string | null
          city: string | null
          cnpj: string | null
          commercial_risk: string | null
          company_size: string | null
          country: string | null
          created_at: string | null
          current_period_end: string | null
          customer_success_owner: string | null
          deleted_at: string | null
          domain: string | null
          grace_period_ends_at: string | null
          id: string
          internal_notes: string | null
          internal_status: string | null
          licenses_total: number | null
          licenses_used: number | null
          logo_url: string | null
          mrr_cents: number | null
          name: string
          next_contact_at: string | null
          onboarding_status: string | null
          plan: string | null
          responsible_email: string | null
          responsible_name: string | null
          responsible_phone: string | null
          responsible_role: string | null
          segment: string | null
          slug: string
          state: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          suspended_at: string | null
          suspension_reason: string | null
          suspension_until: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          city?: string | null
          cnpj?: string | null
          commercial_risk?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string | null
          current_period_end?: string | null
          customer_success_owner?: string | null
          deleted_at?: string | null
          domain?: string | null
          grace_period_ends_at?: string | null
          id?: string
          internal_notes?: string | null
          internal_status?: string | null
          licenses_total?: number | null
          licenses_used?: number | null
          logo_url?: string | null
          mrr_cents?: number | null
          name: string
          next_contact_at?: string | null
          onboarding_status?: string | null
          plan?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          responsible_role?: string | null
          segment?: string | null
          slug: string
          state?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          suspended_at?: string | null
          suspension_reason?: string | null
          suspension_until?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          city?: string | null
          cnpj?: string | null
          commercial_risk?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string | null
          current_period_end?: string | null
          customer_success_owner?: string | null
          deleted_at?: string | null
          domain?: string | null
          grace_period_ends_at?: string | null
          id?: string
          internal_notes?: string | null
          internal_status?: string | null
          licenses_total?: number | null
          licenses_used?: number | null
          logo_url?: string | null
          mrr_cents?: number | null
          name?: string
          next_contact_at?: string | null
          onboarding_status?: string | null
          plan?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          responsible_role?: string | null
          segment?: string | null
          slug?: string
          state?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          suspended_at?: string | null
          suspension_reason?: string | null
          suspension_until?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip: unknown
          metadata: Json | null
          organization_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip?: unknown
          metadata?: Json | null
          organization_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip?: unknown
          metadata?: Json | null
          organization_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_plans: {
        Row: {
          ai_limits: Json
          billing_cycle: string
          created_at: string
          currency: string
          default_licenses: number
          description: string | null
          id: string
          included_modules: Json
          is_active: boolean
          is_public: boolean
          max_licenses: number | null
          min_licenses: number | null
          name: string
          plan_type: string
          price_monthly_cents: number
          price_yearly_cents: number
          slug: string
          sort_order: number
          support_level: string
          updated_at: string
        }
        Insert: {
          ai_limits?: Json
          billing_cycle?: string
          created_at?: string
          currency?: string
          default_licenses?: number
          description?: string | null
          id?: string
          included_modules?: Json
          is_active?: boolean
          is_public?: boolean
          max_licenses?: number | null
          min_licenses?: number | null
          name: string
          plan_type?: string
          price_monthly_cents?: number
          price_yearly_cents?: number
          slug: string
          sort_order?: number
          support_level?: string
          updated_at?: string
        }
        Update: {
          ai_limits?: Json
          billing_cycle?: string
          created_at?: string
          currency?: string
          default_licenses?: number
          description?: string | null
          id?: string
          included_modules?: Json
          is_active?: boolean
          is_public?: boolean
          max_licenses?: number | null
          min_licenses?: number | null
          name?: string
          plan_type?: string
          price_monthly_cents?: number
          price_yearly_cents?: number
          slug?: string
          sort_order?: number
          support_level?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      platform_usage_daily: {
        Row: {
          action_plans_count: number | null
          active_users: number | null
          ai_messages_count: number | null
          checkins_count: number | null
          created_at: string | null
          dna_reports_count: number | null
          estimated_ai_cost_cents: number | null
          executive_ai_messages_count: number | null
          id: string
          organization_id: string
          pulses_count: number | null
          rituals_count: number | null
          tokens_in: number | null
          tokens_out: number | null
          usage_date: string
        }
        Insert: {
          action_plans_count?: number | null
          active_users?: number | null
          ai_messages_count?: number | null
          checkins_count?: number | null
          created_at?: string | null
          dna_reports_count?: number | null
          estimated_ai_cost_cents?: number | null
          executive_ai_messages_count?: number | null
          id?: string
          organization_id: string
          pulses_count?: number | null
          rituals_count?: number | null
          tokens_in?: number | null
          tokens_out?: number | null
          usage_date?: string
        }
        Update: {
          action_plans_count?: number | null
          active_users?: number | null
          ai_messages_count?: number | null
          checkins_count?: number | null
          created_at?: string | null
          dna_reports_count?: number | null
          estimated_ai_cost_cents?: number | null
          executive_ai_messages_count?: number | null
          id?: string
          organization_id?: string
          pulses_count?: number | null
          rituals_count?: number | null
          tokens_in?: number | null
          tokens_out?: number | null
          usage_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_usage_daily_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      predictive_signals: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          confidence: number
          created_at: string
          detected_at: string
          evidence: Json
          expires_at: string | null
          id: string
          narrative: string
          organization_id: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          signal_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          confidence?: number
          created_at?: string
          detected_at?: string
          evidence?: Json
          expires_at?: string | null
          id?: string
          narrative: string
          organization_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          signal_type: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          confidence?: number
          created_at?: string
          detected_at?: string
          evidence?: Json
          expires_at?: string | null
          id?: string
          narrative?: string
          organization_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          signal_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictive_signals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_consents: {
        Row: {
          accepted_at: string | null
          consent_type: string
          id: string
          ip: unknown
          organization_id: string | null
          user_agent: string | null
          user_id: string
          version: string
        }
        Insert: {
          accepted_at?: string | null
          consent_type: string
          id?: string
          ip?: unknown
          organization_id?: string | null
          user_agent?: string | null
          user_id: string
          version: string
        }
        Update: {
          accepted_at?: string | null
          consent_type?: string
          id?: string
          ip?: unknown
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "privacy_consents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          department: string | null
          department_id: string | null
          display_name: string | null
          full_name: string | null
          hired_at: string | null
          id: string
          job_title: string | null
          manager_id: string | null
          organization_id: string | null
          phone: string | null
          status: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          department?: string | null
          department_id?: string | null
          display_name?: string | null
          full_name?: string | null
          hired_at?: string | null
          id: string
          job_title?: string | null
          manager_id?: string | null
          organization_id?: string | null
          phone?: string | null
          status?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          department?: string | null
          department_id?: string | null
          display_name?: string | null
          full_name?: string | null
          hired_at?: string | null
          id?: string
          job_title?: string | null
          manager_id?: string | null
          organization_id?: string | null
          phone?: string | null
          status?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      pulse_prompts: {
        Row: {
          active: boolean
          code: string
          created_at: string
          dimension: string
          id: string
          question: string
          response_type: string
          rotation_weight: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          dimension: string
          id?: string
          question: string
          response_type?: string
          rotation_weight?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          dimension?: string
          id?: string
          question?: string
          response_type?: string
          rotation_weight?: number
        }
        Relationships: []
      }
      pulse_responses: {
        Row: {
          context: string | null
          id: string
          organization_id: string | null
          prompt_id: string
          responded_at: string
          user_id: string
          value_num: number | null
          value_text: string | null
          week_of: string | null
        }
        Insert: {
          context?: string | null
          id?: string
          organization_id?: string | null
          prompt_id: string
          responded_at?: string
          user_id: string
          value_num?: number | null
          value_text?: string | null
          week_of?: string | null
        }
        Update: {
          context?: string | null
          id?: string
          organization_id?: string | null
          prompt_id?: string
          responded_at?: string
          user_id?: string
          value_num?: number | null
          value_text?: string | null
          week_of?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pulse_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pulse_responses_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "pulse_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      pulse_schedules: {
        Row: {
          opted_out: boolean
          preferred_days: number[]
          preferred_hour: number
          snooze_until: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          opted_out?: boolean
          preferred_days?: number[]
          preferred_hour?: number
          snooze_until?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          opted_out?: boolean
          preferred_days?: number[]
          preferred_hour?: number
          snooze_until?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      report_messages: {
        Row: {
          author_role: string
          author_user_id: string | null
          body: string
          created_at: string
          id: string
          organization_id: string
          report_id: string
        }
        Insert: {
          author_role: string
          author_user_id?: string | null
          body: string
          created_at?: string
          id?: string
          organization_id: string
          report_id: string
        }
        Update: {
          author_role?: string
          author_user_id?: string | null
          body?: string
          created_at?: string
          id?: string
          organization_id?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_messages_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          assigned_to: string | null
          body: string
          category: string
          created_at: string
          id: string
          is_anonymous: boolean
          metadata: Json
          organization_id: string
          protocol: string
          reporter_department_id: string | null
          reporter_unit_id: string | null
          reporter_user_id: string | null
          resolved_at: string | null
          severity: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          body: string
          category: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          metadata?: Json
          organization_id: string
          protocol: string
          reporter_department_id?: string | null
          reporter_unit_id?: string | null
          reporter_user_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          body?: string
          category?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          metadata?: Json
          organization_id?: string
          protocol?: string
          reporter_department_id?: string | null
          reporter_unit_id?: string | null
          reporter_user_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_department_id_fkey"
            columns: ["reporter_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_unit_id_fkey"
            columns: ["reporter_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      ritual_participations: {
        Row: {
          completed_at: string | null
          created_at: string
          feedback_score: number | null
          feedback_text: string | null
          id: string
          joined_at: string
          ritual_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          feedback_score?: number | null
          feedback_text?: string | null
          id?: string
          joined_at?: string
          ritual_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          feedback_score?: number | null
          feedback_text?: string | null
          id?: string
          joined_at?: string
          ritual_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ritual_participations_ritual_id_fkey"
            columns: ["ritual_id"]
            isOneToOne: false
            referencedRelation: "intelligent_rituals"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_comments: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          is_internal: boolean
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          id: string
          message: string | null
          opened_by: string | null
          organization_id: string | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          opened_by?: string | null
          organization_id?: string | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          opened_by?: string | null
          organization_id?: string | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      track_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          note: string | null
          sort_order: number
          track_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          note?: string | null
          sort_order?: number
          track_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          note?: string | null
          sort_order?: number
          track_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_items_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          organization_id: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          organization_id: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_ai_insights: {
        Row: {
          confidence: number | null
          created_at: string
          evidence: Json
          generated_at: string
          id: string
          insight_type: string | null
          organization_id: string
          recommended_actions: Json
          severity: string | null
          summary: string | null
          title: string
          updated_at: string
          version: number
          week_of: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          evidence?: Json
          generated_at?: string
          id?: string
          insight_type?: string | null
          organization_id: string
          recommended_actions?: Json
          severity?: string | null
          summary?: string | null
          title: string
          updated_at?: string
          version?: number
          week_of?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          evidence?: Json
          generated_at?: string
          id?: string
          insight_type?: string | null
          organization_id?: string
          recommended_actions?: Json
          severity?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          version?: number
          week_of?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_ai_insights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      employee_profiles_rh_view: {
        Row: {
          communication_style: string | null
          energy_baseline: number | null
          engagement_level: number | null
          generated_at: string | null
          is_leader: boolean | null
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          communication_style?: never
          energy_baseline?: never
          engagement_level?: never
          generated_at?: string | null
          is_leader?: never
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          communication_style?: never
          energy_baseline?: never
          engagement_level?: never
          generated_at?: string | null
          is_leader?: never
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_list_owners: {
        Args: never
        Returns: {
          archived_at: string
          created_at: string
          current_period_end: string
          deleted_at: string
          email: string
          full_name: string
          invite_accepted_at: string
          last_sign_in_at: string
          licenses_total: number
          licenses_used: number
          mrr_cents: number
          organization_id: string
          organization_name: string
          phone: string
          plan: string
          stripe_customer_id: string
          stripe_subscription_id: string
          subscription_status: string
          suspended_at: string
          suspension_reason: string
          suspension_until: string
          trial_ends_at: string
          user_id: string
        }[]
      }
      admin_owners_kpis: { Args: never; Returns: Json }
      assign_support_ticket: {
        Args: { _assignee: string; _ticket_id: string }
        Returns: undefined
      }
      billing_organizations: {
        Args: never
        Returns: {
          current_period_end: string
          days_remaining: number
          id: string
          licenses_total: number
          licenses_used: number
          mrr_cents: number
          name: string
          plan: string
          stripe_customer_id: string
          stripe_subscription_id: string
          subscription_status: string
          trial_ends_at: string
        }[]
      }
      billing_overview: { Args: never; Returns: Json }
      calculate_organizational_score: {
        Args: { _organization_id: string }
        Returns: Json
      }
      current_organization_id: { Args: never; Returns: string }
      generate_report_protocol: { Args: never; Returns: string }
      get_ai_costs: {
        Args: { _days?: number }
        Returns: {
          action_plans: number
          cost_cents: number
          dna_reports: number
          exec_messages: number
          messages: number
          organization_id: string
          organization_name: string
          rituals: number
          tokens_in: number
          tokens_out: number
          tokens_total: number
        }[]
      }
      get_ai_usage: { Args: { _days?: number }; Returns: Json }
      get_capacity_pulse: {
        Args: { _days?: number; _organization_id: string }
        Returns: {
          avg_value: number
          dimension: string
          participants_count: number
          response_count: number
        }[]
      }
      get_cms_dashboard: { Args: never; Returns: Json }
      get_dna_context: {
        Args: { _days?: number; _organization_id: string }
        Returns: Json
      }
      get_emotional_map: {
        Args: { _organization_id: string; _weeks?: number }
        Returns: {
          avg_energy: number
          avg_mood: number
          avg_stress: number
          equilibrium_index: number
          participants_count: number
          week_of: string
        }[]
      }
      get_executive_context: {
        Args: { _organization_id: string }
        Returns: Json
      }
      get_org_min_group_size: {
        Args: { _organization_id: string }
        Returns: number
      }
      get_platform_analytics: { Args: { _days?: number }; Returns: Json }
      get_platform_dashboard_summary: { Args: never; Returns: Json }
      get_platform_organization_details: {
        Args: { _id: string }
        Returns: Json
      }
      get_platform_organizations: {
        Args: {
          _include_archived?: boolean
          _limit?: number
          _offset?: number
          _search?: string
          _sort?: string
          _status?: string
        }
        Returns: {
          active_users_30d: number
          ai_messages_30d: number
          archived_at: string
          created_at: string
          health_status: string
          id: string
          last_activity_at: string
          last_dna_generated_at: string
          last_score: number
          licenses_total: number
          licenses_used: number
          name: string
          plan: string
          responsible_email: string
          responsible_name: string
          slug: string
          subscription_status: string
          suspended_at: string
          total_count: number
        }[]
      }
      get_platform_overview: { Args: never; Returns: Json }
      get_predictive_context: {
        Args: { _days?: number; _organization_id: string }
        Returns: Json
      }
      get_pulse_aggregate: {
        Args: { _days?: number; _organization_id: string }
        Returns: {
          avg_value: number
          dimension: string
          participants_count: number
          response_count: number
        }[]
      }
      get_rh_dashboard_summary: {
        Args: { _organization_id: string }
        Returns: Json
      }
      get_weekly_ai_context: {
        Args: { _organization_id: string }
        Returns: Json
      }
      get_weekly_checkin_aggregate: {
        Args: { _organization_id: string }
        Returns: {
          avg_energy: number
          avg_mood: number
          avg_stress: number
          participants_count: number
          week_of: string
        }[]
      }
      has_any_role: {
        Args: { _roles: Database["public"]["Enums"]["app_role"][] }
        Returns: boolean
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      health_check: { Args: never; Returns: Json }
      is_platform_admin: { Args: never; Returns: boolean }
      measure_impact: {
        Args: {
          _organization_id: string
          _source_id: string
          _source_type: string
        }
        Returns: Json
      }
      org_node_indicators: {
        Args: { _days?: number; _organization_id: string; _profile_id: string }
        Returns: Json
      }
      org_tree: {
        Args: { _organization_id: string }
        Returns: {
          department_name: string
          direct_reports_count: number
          full_name: string
          job_title: string
          level: number
          manager_id: string
          profile_id: string
          status: string
          total_reports_count: number
          unit_name: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "owner"
        | "rh_admin"
        | "leader"
        | "employee"
        | "b2c_user"
        | "platform_admin"
      content_status: "draft" | "published" | "archived"
      content_type:
        | "book"
        | "course"
        | "track"
        | "podcast"
        | "video"
        | "audio"
        | "material"
      lesson_type: "video" | "text" | "pdf" | "audio" | "exercise"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "grace_period"
        | "suspended"
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
      app_role: [
        "owner",
        "rh_admin",
        "leader",
        "employee",
        "b2c_user",
        "platform_admin",
      ],
      content_status: ["draft", "published", "archived"],
      content_type: [
        "book",
        "course",
        "track",
        "podcast",
        "video",
        "audio",
        "material",
      ],
      lesson_type: ["video", "text", "pdf", "audio", "exercise"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "grace_period",
        "suspended",
      ],
    },
  },
} as const
