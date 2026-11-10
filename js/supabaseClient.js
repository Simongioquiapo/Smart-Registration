import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://giklqxyfyrclmqyvmvmc.supabase.co"; // e.g., https://gikl...supabase.co
const supabaseKey = "sb_publishable_Y8GDmft8zfTQxW6Rk1VlZg_o61s-d3g"; // The one starting with sb_publishable_...

export const supabase = createClient(supabaseUrl, supabaseKey);