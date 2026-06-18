// ============================================
// EduFlow — Dashboard Logic
// ============================================

import { getUser, getSession, signOut, onAuthStateChange } from './auth.js'

// ---- PROTECT ROUTE ----
async function init() {
  const session = await getSession()
  if (!session) {
    window.location.href = './pages/login.html'
    return
  }
  setupDashboard(session.user)
}

function setupDashboard(user) {
  // Hide loader, show dashboard
  document.getElementById('dash-loading').style.display = 'none'
  document.getElementById('dashboard').style.display = 'grid'

  // Set user info
  const meta = user.user_metadata || {}
  const firstName = meta.first_name || meta.full_name?.split(' ')[0] || user.email.split('@')[0]
  const initials = (meta.first_name?.[0] || '') + (meta.last_name?.[0] || '') || firstName[0].toUpperCase()

  document.getElementById('greeting-name').textContent = firstName
  document.getElementById('user-name').textContent = meta.full_name || firstName
  document.getElementById('user-avatar').textContent = initials.toUpperCase()

  // Set date
  const now = new Date()
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  document.getElementById('greeting-date').textContent =
    `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`

  // Update greeting based on time
  const hour = now.getHours()
  const greetEl = document.querySelector('.dash-greeting h1')
  const greetings = { 0: 'Good night', 5: 'Good morning', 12: 'Good afternoon', 17: 'Good evening', 21: 'Good night' }
  const greet = Object.entries(greetings).reverse().find(([h]) => hour >= parseInt(h))?.[1] || 'Hello'
  greetEl.innerHTML = `${greet}, <span id="greeting-name" class="grad-text">${firstName}</span> 👋`
}

// ---- NAVIGATION ----
function switchPage(pageId) {
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    const isActive = item.dataset.page === pageId
    item.classList.toggle('active', isActive)
    item.setAttribute('aria-current', isActive ? 'page' : 'false')
  })

  // Update page views
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.toggle('active', view.id === 'page-' + pageId)
  })

  // Close mobile sidebar
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
    console.error('Sign out error:', err)
    window.location.href = './pages/login.html'
  }
}

// ---- EVENT LISTENERS ----
document.addEventListener('DOMContentLoaded', () => {
  // Nav items
  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => switchPage(btn.dataset.page))
  })

  // Sign out
  document.getElementById('signout-btn')?.addEventListener('click', handleSignOut)

  // Mobile menu
  document.getElementById('mob-menu-btn')?.addEventListener('click', openSidebar)
  document.getElementById('sidebar-overlay')?.addEventListener('click', closeSidebar)
})

// ---- AUTH STATE LISTENER ----
onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    window.location.href = './pages/login.html'
  }
})

// ---- INIT ----
init()
