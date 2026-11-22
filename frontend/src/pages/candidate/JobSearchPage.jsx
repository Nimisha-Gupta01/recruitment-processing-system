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

function formatSalary(n) {
  return `₹${(n / 100000).toFixed(1)}L`
}

export default function JobSearchPage() {
  const [vacancies, setVacancies] = useState([])
  const [filters, setFilters] = useState({ location: '', salaryMax: '' })
  const [modal, setModal] = useState(null)
  const [coverNote, setCoverNote] = useState('')
  const [modalMsg, setModalMsg] = useState({ text: '', type: '' })
  const [appliedIds, setAppliedIds] = useState(new Set())

  useEffect(() => {
    api.get('/vacancies/open')
      .then(r => setVacancies(r.data))
      .catch(() => {
        // TODO: remove mock
        setVacancies([
          { vacancyId: 1, designation: 'Software Engineer', employerOrgName: 'TechCorp', location: 'Bangalore', salaryMin: 600000, salaryMax: 1200000, applicationDeadline: '2026-11-30' }
        ])
      })
  }, [])

  const filtered = vacancies.filter(v => {
    if (filters.location && !v.location.toLowerCase().includes(filters.location.toLowerCase())) return false
    if (filters.salaryMax && v.salaryMax > Number(filters.salaryMax)) return false
    return true
  })

  function openModal(vacancy) {
    setModal(vacancy)
    setCoverNote('')
    setModalMsg({ text: '', type: '' })
  }

  function closeModal() {
    setModal(null)
  }

  async function handleApply() {
    setModalMsg({ text: '', type: '' })
    try {
      await api.post('/applications', { vacancyId: modal.vacancyId, coverNote })
      setAppliedIds(s => new Set([...s, modal.vacancyId]))
      setModalMsg({ text: 'Applied successfully!', type: 'success' })
    } catch (err) {
      const rawMsg = err.response?.data
      const msg = typeof rawMsg === 'string' ? rawMsg : (rawMsg?.message || rawMsg?.error || '')
      if (typeof msg === 'string' && msg.toLowerCase().includes('already applied')) {
        setModalMsg({ text: 'You have already applied for this position.', type: 'warning' })
      } else {
        setModalMsg({ text: 'Failed to apply. Please try again.', type: 'danger' })
      }
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
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{v.designation}</h5>
                  <p className="card-text text-muted mb-1">{v.employerOrgName}</p>
                  <p className="card-text mb-1"><small>📍 {v.location}</small></p>
                  <p className="card-text mb-1"><small>💰 {formatSalary(v.salaryMin)} – {formatSalary(v.salaryMax)}</small></p>
                  <p className="card-text"><small>Deadline: {v.applicationDeadline}</small></p>
                </div>
                <div className="card-footer">
                  <button
                    className="btn btn-primary btn-sm w-100"
                    onClick={() => openModal(v)}
                    disabled={appliedIds.has(v.vacancyId)}
                  >
                    {appliedIds.has(v.vacancyId) ? 'Applied' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-muted">No vacancies found.</p>}
        </div>
      </div>

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
                <label className="form-label">Cover Note</label>
                <textarea
                  className="form-control"
                  rows={5}
                  value={coverNote}
                  onChange={e => setCoverNote(e.target.value)}
                  disabled={appliedIds.has(modal.vacancyId)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>Close</button>
                <button
                  className="btn btn-primary"
                  onClick={handleApply}
                  disabled={appliedIds.has(modal.vacancyId)}
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
