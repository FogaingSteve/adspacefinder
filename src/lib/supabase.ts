
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'votre-url-supabase'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'votre-clé-anon'

export const supabase = createClient(supabaseUrl, supabaseKey)
