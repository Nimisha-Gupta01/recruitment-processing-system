import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import api from '../../api/axios';

const OUTCOME_OPTIONS = ['Scheduled', 'Completed', 'Cancelled', 'Selected', 'Rejected'];

const STATUS_COLORS = {
  'Applied':              { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  'Shortlisted':          { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
  'Interview Scheduled':  { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  'Interview Completed':  { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  'Selected':             { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Rejected':             { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  'Withdrawn':            { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
};

const OUTCOME_COLORS = {
  'Scheduled':  { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  'Completed':  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Cancelled':  { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  'Selected':   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Rejected':   { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

function StatusPill({ status, colorMap }) {
  const c = (colorMap || STATUS_COLORS)[status] || { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' };
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {status || '—'}
    </span>
  );
}

function EmployerNavbar() {
  const navigate = useNavigate();
  const [notifCount, setNotifCount] = useState(0);
  useEffect(() => {
    api.get('/notifications').then(r => setNotifCount(r.data.length)).catch(() => {});
  }, []);
  function logout() { localStorage.clear(); navigate('/login'); }
  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-4" style={{ backgroundColor: '#0f172a' }}>
      <span className="navbar-brand fw-bold" style={{ color: '#60a5fa', fontSize: '1.3rem', letterSpacing: '-0.5px' }}>RecPro</span>
      <div className="navbar-nav ms-auto d-flex flex-row align-items-center">
        <button className="btn btn-link nav-link text-white" onClick={() => navigate('/employer/vacancies')}>Vacancies</button>
        <button className="btn btn-link nav-link text-white" onClick={() => navigate('/employer/applications')}>Applications</button>
        <button className="btn btn-link nav-link text-white" onClick={() => navigate('/employer/interviews')}>Interviews</button>
        <button className="btn btn-link nav-link text-white" onClick={() => navigate('/employer/search')}>Search Candidates</button>
        <button className="btn btn-link nav-link text-white" onClick={() => navigate('/employer/report')}>Report</button>
        <button className="btn btn-link nav-link text-white position-relative me-2" onClick={() => navigate('/employer/notifications')}>
          <FaBell size={18} />
          {notifCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: 10 }}>{notifCount}</span>
          )}
        </button>
        <button className="btn btn-outline-light" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

function InterviewsPage() {
  const [vacancies, setVacancies] = useState([]);
  const [filterVacancyId, setFilterVacancyId] = useState('');
  const [allInterviews, setAllInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [outcomeForm, setOutcomeForm] = useState({ outcome: 'Completed', remarks: '' });

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const vacRes = await api.get('/employer/vacancies');
      const vacs = vacRes.data;
      setVacancies(vacs);
      const appLists = await Promise.all(
        vacs.map(v =>
          api.get(`/employer/applications?vacancyId=${v.vacancyId}`)
            .then(r => r.data.map(a => ({ ...a, vacancyDesignation: v.designation, vacancyLocation: v.location, vacancyId: v.vacancyId })))
            .catch(() => [])
        )
      );
      const apps = appLists.flat();
      const interviewLists = await Promise.all(
        apps.map(app =>
          api.get(`/employer/interviews?applicationId=${app.applicationId}`)
            .then(r => r.data.map(i => ({
              ...i,
              candidateName: app.candidateName,
              appStatus: app.status,
              vacancyDesignation: app.vacancyDesignation,
              vacancyLocation: app.vacancyLocation,
              vacancyId: app.vacancyId,
            })))
            .catch(() => [])
        )
      );
      setAllInterviews(interviewLists.flat());
    } catch {
      setError('Failed to load interviews.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  const displayed = filterVacancyId
    ? allInterviews.filter(i => String(i.vacancyId) === String(filterVacancyId))
    : allInterviews;

  function openOutcomeModal(interview) {
    setSelectedInterview(interview);
    setOutcomeForm({ outcome: interview.outcome || 'Completed', remarks: interview.remarks || '' });
  }

  async function handleOutcomeSubmit(e) {
    e.preventDefault();
    try {
      await api.patch(`/employer/interviews/${selectedInterview.interviewId}/outcome`, outcomeForm);
      setSelectedInterview(null);
      loadAll();
    } catch {
      setError('Failed to update outcome.');
    }
  }

  return (
    <>
      <EmployerNavbar />
      <div className="container mt-4">
        <h3 className="mb-4">Interviews</h3>

        {error && (
          <div className="alert alert-danger alert-dismissible">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')} />
          </div>
        )}

        <div className="mb-4 col-md-4">
          <label className="form-label">Filter by Vacancy</label>
          <select className="form-select" value={filterVacancyId} onChange={e => setFilterVacancyId(e.target.value)}>
            <option value="">All Vacancies</option>
            {vacancies.map(v => (
              <option key={v.vacancyId} value={v.vacancyId}>{v.designation} — {v.location}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : displayed.length === 0 ? (
          <p className="text-muted">No interviews scheduled yet.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {displayed.map(iv => {
              const isTerminal = ['Withdrawn', 'Rejected', 'Selected'].includes(iv.appStatus);
              return (
                <div
                  key={iv.interviewId}
                  className="card shadow-sm"
                  style={{ borderRadius: 10, border: '1px solid #e5e7eb', opacity: isTerminal ? 0.6 : 1 }}
                >
                  <div className="card-body py-3 px-4">
                    <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
                      {/* Left: candidate + vacancy */}
                      <div>
                        <div className="fw-bold" style={{ fontSize: 15 }}>{iv.candidateName}</div>
                        <div className="text-muted small">{iv.vacancyDesignation} · {iv.vacancyLocation}</div>
                        <div className="mt-2 d-flex gap-2 flex-wrap">
                          <StatusPill status={iv.appStatus} colorMap={STATUS_COLORS} />
                          {iv.outcome && <StatusPill status={iv.outcome} colorMap={OUTCOME_COLORS} />}
                        </div>
                      </div>
                      {/* Right: date/mode/interviewer */}
                      <div className="text-end">
                        <div className="fw-semibold" style={{ fontSize: 14 }}>
                          {iv.interviewDatetime
                            ? new Date(iv.interviewDatetime).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </div>
                        <div className="text-muted small">{iv.mode || '—'} · {iv.interviewerName || '—'}</div>
                        {iv.venue && <div className="text-muted small">{iv.venue}</div>}
                        {!isTerminal && (
                          <button
                            className="btn btn-sm btn-outline-primary mt-2"
                            onClick={() => openOutcomeModal(iv)}
                          >
                            Update Outcome
                          </button>
                        )}
                      </div>
                    </div>
                    {iv.remarks && (
                      <div className="mt-2 text-muted small" style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
                        <span className="fw-semibold">Remarks:</span> {iv.remarks}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedInterview && (
          <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedInterview(null)}>
            <div className="modal-dialog" onClick={e => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header" style={{ background: '#0f172a', color: '#fff' }}>
                  <div>
                    <h5 className="modal-title fw-bold mb-0">Update Outcome</h5>
                    <p className="mb-0 small" style={{ color: '#94a3b8' }}>{selectedInterview.candidateName}</p>
                  </div>
                  <button className="btn-close btn-close-white" onClick={() => setSelectedInterview(null)} />
                </div>
                <form onSubmit={handleOutcomeSubmit}>
                  <div className="modal-body row g-3">
                    <div className="col-12">
                      <label className="form-label">Outcome</label>
                      <select
                        className="form-select"
                        value={outcomeForm.outcome}
                        onChange={e => setOutcomeForm(f => ({ ...f, outcome: e.target.value }))}
                      >
                        {OUTCOME_OPTIONS.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Remarks</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={outcomeForm.remarks}
                        onChange={e => setOutcomeForm(f => ({ ...f, remarks: e.target.value }))}
                        placeholder="Optional notes..."
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedInterview(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Outcome</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default InterviewsPage;
