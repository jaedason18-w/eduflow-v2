// ============================================
// EduFlow — Landing Page Interactions
// ============================================

import { signUp, signIn, signInWithGoogle, redirectIfLoggedIn } from './auth.js'

// Redirect logged-in users to dashboard
redirectIfLoggedIn()

// ---- MODAL ----
let currentStep = 1

export function openModal() {
  document.getElementById('modal').classList.add('open')
  document.body.style.overflow = 'hidden'
  showStep(1, true)
  setTimeout(() => document.getElementById('fname')?.focus(), 300)
}

export function closeModal() {
  document.getElementById('modal').classList.remove('open')
  document.body.style.overflow = ''
}

function showStep(n, init = false) {
  for (let i = 1; i <= 4; i++) {
    const s = document.getElementById('step' + i)
    if (s) s.style.display = i === n ? 'block' : 'none'
  }
  currentStep = n
  const pct = { 1: '33%', 2: '66%', 3: '100%', 4: '100%' }
  const prog = document.getElementById('prog')
  if (prog) {
    prog.style.width = pct[n] || '33%'
    prog.parentElement.setAttribute('aria-valuenow', parseInt(pct[n]) || 33)
  }
  for (let i = 1; i <= 3; i++) {
    const si = document.getElementById('si' + i)
    if (si) si.className = 'si' + (i < n ? ' done' : i === n ? ' active' : '')
  }
  for (let i = 1; i <= 2; i++) {
    const sl = document.getElementById('sl' + i)
    if (sl) sl.className = 'si-line' + (i < n ? ' done' : '')
  }
}

// ---- VALIDATION ----
function setError(id, show) {
  const inp = document.getElementById(id)
  const err = document.getElementById(id + '-error')
  if (!inp) return
  inp.setAttribute('aria-invalid', show ? 'true' : 'false')
  if (err) err.classList.toggle('show', show)
}

function validateStep1() {
  const fname = document.getElementById('fname')?.value.trim()
  const lname = document.getElementById('lname')?.value.trim()
  const email = document.getElementById('email')?.value.trim()
  const pwd = document.getElementById('pwd')?.value
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
  const uni = document.getElementById('uni')?.value.trim()
  const yr = document.getElementById('yr')?.value
  let ok = true
  setError('uni', !uni); if (!uni) ok = false
  setError('yr', !yr); if (!yr) ok = false
  return ok
}

// ---- SIGN UP SUBMIT ----
async function handleSignUp() {
  const btn = document.getElementById('step3-submit')
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

    const fname = document.getElementById('fname').value.trim()
    const email = document.getElementById('email').value.trim()
    document.getElementById('success-msg').textContent =
      `Welcome, ${fname}! Check ${email} for a confirmation link to activate your account.`
    showStep(4)

  } catch (err) {
    btn.textContent = '🚀 Create my account'
    btn.disabled = false
    showFormError(err.message)
  }
}

function showFormError(msg) {
  let el = document.getElementById('form-global-error')
  if (!el) {
    el = document.createElement('div')
    el.id = 'form-global-error'
    el.style.cssText = 'background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.3);border-radius:8px;padding:.75rem 1rem;font-size:.85rem;color:#f87171;margin-bottom:1rem;'
    document.getElementById('step3')?.prepend(el)
  }
  el.textContent = msg
  el.style.display = 'block'
}

// ---- WIRE UP BUTTONS ----
document.addEventListener('DOMContentLoaded', () => {

  // Open modal buttons
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', openModal)
  })

  // Close modal
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal)
  document.getElementById('success-close')?.addEventListener('click', closeModal)
  document.getElementById('modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal')) closeModal()
  })

  // Step navigation
  document.getElementById('step1-next')?.addEventListener('click', () => {
    if (validateStep1()) showStep(2)
  })
  document.getElementById('step2-back')?.addEventListener('click', () => showStep(1))
  document.getElementById('step2-next')?.addEventListener('click', () => {
    if (validateStep2()) showStep(3)
  })
  document.getElementById('step3-back')?.addEventListener('click', () => showStep(2))
  document.getElementById('step3-submit')?.addEventListener('click', handleSignUp)

  // Google sign-up
  document.getElementById('google-btn')?.addEventListener('click', signInWithGoogle)

  // Password toggle
  const pwdInput = document.getElementById('pwd')
  const pwdToggle = document.getElementById('pwd-toggle')
  pwdToggle?.addEventListener('click', () => {
    const show = pwdInput.type === 'password'
    pwdInput.type = show ? 'text' : 'password'
    pwdToggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password')
    pwdToggle.innerHTML = show
      ? '<i class="ri-eye-off-line"></i>'
      : '<i class="ri-eye-line"></i>'
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
      { w: '25%', c: '#f87171', t: 'Weak — add numbers & symbols' },
      { w: '50%', c: '#fb923c', t: 'Fair — try a longer password' },
      { w: '75%', c: '#facc15', t: 'Good — almost there' },
      { w: '100%', c: '#4ade80', t: 'Strong password ✓' }
    ]
    const l = levels[Math.min(score, 4)]
    if (fill) { fill.style.width = l.w; fill.style.background = l.c }
    if (hint) { hint.textContent = l.t; hint.style.color = l.c }
    if (v.length > 0) setError('pwd', false)
  })

  // Checkbox goals
  document.querySelectorAll('#goals .check-item').forEach(item => {
    const cb = item.querySelector('input[type=checkbox]')
    item.addEventListener('click', () => {
      cb.checked = !cb.checked
      item.classList.toggle('checked', cb.checked)
    })
  })

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item')
      const isOpen = item.classList.contains('open')
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open')
        i.querySelector('.faq-q').setAttribute('aria-expanded', 'false')
      })
      if (!isOpen) {
        item.classList.add('open')
        btn.setAttribute('aria-expanded', 'true')
      }
    })
  })

  // Hamburger menu
  const hamburger = document.getElementById('hamburger')
  const mobileMenu = document.getElementById('mobile-menu')
  function toggleMenu(open) {
    hamburger?.classList.toggle('open', open)
    hamburger?.setAttribute('aria-expanded', open)
    mobileMenu?.classList.toggle('open', open)
    mobileMenu?.setAttribute('aria-hidden', !open)
    document.body.style.overflow = open ? 'hidden' : ''
  }
  hamburger?.addEventListener('click', () => toggleMenu(!hamburger.classList.contains('open')))
  document.querySelectorAll('.mobile-link').forEach(a => a.addEventListener('click', () => toggleMenu(false)))

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal()
  })

  // Scroll reveal
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target) }
    })
  }, { threshold: 0.1 })
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
})
