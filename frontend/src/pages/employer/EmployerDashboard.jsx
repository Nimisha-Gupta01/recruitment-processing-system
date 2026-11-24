import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBriefcase, FaUsers, FaCalendarCheck, FaSearch, FaBell, FaCheckCircle, FaClock } from 'react-icons/fa';
import api from '../../api/axios.js';

function EmployerDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Employer';
  const [notifCount, setNotifCount] = useState(0);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/notifications')
      .then(r => setNotifCount(r.data.length))
      .catch(() => {})

    loadStats()
  }, [])

  async function loadStats() {
    try {
      const vacanciesRes = await api.get('/employer/vacancies')
      const vacancies = vacanciesRes.data

      const openVacancies = vacancies.filter(v => v.status === 'Open').length

      // Fetch all applications across all vacancies in parallel
      const appResults = await Promise.all(
        vacancies.map(v =>
          api.get('/employer/applications', { params: { vacancyId: v.vacancyId } })
            .then(r => r.data)
            .catch(() => [])
        )
      )
      const allApplications = appResults.flat()
      const totalApplicants = allApplications.filter(a => a.status !== 'Withdrawn').length

      // Fetch all interviews for each application that has one scheduled
      const scheduledApps = allApplications.filter(a =>
        a.status === 'Interview Scheduled' || a.status === 'Interview Completed'
      )
      const interviewResults = await Promise.all(
        scheduledApps.map(a =>
          api.get('/employer/interviews', { params: { applicationId: a.applicationId } })
            .then(r => r.data)
            .catch(() => [])
        )
      )
      const allInterviews = interviewResults.flat()

      const now = new Date()
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const interviewsThisWeek = allInterviews.filter(i => {
        const d = new Date(i.interviewDatetime)
        return d >= now && d <= weekFromNow
      }).length

      const shortlisted = allApplications.filter(a => a.status === 'Shortlisted').length

      setStats({ openVacancies, totalApplicants, interviewsThisWeek, shortlisted })
    } catch (e) {
      setStats({ openVacancies: 0, totalApplicants: 0, interviewsThisWeek: 0, shortlisted: 0 })
    }
  }

  function handleLogout() {
    localStorage.clear();
    navigate('/login');
  }

  const statCards = [
    {
      icon: <FaBriefcase size={28} color="#2563eb" />,
      label: 'Open Vacancies',
      value: stats?.openVacancies ?? '—',
      bg: '#eff6ff',
      border: '#bfdbfe',
      onClick: () => navigate('/employer/vacancies'),
    },
    {
      icon: <FaUsers size={28} color="#10b981" />,
      label: 'Total Applicants',
      value: stats?.totalApplicants ?? '—',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      onClick: () => navigate('/employer/applications'),
    },
    {
      icon: <FaCalendarCheck size={28} color="#f59e0b" />,
      label: 'Interviews This Week',
      value: stats?.interviewsThisWeek ?? '—',
      bg: '#fffbeb',
      border: '#fde68a',
      onClick: () => navigate('/employer/interviews'),
    },
    {
      icon: <FaCheckCircle size={28} color="#8b5cf6" />,
      label: 'Shortlisted',
      value: stats?.shortlisted ?? '—',
      bg: '#faf5ff',
      border: '#e9d5ff',
      onClick: () => navigate('/employer/applications'),
    },
  ]

  const quickActions = [
    { icon: <FaBriefcase size={32} color="#2563eb" />, label: 'Manage Vacancies', path: '/employer/vacancies' },
    { icon: <FaUsers size={32} color="#10b981" />, label: 'Applications', path: '/employer/applications' },
    { icon: <FaCalendarCheck size={32} color="#f59e0b" />, label: 'Interviews', path: '/employer/interviews' },
    { icon: <FaSearch size={32} color="#8b5cf6" />, label: 'Find Candidates', path: '/employer/search' },
  ]

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark px-4" style={{ backgroundColor: '#0f172a' }}>
        <span className="navbar-brand fw-bold" style={{ color: '#60a5fa', fontSize: '1.3rem', letterSpacing: '-0.5px' }}>RecPro</span>
        <div className="navbar-nav ms-auto d-flex flex-row align-items-center">
          <button className="btn btn-link nav-link text-white" onClick={() => navigate('/employer/vacancies')}>Vacancies</button>
          <button className="btn btn-link nav-link text-white" onClick={() => navigate('/employer/applications')}>Applications</button>
          <button className="btn btn-link nav-link text-white" onClick={() => navigate('/employer/interviews')}>Interviews</button>
          <button className="btn btn-link nav-link text-white" onClick={() => navigate('/employer/search')}>Search Candidates</button>
          <button className="btn btn-link nav-link text-white position-relative me-2" onClick={() => navigate('/employer/notifications')}>
            <FaBell size={18} />
            {notifCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: 10 }}>
                {notifCount}
              </span>
            )}
          </button>
          <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container mt-5">
        <h2 className="mb-1">Welcome, {name}!</h2>
        <p className="text-muted mb-4">Here's a snapshot of your recruitment activity.</p>

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
                className="card recpro-card text-center p-4 h-100"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(action.path)}
              >
                <div className="mb-3">{action.icon}</div>
                <div className="fw-semibold">{action.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmployerDashboard;
