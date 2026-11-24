import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios.js'

const STATUS_GROUPS = {
  Active: ['Applied', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Offered'],
  Recruited: ['Recruited'],
  Rejected: ['Rejected'],
  Withdrawn: ['Withdrawn'],
}

function StatCard({ label, value, color, bg }) {
  return (
    <div className="card border-0 text-center py-3 shadow-sm h-100" style={{ background: bg }}>
      <div className="fw-bold" style={{ fontSize: 28, color }}>{value}</div>
      <div style={{ fontSize: 11, color, fontWeight: 500, lineHeight: 1.3 }}>{label}</div>
    </div>
  )
}

function EmployerNavbar() {
  const navigate = useNavigate()
  function logout() { localStorage.clear(); navigate('/') }
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <span className="navbar-brand" style={{ color: '#fff' }}>RecPro</span>
      <div className="navbar-nav ms-auto d-flex flex-row gap-3">
        <button className="btn btn-link text-white text-decoration-none" onClick={() => navigate('/employer/dashboard')}>Dashboard</button>
        <button className="btn btn-link text-white text-decoration-none" onClick={() => navigate('/employer/applications')}>Applications</button>
        <button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}

function countByStatus(applications, statuses) {
  return applications.filter(a => statuses.includes(a.status)).length
}

export default function EmployerReportPage() {
  const [vacancies, setVacancies] = useState([])
  const [allApplications, setAllApplications] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const orgName = localStorage.getItem('orgName') || localStorage.getItem('name') || 'Company'
  const contactName = localStorage.getItem('name') || ''
  const generatedOn = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

  useEffect(() => {
    api.get('/employer/vacancies')
      .then(async res => {
        const vacs = res.data
        setVacancies(vacs)
        // Load applications for each vacancy in parallel
        const appMap = {}
        await Promise.all(vacs.map(async v => {
          try {
            const r = await api.get(`/employer/applications?vacancyId=${v.vacancyId}`)
            appMap[v.vacancyId] = r.data
          } catch {
            appMap[v.vacancyId] = []
          }
        }))
        setAllApplications(appMap)
      })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false))
  }, [])

  const flatApps = Object.values(allApplications).flat()

  const totals = {
    vacancies: vacancies.length,
    applications: flatApps.length,
    shortlisted: flatApps.filter(a => ['Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Offered', 'Recruited'].includes(a.status)).length,
    interviewed: flatApps.filter(a => ['Interview Completed', 'Selected', 'Offered', 'Recruited'].includes(a.status)).length,
    recruited: flatApps.filter(a => a.status === 'Recruited').length,
    rejected: flatApps.filter(a => a.status === 'Rejected').length,
  }

  return (
    <>
      <div className="no-print">
        <EmployerNavbar />
      </div>

      <div className="container mt-4" style={{ maxWidth: 1000 }}>
        {/* Controls */}
        <div className="d-flex justify-content-between align-items-center mb-4 no-print">
          <div>
            <h4 className="fw-bold mb-0">Recruitment Report</h4>
            <p className="text-muted mb-0 small">Summary of all vacancies, interviews conducted, and recruitment outcomes</p>
          </div>
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => window.print()}>
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
          <>
            {/* Report Header */}
            <div className="card border-0 shadow-sm mb-4" style={{ background: '#0f172a', color: '#fff', borderRadius: 8 }}>
              <div className="card-body px-4 py-4">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                  <div>
                    <h2 className="fw-bold mb-1" style={{ color: '#60a5fa' }}>RecPro</h2>
                    <p className="mb-0" style={{ color: '#94a3b8', fontSize: 13 }}>Online Recruitment Processing System</p>
                  </div>
                  <div className="text-end">
                    <div className="fw-semibold" style={{ fontSize: 15 }}>Recruitment Summary Report</div>
                    <div style={{ color: '#94a3b8', fontSize: 13 }}>Generated: {generatedOn}</div>
                  </div>
                </div>
                <hr style={{ borderColor: '#334155', margin: '16px 0' }} />
                <div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>Organisation</div>
                  <div className="fw-bold fs-5">{orgName}</div>
                  {contactName && orgName !== contactName && (
                    <div style={{ color: '#94a3b8', fontSize: 13 }}>Contact: {contactName}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="row g-3 mb-4">
              {[
                { label: 'Total Vacancies', value: totals.vacancies, color: '#0d6efd', bg: '#e7f1ff' },
                { label: 'Total Applications', value: totals.applications, color: '#6f42c1', bg: '#ede7f6' },
                { label: 'Shortlisted', value: totals.shortlisted, color: '#0dcaf0', bg: '#e3f8fb' },
                { label: 'Interviews Conducted', value: totals.interviewed, color: '#fd7e14', bg: '#fff3cd' },
                { label: 'Recruited', value: totals.recruited, color: '#198754', bg: '#d1e7dd' },
                { label: 'Rejected', value: totals.rejected, color: '#dc3545', bg: '#f8d7da' },
              ].map(s => (
                <div className="col-6 col-md-4 col-lg-2" key={s.label}>
                  <StatCard {...s} />
                </div>
              ))}
            </div>

            {/* Per-Vacancy Breakdown */}
            {vacancies.length === 0 ? (
              <div className="text-center py-5 text-muted">No vacancies found.</div>
            ) : (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-dark text-white px-4 py-3">
                  <h6 className="mb-0 fw-semibold">Per-Vacancy Recruitment Breakdown</h6>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-hover mb-0">
                    <thead style={{ background: '#f8f9fa' }}>
                      <tr>
                        <th>#</th>
                        <th>Position</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th className="text-center">Applications</th>
                        <th className="text-center">Shortlisted</th>
                        <th className="text-center">Interviewed</th>
                        <th className="text-center">Recruited</th>
                        <th className="text-center">Rejected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vacancies.map((v, idx) => {
                        const apps = allApplications[v.vacancyId] || []
                        const shortlisted = countByStatus(apps, ['Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Offered', 'Recruited'])
                        const interviewed = countByStatus(apps, ['Interview Completed', 'Selected', 'Offered', 'Recruited'])
                        const recruited = countByStatus(apps, ['Recruited'])
                        const rejected = countByStatus(apps, ['Rejected'])
                        return (
                          <tr key={v.vacancyId}>
                            <td className="text-muted" style={{ fontSize: 13 }}>{idx + 1}</td>
                            <td className="fw-semibold">{v.designation}</td>
                            <td>{v.location}</td>
                            <td>
                              <span className={`badge ${v.status === 'Open' ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: 11 }}>
                                {v.status || 'Open'}
                              </span>
                            </td>
                            <td className="text-center">{apps.length}</td>
                            <td className="text-center">{shortlisted}</td>
                            <td className="text-center">{interviewed}</td>
                            <td className="text-center">
                              <span style={{ color: '#198754', fontWeight: 600 }}>{recruited}</span>
                            </td>
                            <td className="text-center">
                              <span style={{ color: '#dc3545', fontWeight: 600 }}>{rejected}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot style={{ background: '#f8f9fa', fontWeight: 600 }}>
                      <tr>
                        <td colSpan={4} className="text-end">Total</td>
                        <td className="text-center">{totals.applications}</td>
                        <td className="text-center">{totals.shortlisted}</td>
                        <td className="text-center">{totals.interviewed}</td>
                        <td className="text-center" style={{ color: '#198754' }}>{totals.recruited}</td>
                        <td className="text-center" style={{ color: '#dc3545' }}>{totals.rejected}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Candidates Recruited */}
            {totals.recruited > 0 && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header px-4 py-3" style={{ background: '#198754', color: '#fff' }}>
                  <h6 className="mb-0 fw-semibold">Successfully Recruited Candidates</h6>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-hover mb-0">
                    <thead style={{ background: '#f8f9fa' }}>
                      <tr>
                        <th>#</th>
                        <th>Candidate Name</th>
                        <th>Position</th>
                        <th>Applied On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flatApps.filter(a => a.status === 'Recruited').map((app, idx) => (
                        <tr key={app.applicationId}>
                          <td className="text-muted">{idx + 1}</td>
                          <td className="fw-semibold">{app.candidateName}</td>
                          <td>{app.vacancyTitle}</td>
                          <td style={{ fontSize: 13 }}>
                            {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
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
          </>
        )}
      </div>

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
