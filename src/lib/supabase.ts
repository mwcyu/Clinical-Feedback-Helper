import { createClient } from "@supabase/supabase-js";

// ⚙️ Your Supabase project credentials (from .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ Initialize the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);