import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaPhone, FaLock, FaBriefcase, FaEye, FaEyeSlash } from 'react-icons/fa'
import api from '../api/axios.js'

const employerInitial = { orgName: '', contactName: '', email: '', phone: '', password: '' }
const candidateInitial = {
  fullName: '', email: '', phone: '', password: '',
  degree: '', institution: '', yearOfPassing: '', percentage: '',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState('CANDIDATE')
  const [form, setForm] = useState(candidateInitial)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function handleRoleChange(e) {
    const r = e.target.value
    setRole(r)
    setForm(r === 'EMPLOYER' ? employerInitial : candidateInitial)
    setError('')
    setSuccess(false)
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    const endpoint = role === 'EMPLOYER' ? '/auth/register/employer' : '/auth/register/candidate'
    try {
      const { data } = await api.post(endpoint, form)
      setSuccess(true)
      if (role === 'EMPLOYER' || data?.role === 'PENDING') {
        // Employer accounts need admin approval — stay on page, show message
      } else {
        setTimeout(() => navigate('/login'), 1500)
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed'
      setError(typeof msg === 'string' ? msg : 'Registration failed')
    }
  }

  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 py-4" style={{ backgroundColor: '#0f172a' }}>
      <div className="mb-4 text-center">
        <FaBriefcase size={32} color="#60a5fa" className="mb-2" />
        <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>RecPro</div>
        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Your career, simplified.</div>
      </div>
      <div className="card shadow p-4" style={{ width: '500px', borderRadius: 12 }}>
        <h5 className="card-title mb-4 text-center fw-semibold">Create an Account</h5>
        {success && role === 'EMPLOYER' && (
          <div className="alert alert-warning">
            <strong>Registration submitted!</strong> Your employer account is pending admin approval.
            You will be able to log in once an admin activates your account.
          </div>
        )}
        {success && role !== 'EMPLOYER' && <div className="alert alert-success">Registered successfully! Redirecting to login...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <select className="form-select" value={role} onChange={handleRoleChange}>
            <option value="CANDIDATE">Candidate</option>
            <option value="EMPLOYER">Employer</option>
          </select>
        </div>
        <form onSubmit={handleSubmit}>
          {role === 'EMPLOYER' ? (
            <>
              <div className="mb-3">
                <label className="form-label">Organisation Name</label>
                <div className="input-group">
                  <span className="input-group-text"><FaBriefcase color="#6c757d" /></span>
                  <input name="orgName" className="form-control" value={form.orgName} onChange={handleChange} required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Contact Name</label>
                <div className="input-group">
                  <span className="input-group-text"><FaUser color="#6c757d" /></span>
                  <input name="contactName" className="form-control" value={form.contactName} onChange={handleChange} required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <div className="input-group">
                  <span className="input-group-text"><FaEnvelope color="#6c757d" /></span>
                  <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Phone</label>
                <div className="input-group">
                  <span className="input-group-text"><FaPhone color="#6c757d" /></span>
                  <input name="phone" className="form-control" value={form.phone} onChange={handleChange} required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-group-text"><FaLock color="#6c757d" /></span>
                  <input type={showPassword ? 'text' : 'password'} name="password" className="form-control" value={form.password} onChange={handleChange} required />
                  <button type="button" className="input-group-text bg-white border-start-0" onClick={() => setShowPassword(s => !s)} tabIndex={-1}>
                    {showPassword ? <FaEyeSlash color="#6c757d" /> : <FaEye color="#6c757d" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text"><FaUser color="#6c757d" /></span>
                  <input name="fullName" className="form-control" value={form.fullName} onChange={handleChange} required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <div className="input-group">
                  <span className="input-group-text"><FaEnvelope color="#6c757d" /></span>
                  <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Phone</label>
                <div className="input-group">
                  <span className="input-group-text"><FaPhone color="#6c757d" /></span>
                  <input name="phone" className="form-control" value={form.phone} onChange={handleChange} required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-group-text"><FaLock color="#6c757d" /></span>
                  <input type={showPassword ? 'text' : 'password'} name="password" className="form-control" value={form.password} onChange={handleChange} required />
                  <button type="button" className="input-group-text bg-white border-start-0" onClick={() => setShowPassword(s => !s)} tabIndex={-1}>
                    {showPassword ? <FaEyeSlash color="#6c757d" /> : <FaEye color="#6c757d" />}
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Degree</label>
                <input name="degree" className="form-control" value={form.degree} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Institution</label>
                <input name="institution" className="form-control" value={form.institution} onChange={handleChange} required />
              </div>
              <div className="row">
                <div className="col mb-3">
                  <label className="form-label">Year of Passing</label>
                  <input type="number" name="yearOfPassing" className="form-control" value={form.yearOfPassing} onChange={handleChange} required />
                </div>
                <div className="col mb-3">
                  <label className="form-label">Percentage</label>
                  <input type="number" step="0.01" name="percentage" className="form-control" value={form.percentage} onChange={handleChange} required />
                </div>
              </div>
            </>
          )}
          <button type="submit" className="btn btn-primary w-100">Register</button>
        </form>
        <p className="text-center mt-3">Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  )
}
