// ============================================
// EduFlow — Supabase Client Configuration
// ============================================

// import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// const SUPABASE_URL = 'https://jhprqhamscybyluzuwoh.supabase.co'
// const SUPABASE_ANON_KEY = 'sb_publishable_T_QVl4-z8R53l6aQ3mtdHQ_58nfQ6WL'

// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// export default supabase
// const SUPABASE_URL = 'https://jhprqhamscybyluzuwoh.supabase.co';
// const SUPABASE_ANON_KEY = 'sb_publishable_T_QVl4-z8R53l6aQ3mtdHQ_58nfQ6WL';

// // create client from global CDN (window.supabase)
// const supabase = window.supabase.createClient(
//     SUPABASE_URL,
//     SUPABASE_ANON_KEY
// );

// // optional export if you really need modules later
// export default supabase;

// ============================================
// EduFlow — Supabase Client Configuration
// ============================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://jhprqhamscybyluzuwoh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_T_QVl4-z8R53l6aQ3mtdHQ_58nfQ6WL';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export default supabase;

// Helper: Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Helper: Get user profile
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

// Helper: Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}