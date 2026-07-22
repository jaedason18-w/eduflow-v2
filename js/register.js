// ============================================
// EduFlow — Register Page Logic
// ============================================

import { signUp, signInWithGoogle, redirectIfLoggedIn } from './auth.js'
import { validateForm, attachLiveValidation, passwordStrength, validate, applyFieldResult } from './validate.js'

redirectIfLoggedIn('/dashboard.html')

let currentStep = 1

// ---- GOOGLE BUTTON ----
const GOOGLE_ORIGINAL = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg> Sign up with Google`
const GOOGLE_LOADING = `<span class="google-spinner" aria-hidden="true"></span> Redirecting to Google…`

function setGoogleLoading(btn, loading) {
  btn.disabled = loading
  btn.innerHTML = loading ? GOOGLE_LOADING : GOOGLE_ORIGINAL
  btn.setAttribute('aria-busy', String(loading))
  btn.style.opacity = loading ? '0.75' : '1'
}

// ---- ERROR MAP ----
const ERROR_MAP = {
  'User already registered': 'An account with this email already exists. Try signing in instead.',
  'Invalid email':           'Please enter a valid email address.',
  'Password should be':      'Password must be at least 8 characters with uppercase, lowercase, number and symbol.',
  'Network request failed':  'Connection failed. Please check your internet and try again.',
  'popup_closed_by_user':    'Google sign-up was cancelled. Please try again.',
  'access_denied':           'Google sign-up was denied. Please allow access and try again.',
  'cancelled':               'Google sign-up was cancelled. Please try again.',
}

function getFriendlyError(msg) {
  for (const [key, val] of Object.entries(ERROR_MAP)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return val
  }
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

// ---- STEP DISPLAY ----
function showStep(n) {
  [1, 2, 3].forEach(i => {
    const el = document.getElementById('reg-step' + i)
    if (el) el.style.display = i === n ? 'block' : 'none'
  })
  const success = document.getElementById('reg-success')
  const link    = document.getElementById('signin-link')
  if (success) success.style.display = 'none'
  if (link)    link.style.display = n === 3 ? 'none' : 'block'
  currentStep = n
  updateIndicator(n)
}

// ---- FIXED: single semicolon between forEach calls ----
function updateIndicator(n) {
  [1, 2, 3].forEach(i => {
    const rs = document.getElementById('rs' + i)
    if (rs) rs.className = 'reg-step' + (i < n ? ' done' : i === n ? ' active' : '')
  })
  ;[1, 2].forEach(i => {
    const rl = document.getElementById('rl' + i)
    if (rl) rl.className = 'rs-line' + (i < n ? ' done' : '')
  })
}

// ---- STEP 1 VALIDATION ----
function validateStep1() {
  return validateForm([
    { inputId: 'fname', type: 'name'     },
    { inputId: 'lname', type: 'name'     },
    { inputId: 'email', type: 'email'    },
    { inputId: 'pwd',   type: 'password' },
  ])
}

// ---- STEP 2 VALIDATION ----
function validateStep2() {
  let ok = true

  const uni    = document.getElementById('uni')
  const uniErr = document.getElementById('uni-error')
  if (!uni?.value.trim()) {
    uni?.setAttribute('aria-invalid', 'true')
    if (uniErr) { uniErr.textContent = 'University name is required.'; uniErr.classList.add('show') }
    ok = false
  } else {
    uni?.setAttribute('aria-invalid', 'false')
    if (uniErr) uniErr.classList.remove('show')
  }

  const yr    = document.getElementById('yr')
  const yrErr = document.getElementById('yr-error')
  if (!yr?.value) {
    yr?.setAttribute('aria-invalid', 'true')
    if (yrErr) { yrErr.textContent = 'Please select your current year.'; yrErr.classList.add('show') }
    ok = false
  } else {
    yr?.setAttribute('aria-invalid', 'false')
    if (yrErr) yrErr.classList.remove('show')
  }

  const matricResult = validate('matric', document.getElementById('matric')?.value || '')
  const matricOk     = applyFieldResult('matric', matricResult)
  if (!matricOk) ok = false

  return ok
}

// ---- SUBMIT ----
async function handleSubmit() {
  hideAuthError()
  const btn      = document.getElementById('s3-submit')
  const original = btn.textContent
  btn.textContent = 'Creating account…'
  btn.disabled    = true

  try {
    await signUp({
      firstName:  document.getElementById('fname').value.trim(),
      lastName:   document.getElementById('lname').value.trim(),
      email:      document.getElementById('email').value.trim(),
      password:   document.getElementById('pwd').value,
      university: document.getElementById('uni').value.trim(),
      department: document.getElementById('dept')?.value.trim() || '',
      year:       document.getElementById('yr').value,
      degree:     document.getElementById('deg')?.value || '',
      matric:     document.getElementById('matric')?.value.trim() || '',
    })

    ;[1, 2, 3].forEach(i => {
      const el = document.getElementById('reg-step' + i)
      if (el) el.style.display = 'none'
    })

    const success = document.getElementById('reg-success')
    const link    = document.getElementById('signin-link')
    if (success) success.style.display = 'block'
    if (link)    link.style.display    = 'none'

    const fname = document.getElementById('fname').value.trim()
    const email = document.getElementById('email').value.trim()
    const msgEl = document.getElementById('reg-success-msg')
    if (msgEl) msgEl.textContent =
      `Welcome, ${fname}! We sent a confirmation link to ${email}. Click it to activate your account.`

    setTimeout(() => { window.location.href = './login.html' }, 5000)

  } catch (err) {
    btn.textContent = original
    btn.disabled    = false
    showAuthError(getFriendlyError(err.message))
  }
}

// ---- DOM READY ----
document.addEventListener('DOMContentLoaded', () => {

  // Live validation
  attachLiveValidation('fname',  'name')
  attachLiveValidation('lname',  'name')
  attachLiveValidation('email',  'email')
  attachLiveValidation('pwd',    'password')
  attachLiveValidation('matric', 'matric')

  // Password strength meter
  document.getElementById('pwd')?.addEventListener('input', (e) => {
    const s    = passwordStrength(e.target.value)
    const fill = document.getElementById('pwd-strength-fill')
    const hint = document.getElementById('pwd-strength-hint')
    if (fill) { fill.style.width = s.width; fill.style.background = s.color }
    if (hint) { hint.textContent = s.label; hint.style.color = s.color }
  })

  // Password toggle — FIXED: inside DOMContentLoaded
  const pwdInput  = document.getElementById('pwd')
  const pwdToggle = document.getElementById('pwd-toggle')
  pwdToggle?.addEventListener('click', () => {
    const show = pwdInput.type === 'password'
    pwdInput.type = show ? 'text' : 'password'
    pwdToggle.innerHTML = show
      ? '<i class="ri-eye-off-line"></i>'
      : '<i class="ri-eye-line"></i>'
  })

  // Step navigation
  document.getElementById('s1-next')?.addEventListener('click', () => { if (validateStep1()) showStep(2) })
  document.getElementById('s2-back')?.addEventListener('click', () => showStep(1))
  document.getElementById('s2-next')?.addEventListener('click', () => { if (validateStep2()) showStep(3) })
  document.getElementById('s3-back')?.addEventListener('click', () => showStep(2))
  document.getElementById('s3-submit')?.addEventListener('click', handleSubmit)

  // Google sign-up
  document.getElementById('google-signup')?.addEventListener('click', async () => {
    const btn = document.getElementById('google-signup')
    hideAuthError()
    setGoogleLoading(btn, true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setGoogleLoading(btn, false)
      const msg        = err?.message || ''
      const isCancelled = msg.includes('popup_closed') || msg.includes('cancelled') ||
                          msg.includes('access_denied') || msg.includes('user_cancelled')
      showAuthError(isCancelled
        ? 'Google sign-up was cancelled. Please try again.'
        : getFriendlyError(msg)
      )
    }
  })

  // Checkbox goals
  document.querySelectorAll('#goals .check-item').forEach(item => {
    const cb = item.querySelector('input[type=checkbox]')
    item.addEventListener('click', () => {
      cb.checked = !cb.checked
      item.classList.toggle('checked', cb.checked)
    })
  })
})
