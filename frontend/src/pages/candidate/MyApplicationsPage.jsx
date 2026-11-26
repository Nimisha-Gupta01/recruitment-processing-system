import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios.js'

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
        <span key={star}
          style={{ fontSize: 28, cursor: 'pointer', color: star <= (hovered || value) ? '#f59e0b' : '#d1d5db', transition: 'color 0.1s', lineHeight: 1, userSelect: 'none' }}
          onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)} onClick={() => onChange(star)}
        >★</span>
      ))}
      {(hovered || value) > 0 && <span className="ms-2 text-muted" style={{ fontSize: 12 }}>{STAR_LABELS[hovered || value]}</span>}
    </div>
  )
}

function ConfirmModal({ show, title, message, onConfirm, onCancel, loading, reason, onReasonChange }) {
  if (!show) return null
  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-semibold">{title}</h5>
            <button className="btn-close" onClick={onCancel} disabled={loading} />
          </div>
          <div className="modal-body pt-2">
            <p className="text-muted mb-3">{message}</p>
            <label className="form-label fw-semibold small">Reason for withdrawal <span className="text-danger">*</span></label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Please tell the employer why you are withdrawing (e.g. accepted another offer, personal reasons…)"
              value={reason}
              onChange={e => onReasonChange(e.target.value)}
              disabled={loading}
              maxLength={300}
            />
            <div className="text-muted text-end small mt-1">{reason.length}/300</div>
          </div>
          <div className="modal-footer border-0 pt-0">
            <button className="btn btn-outline-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
            <button className="btn btn-danger" onClick={onConfirm} disabled={loading || !reason.trim()}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Withdrawing…</> : 'Yes, Withdraw'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CandidateNavbar() {
  const navigate = useNavigate()
  function logout() { localStorage.clear(); navigate('/') }
  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-4" style={{ backgroundColor: '#0f172a' }}>
      <span className="navbar-brand fw-bold" style={{ color: '#60a5fa', letterSpacing: '-0.5px' }}>RecPro</span>
      <div className="navbar-nav ms-auto d-flex flex-row gap-3">
        <button className="btn btn-link text-white text-decoration-none" onClick={() => navigate('/candidate/profile')}>Profile</button>
        <button className="btn btn-link text-white text-decoration-none" onClick={() => navigate('/candidate/jobs')}>Job Search</button>
        <button className="btn btn-link text-white text-decoration-none" onClick={() => navigate('/candidate/applications')}>My Applications</button>
        <button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}

const STEPS = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected']
const TERMINAL_NEGATIVE = ['Rejected', 'Withdrawn']

function StatusJourney({ status }) {
  const isTerminalNeg = TERMINAL_NEGATIVE.includes(status)
  const currentStepIndex = isTerminalNeg ? STEPS.length - 1 : STEPS.indexOf(status)

  return (
    <div className="d-flex align-items-center w-100 py-2 overflow-auto" style={{ minHeight: '56px' }}>
      {STEPS.map((step, idx) => {
        const isDone = !isTerminalNeg && idx < currentStepIndex
        const isCurrent = !isTerminalNeg && idx === currentStepIndex
        const isGrayed = isTerminalNeg

        let circleClass = 'rounded-circle d-flex align-items-center justify-content-center flex-shrink-0'
        let circleStyle = { width: 28, height: 28, fontSize: 13, border: '2px solid' }

        if (isGrayed) {
          circleStyle = { ...circleStyle, borderColor: '#6c757d', backgroundColor: '#e9ecef', color: '#6c757d' }
        } else if (isDone) {
          circleStyle = { ...circleStyle, borderColor: '#198754', backgroundColor: '#198754', color: '#fff' }
        } else if (isCurrent) {
          const color = idx === STEPS.length - 1 ? '#198754' : '#0d6efd'
          circleStyle = { ...circleStyle, borderColor: color, backgroundColor: color, color: '#fff' }
        } else {
          circleStyle = { ...circleStyle, borderColor: '#dee2e6', backgroundColor: '#fff', color: '#adb5bd' }
        }

        const showConnector = idx < STEPS.length - 1
        const connectorColor = !isGrayed && idx < currentStepIndex ? '#198754' : '#dee2e6'

        let labelColor = '#adb5bd'
        if (!isGrayed && isDone) labelColor = '#198754'
        else if (!isGrayed && isCurrent) labelColor = idx === STEPS.length - 1 ? '#198754' : '#0d6efd'
        else if (isGrayed) labelColor = '#6c757d'

        return (
          <div key={step} className="d-flex align-items-center flex-shrink-0">
            <div className="d-flex flex-column align-items-center" style={{ minWidth: 60 }}>
              <div className={circleClass} style={circleStyle}>
                {isDone || (isCurrent && idx === STEPS.length - 1) ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{idx + 1}</span>
                )}
              </div>
              <span className="text-center mt-1" style={{ fontSize: 10, fontWeight: isCurrent ? 600 : 400, color: labelColor, lineHeight: 1.2, maxWidth: 60 }}>
                {step}
              </span>
            </div>
            {showConnector && (
              <div style={{ height: 2, width: 24, backgroundColor: connectorColor, flexShrink: 0, marginBottom: 18 }} />
            )}
          </div>
        )
      })}
      {isTerminalNeg && (
        <div className="d-flex align-items-center flex-shrink-0" style={{ marginBottom: 18 }}>
          <div style={{ height: 2, width: 24, backgroundColor: '#dc3545', flexShrink: 0 }} />
          <span className="badge rounded-pill" style={{ backgroundColor: '#dc3545', fontSize: 12, padding: '5px 10px', whiteSpace: 'nowrap' }}>
            ✕ {status}
          </span>
        </div>
      )}
    </div>
  )
}

