// ============================================
// EduFlow — Register Page Logic
// ============================================

import { signUp, signInWithGoogle, redirectIfLoggedIn } from './auth.js'

redirectIfLoggedIn('/dashboard.html')

let currentStep = 1

function setError(id, show) {
  const inp = document.getElementById(id)
  const err = document.getElementById(id + '-error')
  if (!inp) return
  inp.setAttribute('aria-invalid', show ? 'true' : 'false')
  if (err) err.classList.toggle('show', show)
}

function showStep(n) {
  ;[1, 2, 3].forEach(i => {
    const el = document.getElementById('reg-step' + i)
    if (el) el.style.display = i === n ? 'block' : 'none'
  })
  document.getElementById('reg-success').style.display = 'none'
  document.getElementById('signin-link').style.display = n === 3 ? 'none' : 'block'
  currentStep = n
  updateStepIndicator(n)
}

function updateStepIndicator(n) {
  ;[1, 2, 3].forEach(i => {
    const rs = document.getElementById('rs' + i)
    if (rs) rs.className = 'reg-step' + (i < n ? ' done' : i === n ? ' active' : '')
  })
  ;[1, 2].forEach(i => {
    const rl = document.getElementById('rl' + i)
    if (rl) rl.className = 'rs-line' + (i < n ? ' done' : '')
  })
}

function validateStep1() {
  const fname = document.getElementById('fname').value.trim()
  const lname = document.getElementById('lname').value.trim()
  const email = document.getElementById('email').value.trim()
  const pwd = document.getElementById('pwd').value
  let ok = true
  setError('fname', !fname); if (!fname) ok = false
  setError('lname', !lname); if (!lname) ok = false
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  setError('email', !emailOk); if (!emailOk) ok = false
  const pwdOk = pwd.length >= 8 && /\d/.test(pwd) && /[^a-zA-Z0-9]/.test(pwd)
  setError('pwd', !pwdOk); if (!pwdOk) ok = false
  return ok
}

function validateStep2() {
  const uni = document.getElementById('uni').value.trim()
  const yr = document.getElementById('yr').value
  let ok = true
  setError('uni', !uni); if (!uni) ok = false
  setError('yr', !yr); if (!yr) ok = false
  return ok
}

async function handleSubmit() {
  const btn = document.getElementById('s3-submit')
  btn.textContent = 'Creating account...'
  btn.disabled = true

  try {
    await signUp({
      firstName: document.getElementById('fname').value.trim(),
      lastName: document.getElementById('lname').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('pwd').value,
      university: document.getElementById('uni').value.trim(),
      department: document.getElementById('dept')?.value.trim(),
      year: document.getElementById('yr').value,
      degree: document.getElementById('deg')?.value,
    })

    ;[1, 2, 3].forEach(i => {
      const el = document.getElementById('reg-step' + i)
      if (el) el.style.display = 'none'
    })
    document.getElementById('reg-success').style.display = 'block'
    document.getElementById('signin-link').style.display = 'none'
    const fname = document.getElementById('fname').value.trim()
    const email = document.getElementById('email').value.trim()
    document.getElementById('reg-success-msg').textContent =
      `Welcome, ${fname}! We sent a confirmation link to ${email}. Click it to activate your account.`

  } catch (err) {
    btn.textContent = '🚀 Create my account'
    btn.disabled = false
    const errEl = document.getElementById('auth-error')
    if (errEl) { errEl.textContent = err.message; errEl.style.display = 'block' }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Step navigation
  document.getElementById('s1-next')?.addEventListener('click', () => {
    if (validateStep1()) showStep(2)
  })
  document.getElementById('s2-back')?.addEventListener('click', () => showStep(1))
  document.getElementById('s2-next')?.addEventListener('click', () => {
    if (validateStep2()) showStep(3)
  })
  document.getElementById('s3-back')?.addEventListener('click', () => showStep(2))
  document.getElementById('s3-submit')?.addEventListener('click', handleSubmit)

  // Google
  document.getElementById('google-signup')?.addEventListener('click', signInWithGoogle)

  // Password toggle
  const pwdInput = document.getElementById('pwd')
  const pwdToggle = document.getElementById('pwd-toggle')
  pwdToggle?.addEventListener('click', () => {
    const show = pwdInput.type === 'password'
    pwdInput.type = show ? 'text' : 'password'
    pwdToggle.innerHTML = show ? '<i class="ri-eye-off-line"></i>' : '<i class="ri-eye-line"></i>'
  })

  // Password strength
  pwdInput?.addEventListener('input', () => {
    const v = pwdInput.value
    let score = 0
    if (v.length >= 8) score++
    if (v.length >= 12) score++
    if (/[A-Z]/.test(v)) score++
    if (/\d/.test(v)) score++
    if (/[^a-zA-Z0-9]/.test(v)) score++
    const fill = document.getElementById('pwd-strength-fill')
    const hint = document.getElementById('pwd-strength-hint')
    const levels = [
      { w: '0%', c: 'transparent', t: '' },
      { w: '25%', c: '#f87171', t: 'Weak' },
      { w: '50%', c: '#fb923c', t: 'Fair' },
      { w: '75%', c: '#facc15', t: 'Good' },
      { w: '100%', c: '#4ade80', t: 'Strong ✓' }
    ]
    const l = levels[Math.min(score, 4)]
    if (fill) { fill.style.width = l.w; fill.style.background = l.c }
    if (hint) { hint.textContent = l.t; hint.style.color = l.c }
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
