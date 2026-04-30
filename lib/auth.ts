export type GatekeepUser = {
  email: string
  name: string
}

const USERS_KEY = 'gatekeep.users'
const CURRENT_USER_KEY = 'gatekeep.currentUser'

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function getCurrentUser(): GatekeepUser | null {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function setCurrentUser(user: GatekeepUser | null) {
  if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(CURRENT_USER_KEY)
}

export function getSavedOutfitsKey(email?: string) {
  const user = email ? { email } : getCurrentUser()
  return user ? `gatekeep.savedOutfits.${normalizeEmail(user.email)}` : 'gatekeep.savedOutfits.guest'
}

export function signUpUser(email: string, name: string) {
  const users = getUsers()
  const normalized = normalizeEmail(email)
  const user = { email: normalized, name: name.trim() || normalized.split('@')[0] }
  localStorage.setItem(USERS_KEY, JSON.stringify({ ...users, [normalized]: user }))
  setCurrentUser(user)
  return user
}

export function signInUser(email: string) {
  const normalized = normalizeEmail(email)
  const user = getUsers()[normalized] || { email: normalized, name: normalized.split('@')[0] }
  setCurrentUser(user)
  return user
}

function getUsers(): Record<string, GatekeepUser> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  } catch {
    return {}
  }
}
