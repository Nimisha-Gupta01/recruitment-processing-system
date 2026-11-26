import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios.js'

function AdminNavbar() {
  const navigate = useNavigate()
  function logout() {
    api.post('/auth/logout').catch(() => {})
    localStorage.clear()
    navigate('/admin/login')
  }
  return (
    <nav className="navbar navbar-dark px-4" style={{ backgroundColor: '#0f172a' }}>
      <span className="navbar-brand fw-bold" style={{ color: '#60a5fa' }}>RecPro</span>
      <span className="text-white-50 small me-auto ms-3">Admin Panel</span>
      <button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
    </nav>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="col-md-4 col-6">
      <div className="card text-center shadow-sm py-3">
        <div className="fw-bold fs-2" style={{ color }}>{value ?? '—'}</div>
        <div className="text-muted small">{label}</div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  if (value == null || value === '') return null
  return (
    <div className="row mb-2">
      <div className="col-5 text-muted small fw-semibold">{label}</div>
      <div className="col-7 small">{value}</div>
    </div>
  )
}

function ReportBell({ count, onClick }) {
  if (count === 0) return (
    <span className="text-muted small">—</span>
  )
  return (
    <button
      className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 py-0 px-2"
      onClick={onClick}
      title={`${count} report(s)`}
    >
      <span>🔔</span>
      <span className="fw-bold">{count}</span>
    </button>
  )
}

function ReportsSection({ reports }) {
  if (!reports || reports.length === 0) return null
  return (
    <div className="mt-4 border-top pt-3">
      <h6 className="text-danger mb-2">🔔 Reports ({reports.length})</h6>
      <div className="list-group">
        {reports.map(r => (
          <div key={r.reportId} className="list-group-item list-group-item-warning py-2 px-3">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="badge bg-secondary me-2">{r.reporterType}</span>
                <strong className="small">{r.reporterName}</strong>
              </div>
              <small className="text-muted">{r.createdAt?.split('T')[0]}</small>
            </div>
            <p className="mb-0 mt-1 small">{r.reason}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CandidateModal({ candidate: c, onClose, onToggle }) {
  const [reports, setReports] = useState(null)

  useEffect(() => {
    if (!c) return
    api.get(`/admin/candidates/${c.id}/reports`)
      .then(r => setReports(r.data))
      .catch(() => setReports([]))
  }, [c])

  if (!c) return null
  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Candidate Profile
              <span className={`badge ms-2 bg-${c.active ? 'success' : 'secondary'}`}>
                {c.active ? 'Active' : 'Inactive'}
              </span>
              {c.role === 'ADMIN' && <span className="badge ms-1 bg-dark">Admin</span>}
              {c.reportCount > 0 && (
                <span className="badge ms-1 bg-danger">🔔 {c.reportCount} reports</span>
              )}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <h6 className="text-primary mb-3">{c.name}</h6>
            <div className="row">
              <div className="col-md-6">
                <DetailRow label="Email" value={c.email} />
                <DetailRow label="Phone" value={c.phone} />
                <DetailRow label="Date of Birth" value={c.dob} />
                <DetailRow label="Gender" value={c.gender} />
                <DetailRow label="Address" value={c.address} />
                <DetailRow label="Registered On" value={c.createdAt?.split('T')[0]} />
              </div>
              <div className="col-md-6">
                <DetailRow label="Degree" value={c.degree} />
                <DetailRow label="Institution" value={c.institution} />
                <DetailRow label="Year of Passing" value={c.yearOfPassing} />
                <DetailRow label="Percentage" value={c.percentage != null ? `${c.percentage}%` : null} />
                <DetailRow label="Experience" value={c.totalExpYrs != null ? `${c.totalExpYrs} yrs` : null} />
                <DetailRow label="Expected Salary" value={
                  c.expectedSalMin && c.expectedSalMax
                    ? `₹${(c.expectedSalMin / 100000).toFixed(1)}L – ₹${(c.expectedSalMax / 100000).toFixed(1)}L`
                    : null
                } />
              </div>
            </div>
            <ReportsSection reports={reports} />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            {c.role !== 'ADMIN' && (
              c.active
                ? <button className="btn btn-warning" onClick={() => onToggle(c.id, false)}>Deactivate</button>
                : <button className="btn btn-success" onClick={() => onToggle(c.id, true)}>Activate</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmployerModal({ employer: e, onClose, onToggle }) {
  const [reports, setReports] = useState(null)

  useEffect(() => {
    if (!e) return
    api.get(`/admin/employers/${e.id}/reports`)
      .then(r => setReports(r.data))
      .catch(() => setReports([]))
  }, [e])

  if (!e) return null
  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Employer Profile
              <span className={`badge ms-2 bg-${e.active ? 'success' : 'warning text-dark'}`}>
                {e.active ? 'Active' : 'Pending Approval'}
              </span>
              {e.reportCount > 0 && (
                <span className="badge ms-1 bg-danger">🔔 {e.reportCount} reports</span>
              )}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <h6 className="text-primary mb-3">{e.orgName}</h6>
            <div className="row">
              <div className="col-md-6">
                <DetailRow label="Contact Name" value={e.contactName} />
                <DetailRow label="Email" value={e.email} />
                <DetailRow label="Phone" value={e.phone} />
                <DetailRow label="Address" value={e.address} />
                <DetailRow label="Website" value={e.website} />
                <DetailRow label="Registered On" value={e.createdAt?.split('T')[0]} />
              </div>
              <div className="col-md-6">
                <DetailRow label="Established" value={e.establishedYr} />
                <DetailRow label="No. of Employees" value={e.numEmployees} />
                <DetailRow label="Annual Turnover" value={
                  e.annualTurnover != null
                    ? `₹${(e.annualTurnover / 10000000).toFixed(2)} Cr`
                    : null
                } />
              </div>
            </div>
            <ReportsSection reports={reports} />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            {e.active
              ? <button className="btn btn-warning" onClick={() => onToggle(e.id, false)}>Deactivate</button>
              : <button className="btn btn-success" onClick={() => onToggle(e.id, true)}>Approve & Activate</button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [employers, setEmployers] = useState([])
  const [tab, setTab] = useState('employers')
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [selectedEmployer, setSelectedEmployer] = useState(null)

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {})
    api.get('/admin/candidates').then(r => setCandidates(r.data)).catch(() => {})
    api.get('/admin/employers').then(r => setEmployers(r.data)).catch(() => {})
  }, [])

  function flash(text, type = 'success') {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: '' }), 3000)
  }

  async function toggleCandidate(id, active) {
    const path = active ? 'activate' : 'deactivate'
    await api.patch(`/admin/candidates/${id}/${path}`)
    setCandidates(cs => cs.map(c => c.id === id ? { ...c, active } : c))
    setSelectedCandidate(prev => prev?.id === id ? { ...prev, active } : prev)
    flash(`Candidate ${active ? 'activated' : 'deactivated'}.`)
  }

  async function toggleEmployer(id, active) {
    const path = active ? 'activate' : 'deactivate'
    await api.patch(`/admin/employers/${id}/${path}`)
    setEmployers(es => es.map(e => e.id === id ? { ...e, active } : e))
    setSelectedEmployer(prev => prev?.id === id ? { ...prev, active } : prev)
    flash(`Employer ${active ? 'activated' : 'deactivated'}.`)
  }

  const pendingEmployers = employers.filter(e => !e.active).length

  return (
    <>
      <AdminNavbar />
      <div className="container my-4">
        {msg.text && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}

        <h5 className="mb-3">Platform Overview</h5>
        <div className="row g-3 mb-5">
          <StatCard label="Total Candidates" value={stats?.totalCandidates} color="#2563eb" />
          <StatCard label="Total Employers" value={stats?.totalEmployers} color="#7c3aed" />
          <StatCard label="Total Vacancies" value={stats?.totalVacancies} color="#059669" />
          <StatCard label="Open Vacancies" value={stats?.openVacancies} color="#10b981" />
          <StatCard label="Total Applications" value={stats?.totalApplications} color="#d97706" />
        </div>

        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <button className={`nav-link ${tab === 'employers' ? 'active' : ''}`} onClick={() => setTab('employers')}>
              Employers ({employers.length})
              {pendingEmployers > 0 && (
                <span className="badge bg-warning text-dark ms-1">{pendingEmployers} pending</span>
              )}
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${tab === 'candidates' ? 'active' : ''}`} onClick={() => setTab('candidates')}>
              Candidates ({candidates.length})
            </button>
          </li>
        </ul>

        {tab === 'employers' && (
          <div className="d-flex flex-column gap-2">
            {employers.map(e => (
              <div key={e.id} className="card shadow-sm" style={{ borderRadius: 10, border: '1px solid #e5e7eb' }}>
                <div className="card-body py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div>
                    <div className="fw-bold">{e.orgName}</div>
                    <div className="text-muted small">{e.email}</div>
                    <div className="mt-1 d-flex gap-2 align-items-center">
                      <span style={{
                        background: e.active ? '#f0fdf4' : '#fffbeb',
                        color: e.active ? '#16a34a' : '#d97706',
                        border: `1px solid ${e.active ? '#bbf7d0' : '#fde68a'}`,
                        borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600,
                      }}>
                        {e.active ? 'Active' : 'Pending'}
                      </span>
                      {e.reportCount > 0 && (
                        <ReportBell count={e.reportCount} onClick={() => setSelectedEmployer(e)} />
                      )}
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedEmployer(e)}>View</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'candidates' && (
          <div className="d-flex flex-column gap-2">
            {candidates.map(c => (
              <div key={c.id} className="card shadow-sm" style={{ borderRadius: 10, border: '1px solid #e5e7eb' }}>
                <div className="card-body py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div>
                    <div className="fw-bold">{c.name}</div>
                    <div className="text-muted small">{c.email}</div>
                    <div className="mt-1 d-flex gap-2 align-items-center">
                      <span style={{
                        background: c.active ? '#f0fdf4' : '#f9fafb',
                        color: c.active ? '#16a34a' : '#6b7280',
                        border: `1px solid ${c.active ? '#bbf7d0' : '#e5e7eb'}`,
                        borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600,
                      }}>
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                      {c.role === 'ADMIN' && (
                        <span style={{ background: '#1e293b', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>Admin</span>
                      )}
                      {c.reportCount > 0 && (
                        <ReportBell count={c.reportCount} onClick={() => setSelectedCandidate(c)} />
                      )}
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedCandidate(c)}>View</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onToggle={toggleCandidate}
        />
      )}

      {selectedEmployer && (
        <EmployerModal
          employer={selectedEmployer}
          onClose={() => setSelectedEmployer(null)}
          onToggle={toggleEmployer}
        />
      )}
    </>
  )
}
