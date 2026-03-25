import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  try { loader.show() } catch {}

  return config
})

// Flag para evitar loop infinito en el retry del refresh
let isRefreshing    = false
let refreshQueue    = []

function processQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  refreshQueue = []
}

api.interceptors.response.use(
  (res) => {
    try { loader.hide() } catch {}
    return res
  },
  async (err) => {
    try { loader.hide() } catch {}

    const status       = err.response?.status
    const originalReq  = err.config

    // Intentar renovar el token si expiró (401) y no es la ruta de refresh/login
    if (status === 401 && !originalReq._retry &&
        !originalReq.url.includes('/auth/refresh') &&
        !originalReq.url.includes('/auth/login')) {

      const refreshToken = localStorage.getItem('refresh_token')

      if (refreshToken) {
        if (isRefreshing) {
          // Encolar solicitudes mientras se refresca
          return new Promise((resolve, reject) => {
            refreshQueue.push({ resolve, reject })
          }).then(token => {
            originalReq.headers.Authorization = `Bearer ${token}`
            return api(originalReq)
          })
        }

        originalReq._retry = true
        isRefreshing = true

        try {
          const res = await axios.post('/api/v1/auth/refresh', { refresh_token: refreshToken })
          const newToken = res.data.access_token

          localStorage.setItem('token', newToken)
          if (res.data.refresh_token) {
            localStorage.setItem('refresh_token', res.data.refresh_token)
          }
          // Actualizar usuario en localStorage si viene
          if (res.data.user) {
            localStorage.setItem('user', JSON.stringify(res.data.user))
          }

          api.defaults.headers.common.Authorization = `Bearer ${newToken}`
          originalReq.headers.Authorization         = `Bearer ${newToken}`

          processQueue(null, newToken)
          return api(originalReq)
        } catch (refreshErr) {
          processQueue(refreshErr, null)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
          return Promise.reject(refreshErr)
        } finally {
          isRefreshing = false
        }
      }

      // No hay refresh token — redirigir al login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
      return Promise.reject(err)
    }

    // Enriquecer errores sin mensaje del servidor
    if (!err.response?.data?.message) {
      const fallbacks = {
        403: 'No tenés permiso para realizar esta acción.',
        404: 'El recurso solicitado no existe.',
        429: 'Demasiadas solicitudes. Esperá un momento e intentá de nuevo.',
        500: 'Error interno del servidor. Intentá de nuevo más tarde.',
      }
      if (err.response) {
        err.response.data = err.response.data || {}
        err.response.data.message = fallbacks[status] || `Error ${status || 'de red'}.`
      } else {
        err.networkError = true
        err.userMessage  = 'No se pudo conectar al servidor. Verificá tu conexión.'
      }
    }

    return Promise.reject(err)
  }
)

/**
 * Extrae el mensaje de error de una respuesta de axios.
 * Usar en catch blocks: const msg = getErrorMessage(e)
 */
export function getErrorMessage(err, fallback = 'Ocurrió un error inesperado.') {
  if (err?.networkError)             return err.userMessage
  if (err?.response?.data?.message) return err.response.data.message
  return fallback
}

export default api
