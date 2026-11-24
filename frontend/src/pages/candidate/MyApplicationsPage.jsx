import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios.js'

// ─── Confirm Modal ────────────────────────────────────────────────────────────

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

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = [
  'Applied',
  'Shortlisted',
  'Interview Scheduled',
  'Interview Completed',
  'Selected',
]

const TERMINAL_NEGATIVE = ['Rejected', 'Withdrawn']

// ─── Status Journey Tracker ──────────────────────────────────────────────────
// Pure Bootstrap / inline-style — no external chart libraries.

function StatusJourney({ status }) {
  const isTerminalNeg = TERMINAL_NEGATIVE.includes(status)

  // Index of the current affirmative step (or the last step before rejection)
  const currentStepIndex = isTerminalNeg
    ? STEPS.length - 1   // show all steps grayed when rejected/withdrawn (connector only)
    : STEPS.indexOf(status)

  // How many steps are "done" (completed = strictly before current)
  // currentStep itself is highlighted, everything before is green.
  const doneUpTo = isTerminalNeg ? -1 : currentStepIndex

  return (
    <div className="d-flex align-items-center w-100 py-2 overflow-auto" style={{ minHeight: '56px' }}>
      {STEPS.map((step, idx) => {
        const isDone = !isTerminalNeg && idx < currentStepIndex
        const isCurrent = !isTerminalNeg && idx === currentStepIndex
        const isFuture = !isTerminalNeg && idx > currentStepIndex
        // For terminal negative: show all as grayed
        const isGrayed = isTerminalNeg

        // Circle styling
        let circleClass = 'rounded-circle d-flex align-items-center justify-content-center flex-shrink-0'
        let circleStyle = { width: 28, height: 28, fontSize: 13, border: '2px solid' }

        if (isGrayed) {
          circleStyle = { ...circleStyle, borderColor: '#6c757d', backgroundColor: '#e9ecef', color: '#6c757d' }
        } else if (isDone) {
          circleStyle = { ...circleStyle, borderColor: '#198754', backgroundColor: '#198754', color: '#fff' }
        } else if (isCurrent) {
          // Last step (Selected) gets green, intermediate steps get blue
          const isLastStep = idx === STEPS.length - 1
          const color = isLastStep ? '#198754' : '#0d6efd'
          circleStyle = { ...circleStyle, borderColor: color, backgroundColor: color, color: '#fff' }
        } else {
          // future
          circleStyle = { ...circleStyle, borderColor: '#dee2e6', backgroundColor: '#fff', color: '#adb5bd' }
        }

        // Connector line after each step except last
        const showConnector = idx < STEPS.length - 1
        let connectorColor = '#dee2e6'
        if (!isGrayed && idx < currentStepIndex) connectorColor = '#198754'

        // Label color
        let labelColor = '#adb5bd'
        if (!isGrayed && isDone) labelColor = '#198754'
        else if (!isGrayed && isCurrent) labelColor = idx === STEPS.length - 1 ? '#198754' : '#0d6efd'
        else if (isGrayed) labelColor = '#6c757d'

        return (
          <div key={step} className="d-flex align-items-center flex-shrink-0">
            {/* Step node */}
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
              <span
                className="text-center mt-1"
                style={{ fontSize: 10, fontWeight: isCurrent ? 600 : 400, color: labelColor, lineHeight: 1.2, maxWidth: 60 }}
              >
                {step}
              </span>
            </div>

            {/* Connector line */}
            {showConnector && (
              <div
                style={{
                  height: 2,
                  width: 24,
                  backgroundColor: connectorColor,
                  flexShrink: 0,
                  marginBottom: 18,  // offset to align with circles, not labels
                }}
              />
            )}
          </div>
        )
      })}

      {/* Terminal negative badge appended after all steps */}
      {isTerminalNeg && (
        <div className="d-flex align-items-center flex-shrink-0" style={{ marginBottom: 18 }}>
          <div style={{ height: 2, width: 24, backgroundColor: '#dc3545', flexShrink: 0 }} />
          <span
            className="badge rounded-pill"
            style={{ backgroundColor: '#dc3545', fontSize: 12, padding: '5px 10px', whiteSpace: 'nowrap' }}
          >
            ✕ {status}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Application Card ─────────────────────────────────────────────────────────

function ApplicationCard({ application, interview, onWithdraw }) {
  const [expanded, setExpanded] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [confirmWithdraw, setConfirmWithdraw] = useState(false)
  const [withdrawReason, setWithdrawReason] = useState('')

  const { applicationId, vacancyTitle, employerOrgName, appliedAt, status, coverNote, resumePath } = application

  const canWithdraw = !['Withdrawn', 'Rejected', 'Selected'].includes(status)

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

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Extract filename from path like "/uploads/resumes/abc.pdf" or "abc.pdf"
  function extractFilename(path) {
    if (!path) return null
    return path.split('/').pop().split('\\').pop()
  }

  const filename = extractFilename(resumePath)

  // Status badge variant for the detail section
  const badgeVariants = {
    Applied: 'secondary',
    Shortlisted: 'primary',
    'Interview Scheduled': 'info',
    'Interview Completed': 'warning',
    Selected: 'success',
    Rejected: 'danger',
    Withdrawn: 'danger',
  }
  const badgeColor = badgeVariants[status] || 'secondary'

  const isTerminal = ['Withdrawn', 'Rejected', 'Selected'].includes(status)

  return (
    <div
      className="card mb-4 shadow-sm border-0"
      style={isTerminal ? { opacity: 0.65, filter: 'grayscale(30%)' } : {}}
    >
      {/* Withdrawn / Rejected banner */}
      {isTerminal && (
        <div
          className="d-flex align-items-center gap-2 px-4 py-2"
          style={{
            background: status === 'Selected' ? '#d1fae5' : '#fee2e2',
            borderBottom: `2px solid ${status === 'Selected' ? '#6ee7b7' : '#fca5a5'}`,
            fontSize: 13,
          }}
        >
          <span style={{ fontSize: 16 }}>{status === 'Selected' ? '✅' : '🚫'}</span>
          <span className="fw-semibold">
            {status === 'Withdrawn'
              ? 'You have withdrawn this application. No further actions are available.'
              : status === 'Rejected'
              ? 'This application was not selected. No further actions are available.'
              : 'Congratulations! You have been selected for this position.'}
          </span>
        </div>
      )}

      {/* Card Header Row */}
      <div
        className="card-header bg-white d-flex flex-wrap align-items-start justify-content-between py-3 px-4"
        style={{ borderBottom: '1px solid #e9ecef', cursor: isTerminal ? 'default' : 'pointer' }}
        onClick={() => !isTerminal && setExpanded(v => !v)}
        role="button"
        aria-expanded={expanded}
      >
        <div>
          <h5 className="mb-0 fw-bold" style={isTerminal ? { color: '#9ca3af' } : {}}>{vacancyTitle}</h5>
          <span className="text-muted" style={{ fontSize: 14 }}>{employerOrgName}</span>
        </div>
        <div className="text-end d-flex flex-column align-items-end gap-1">
          <span className="text-muted" style={{ fontSize: 13 }}>
            Applied {formatDate(appliedAt)}
          </span>
          <div className="d-flex gap-2">
            {!isTerminal && (
              <button
                className="btn btn-sm btn-outline-secondary"
                style={{ fontSize: 12, padding: '2px 10px' }}
                onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
              >
                {expanded ? 'Hide Details' : 'View Details'}
              </button>
            )}
            {canWithdraw && (
              <button
                className="btn btn-sm btn-outline-danger"
                style={{ fontSize: 12, padding: '2px 10px' }}
                onClick={openWithdrawModal}
              >
                Withdraw
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Journey */}
      <div className="px-4 pt-3 pb-1 bg-white">
        <StatusJourney status={status} />
      </div>

      {/* Expandable Detail Section — hidden for terminal states */}
      {expanded && !isTerminal && (
        <div className="card-body px-4 pt-2 pb-4" style={{ borderTop: '1px solid #f0f0f0' }}>
          {/* Status badge */}
          <div className="mb-3">
            <span className={`badge bg-${badgeColor} fs-6`}>{status}</span>
          </div>

          {/* Interview details — only for active scheduled/completed */}
          {interview && ['Interview Scheduled', 'Interview Completed'].includes(status) && !isTerminal && (
            <div className="mb-3 p-3 rounded" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <div className="fw-semibold mb-2" style={{ color: '#1d4ed8' }}>
                📅 Interview Details — Round {interview.roundNumber}
              </div>
              <div className="row g-2" style={{ fontSize: 14 }}>
                <div className="col-sm-6">
                  <span className="text-muted">Date &amp; Time:</span>{' '}
                  <strong>{new Date(interview.interviewDatetime).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}</strong>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted">Mode:</span> <strong>{interview.mode}</strong>
                </div>
                {interview.venue && (
                  <div className="col-sm-6">
                    <span className="text-muted">Venue:</span> <strong>{interview.venue}</strong>
                  </div>
                )}
                <div className="col-sm-6">
                  <span className="text-muted">Interviewer:</span> <strong>{interview.interviewerName}</strong>
                </div>
                {status === 'Interview Completed' && (
                  <div className="col-12 mt-1">
                    <span className="badge bg-secondary">Completed</span>
                    {interview.remarks && <span className="ms-2 text-muted">{interview.remarks}</span>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vacancy info */}
          <div className="mb-3">
            <p className="mb-1"><strong>Vacancy:</strong> {vacancyTitle}</p>
            <p className="mb-0"><strong>Company:</strong> {employerOrgName}</p>
          </div>

          {/* Cover note */}
          {coverNote && (
            <div className="mb-3">
              <strong>Cover Note:</strong>
              <p className="mt-1 mb-0 text-muted" style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{coverNote}</p>
            </div>
          )}

          {/* Resume section */}
          <div className="mt-3">
            <strong>Resume:</strong>
            {filename ? (
              <div className="mt-2">
                <a
                  href={`/api/resumes/${filename}`}
                  className="btn btn-sm btn-outline-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Resume
                </a>
              </div>
            ) : (
              <p className="text-muted mt-2 mb-0" style={{ fontSize: 14 }}>No resume on file.</p>
            )}
          </div>
        </div>
      )}
      {/* Withdraw confirm modal */}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  useEffect(() => {
    loadAll()
  }, [])

  const filtered = applications.filter(app => {
    const matchesSearch =
      search.trim() === '' ||
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

        {/* Search & filter row */}
        {!loading && !error && applications.length > 0 && (
          <div className="row g-2 mb-4">
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Search by job title or company…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
                ))}
              </select>
            </div>
            {(search || statusFilter !== 'All') && (
              <div className="col-md-2 d-flex align-items-center">
                <button
                  className="btn btn-sm btn-outline-secondary w-100"
                  onClick={() => { setSearch(''); setStatusFilter('All') }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading…</span>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted fs-5">You haven't applied to any positions yet.</p>
            <Link to="/candidate/jobs" className="btn btn-primary mt-2">Browse Jobs</Link>
          </div>
        )}

        {!loading && !error && applications.length > 0 && filtered.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted">No applications match your search.</p>
          </div>
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
