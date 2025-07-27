import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for server-side operations (with service role key for admin operations)
// Only create admin client if service key is available (server-side only)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Client for client-side operations (with anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (you can generate these from Supabase CLI)
export interface Database {
  public: {
    Tables: {
      domains: {
        Row: {
          id: number;
          slug: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          slug: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          slug?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conferences: {
        Row: {
          id: number;
          domain_slug: string;
          name: string;
          url: string;
          start_date: string;
          end_date: string;
          city: string | null;
          country: string | null;
          online: boolean;
          cfp_until: string | null;
          cfp_url: string | null;
          twitter: string | null;
          description: string | null;
          source: string;
          scraped_at: string | null;
          is_new: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          domain_slug: string;
          name: string;
          url: string;
          start_date: string;
          end_date: string;
          city?: string | null;
          country?: string | null;
          online?: boolean;
          cfp_until?: string | null;
          cfp_url?: string | null;
          twitter?: string | null;
          description?: string | null;
          source?: string;
          scraped_at?: string | null;
          is_new?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          domain_slug?: string;
          name?: string;
          url?: string;
          start_date?: string;
          end_date?: string;
          city?: string | null;
          country?: string | null;
          online?: boolean;
          cfp_until?: string | null;
          cfp_url?: string | null;
          twitter?: string | null;
          description?: string | null;
          source?: string;
          scraped_at?: string | null;
          is_new?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      scrape_logs: {
        Row: {
          id: number;
          scrape_type: string;
          status: string;
          conferences_found: number;
          conferences_added: number;
          conferences_updated: number;
          error_message: string | null;
          started_at: string;
          completed_at: string | null;
          metadata: Record<string, unknown> | null;
        };
        Insert: {
          id?: number;
          scrape_type: string;
          status: string;
          conferences_found?: number;
          conferences_added?: number;
          conferences_updated?: number;
          error_message?: string | null;
          started_at?: string;
          completed_at?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Update: {
          id?: number;
          scrape_type?: string;
          status?: string;
          conferences_found?: number;
          conferences_added?: number;
          conferences_updated?: number;
          error_message?: string | null;
          started_at?: string;
          completed_at?: string | null;
          metadata?: Record<string, unknown> | null;
        };
      };
    };
    Views: {
      conferences_with_domains: {
        Row: {
          id: number;
          domain_slug: string;
          name: string;
          url: string;
          start_date: string;
          end_date: string;
          city: string | null;
          country: string | null;
          online: boolean;
          cfp_until: string | null;
          cfp_url: string | null;
          twitter: string | null;
          description: string | null;
          source: string;
          scraped_at: string | null;
          is_new: boolean;
          created_at: string;
          updated_at: string;
          domain_name: string;
          domain_description: string | null;
        };
      };
    };
  };
} 