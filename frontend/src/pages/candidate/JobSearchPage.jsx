import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa'
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
        <span
          key={star}
          style={{ fontSize: 32, cursor: 'pointer', color: star <= (hovered || value) ? '#f59e0b' : '#d1d5db', transition: 'color 0.1s', lineHeight: 1, userSelect: 'none' }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >★</span>
      ))}
      {(hovered || value) > 0 && (
        <span className="ms-2 text-muted" style={{ fontSize: 13 }}>{STAR_LABELS[hovered || value]}</span>
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
              <p className="text-muted small mb-0">{vacancy.orgName || vacancy.employerOrgName} · {vacancy.designation}</p>
            </div>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body pt-3">
            {msg.text && <div className={`alert alert-${msg.type} mb-3`}>{msg.text}</div>}
            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">Overall Experience with this Employer</label>
              <StarRating value={rating} onChange={setRating} />
              <div className="text-muted mt-1" style={{ fontSize: 12 }}>Rate the recruiter's overall conduct (1 = very poor, 5 = excellent)</div>
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Issue Category</label>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {ISSUE_CATEGORIES.map(cat => (
                  <button key={cat} type="button" className="btn btn-sm"
                    style={{ borderRadius: 20, border: `1.5px solid ${category === cat ? '#dc3545' : '#dee2e6'}`, background: category === cat ? '#dc354520' : '#fff', color: category === cat ? '#dc3545' : '#495057', fontWeight: category === cat ? 600 : 400, fontSize: 13 }}
                    onClick={() => setCategory(cat)}
                  >{cat}</button>
                ))}
              </div>
            </div>
            <div className="mb-2">
              <label className="form-label fw-semibold">Details <span className="text-muted fw-normal ms-1" style={{ fontSize: 12 }}>(min. 10 characters)</span></label>
              <textarea className="form-control" rows={4} placeholder="Please describe your experience in detail. Your report is confidential." value={details} onChange={e => setDetails(e.target.value)} style={{ resize: 'none', fontSize: 14 }} />
              <div className="text-end text-muted mt-1" style={{ fontSize: 11 }}>{details.length} chars</div>
            </div>
          </div>
          <div className="modal-footer border-0 pt-0">
            <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-danger" onClick={handleSubmit} disabled={!canSubmit || submitting}>
              {submitting ? <><span className="spinner-border spinner-border-sm me-1" />Submitting…</> : 'Submit Report'}
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

function formatSalary(n) {
  return `₹${(n / 100000).toFixed(1)}L`
}

export default function JobSearchPage() {
  const [vacancies, setVacancies] = useState([])
  const [filters, setFilters] = useState({ location: '', salaryMax: '' })
  const [modal, setModal] = useState(null)
  const [detailVacancy, setDetailVacancy] = useState(null)
  const [reportModal, setReportModal] = useState(null)
  const [coverNote, setCoverNote] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeError, setResumeError] = useState('')
  const [modalMsg, setModalMsg] = useState({ text: '', type: '' })
  const [appliedIds, setAppliedIds] = useState(new Set())
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    api.get('/vacancies/open')
      .then(r => setVacancies(r.data))
      .catch(() => {
        setVacancies([
          { vacancyId: 1, designation: 'Software Engineer', employerOrgName: 'TechCorp', location: 'Bangalore', salaryMin: 600000, salaryMax: 1200000, applicationDeadline: '2026-11-30' }
        ])
      })
    // Load already-applied vacancy IDs so Report button shows on page load
    api.get('/applications/my')
      .then(r => setAppliedIds(new Set(r.data.map(a => a.vacancyId))))
      .catch(() => {})
  }, [])

  const filtered = vacancies
    .filter(v => {
      if (filters.location && !v.location.toLowerCase().includes(filters.location.toLowerCase())) return false
      if (filters.salaryMax && v.salaryMax > Number(filters.salaryMax)) return false
      return true
    })
    .sort((a, b) => {
      const aApplied = appliedIds.has(a.vacancyId) ? 1 : 0
      const bApplied = appliedIds.has(b.vacancyId) ? 1 : 0
      return aApplied - bApplied
    })

  function openModal(vacancy) {
    setModal(vacancy)
    setCoverNote('')
    setResumeFile(null)
    setResumeError('')
    setModalMsg({ text: '', type: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function closeModal() {
    setModal(null)
  }

  function handleFileChange(e) {
    const file = e.target.files[0] || null
    setResumeError('')
    if (file) {
      if (file.type !== 'application/pdf') {
        setResumeError('Only PDF files are accepted.')
        setResumeFile(null)
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setResumeError('File must be under 5 MB.')
        setResumeFile(null)
        return
      }
    }
    setResumeFile(file)
  }

  async function handleApply() {
    if (!resumeFile) {
      setResumeError('Please upload your resume to apply.')
      return
    }
    setModalMsg({ text: '', type: '' })
    setSubmitting(true)
    try {
      // Step 1: submit application
      const appRes = await api.post('/applications', { vacancyId: modal.vacancyId, coverNote })
      const applicationId = appRes.data.applicationId

      // Step 2: upload resume linked to this application
      const formData = new FormData()
      formData.append('file', resumeFile)
      await api.post(`/applications/${applicationId}/resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setAppliedIds(s => new Set([...s, modal.vacancyId]))
      setModalMsg({ text: 'Applied successfully!', type: 'success' })
    } catch (err) {
      const rawMsg = err.response?.data
      const msg = typeof rawMsg === 'string' ? rawMsg : (rawMsg?.message || rawMsg?.error || '')
      if (typeof msg === 'string' && msg.toLowerCase().includes('already applied')) {
        setModalMsg({ text: 'You have already applied for this position.', type: 'warning' })
      } else if (typeof msg === 'string' && msg.toLowerCase().includes('cannot re-apply')) {
        setModalMsg({ text: msg, type: 'warning' })
      } else {
        setModalMsg({ text: 'Failed to apply. Please try again.', type: 'danger' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <CandidateNavbar />
      <div className="container mt-4">
        <h4 className="mb-4">Job Search</h4>
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Filter by location"
              value={filters.location}
              onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
            />
          </div>
          <div className="col-md-4">
            <input
              type="number"
              className="form-control"
              placeholder="Max salary (₹)"
              value={filters.salaryMax}
              onChange={e => setFilters(f => ({ ...f, salaryMax: e.target.value }))}
            />
          </div>
        </div>
        <div className="row g-4">
          {filtered.map(v => (
            <div className="col-md-4" key={v.vacancyId}>
              <div className="card recpro-card h-100 d-flex flex-column">
                <div className="card-body flex-grow-1">
                  <h5 className="card-title fw-bold mb-1">{v.designation}</h5>
                  <p className="card-text mb-2 fw-semibold" style={{ color: '#2563eb', fontSize: 14 }}>{v.orgName || v.employerOrgName}</p>
                  <p className="card-text mb-1"><small><FaMapMarkerAlt color="#6c757d" className="me-1" />{v.location}</small></p>
                  <p className="card-text mb-1"><small><FaMoneyBillWave color="#6c757d" className="me-1" />{formatSalary(v.salaryMin)} – {formatSalary(v.salaryMax)}</small></p>
                  <p className="card-text mb-2"><small><FaCalendarAlt color="#6c757d" className="me-1" />Deadline: {v.applicationDeadline}</small></p>
                  {v.jobDescription && (
                    <p className="card-text text-muted small mb-0" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {v.jobDescription}
                    </p>
                  )}
                </div>
                <div className="card-footer d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-primary btn-sm flex-grow-1"
                    onClick={() => appliedIds.has(v.vacancyId) ? null : setDetailVacancy(v)}
                    disabled={appliedIds.has(v.vacancyId)}
                  >
                    {appliedIds.has(v.vacancyId) ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-muted">No vacancies found.</p>}
        </div>
      </div>

      {/* Job Detail Modal */}
      {detailVacancy && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setDetailVacancy(null)}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header" style={{ background: '#0f172a', color: '#fff' }}>
                <div>
                  <h5 className="modal-title fw-bold mb-0">{detailVacancy.designation}</h5>
                  <p className="mb-0 fw-semibold" style={{ color: '#60a5fa', fontSize: 15 }}>{detailVacancy.orgName || detailVacancy.employerOrgName}</p>
                </div>
                <button className="btn-close btn-close-white" onClick={() => setDetailVacancy(null)} />
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-4">
                  {[
                    ['📍 Location', detailVacancy.location],
                    ['💰 Salary', `${formatSalary(detailVacancy.salaryMin)} – ${formatSalary(detailVacancy.salaryMax)}`],
                    ['🗓 Deadline', detailVacancy.applicationDeadline],
                    ['🏢 Employment Type', detailVacancy.employmentType],
                    ['🎓 Qualification', detailVacancy.requiredQual],
                    ['⏳ Experience', `${detailVacancy.requiredExpYrs} yr(s)`],
                    ['👥 Openings', detailVacancy.numOpenings],
                    ['🏬 Department', detailVacancy.department],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div className="col-md-6" key={label}>
                      <div className="text-muted small">{label}</div>
                      <div className="fw-semibold">{value}</div>
                    </div>
                  ))}
                </div>
                {detailVacancy.jobDescription && (
                  <>
                    <hr />
                    <h6 className="fw-bold mb-3">Job Description</h6>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.8, color: '#374151' }}>
                      {detailVacancy.jobDescription}
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDetailVacancy(null)}>Close</button>
                <button
                  className="btn btn-primary"
                  onClick={() => { setDetailVacancy(null); openModal(detailVacancy) }}
                  disabled={appliedIds.has(detailVacancy.vacancyId)}
                >
                  {appliedIds.has(detailVacancy.vacancyId) ? 'Already Applied' : 'Apply Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Apply — {modal.designation}</h5>
                <button type="button" className="btn-close" onClick={closeModal} />
              </div>
              <div className="modal-body">
                {modalMsg.text && <div className={`alert alert-${modalMsg.type}`}>{modalMsg.text}</div>}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Resume <span className="text-danger">*</span></label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className={`form-control ${resumeError ? 'is-invalid' : ''}`}
                    onChange={handleFileChange}
                    disabled={appliedIds.has(modal.vacancyId) || submitting}
                  />
                  {resumeError && <div className="invalid-feedback">{resumeError}</div>}
                  {resumeFile && !resumeError && (
                    <div className="form-text text-success">
                      ✓ {resumeFile.name} ({(resumeFile.size / 1024).toFixed(0)} KB)
                    </div>
                  )}
                  <div className="form-text">PDF only, max 5 MB</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Cover Note</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={coverNote}
                    onChange={e => setCoverNote(e.target.value)}
                    disabled={appliedIds.has(modal.vacancyId) || submitting}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal} disabled={submitting}>Close</button>
                <button
                  className="btn btn-primary"
                  onClick={handleApply}
                  disabled={appliedIds.has(modal.vacancyId) || submitting}
                >
                  {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</> : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportModal && (
        <ReportModal
          vacancy={reportModal}
          onClose={() => setReportModal(null)}
        />
      )}
    </>
  )
}
