import { createClient } from "@supabase/supabase-js";

// Clean Supabase URL to strip accidental trailing slashes or /rest/v1 if pasted by mistake
const rawUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase URL or Anon Key. Check your .env file!");
}

// Create and export the Supabase client for browser usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
