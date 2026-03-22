import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Mostrar loader global
  try {
    loader.show()
  } catch {}

  return config
})

api.interceptors.response.use(
  (res) => {
    // Ocultar loader
    try {
      loader.hide()
    } catch {}
    return res
  },
  (err) => {
    // Ocultar loader aunque haya error
    try {
      loader.hide()
    } catch {}

    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
