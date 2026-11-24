import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios.js'

const STATUS_COLOR = {
  Applied: { bg: '#e9ecef', color: '#495057' },
  Shortlisted: { bg: '#cfe2ff', color: '#084298' },
  'Interview Scheduled': { bg: '#cff4fc', color: '#055160' },
  'Interview Completed': { bg: '#fff3cd', color: '#664d03' },
  Selected: { bg: '#d1e7dd', color: '#0a3622' },
  Offered: { bg: '#d0f0c0', color: '#1a5c20' },
  Recruited: { bg: '#198754', color: '#fff' },
  Rejected: { bg: '#f8d7da', color: '#842029' },
  Withdrawn: { bg: '#e2e3e5', color: '#41464b' },
}

function StatusBadge({ status }) {
  const s = STATUS_COLOR[status] || { bg: '#e9ecef', color: '#495057' }
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 12,
      fontSize: 12, fontWeight: 600, background: s.bg, color: s.color,
    }}>
      {status}
    </span>
  )
}

function CandidateNavbar() {
  const navigate = useNavigate()
  function logout() { localStorage.clear(); navigate('/') }
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <span className="navbar-brand recpro-brand" style={{ color: '#fff' }}>RecPro</span>
      <div className="navbar-nav ms-auto d-flex flex-row gap-3">
        <button className="btn btn-link text-white text-decoration-none" onClick={() => navigate('/candidate/dashboard')}>Dashboard</button>
        <button className="btn btn-link text-white text-decoration-none" onClick={() => navigate('/candidate/applications')}>My Applications</button>
        <button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}

export default function CandidateReportPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const name = localStorage.getItem('name') || 'Candidate'
  const printRef = useRef()

  useEffect(() => {
    api.get('/applications/my')
      .then(r => setApplications(r.data))
      .catch(() => setError('Failed to load applications.'))
      .finally(() => setLoading(false))
  }, [])

  function handlePrint() {
    window.print()
  }

  const summary = {
    total: applications.length,
    shortlisted: applications.filter(a => ['Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Offered', 'Recruited'].includes(a.status)).length,
    selected: applications.filter(a => ['Selected', 'Offered', 'Recruited'].includes(a.status)).length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
    pending: applications.filter(a => a.status === 'Applied').length,
  }

  const generatedOn = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <>
      <div className="no-print">
        <CandidateNavbar />
      </div>

      <div className="container mt-4" style={{ maxWidth: 900 }}>
        {/* Controls — hidden on print */}
        <div className="d-flex justify-content-between align-items-center mb-4 no-print">
          <div>
            <h4 className="fw-bold mb-0">My Application Report</h4>
            <p className="text-muted mb-0 small">A complete record of all your job applications</p>
          </div>
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handlePrint}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
              <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zm4 11.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1h2zM9.5 4h-3V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1z"/>
            </svg>
            Print / Save as PDF
          </button>
        </div>

        {loading && <div className="text-center py-5"><div className="spinner-border text-primary" /></div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && (
          <div ref={printRef}>
            {/* Report Header */}
            <div className="card border-0 shadow-sm mb-4" style={{ background: '#0f172a', color: '#fff', borderRadius: 8 }}>
              <div className="card-body px-4 py-4">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                  <div>
                    <h2 className="fw-bold mb-1" style={{ color: '#60a5fa' }}>RecPro</h2>
                    <p className="mb-0" style={{ color: '#94a3b8', fontSize: 13 }}>Online Recruitment Processing System</p>
                  </div>
                  <div className="text-end">
                    <div className="fw-semibold" style={{ fontSize: 15 }}>Application Report</div>
                    <div style={{ color: '#94a3b8', fontSize: 13 }}>Generated: {generatedOn}</div>
                  </div>
                </div>
                <hr style={{ borderColor: '#334155', margin: '16px 0' }} />
                <div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>Candidate Name</div>
                  <div className="fw-bold fs-5">{name}</div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="row g-3 mb-4">
              {[
                { label: 'Total Applications', value: summary.total, color: '#0d6efd', bg: '#e7f1ff' },
                { label: 'Shortlisted / Progressed', value: summary.shortlisted, color: '#0dcaf0', bg: '#e3f8fb' },
                { label: 'Selected / Offered / Recruited', value: summary.selected, color: '#198754', bg: '#d1e7dd' },
                { label: 'Rejected', value: summary.rejected, color: '#dc3545', bg: '#f8d7da' },
                { label: 'Pending Review', value: summary.pending, color: '#6c757d', bg: '#e9ecef' },
              ].map(s => (
                <div className="col-6 col-md-4 col-lg" key={s.label}>
                  <div className="card border-0 text-center py-3 shadow-sm h-100" style={{ background: s.bg }}>
                    <div className="fw-bold" style={{ fontSize: 28, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: s.color, fontWeight: 500, lineHeight: 1.3 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Applications Table */}
            {applications.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p>No applications found.</p>
              </div>
            ) : (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-dark text-white px-4 py-3">
                  <h6 className="mb-0 fw-semibold">Application Details</h6>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-hover mb-0">
                    <thead style={{ background: '#f8f9fa' }}>
                      <tr>
                        <th style={{ width: 32 }}>#</th>
                        <th>Position</th>
                        <th>Company</th>
                        <th>Applied On</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app, idx) => (
                        <tr key={app.applicationId}>
                          <td className="text-muted" style={{ fontSize: 13 }}>{idx + 1}</td>
                          <td className="fw-semibold">{app.vacancyTitle}</td>
                          <td>{app.employerOrgName}</td>
                          <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                            {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td><StatusBadge status={app.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Print footer */}
            <div className="text-center text-muted mt-4 print-only" style={{ fontSize: 12 }}>
              RecPro — Online Recruitment Processing System &nbsp;|&nbsp; Confidential &nbsp;|&nbsp; Generated {generatedOn}
            </div>
          </div>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .container { max-width: 100% !important; }
          .shadow-sm { box-shadow: none !important; }
        }
        @media screen {
          .print-only { display: none; }
        }
      `}</style>
    </>
  )
}
