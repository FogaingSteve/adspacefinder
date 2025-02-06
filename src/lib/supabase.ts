
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl === 'https://your-project-id.supabase.co') {
  throw new Error('Please set a valid VITE_SUPABASE_URL in your .env file')
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  throw new Error('Please set a valid VITE_SUPABASE_ANON_KEY in your .env file')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
