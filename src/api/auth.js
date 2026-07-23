import api, { tokenStorage, userStorage } from './client'

// CONFIRMED — read directly from authRoute.js / services/authService.js:
// POST /auth/signup  { name, email, password, role? }  -> { data: user, token }
// POST /auth/login   { email, password }                -> { data: user, token }
// No /auth/me and no /auth/logout route exists anywhere in the backend.

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password })
  if (res.token) tokenStorage.set(res.token)
  if (res.data) userStorage.set(res.data)
  return res.data
}

export async function signup({ name, email, password, role }) {
  const res = await api.post('/auth/signup', { name, email, password, role })
  if (res.token) tokenStorage.set(res.token)
  if (res.data) userStorage.set(res.data)
  return res.data
}

// No backend logout route is confirmed — this clears the local session only.
export function logout() {
  tokenStorage.clear()
  userStorage.clear()
}

// Used to rehydrate the session on page refresh. There's no /auth/me to
// re-fetch from, and the JWT payload itself only contains { userId } (see
// utils/createToken.js) — so the real user object captured at login time is
// read back from local storage instead of being reconstructed from the token.
export function getStoredUser() {
  return userStorage.get()
}
