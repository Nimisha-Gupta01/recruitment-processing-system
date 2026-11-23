import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios.js'

function formatSalary(n) {
  return `₹${(n / 100000).toFixed(1)}L`
}

function ApplyModal({ vacancy, onClose, onApplied, appliedIds }) {
  const [coverNote, setCoverNote] = useState('')
  const [msg, setMsg] = useState({ text: '', type: '' })

  async function handleApply() {
    setMsg({ text: '', type: '' })
    try {
      await api.post('/applications', { vacancyId: vacancy.vacancyId, coverNote })
      onApplied(vacancy.vacancyId)
      setMsg({ text: 'Applied successfully!', type: 'success' })
    } catch (err) {
      const rawMsg = err.response?.data
      const text = typeof rawMsg === 'string' ? rawMsg : (rawMsg?.message || rawMsg?.error || '')
      if (typeof text === 'string' && text.toLowerCase().includes('already applied')) {
        setMsg({ text: 'You have already applied for this position.', type: 'warning' })
      } else {
        setMsg({ text: 'Failed to apply. Please try again.', type: 'danger' })
      }
    }
  }

  const alreadyApplied = appliedIds.has(vacancy.vacancyId)

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Apply — {vacancy.designation}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
            <label className="form-label">Cover Note</label>
            <textarea
              className="form-control"
              rows={5}
              value={coverNote}
              onChange={e => setCoverNote(e.target.value)}
              disabled={alreadyApplied}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            <button
              className="btn btn-primary"
              onClick={handleApply}
              disabled={alreadyApplied}
            >
              Submit Application
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReportModal({ vacancy, onClose }) {
  const [reason, setReason] = useState('')
  const [msg, setMsg] = useState({ text: '', type: '' })

  async function handleSubmit() {
    if (!reason.trim()) return
    try {
      await api.post(`/reports/employer/${vacancy.employerId}`, { reason })
      setMsg({ text: 'Report submitted. Admin will review it.', type: 'success' })
      setReason('')
      setTimeout(onClose, 2000)
    } catch (err) {
      const raw = err.response?.data?.message || err.response?.data || 'Failed to submit report'
      setMsg({ text: typeof raw === 'string' ? raw : 'Failed to submit report', type: 'danger' })
    }
  }

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Report — {vacancy.employerOrgName}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
            <label className="form-label">Reason for reporting</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Describe why you are reporting this employer..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-danger" onClick={handleSubmit} disabled={!reason.trim()}>
              Submit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function LandingPage() {
  const navigate = useNavigate()
  const role = localStorage.getItem('role')

  const isLoggedInCandidate = role === 'CANDIDATE'

  // Redirect employers away immediately
  useEffect(() => {
    if (role === 'EMPLOYER') {
      navigate('/employer/dashboard', { replace: true })
    }
  }, [role, navigate])

  const [vacancies, setVacancies] = useState([])
  const [locationFilter, setLocationFilter] = useState('')
  const [appliedIds, setAppliedIds] = useState(new Set())
  const [modal, setModal] = useState(null)
  const [reportModal, setReportModal] = useState(null)
  const [stats, setStats] = useState({ openings: 3, companies: 2, candidates: 5 })

  useEffect(() => {
    // Public endpoint — no auth needed (axios interceptor only adds token if present)
    api.get('/vacancies/open')
      .then(r => {
        setVacancies(r.data)
        // Derive stats from real data if endpoint returns them
        const uniqueCompanies = new Set(r.data.map(v => v.employerOrgName)).size
        setStats(s => ({ ...s, openings: r.data.length, companies: uniqueCompanies || s.companies }))
      })
      .catch(() => {
        setVacancies([
          { vacancyId: 1, designation: 'Software Engineer', employerOrgName: 'TechCorp', location: 'Bangalore', salaryMin: 600000, salaryMax: 1200000, applicationDeadline: '2026-11-30' },
          { vacancyId: 2, designation: 'Product Manager', employerOrgName: 'InnoVate', location: 'Hyderabad', salaryMin: 1200000, salaryMax: 2000000, applicationDeadline: '2026-12-15' },
          { vacancyId: 3, designation: 'Data Analyst', employerOrgName: 'DataWorks', location: 'Pune', salaryMin: 500000, salaryMax: 900000, applicationDeadline: '2026-12-01' },
        ])
      })
  }, [])

  // Try to fetch candidate count from backend stats endpoint
  useEffect(() => {
    api.get('/stats/summary')
      .then(r => {
        if (r.data?.candidatesRegistered) {
          setStats(s => ({ ...s, candidates: r.data.candidatesRegistered }))
        }
      })
      .catch(() => { /* use static fallback */ })
  }, [])

  const filtered = vacancies.filter(v => {
    if (locationFilter && !v.location.toLowerCase().includes(locationFilter.toLowerCase())) return false
    return true
  })

  function handleApplyClick(vacancy) {
    if (!isLoggedInCandidate) {
      navigate('/login')
      return
    }
    setModal(vacancy)
  }

  function handleApplied(vacancyId) {
    setAppliedIds(s => new Set([...s, vacancyId]))
  }

  function handleLogout() {
    localStorage.clear()
    navigate('/')
    window.location.reload()
  }

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark px-4" style={{ backgroundColor: '#0f172a' }}>
        <span className="navbar-brand fw-bold fs-4" style={{ color: '#60a5fa', cursor: 'pointer' }} onClick={() => navigate('/')}>
          RecPro
        </span>
        <div className="navbar-nav ms-auto d-flex flex-row align-items-center gap-3">
          <Link to="/employer/login" className="nav-link text-white">For Employers</Link>
          <Link to="/admin/login" className="nav-link text-white-50 small">Admin</Link>
          {isLoggedInCandidate ? (
            <>
              <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/candidate/dashboard')}>
                Dashboard
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div
        className="py-5 text-white text-center"
        style={{ backgroundColor: '#0f172a', minHeight: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      >
        <h1 className="display-4 fw-bold mb-2">RecPro</h1>
        <p className="lead mb-4" style={{ color: '#94a3b8' }}>Find your next opportunity</p>
        <div className="d-flex justify-content-center" style={{ maxWidth: '500px', width: '100%' }}>
          <input
            className="form-control form-control-lg me-2"
            placeholder="Search by location..."
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            style={{ borderRadius: '8px' }}
          />
          <button
            className="btn btn-primary btn-lg"
            onClick={() => { /* filter is live via state */ }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-bottom py-3">
        <div className="container">
          <div className="row text-center g-3">
            <div className="col-4">
              <div className="fw-bold fs-4" style={{ color: '#0f172a' }}>{stats.openings}</div>
              <div className="text-muted small">Active Openings</div>
            </div>
            <div className="col-4">
              <div className="fw-bold fs-4" style={{ color: '#0f172a' }}>{stats.companies}</div>
              <div className="text-muted small">Companies Hiring</div>
            </div>
            <div className="col-4">
              <div className="fw-bold fs-4" style={{ color: '#0f172a' }}>{stats.candidates}</div>
              <div className="text-muted small">Candidates Registered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Cards */}
      <div className="container my-5">
        <div className="row g-4">
          {filtered.map(v => (
            <div className="col-md-4" key={v.vacancyId}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{v.designation}</h5>
                  <p className="card-text text-muted mb-1">{v.employerOrgName}</p>
                  <p className="card-text mb-1"><small>📍 {v.location}</small></p>
                  <p className="card-text mb-1"><small>💰 {formatSalary(v.salaryMin)} – {formatSalary(v.salaryMax)}</small></p>
                  <p className="card-text"><small>Deadline: {v.applicationDeadline}</small></p>
                </div>
                <div className="card-footer d-flex gap-2">
                  <button
                    className="btn btn-primary btn-sm flex-grow-1"
                    onClick={() => handleApplyClick(v)}
                    disabled={isLoggedInCandidate && appliedIds.has(v.vacancyId)}
                  >
                    {isLoggedInCandidate && appliedIds.has(v.vacancyId) ? 'Applied' : 'Apply Now'}
                  </button>
                  {isLoggedInCandidate && (
                    <button
                      className="btn btn-outline-danger btn-sm"
                      title="Report this employer"
                      onClick={() => setReportModal(v)}
                    >
                      🚩
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted text-center w-100">No vacancies found for that location.</p>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {modal && (
        <ApplyModal
          vacancy={modal}
          onClose={() => setModal(null)}
          onApplied={handleApplied}
          appliedIds={appliedIds}
        />
      )}

      {/* Report Modal */}
      {reportModal && (
        <ReportModal
          vacancy={reportModal}
          onClose={() => setReportModal(null)}
        />
      )}
    </>
  )
}
