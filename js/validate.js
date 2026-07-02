// ============================================
// EduFlow — Regex Validation Module
// ============================================

// ---- REGEX PATTERNS ----
export const PATTERNS = {
  // Email: standard format user@domain.tld
  email: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,

  // Password: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{8,}$/,

  // Name: letters only plus spaces, apostrophes, hyphens (e.g. "Mary-Jane O'Brien")
  name: /^[a-zA-ZÀ-ÿ]+([ '\-][a-zA-ZÀ-ÿ]+)*$/,

  // Username: alphanumeric + underscores, 3–20 chars
  username: /^[a-zA-Z0-9_]{3,20}$/,

  // OTP: exactly 6 digits
  otp: /^\d{6}$/,
}

// ---- ERROR MESSAGES ----
export const MESSAGES = {
  email: {
    required: 'Email address is required.',
    invalid: 'Please enter a valid email address (e.g. name@university.edu).',
  },
  password: {
    required: 'Password is required.',
    weak: 'Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character (e.g. @, #, !).',
    mismatch: 'Passwords do not match.',
  },
  name: {
    required: 'This field is required.',
    invalid: "Name can only contain letters, spaces, apostrophes, and hyphens (e.g. Mary-Jane O'Brien).",
    tooShort: 'Name must be at least 2 characters.',
  },
  username: {
    required: 'Username is required.',
    invalid: 'Username can only contain letters, numbers, and underscores.',
    tooShort: 'Username must be at least 3 characters.',
    tooLong: 'Username must be 20 characters or fewer.',
  },
  otp: {
    required: 'Verification code is required.',
    invalid: 'Please enter the 6-digit code sent to your email.',
  },
}

// ---- CORE VALIDATOR ----

/**
 * Validate a single field value against a type.
 * Returns { valid: boolean, message: string }
 */
export function validate(type, value, options = {}) {
  const v = (value || '').trim()

  switch (type) {

    case 'email':
      if (!v) return fail(MESSAGES.email.required)
      if (!PATTERNS.email.test(v)) return fail(MESSAGES.email.invalid)
      return pass()

    case 'password':
      if (!v) return fail(MESSAGES.password.required)
      if (!PATTERNS.password.test(v)) return fail(MESSAGES.password.weak)
      return pass()

    case 'confirmPassword':
      if (!v) return fail(MESSAGES.password.required)
      if (v !== options.match) return fail(MESSAGES.password.mismatch)
      return pass()

    case 'name':
      if (!v) return fail(MESSAGES.name.required)
      if (v.length < 2) return fail(MESSAGES.name.tooShort)
      if (!PATTERNS.name.test(v)) return fail(MESSAGES.name.invalid)
      return pass()

    case 'username':
      if (!v) return fail(MESSAGES.username.required)
      if (v.length < 3) return fail(MESSAGES.username.tooShort)
      if (v.length > 20) return fail(MESSAGES.username.tooLong)
      if (!PATTERNS.username.test(v)) return fail(MESSAGES.username.invalid)
      return pass()

    case 'otp':
      if (!v) return fail(MESSAGES.otp.required)
      if (!PATTERNS.otp.test(v)) return fail(MESSAGES.otp.invalid)
      return pass()

    default:
      if (!v) return fail('This field is required.')
      return pass()
  }
}

function pass() { return { valid: true, message: '' } }
function fail(message) { return { valid: false, message } }

// ---- PASSWORD STRENGTH SCORE ----
// Returns 0 (empty) → 5 (very strong)
export function passwordStrength(password) {
  if (!password) return { score: 0, label: '', color: 'transparent', width: '0%' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) score++

  const levels = [
    { score: 0, label: '',                  color: 'transparent', width: '0%'   },
    { score: 1, label: 'Very weak',         color: '#f87171',     width: '20%'  },
    { score: 2, label: 'Weak',              color: '#fb923c',     width: '40%'  },
    { score: 3, label: 'Fair',              color: '#facc15',     width: '60%'  },
    { score: 4, label: 'Good',              color: '#a3e635',     width: '80%'  },
    { score: 5, label: 'Strong ✓',          color: '#4ade80',     width: '100%' },
  ]
  return levels[Math.min(score, 5)]
}

// ---- FORM FIELD UI HELPER ----
// Attach to an input to show/hide error message and toggle aria-invalid
export function applyFieldResult(inputId, result) {
  const input = document.getElementById(inputId)
  const error = document.getElementById(inputId + '-error')
  if (!input) return
  if (result.valid) {
    input.setAttribute('aria-invalid', 'false')
    if (error) { error.textContent = ''; error.classList.remove('show') }
  } else {
    input.setAttribute('aria-invalid', 'true')
    if (error) { error.textContent = result.message; error.classList.add('show') }
  }
  return result.valid
}

// ---- VALIDATE ENTIRE FORM ----
// Pass an array of { inputId, type, options? } objects
// Returns true only if ALL fields pass
export function validateForm(fields) {
  let allValid = true
  fields.forEach(({ inputId, type, options }) => {
    const input = document.getElementById(inputId)
    if (!input) return
    const result = validate(type, input.value, options)
    const ok = applyFieldResult(inputId, result)
    if (!ok) allValid = false
  })
  return allValid
}

// ---- LIVE VALIDATION ----
// Wire real-time validation to an input on blur (and optionally on input)
export function attachLiveValidation(inputId, type, options = {}) {
  const input = document.getElementById(inputId)
  if (!input) return
  input.addEventListener('blur', () => {
    applyFieldResult(inputId, validate(type, input.value, options))
  })
  // Only show password strength live, not errors mid-typing
  if (type === 'password') {
    input.addEventListener('input', () => {
      const strength = passwordStrength(input.value)
      const fill = document.getElementById('pwd-strength-fill')
      const hint = document.getElementById('pwd-strength-hint')
      if (fill) { fill.style.width = strength.width; fill.style.background = strength.color }
      if (hint) { hint.textContent = strength.label; hint.style.color = strength.color }
      // Clear error once valid, but don't show error while typing
      if (PATTERNS.password.test(input.value)) {
        applyFieldResult(inputId, { valid: true, message: '' })
      }
    })
  }
}
