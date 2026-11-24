import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaFileAlt, FaUserCircle, FaBell, FaCalendarCheck } from 'react-icons/fa'
import api from '../../api/axios.js'

export default function CandidateDashboard() {
  const navigate = useNavigate()
  const name = localStorage.getItem('name') || 'Candidate'
  const [notifCount, setNotifCount] = useState(0)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/notifications')
      .then(r => setNotifCount(r.data.length))
      .catch(() => {})

    loadStats()
  }, [])

  async function loadStats() {
    try {
      const [appsRes, intRes] = await Promise.all([
        api.get('/applications/my'),
        api.get('/candidate/interviews').catch(() => ({ data: [] })),
      ])
      const apps = appsRes.data
      const interviews = intRes.data

      const totalApplications = apps.filter(a => a.status !== 'Withdrawn').length
      const interviewsScheduled = apps.filter(a => a.status === 'Interview Scheduled').length
      const shortlisted = apps.filter(a => a.status === 'Shortlisted').length
      const selected = apps.filter(a => a.status === 'Selected').length

      setStats({ totalApplications, interviewsScheduled, shortlisted, selected })
    } catch {
      setStats({ totalApplications: 0, interviewsScheduled: 0, shortlisted: 0, selected: 0 })
    }
  }

  function logout() {
    localStorage.clear()
    navigate('/')
  }

  const statCards = [
    {
      icon: <FaFileAlt size={28} color="#2563eb" />,
      label: 'Applications',
      value: stats?.totalApplications ?? '—',
      bg: '#eff6ff',
      border: '#bfdbfe',
      onClick: () => navigate('/candidate/applications'),
    },
    {
      icon: <FaCalendarCheck size={28} color="#f59e0b" />,
      label: 'Interviews Scheduled',
      value: stats?.interviewsScheduled ?? '—',
      bg: '#fffbeb',
      border: '#fde68a',
      onClick: () => navigate('/candidate/applications'),
    },
    {
      icon: <FaSearch size={28} color="#8b5cf6" />,
      label: 'Shortlisted',
      value: stats?.shortlisted ?? '—',
      bg: '#faf5ff',
      border: '#e9d5ff',
      onClick: () => navigate('/candidate/applications'),
    },
    {
      icon: <FaUserCircle size={28} color="#10b981" />,
      label: 'Selected',
      value: stats?.selected ?? '—',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      onClick: () => navigate('/candidate/applications'),
    },
  ]

  const quickActions = [
    { icon: <FaUserCircle size={32} color="#f59e0b" />, label: 'My Profile', description: 'Update your skills and preferences', path: '/candidate/profile' },
    { icon: <FaSearch size={32} color="#2563eb" />, label: 'Search Jobs', description: 'Browse and apply for open vacancies', path: '/candidate/jobs' },
    { icon: <FaFileAlt size={32} color="#10b981" />, label: 'My Applications', description: 'Track your application status', path: '/candidate/applications' },
    { icon: <FaBell size={32} color="#8b5cf6" />, label: 'Notifications', description: 'View interview schedules and updates', path: '/candidate/notifications', badge: notifCount },
  ]

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark px-4" style={{ backgroundColor: '#0f172a' }}>
        <span className="navbar-brand fw-bold" style={{ color: '#60a5fa', fontSize: '1.3rem', letterSpacing: '-0.5px' }}>RecPro</span>
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
        <p className="text-muted mb-4">Here's a snapshot of your job search activity.</p>

        {/* Stats row */}
        <div className="row g-3 mb-5">
          {statCards.map(card => (
            <div className="col-6 col-md-3" key={card.label}>
              <div
                className="card h-100"
                style={{ background: card.bg, border: `1px solid ${card.border}`, cursor: 'pointer', borderRadius: 12 }}
                onClick={card.onClick}
              >
                <div className="card-body d-flex flex-column align-items-start p-3">
                  <div className="mb-2">{card.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
                    {stats === null
                      ? <span className="spinner-border spinner-border-sm text-secondary" />
                      : card.value}
                  </div>
                  <div className="text-muted mt-1" style={{ fontSize: 13 }}>{card.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <h5 className="mb-3 text-muted fw-semibold" style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Quick Actions</h5>
        <div className="row g-4">
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
