import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios.js'

// ─── Navbar ──────────────────────────────────────────────────────────────────

function CandidateNavbar() {
  const navigate = useNavigate()
  function logout() { localStorage.clear(); navigate('/') }
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <span className="navbar-brand"><span className="recpro-brand" style={{ color: '#fff' }}>RecPro</span></span>
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
  'Offered',
  'Recruited',
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
          circleStyle = { ...circleStyle, borderColor: '#0d6efd', backgroundColor: '#0d6efd', color: '#fff' }
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
        else if (!isGrayed && isCurrent) labelColor = '#0d6efd'
        else if (isGrayed) labelColor = '#6c757d'

        return (
          <div key={step} className="d-flex align-items-center flex-shrink-0">
            {/* Step node */}
            <div className="d-flex flex-column align-items-center" style={{ minWidth: 60 }}>
              <div className={circleClass} style={circleStyle}>
                {isDone ? (
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

function ApplicationCard({ application, onResumeUploaded }) {
  const [expanded, setExpanded] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef = useRef(null)

  const { applicationId, vacancyTitle, employerOrgName, appliedAt, status, coverNote, resumePath } = application

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Extract filename from path like "/uploads/resumes/abc.pdf" or "abc.pdf"
  function extractFilename(path) {
    if (!path) return null
    return path.split('/').pop().split('\\').pop()
  }

  async function handleUpload() {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File must be under 5 MB.')
      return
    }
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are accepted.')
      return
    }
    setUploadError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await api.post(`/applications/${applicationId}/resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      onResumeUploaded()
    } catch (err) {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function handleFileChange(e) {
    setUploadError(null)
    setFile(e.target.files[0] || null)
  }

  const filename = extractFilename(resumePath)

  // Status badge variant for the detail section
  const badgeVariants = {
    Applied: 'secondary',
    Shortlisted: 'primary',
    'Interview Scheduled': 'info',
    'Interview Completed': 'warning',
    Selected: 'success',
    Offered: 'success',
    Recruited: 'success',
    Rejected: 'danger',
    Withdrawn: 'danger',
  }
  const badgeColor = badgeVariants[status] || 'secondary'

  return (
    <div className="card mb-4 shadow-sm border-0">
      {/* Card Header Row */}
      <div
        className="card-header bg-white d-flex flex-wrap align-items-start justify-content-between py-3 px-4"
        style={{ borderBottom: '1px solid #e9ecef', cursor: 'pointer' }}
        onClick={() => setExpanded(v => !v)}
        role="button"
        aria-expanded={expanded}
      >
        <div>
          <h5 className="mb-0 fw-bold">{vacancyTitle}</h5>
          <span className="text-muted" style={{ fontSize: 14 }}>{employerOrgName}</span>
        </div>
        <div className="text-end d-flex flex-column align-items-end gap-1">
          <span className="text-muted" style={{ fontSize: 13 }}>
            Applied {formatDate(appliedAt)}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            style={{ fontSize: 12, padding: '2px 10px' }}
            onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
          >
            {expanded ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>

      {/* Status Journey */}
      <div className="px-4 pt-3 pb-1 bg-white">
        <StatusJourney status={status} />
      </div>

      {/* Expandable Detail Section */}
      {expanded && (
        <div className="card-body px-4 pt-2 pb-4" style={{ borderTop: '1px solid #f0f0f0' }}>
          {/* Status badge */}
          <div className="mb-3">
            <span className={`badge bg-${badgeColor} fs-6`}>{status}</span>
          </div>

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
              <div className="mt-2">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="form-control form-control-sm"
                    style={{ maxWidth: 300 }}
                    onChange={handleFileChange}
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleUpload}
                    disabled={uploading || !file}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Uploading…
                      </>
                    ) : 'Upload Resume'}
                  </button>
                </div>
                {uploadError && (
                  <div className="text-danger mt-1" style={{ fontSize: 13 }}>{uploadError}</div>
                )}
                <div className="text-muted mt-1" style={{ fontSize: 12 }}>PDF only, max 5 MB</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  function loadApplications() {
    setLoading(true)
    setError(null)
    api.get('/applications/my')
      .then(r => setApplications(r.data))
      .catch(() => setError('Failed to load applications. Please refresh.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadApplications()
  }, [])

  return (
    <>
      <CandidateNavbar />
      <div className="container mt-4" style={{ maxWidth: 860 }}>
        <h4 className="mb-4 fw-bold">My Applications</h4>

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

        {!loading && !error && applications.length > 0 && applications.map(app => (
          <ApplicationCard
            key={app.applicationId}
            application={app}
            onResumeUploaded={loadApplications}
          />
        ))}
      </div>
    </>
  )
}
