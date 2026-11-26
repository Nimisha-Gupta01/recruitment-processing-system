import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios.js'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { ...form, role: 'ADMIN' })
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('userId', res.data.userId)
      localStorage.setItem('name', res.data.name)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      const raw = err.response?.data
      const msg = typeof raw === 'string' ? raw : (raw?.message || raw?.error || 'Invalid credentials')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#0f172a' }}>
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <h4 className="fw-bold" style={{ color: '#0f172a' }}>RecPro</h4>
          <p className="text-muted small">Admin Portal</p>
        </div>
        {error && <div className="alert alert-danger py-2">{String(error)}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="btn btn-dark w-100" disabled={loading}>
            {loading ? 'Logging in…' : 'Login as Admin'}
          </button>
        </form>
        <div className="text-center mt-3">
          <a href="/" className="text-muted small">← Back to home</a>
        </div>
      </div>
    </div>
  )
}
