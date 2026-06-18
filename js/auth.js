// ============================================
// EduFlow — Authentication
// ============================================

import { supabase } from './supabase.js'

// ---- SIGN UP WITH EMAIL ----
export async function signUp({ firstName, lastName, email, password, university, department, year, degree }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        university,
        department,
        year,
        degree,
      },
      emailRedirectTo: window.location.origin + '/pages/login.html'
    }
  })
  if (error) throw error
  return data
}

// ---- SIGN IN WITH EMAIL ----
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// ---- SIGN IN WITH GOOGLE ----
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/dashboard.html'
    }
  })
  if (error) throw error
  return data
}

// ---- SIGN OUT ----
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  window.location.href = '/index.html'
}

// ---- GET CURRENT USER ----
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ---- GET SESSION ----
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ---- LISTEN TO AUTH STATE CHANGES ----
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}

// ---- RESET PASSWORD ----
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/pages/reset-password.html'
  })
  if (error) throw error
}

// ---- PROTECT ROUTE (redirect if not logged in) ----
export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    window.location.href = '/pages/login.html'
    return null
  }
  return session
}

// ---- REDIRECT IF ALREADY LOGGED IN ----
export async function redirectIfLoggedIn(destination = '/dashboard.html') {
  const session = await getSession()
  if (session) {
    window.location.href = destination
  }
}
