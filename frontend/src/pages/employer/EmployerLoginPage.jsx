import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import api from '../../api/axios.js'

export default function EmployerLoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', { ...form, role: 'EMPLOYER' })
      // JWT is now in httpOnly cookie — only store non-sensitive info
      localStorage.setItem('role', data.role)
      localStorage.setItem('userId', data.userId)
      localStorage.setItem('name', data.name)
      navigate('/employer/dashboard')
    } catch (err) {
      const raw = err.response?.data?.message || err.response?.data || 'Invalid credentials'
      const msg = typeof raw === 'string' ? raw : 'Invalid credentials'
      if (msg.toLowerCase().includes('pending')) {
        setError('Your account is pending admin approval. Please wait for activation.')
      } else {
        setError(msg)
      }
    }
  }

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100" style={{ backgroundColor: '#0f172a' }}>
      <div className="mb-4 text-center">
        <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>RecPro</div>
        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Hire smarter, faster.</div>
      </div>
      <div className="card shadow p-4" style={{ width: '400px', borderRadius: 12 }}>
        <h5 className="card-title mb-4 text-center fw-semibold">Employer Login</h5>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="input-group-text bg-white border-start-0"
                onClick={() => setShowPassword(s => !s)}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash color="#6c757d" /> : <FaEye color="#6c757d" />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-dark w-100">Login</button>
        </form>
        <p className="text-center mt-3 small">
          Don&apos;t have an account? <Link to="/register">Register as Employer</Link>
        </p>
        <hr />
        <p className="text-center text-muted small mb-0">
          <Link to="/">&larr; Back to home</Link>
        </p>
      </div>
    </div>
  )
}
