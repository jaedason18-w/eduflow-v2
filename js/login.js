// ============================================
// EduFlow — Login Page Logic
// ============================================

import { signIn, signInWithGoogle, redirectIfLoggedIn, getSession } from './auth.js'
import { validateForm, attachLiveValidation } from './validate.js'

redirectIfLoggedIn('/dashboard.html')

// ---- GOOGLE BUTTON STATE HELPERS ----
const GOOGLE_BTN_ORIGINAL = `
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
  Continue with Google`

const GOOGLE_BTN_LOADING = `
  <span class="google-spinner" aria-hidden="true"></span>
  Signing in with Google…`

function setGoogleLoading(btn, loading) {
  btn.disabled = loading
  btn.innerHTML = loading ? GOOGLE_BTN_LOADING : GOOGLE_BTN_ORIGINAL
  btn.setAttribute('aria-busy', loading)
  btn.style.opacity = loading ? '0.75' : '1'
}

// ---- ERROR HELPERS ----
const ERROR_MESSAGES = {
  'Invalid login credentials':          'Incorrect email or password. Please try again.',
  'Email not confirmed':                'Please confirm your email address first. Check your inbox for a confirmation link.',
  'Too many requests':                  'Too many sign-in attempts. Please wait a few minutes and try again.',
  'User not found':                     'No account found with this email address.',
  'Network request failed':             'Connection failed. Please check your internet and try again.',
  'popup_closed_by_user':               'Google sign-in was cancelled. Please try again.',
  'access_denied':                      'Google sign-in was denied. Please allow access and try again.',
  'OAuth error':                        'Google sign-in failed. Please try again or use email instead.',
}

function getFriendlyError(message) {
  for (const [key, friendly] of Object.entries(ERROR_MESSAGES)) {
    if (message.toLowerCase().includes(key.toLowerCase())) return friendly
  }
  // Fallback — don't expose raw Supabase/OAuth internals
  return 'Something went wrong. Please try again.'
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error')
  if (!el) return
  el.textContent = msg
  el.style.display = 'block'
  el.focus()
}

function hideAuthError() {
  const el = document.getElementById('auth-error')
  if (el) el.style.display = 'none'
}

// ---- LIVE VALIDATION ----
document.addEventListener('DOMContentLoaded', () => {
  attachLiveValidation('email',    'email')
  attachLiveValidation('password', 'password')
})

// ---- EMAIL SIGN IN ----
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault()
  hideAuthError()

  const valid = validateForm([
    { inputId: 'email',    type: 'email'    },
    { inputId: 'password', type: 'password' },
  ])
  if (!valid) return

  const btn = document.getElementById('signin-btn')
  const original = btn.textContent
  btn.textContent = 'Signing in…'
  btn.disabled = true

  try {
    await signIn({
      email:    document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
    })
    window.location.href = '/dashboard.html'
  } catch (err) {
    btn.textContent = original
    btn.disabled = false
    showAuthError(getFriendlyError(err.message))
  }
})

// ---- GOOGLE SIGN IN ----
document.getElementById('google-signin')?.addEventListener('click', async () => {
  const btn = document.getElementById('google-signin')
  hideAuthError()
  setGoogleLoading(btn, true)
  try {
    await signInWithGoogle()
  } catch (err) {
    setGoogleLoading(btn, false)
    const msg = err?.message || ''
    const isCancelled = msg.includes('popup_closed') || msg.includes('cancelled') ||
                        msg.includes('access_denied') || msg.includes('user_cancelled')
    showAuthError(isCancelled
      ? 'Google sign-in was cancelled. Please try again.'
      : getFriendlyError(msg)
    )
  }
})

// ---- PASSWORD TOGGLE ----
const pwdInput  = document.getElementById('password')
const pwdToggle = document.getElementById('pwd-toggle')
pwdToggle?.addEventListener('click', () => {
  const show = pwdInput.type === 'password'
  pwdInput.type = show ? 'text' : 'password'
  pwdToggle.setAttribute('aria-label',   show ? 'Hide password' : 'Show password')
  pwdToggle.setAttribute('aria-pressed', show)
  pwdToggle.innerHTML = show
    ? '<i class="ri-eye-off-line"></i>'
    : '<i class="ri-eye-line"></i>'
})
