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

const ISSUE_CATEGORIES = [
  'Fake job posting',
  'Ghost employer (no response)',
  'Unprofessional behavior',
  'Misleading job description',
  'Asked for money/fees',
  'Interview was not conducted fairly',
  'Other',
]

const STAR_LABELS = ['', 'Very Poor', 'Poor', 'Average', 'Good', 'Excellent']

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="d-flex align-items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          style={{
            fontSize: 32,
            cursor: 'pointer',
            color: star <= (hovered || value) ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.1s',
            lineHeight: 1,
            userSelect: 'none',
          }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          ★
        </span>
      ))}
      {(hovered || value) > 0 && (
        <span className="ms-2 text-muted" style={{ fontSize: 13 }}>
          {STAR_LABELS[hovered || value]}
        </span>
      )}
    </div>
  )
}

function ReportModal({ vacancy, onClose }) {
  const [rating, setRating] = useState(0)
  const [category, setCategory] = useState('')
  const [details, setDetails] = useState('')
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = rating > 0 && category && details.trim().length >= 10

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    const fullReason = `[Rating: ${rating}/5] [Issue: ${category}] ${details.trim()}`
    try {
      await api.post(`/reports/employer/${vacancy.employerId}`, { reason: fullReason })
      setMsg({ text: 'Thank you. Your report has been submitted and will be reviewed by our team.', type: 'success' })
      setTimeout(onClose, 2500)
    } catch (err) {
      const raw = err.response?.data?.message || err.response?.data || 'Failed to submit report'
      setMsg({ text: typeof raw === 'string' ? raw : 'Failed to submit report', type: 'danger' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0 pb-0">
            <div>
              <h5 className="modal-title fw-bold mb-0">Report Employer</h5>
              <p className="text-muted small mb-0">{vacancy.employerOrgName} · {vacancy.designation}</p>
            </div>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body pt-3">
            {msg.text && <div className={`alert alert-${msg.type} mb-3`}>{msg.text}</div>}

            {/* Star rating */}
            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">Overall Experience with this Employer</label>
              <StarRating value={rating} onChange={setRating} />
              <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                Rate the recruiter's overall conduct (1 = very poor, 5 = excellent)
              </div>
            </div>

            {/* Issue category */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Issue Category</label>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {ISSUE_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className="btn btn-sm"
                    style={{
                      borderRadius: 20,
                      border: `1.5px solid ${category === cat ? '#dc3545' : '#dee2e6'}`,
                      background: category === cat ? '#dc354520' : '#fff',
                      color: category === cat ? '#dc3545' : '#495057',
                      fontWeight: category === cat ? 600 : 400,
                      fontSize: 13,
                    }}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="mb-2">
              <label className="form-label fw-semibold">
                Details
                <span className="text-muted fw-normal ms-1" style={{ fontSize: 12 }}>(min. 10 characters)</span>
              </label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Please describe your experience in detail. Your report is confidential and will help us maintain a trustworthy platform."
                value={details}
                onChange={e => setDetails(e.target.value)}
                style={{ resize: 'none', fontSize: 14 }}
              />
              <div className="text-end text-muted mt-1" style={{ fontSize: 11 }}>{details.length} chars</div>
            </div>

            {!canSubmit && rating > 0 && category && details.trim().length < 10 && (
              <p className="text-muted small mb-0">Please provide at least 10 characters in the details field.</p>
            )}
          </div>
          <div className="modal-footer border-0 pt-0">
            <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-danger"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
            >
              {submitting ? <><span className="spinner-border spinner-border-sm me-1" />Submitting…</> : 'Submit Report'}
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
                  <button
                    className="btn btn-outline-danger btn-sm"
                    title="Report this vacancy"
                    onClick={() => isLoggedInCandidate ? setReportModal(v) : navigate('/login')}
                  >
                    Report
                  </button>
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
