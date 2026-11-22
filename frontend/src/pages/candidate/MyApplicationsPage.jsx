import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios.js'

function CandidateNavbar() {
  const navigate = useNavigate()
  function logout() { localStorage.clear(); navigate('/') }
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <span className="navbar-brand">RPS</span>
      <div className="navbar-nav ms-auto d-flex flex-row gap-3">
        <button className="btn btn-link text-white text-decoration-none" onClick={() => navigate('/candidate/profile')}>Profile</button>
        <button className="btn btn-link text-white text-decoration-none" onClick={() => navigate('/candidate/jobs')}>Job Search</button>
        <button className="btn btn-link text-white text-decoration-none" onClick={() => navigate('/candidate/applications')}>My Applications</button>
        <button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}

const statusBadge = {
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

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([])

  useEffect(() => {
    api.get('/applications/my')
      .then(r => setApplications(r.data))
      .catch(() => {
        // TODO: remove mock
        setApplications([
          { applicationId: 1, vacancyTitle: 'Software Engineer', employerOrgName: 'TechCorp', appliedAt: '2026-11-16T10:00:00', status: 'Applied' }
        ])
      })
  }, [])

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <>
      <CandidateNavbar />
      <div className="container mt-4">
        <h4 className="mb-4">My Applications</h4>
        {applications.length === 0 ? (
          <p className="text-muted">No applications yet.</p>
        ) : (
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Vacancy</th>
                <th>Company</th>
                <th>Applied Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(a => (
                <tr key={a.applicationId}>
                  <td>{a.vacancyTitle}</td>
                  <td>{a.employerOrgName}</td>
                  <td>{formatDate(a.appliedAt)}</td>
                  <td>
                    <span className={`badge bg-${statusBadge[a.status] || 'secondary'}`}>{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
