import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send httpOnly cookie with every request
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const role = localStorage.getItem('role')
      if (role) {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