function ApplicationCard({ application, interview, onWithdraw }) {
  const [expanded, setExpanded] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [confirmWithdraw, setConfirmWithdraw] = useState(false)
  const [withdrawReason, setWithdrawReason] = useState('')
  const [showReport, setShowReport] = useState(false)
  const [reportRating, setReportRating] = useState(0)
  const [reportCategory, setReportCategory] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [reportMsg, setReportMsg] = useState({ text: '', type: '' })
  const [reportSubmitting, setReportSubmitting] = useState(false)

  const { applicationId, vacancyTitle, employerOrgName, employerId, appliedAt, status, coverNote, resumePath } = application
  const canWithdraw = !['Withdrawn', 'Rejected', 'Selected'].includes(status)
  const isTerminal = ['Withdrawn', 'Rejected', 'Selected'].includes(status)

  async function handleWithdraw() {
    setWithdrawing(true)
    try {
      await api.patch(`/applications/${applicationId}/withdraw`, { reason: withdrawReason })
    } catch {
      alert('Failed to withdraw. Please try again.')
      setWithdrawing(false)
      setConfirmWithdraw(false)
      setWithdrawReason('')
      return
    }
    setWithdrawing(false)
    setConfirmWithdraw(false)
    setWithdrawReason('')
    onWithdraw()
  }

  function openWithdrawModal(e) {
    e.stopPropagation()
    setWithdrawReason('')
    setConfirmWithdraw(true)
  }

  async function handleReport(e) {
    e.stopPropagation()
    if (!reportRating || !reportCategory || reportDetails.trim().length < 10) return
    setReportSubmitting(true)
    const reason = `[Rating: ${reportRating}/5] [Issue: ${reportCategory}] ${reportDetails.trim()}`
    try {
      await api.post(`/reports/employer/${employerId}`, { reason })
      setReportMsg({ text: 'Report submitted. Thank you for your feedback.', type: 'success' })
      setTimeout(() => { setShowReport(false); setReportMsg({ text: '', type: '' }) }, 2500)
    } catch (err) {
      const raw = err.response?.data?.message || err.response?.data || 'Failed'
      setReportMsg({ text: typeof raw === 'string' ? raw : 'Failed to submit report', type: 'danger' })
    } finally {
      setReportSubmitting(false)
    }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  function extractFilename(path) {
    if (!path) return null
    return path.split('/').pop().split('\\').pop()
  }

  const filename = extractFilename(resumePath)
  const badgeVariants = { Applied: 'secondary', Shortlisted: 'primary', 'Interview Scheduled': 'info', 'Interview Completed': 'warning', Selected: 'success', Rejected: 'danger', Withdrawn: 'danger' }
  const badgeColor = badgeVariants[status] || 'secondary'

  return (
    <div className="card mb-4 shadow-sm border-0" style={isTerminal ? { opacity: 0.65, filter: 'grayscale(30%)' } : {}}>
      {isTerminal && (
        <div className="d-flex align-items-center gap-2 px-4 py-2" style={{ background: status === 'Selected' ? '#d1fae5' : '#fee2e2', borderBottom: `2px solid ${status === 'Selected' ? '#6ee7b7' : '#fca5a5'}`, fontSize: 13 }}>
          <span style={{ fontSize: 16 }}>{status === 'Selected' ? '✅' : '🚫'}</span>
          <span className="fw-semibold">
            {status === 'Withdrawn' ? 'You have withdrawn this application. No further actions are available.'
              : status === 'Rejected' ? 'This application was not selected. No further actions are available.'
              : 'Congratulations! You have been selected for this position.'}
          </span>
        </div>
      )}

      <div
        className="card-header bg-white d-flex flex-wrap align-items-start justify-content-between py-3 px-4"
        style={{ borderBottom: '1px solid #e9ecef', cursor: isTerminal ? 'default' : 'pointer' }}
        onClick={() => !isTerminal && setExpanded(v => !v)}
        role="button"
        aria-expanded={expanded}
      >
        <div>
          <h5 className="mb-0 fw-bold" style={isTerminal ? { color: '#9ca3af' } : {}}>{vacancyTitle}</h5>
          <span className="fw-semibold" style={{ fontSize: 14, color: isTerminal ? '#9ca3af' : '#374151' }}>{employerOrgName}</span>
        </div>
        <div className="text-end d-flex flex-column align-items-end gap-1">
          <span className="text-muted" style={{ fontSize: 13 }}>Applied {formatDate(appliedAt)}</span>
          <div className="d-flex gap-2">
            {!isTerminal && (
              <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: 12, padding: '2px 10px' }}
                onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}>
                {expanded ? 'Hide Details' : 'View Details'}
              </button>
            )}
            {canWithdraw && (
              <button className="btn btn-sm btn-outline-danger" style={{ fontSize: 12, padding: '2px 10px' }} onClick={openWithdrawModal}>
                Withdraw
              </button>
            )}
            {employerId && (
              <button className="btn btn-sm btn-outline-warning" style={{ fontSize: 12, padding: '2px 10px' }}
                onClick={e => { e.stopPropagation(); setShowReport(r => !r); setReportRating(0); setReportCategory(''); setReportDetails(''); setReportMsg({ text: '', type: '' }) }}>
                🚩 Report
              </button>
            )}
          </div>
        </div>
      </div>

      {showReport && (
        <div className="px-4 py-3" style={{ background: '#fef2f2', borderTop: '1px solid #fecaca' }} onClick={e => e.stopPropagation()}>
          <div className="fw-semibold mb-3" style={{ fontSize: 14, color: '#991b1b' }}>Report Employer — {employerOrgName}</div>
          {reportMsg.text && <div className={`alert alert-${reportMsg.type} py-2 mb-3`}>{reportMsg.text}</div>}
          <div className="mb-3">
            <label className="form-label form-label-sm fw-semibold">Overall Rating</label>
            <StarRating value={reportRating} onChange={setReportRating} />
          </div>
          <div className="mb-3">
            <label className="form-label form-label-sm fw-semibold">Issue Category</label>
            <div className="d-flex flex-wrap gap-2 mt-1">
              {ISSUE_CATEGORIES.map(cat => (
                <button key={cat} type="button" className="btn btn-sm"
                  style={{ borderRadius: 20, border: `1.5px solid ${reportCategory === cat ? '#dc3545' : '#dee2e6'}`, background: reportCategory === cat ? '#dc354520' : '#fff', color: reportCategory === cat ? '#dc3545' : '#495057', fontWeight: reportCategory === cat ? 600 : 400, fontSize: 12 }}
                  onClick={() => setReportCategory(cat)}
                >{cat}</button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label form-label-sm fw-semibold">Details <span className="text-muted fw-normal">(min. 10 chars)</span></label>
            <textarea className="form-control form-control-sm" rows={3} value={reportDetails}
              onChange={e => setReportDetails(e.target.value)} style={{ resize: 'none' }}
              placeholder="Describe your experience in detail. Your report is confidential." />
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-danger btn-sm" onClick={handleReport}
              disabled={!reportRating || !reportCategory || reportDetails.trim().length < 10 || reportSubmitting}>
              {reportSubmitting ? <><span className="spinner-border spinner-border-sm me-1" />Submitting…</> : 'Submit Report'}
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowReport(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="px-4 pt-3 pb-1 bg-white">
        <StatusJourney status={status} />
      </div>

      {expanded && !isTerminal && (
        <div className="card-body px-4 pt-2 pb-4" style={{ borderTop: '1px solid #f0f0f0' }}>
          <div className="mb-3">
            <span className={`badge bg-${badgeColor} fs-6`}>{status}</span>
          </div>
          {interview && ['Interview Scheduled', 'Interview Completed'].includes(status) && (
            <div className="mb-3 p-3 rounded" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <div className="fw-semibold mb-2" style={{ color: '#1d4ed8' }}>📅 Interview Details — Round {interview.roundNumber}</div>
              <div className="row g-2" style={{ fontSize: 14 }}>
                <div className="col-sm-6">
                  <span className="text-muted">Date &amp; Time:</span>{' '}
                  <strong>{new Date(interview.interviewDatetime).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                </div>
                <div className="col-sm-6"><span className="text-muted">Mode:</span> <strong>{interview.mode}</strong></div>
                {interview.venue && <div className="col-sm-6"><span className="text-muted">Venue:</span> <strong>{interview.venue}</strong></div>}
                <div className="col-sm-6"><span className="text-muted">Interviewer:</span> <strong>{interview.interviewerName}</strong></div>
                {status === 'Interview Completed' && (
                  <div className="col-12 mt-1">
                    <span className="badge bg-secondary">Completed</span>
                    {interview.remarks && <span className="ms-2 text-muted">{interview.remarks}</span>}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="mb-3">
            <p className="mb-1"><strong>Vacancy:</strong> {vacancyTitle}</p>
            <p className="mb-0"><strong>Company:</strong> {employerOrgName}</p>
          </div>
          {coverNote && (
            <div className="mb-3">
              <strong>Cover Note:</strong>
              <p className="mt-1 mb-0 text-muted" style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{coverNote}</p>
            </div>
          )}
          <div className="mt-3">
            <strong>Resume:</strong>
            {filename ? (
              <div className="mt-2">
                <a href={`/api/resumes/${filename}`} className="btn btn-sm btn-outline-primary" target="_blank" rel="noopener noreferrer">
                  Download Resume
                </a>
              </div>
            ) : (
              <p className="text-muted mt-2 mb-0" style={{ fontSize: 14 }}>No resume on file.</p>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        show={confirmWithdraw}
        title="Withdraw Application"
        message={`Are you sure you want to withdraw your application for ${vacancyTitle} at ${employerOrgName}? This cannot be undone.`}
        onConfirm={handleWithdraw}
        onCancel={() => { setConfirmWithdraw(false); setWithdrawReason('') }}
        loading={withdrawing}
        reason={withdrawReason}
        onReasonChange={setWithdrawReason}
      />
    </div>
  )
}

const STATUS_OPTIONS = ['All', 'Applied', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Rejected', 'Withdrawn']

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  function loadAll() {
    setLoading(true)
    setError(null)
    Promise.all([
      api.get('/applications/my'),
      api.get('/candidate/interviews').catch(() => ({ data: [] })),
    ])
      .then(([appsRes, intRes]) => {
        setApplications(appsRes.data)
        setInterviews(intRes.data)
      })
      .catch(() => setError('Failed to load applications. Please refresh.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  const filtered = applications.filter(app => {
    const matchesSearch = search.trim() === '' ||
      app.vacancyTitle?.toLowerCase().includes(search.toLowerCase()) ||
      app.employerOrgName?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <CandidateNavbar />
      <div className="container mt-4" style={{ maxWidth: 860 }}>
        <h4 className="mb-3 fw-bold">My Applications</h4>

        {!loading && !error && applications.length > 0 && (
          <div className="row g-2 mb-4">
            <div className="col-md-6">
              <input className="form-control" placeholder="Search by job title or company…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
              </select>
            </div>
            {(search || statusFilter !== 'All') && (
              <div className="col-md-2 d-flex align-items-center">
                <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => { setSearch(''); setStatusFilter('All') }}>Clear</button>
              </div>
            )}
          </div>
        )}

        {loading && <div className="text-center py-5"><div className="spinner-border text-primary" /></div>}
        {!loading && error && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && applications.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted fs-5">You haven't applied to any positions yet.</p>
            <Link to="/candidate/jobs" className="btn btn-primary mt-2">Browse Jobs</Link>
          </div>
        )}
        {!loading && !error && applications.length > 0 && filtered.length === 0 && (
          <div className="text-center py-5"><p className="text-muted">No applications match your search.</p></div>
        )}
        {!loading && !error && filtered.map(app => (
          <ApplicationCard
            key={app.applicationId}
            application={app}
            interview={interviews.find(i => i.applicationId === app.applicationId) || null}
            onWithdraw={loadAll}
          />
        ))}
      </div>
    </>
  )
}
