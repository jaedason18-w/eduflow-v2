// ============================================
// EduFlow — Supabase Client
// ============================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://jhprqhamscybyluzuwoh.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_T_QVl4-z8R53l6aQ3mtdHQ_58nfQ6WL'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export default supabase