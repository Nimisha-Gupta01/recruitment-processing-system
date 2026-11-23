import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaFileAlt, FaUserCircle, FaBell } from 'react-icons/fa'
import api from '../../api/axios.js'

export default function CandidateDashboard() {
  const navigate = useNavigate()
  const name = localStorage.getItem('name') || 'Candidate'
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    api.get('/notifications')
      .then(r => setNotifCount(r.data.length))
      .catch(() => {})
  }, [])

  function logout() {
    localStorage.clear()
    navigate('/')
  }

  const quickActions = [
    {
      icon: <FaSearch size={36} color="#2563eb" />,
      label: 'Search Jobs',
      description: 'Browse and apply for open vacancies',
      path: '/candidate/jobs',
    },
    {
      icon: <FaFileAlt size={36} color="#10b981" />,
      label: 'My Applications',
      description: 'Track your application status',
      path: '/candidate/applications',
    },
    {
      icon: <FaUserCircle size={36} color="#f59e0b" />,
      label: 'My Profile',
      description: 'Update your skills and preferences',
      path: '/candidate/profile',
    },
    {
      icon: <FaBell size={36} color="#8b5cf6" />,
      label: 'Notifications',
      description: 'View interview schedules and updates',
      path: '/candidate/notifications',
      badge: notifCount,
    },
  ]

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
        <span className="navbar-brand recpro-brand" style={{ color: '#fff', fontSize: '1.3rem' }}>RecPro</span>
        <div className="navbar-nav ms-auto d-flex flex-row align-items-center">
          <button className="btn btn-link nav-link text-white" onClick={() => navigate('/candidate/profile')}>Profile</button>
          <button className="btn btn-link nav-link text-white position-relative me-2" onClick={() => navigate('/candidate/notifications')}>
            <FaBell size={18} />
            {notifCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: 10 }}>
                {notifCount}
              </span>
            )}
          </button>
          <button className="btn btn-outline-light" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="container mt-5">
        <h2 className="mb-1">Welcome, {name}!</h2>
        <p className="text-muted mb-4">Here's a quick overview of your job search tools.</p>

        <div className="row g-4 mb-4">
          {quickActions.map(action => (
            <div className="col-md-3" key={action.label}>
              <div
                className="card recpro-card text-center p-4 h-100 position-relative"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(action.path)}
              >
                <div className="mb-3">{action.icon}</div>
                <div className="fw-semibold">{action.label}</div>
                <div className="text-muted small mt-1">{action.description}</div>
                {action.badge > 0 && (
                  <span className="position-absolute top-0 end-0 m-2 badge rounded-pill bg-danger" style={{ fontSize: 11 }}>
                    {action.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
