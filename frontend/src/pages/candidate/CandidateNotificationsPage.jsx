import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBell, FaTimesCircle, FaStar, FaTrophy, FaInfoCircle, FaInbox } from 'react-icons/fa'
import api from '../../api/axios.js'

const EVENT_CONFIG = {
  APPLICATION_SUBMITTED: {
    label: 'Applied',
    color: '#2563eb',
    bg: '#eff6ff',
    icon: <FaInfoCircle size={18} color="#2563eb" />,
    tab: 'Updates',
  },
  STATUS_CHANGED: {
    label: 'Status Update',
    color: '#2563eb',
    bg: '#eff6ff',
    icon: <FaInfoCircle size={18} color="#2563eb" />,
    tab: 'Updates',
  },
  STATUS_REJECTED: {
    label: 'Not Selected',
    color: '#dc3545',
    bg: '#fff5f5',
    icon: <FaTimesCircle size={18} color="#dc3545" />,
    tab: 'Updates',
  },
  STATUS_SHORTLISTED: {
    label: 'Shortlisted',
    color: '#f59e0b',
    bg: '#fffbeb',
    icon: <FaStar size={18} color="#f59e0b" />,
    tab: 'Good News',
  },
  STATUS_SELECTED: {
    label: 'Selected',
    color: '#10b981',
    bg: '#f0fdf4',
    icon: <FaTrophy size={18} color="#10b981" />,
    tab: 'Good News',
  },
}

function getConfig(eventType) {
  return EVENT_CONFIG[eventType] || {
    label: eventType?.replace(/_/g, ' ') || 'Update',
    color: '#6c757d',
    bg: '#f8f9fa',
    icon: <FaBell size={18} color="#6c757d" />,
    tab: 'Other',
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function CandidateNotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('All')

  useEffect(() => {
    api.get('/notifications')
      .then(r => setNotifications(r.data))
      .catch(() => setError('Failed to load notifications.'))
      .finally(() => setLoading(false))
  }, [])

  function handleLogout() {
    localStorage.clear()
    navigate('/')
  }

  const tabs = ['All', 'Good News', 'Updates', 'Other']

  const filtered = activeTab === 'All'
    ? notifications
    : notifications.filter(n => getConfig(n.eventType).tab === activeTab)

  const countFor = tab => tab === 'All'
    ? notifications.length
    : notifications.filter(n => getConfig(n.eventType).tab === tab).length

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fb' }}>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
        <span className="navbar-brand recpro-brand" style={{ color: '#fff', fontSize: '1.3rem' }}>RecPro</span>
        <div className="navbar-nav ms-auto d-flex flex-row align-items-center">
          <button className="btn btn-link nav-link text-white" onClick={() => navigate('/candidate/dashboard')}>Dashboard</button>
          <button className="btn btn-link nav-link text-white" onClick={() => navigate('/candidate/profile')}>Profile</button>
          <button className="btn btn-outline-light ms-2" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container mt-4" style={{ maxWidth: 820 }}>
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div>
            <h4 className="mb-0 fw-bold d-flex align-items-center gap-2">
              <FaBell color="#8b5cf6" /> Notifications
            </h4>
            <p className="text-muted mb-0 small">Application status updates and recruiter activity</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total', count: notifications.length, color: '#6c757d', bg: '#f8f9fa' },
            { label: 'Good News', count: countFor('Good News'), color: '#10b981', bg: '#f0fdf4' },
            { label: 'Updates', count: countFor('Updates'), color: '#2563eb', bg: '#eff6ff' },
          ].map(s => (
            <div className="col-4" key={s.label}>
              <div className="card border-0 shadow-sm text-center py-3" style={{ background: s.bg }}>
                <div className="fw-bold" style={{ fontSize: 26, color: s.color }}>{s.count}</div>
                <div className="text-muted small">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom px-0 pt-0 pb-0">
            <ul className="nav nav-tabs border-0 px-3 pt-3">
              {tabs.map(tab => (
                <li className="nav-item" key={tab}>
                  <button
                    className={`nav-link fw-semibold ${activeTab === tab ? 'active' : 'text-muted'}`}
                    style={{ fontSize: 14, borderBottom: activeTab === tab ? '2px solid #8b5cf6' : 'none', color: activeTab === tab ? '#8b5cf6' : undefined }}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                    {countFor(tab) > 0 && (
                      <span className="ms-1 badge rounded-pill" style={{ fontSize: 10, background: activeTab === tab ? '#8b5cf6' : '#e9ecef', color: activeTab === tab ? '#fff' : '#6c757d' }}>
                        {countFor(tab)}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-body p-0">
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-secondary" />
              </div>
            )}
            {error && <div className="alert alert-danger m-3">{error}</div>}

            {!loading && !error && filtered.length === 0 && (
              <div className="text-center py-5 text-muted">
                <FaInbox size={36} className="mb-2" />
                <p className="mb-0">No notifications in this category.</p>
              </div>
            )}

            {!loading && !error && filtered.map((n, idx) => {
              const cfg = getConfig(n.eventType)
              return (
                <div
                  key={n.notificationId}
                  className="d-flex align-items-start px-4 py-3"
                  style={{
                    borderLeft: `4px solid ${cfg.color}`,
                    background: cfg.bg,
                    borderBottom: idx < filtered.length - 1 ? '1px solid #f0f0f0' : 'none',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-circle me-3 mt-1"
                    style={{ width: 38, height: 38, background: '#fff', border: `1.5px solid ${cfg.color}22` }}
                  >
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="fw-semibold" style={{ fontSize: 14 }}>{n.subject}</span>
                      <span
                        className="badge rounded-pill"
                        style={{ fontSize: 10, background: cfg.color, color: '#fff' }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <div className="text-muted" style={{ fontSize: 13 }}>{n.body}</div>
                  </div>

                  {/* Date */}
                  <div className="text-muted flex-shrink-0 ms-3 text-end" style={{ fontSize: 11, minWidth: 110 }}>
                    {formatDate(n.sentAt)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
