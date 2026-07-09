// ============================================
// EduFlow — Dashboard Logic
// ============================================

import { getSession, signOut, onAuthStateChange } from './auth.js'
import { supabase } from './supabase.js'

const WELCOME_KEY = 'ef_welcomed'

// ---- PROTECT ROUTE + INIT ----
async function init() {
  const session = await getSession()

  // 6. Dashboard protection — redirect if not logged in
  if (!session) {
    window.location.href = '/pages/login.html'
    return
  }

  // 1. Auto-create profile if it doesn't exist
  await ensureProfile(session.user)

  // Setup dashboard with user data
  setupDashboard(session.user)
}

// ---- 1. AUTO-CREATE PROFILE ----
async function ensureProfile(user) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (error || !data) {
      const meta = user.user_metadata || {}
      const fullName = meta.full_name || meta.name || ''
      const nameParts = fullName.split(' ')

      await supabase.from('profiles').upsert({
        id:          user.id,
        email:       user.email,
        first_name:  meta.first_name  || nameParts[0]              || '',
        last_name:   meta.last_name   || nameParts.slice(1).join(' ') || '',
        full_name:   fullName,
        avatar_url:  meta.avatar_url  || meta.picture              || '',
        university:  meta.university  || '',
        department:  meta.department  || '',
        year:        meta.year        || '',
        degree:      meta.degree      || '',
        provider:    user.app_metadata?.provider || 'email',
        created_at:  new Date().toISOString(),
      }, { onConflict: 'id' })
    }
  } catch (err) {
    // Fail silently — don't block dashboard if profiles table isn't ready
    console.warn('Profile upsert skipped:', err.message)
  }
}

// ---- SETUP DASHBOARD ----
function setupDashboard(user) {
  // Show dashboard, hide loader
  document.getElementById('dash-loading').style.display = 'none'
  document.getElementById('dashboard').style.display = 'grid'

  const meta = user.user_metadata || {}

  // 3. Display user's name from Google account
  const firstName = meta.first_name
    || meta.given_name
    || meta.full_name?.split(' ')[0]
    || meta.name?.split(' ')[0]
    || user.email.split('@')[0]

  const fullName = meta.full_name
    || meta.name
    || `${meta.first_name || ''} ${meta.last_name || ''}`.trim()
    || firstName

  const initials = (
    (meta.first_name?.[0] || meta.given_name?.[0] || firstName[0] || '') +
    (meta.last_name?.[0]  || meta.family_name?.[0] || '')
  ).toUpperCase() || '?'

  // 2. Display Google profile picture
  const avatarUrl = meta.avatar_url || meta.picture || ''
  setAvatar(avatarUrl, initials)

  // Sidebar user card
  const nameEl = document.getElementById('user-name')
  if (nameEl) nameEl.textContent = fullName

  // Greeting
  const now    = new Date()
  const hour   = now.getHours()
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']

  const dateEl = document.getElementById('greeting-date')
  if (dateEl) dateEl.textContent =
    `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`

  const greetMap = [[21,'Good night'],[17,'Good evening'],[12,'Good afternoon'],[5,'Good morning'],[0,'Good night']]
  const greet = greetMap.find(([h]) => hour >= h)?.[1] || 'Hello'

  const greetEl = document.querySelector('.dash-greeting h1')
  if (greetEl) greetEl.innerHTML =
    `${greet}, <span id="greeting-name" class="grad-text">${firstName}</span> 👋`

  // 4. Welcome message for first-time Google users
  const isGoogle    = user.app_metadata?.provider === 'google'
  const isFirstTime = !localStorage.getItem(WELCOME_KEY + '_' + user.id)

  if (isFirstTime) {
    showWelcomeBanner(firstName, avatarUrl, isGoogle)
    localStorage.setItem(WELCOME_KEY + '_' + user.id, '1')
  }
}

// ---- 2. SET AVATAR ----
function setAvatar(url, initials) {
  const el = document.getElementById('user-avatar')
  if (!el) return

  if (url) {
    el.innerHTML = `<img src="${url}" alt="Profile picture"
      style="width:100%;height:100%;border-radius:50%;object-fit:cover;"
      onerror="this.parentElement.textContent='${initials}'">`
  } else {
    el.textContent = initials
  }
}

// ---- 4. WELCOME BANNER ----
function showWelcomeBanner(name, avatarUrl, isGoogle) {
  const existing = document.getElementById('welcome-banner')
  if (existing) existing.remove()

  const banner = document.createElement('div')
  banner.id = 'welcome-banner'
  banner.setAttribute('role', 'status')
  banner.setAttribute('aria-live', 'polite')
  banner.innerHTML = `
    <div class="welcome-banner-inner">
      ${avatarUrl
        ? `<img src="${avatarUrl}" alt="" class="welcome-avatar" aria-hidden="true">`
        : `<div class="welcome-avatar-fallback" aria-hidden="true"><i class="ri-user-smile-line"></i></div>`
      }
      <div class="welcome-text">
        <strong>Welcome to EduFlow, ${name}! 🎓</strong>
        <span>${isGoogle
          ? 'Signed in with Google. Start by adding your courses.'
          : 'Your account is ready. Start by adding your courses.'
        }</span>
      </div>
      <button class="welcome-close" aria-label="Dismiss welcome message">
        <i class="ri-close-line"></i>
      </button>
    </div>
  `

  const main = document.getElementById('dash-main')
  if (main) main.prepend(banner)

  // Close button
  banner.querySelector('.welcome-close').addEventListener('click', () => banner.remove())

  // Auto-dismiss after 6 seconds
  setTimeout(() => { if (banner.parentNode) banner.remove() }, 6000)
}

// ---- NAVIGATION ----
function switchPage(pageId) {
  document.querySelectorAll('.nav-item').forEach(item => {
    const isActive = item.dataset.page === pageId
    item.classList.toggle('active', isActive)
    item.setAttribute('aria-current', isActive ? 'page' : 'false')
  })
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.toggle('active', view.id === 'page-' + pageId)
  })
  closeSidebar()
}

// ---- SIDEBAR ----
function openSidebar() {
  document.getElementById('sidebar').classList.add('open')
  document.getElementById('sidebar-overlay').classList.add('open')
  document.body.style.overflow = 'hidden'
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open')
  document.getElementById('sidebar-overlay').classList.remove('open')
  document.body.style.overflow = ''
}

// ---- SIGN OUT ----
async function handleSignOut() {
  try {
    await signOut()
  } catch (err) {
    window.location.href = '/pages/login.html'
  }
}

// ---- EVENT LISTENERS ----
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => switchPage(btn.dataset.page))
  })
  document.getElementById('signout-btn')?.addEventListener('click', handleSignOut)
  document.getElementById('mob-menu-btn')?.addEventListener('click', openSidebar)
  document.getElementById('sidebar-overlay')?.addEventListener('click', closeSidebar)
})

// ---- 5. SESSION PERSISTENCE ----
onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    window.location.href = '/pages/login.html'
  }
  if (event === 'TOKEN_REFRESHED' && session) {
    console.log('Session refreshed — user stays logged in')
  }
})

// ---- INIT ----
init()