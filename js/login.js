// ============================================
// EduFlow — Login Page Logic
// ============================================

import { signIn, signInWithGoogle, redirectIfLoggedIn } from './auth.js'

// Redirect if already logged in
redirectIfLoggedIn('/dashboard.html')

function setError(id, show) {
  const inp = document.getElementById(id)
  const err = document.getElementById(id + '-error')
  if (!inp) return
  inp.setAttribute('aria-invalid', show ? 'true' : 'false')
  if (err) err.classList.toggle('show', show)
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error')
  if (el) { el.textContent = msg; el.style.display = 'block' }
}

function hideAuthError() {
  const el = document.getElementById('auth-error')
  if (el) el.style.display = 'none'
}

// ---- SIGN IN ----
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault()
  hideAuthError()

  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value
  let ok = true

  setError('email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ok = false

  setError('password', !password)
  if (!password) ok = false

  if (!ok) return

  const btn = document.getElementById('signin-btn')
  btn.textContent = 'Signing in...'
  btn.disabled = true

  try {
    await signIn({ email, password })
    window.location.href = '/dashboard.html'
  } catch (err) {
    btn.textContent = 'Sign in to EduFlow'
    btn.disabled = false
    showAuthError(err.message === 'Invalid login credentials'
      ? 'Incorrect email or password. Please try again.'
      : err.message)
  }
})

// ---- GOOGLE ----
document.getElementById('google-signin')?.addEventListener('click', async () => {
  try {
    await signInWithGoogle()
  } catch (err) {
    showAuthError(err.message)
  }
})

// ---- PASSWORD TOGGLE ----
const pwdInput = document.getElementById('password')
const pwdToggle = document.getElementById('pwd-toggle')
pwdToggle?.addEventListener('click', () => {
  const show = pwdInput.type === 'password'
  pwdInput.type = show ? 'text' : 'password'
  pwdToggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password')
  pwdToggle.innerHTML = show
    ? '<i class="ri-eye-off-line"></i>'
    : '<i class="ri-eye-line"></i>'
})
