import axios from 'axios'

// Single source of truth for the API base URL — always read from env,
// never hardcode a host/port anywhere else in the app.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

// The backend serves uploaded files from the host root via express.static
// ("/uploads"), not under /api/v1 — e.g. http://localhost:8000/uploads/products/x.jpg
export const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '')

const TOKEN_KEY = 'boda_jwt_token'
const USER_KEY = 'boda_user'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

// There is no GET /auth/me endpoint in this backend, and the JWT payload only
// contains { userId } (see utils/createToken.js) — no name/email/role. So the
// user object returned by the real login response is cached here purely for
// rehydrating the session UI on refresh. This is not a fabricated endpoint;
// it's just persisting data the backend already gave us at login time.
export const userStorage = {
  get: () => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
  set: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear: () => localStorage.removeItem(USER_KEY),
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: 'application/json' },
})

// Attach JWT to every protected request.
api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// IMPORTANT: the real backend does NOT wrap responses in { status: 'success',
// data }. Success bodies look like { data }, { data, token }, { results,
// paginationResult, data }, or occasionally an empty 204 body (deletes). So
// this interceptor does NOT try to guess/unwrap a shape — it just hands back
// the raw parsed JSON body, and each api/*.js function explicitly picks the
// field(s) it needs (see e.g. api/categories.js, api/auth.js).
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      // Two different error shapes exist in this backend:
      // - ApiError/global error handler: { status: 'fail'|'error', message }
      // - express-validator failures (validatorMiddleware.js): { errors: [{ msg, path, ... }] }
      const message = data?.message || data?.errors?.[0]?.msg || error.message || 'Request failed'

      if (status === 401) {
        tokenStorage.clear()
        userStorage.clear()
        if (!window.location.pathname.startsWith('/login')) {
          window.location.assign('/login')
        }
      }
      return Promise.reject(new ApiError(message, status))
    }
    return Promise.reject(new ApiError(error.message || 'Network error', 0))
  }
)

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Prepend the backend file host to a relative upload path like "/uploads/products/x.jpg". */
export function resolveImageUrl(path) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  return `${FILE_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

export default api
