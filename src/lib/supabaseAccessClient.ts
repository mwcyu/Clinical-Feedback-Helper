// src/lib/supabaseAccessClient.ts
import { createClient } from "@supabase/supabase-js";

const ACCESS_SUPABASE_URL = import.meta.env.VITE_ACCESS_SUPABASE_URL;
const ACCESS_SUPABASE_ANON = import.meta.env.VITE_ACCESS_SUPABASE_ANON_KEY;

// ✅ MUST export with this exact name
export const supabaseAccess = createClient(
  ACCESS_SUPABASE_URL,
  ACCESS_SUPABASE_ANON
);
