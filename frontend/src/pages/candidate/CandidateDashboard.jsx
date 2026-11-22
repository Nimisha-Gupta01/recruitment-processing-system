import { useNavigate } from 'react-router-dom'

export default function CandidateDashboard() {
  const navigate = useNavigate()
  const name = localStorage.getItem('name') || 'Candidate'

  function logout() {
    localStorage.clear()
    navigate('/')
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
        <span className="navbar-brand">RPS</span>
        <div className="navbar-nav ms-auto d-flex flex-row gap-3">
          <button className="btn btn-link text-white text-decoration-none" onClick={() => navigate('/candidate/profile')}>Profile</button>
          <button className="btn btn-link text-white text-decoration-none" onClick={() => navigate('/candidate/jobs')}>Job Search</button>
          <button className="btn btn-link text-white text-decoration-none" onClick={() => navigate('/candidate/applications')}>My Applications</button>
          <button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
        </div>
      </nav>
      <div className="container mt-5">
        <h2>Welcome, {name}!</h2>
        <p className="text-muted">Use the navigation above to explore job opportunities and manage your applications.</p>
      </div>
    </>
  )
}
