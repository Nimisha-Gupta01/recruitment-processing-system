import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios.js'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: searchParams.get('role') || 'CANDIDATE',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam) setForm(f => ({ ...f, role: roleParam }))
  }, [searchParams])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      localStorage.setItem('userId', data.userId)
      localStorage.setItem('name', data.name)
      if (data.role === 'EMPLOYER') navigate('/employer/dashboard')
      else navigate('/candidate/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Invalid credentials'
      setError(typeof msg === 'string' ? msg : 'Invalid credentials')
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ width: '400px' }}>
        <h4 className="card-title mb-4 text-center">Login</h4>
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
            <input
              type="password"
              name="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <select name="role" className="form-select" value={form.role} onChange={handleChange}>
              <option value="EMPLOYER">Employer</option>
              <option value="CANDIDATE">Candidate</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
        <p className="text-center mt-3">
          Don&apos;t have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  )
}
