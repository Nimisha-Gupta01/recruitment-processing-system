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
      const msg = err.response?.data?.message || err.response?.data || 'Invalid credentials'
      setError(typeof msg === 'string' ? msg : 'Invalid credentials')
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ width: '400px' }}>
        <h4 className="card-title mb-4 text-center">Employer Login</h4>
        {error && <div className="alert alert-danger">{error}</div>}
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
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
        <p className="text-center mt-3">
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
