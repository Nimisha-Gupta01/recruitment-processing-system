import { useState, useEffect } from 'react';
import api from '../../api/axios';

const OUTCOME_OPTIONS = ['Scheduled', 'Completed', 'Cancelled', 'Selected', 'Rejected'];

const STATUS_BADGE = {
  Withdrawn: 'secondary',
  Rejected: 'danger',
  Selected: 'success',
  'Interview Scheduled': 'info',
  'Interview Completed': 'warning',
  Shortlisted: 'primary',
  Applied: 'secondary',
};

function InterviewsPage() {
  const [vacancies, setVacancies] = useState([]);
  const [filterVacancyId, setFilterVacancyId] = useState('');
  const [allInterviews, setAllInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [outcomeForm, setOutcomeForm] = useState({ outcome: 'Completed', remarks: '' });

  useEffect(() => {
    async function loadAll() {
      try {
        const vacRes = await api.get('/employer/vacancies');
        const vacs = vacRes.data;
        setVacancies(vacs);

        // Load all applications across all vacancies, then all interviews
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
    loadAll();
  }, []);

  async function reload() {
    setLoading(true);
    setError('');
    try {
      const vacs = vacancies;
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
      setError('Failed to reload interviews.');
    } finally {
      setLoading(false);
    }
  }

  const displayed = filterVacancyId
    ? allInterviews.filter(i => String(i.vacancyId) === String(filterVacancyId))
    : allInterviews;

  function openOutcomeModal(interview) {
    setSelectedInterview(interview);
    setOutcomeForm({ outcome: interview.outcome || 'Completed', remarks: interview.remarks || '' });
    setShowOutcomeModal(true);
  }

  async function handleOutcomeSubmit(e) {
    e.preventDefault();
    try {
      await api.patch(`/employer/interviews/${selectedInterview.interviewId}/outcome`, {
        outcome: outcomeForm.outcome,
        remarks: outcomeForm.remarks,
      });
      setShowOutcomeModal(false);
      reload();
    } catch {
      setError('Failed to update outcome.');
    }
  }

  return (
    <div className="container mt-4">
      <h3>Interviews</h3>
      {error && <div className="alert alert-danger alert-dismissible">
        {error}
        <button type="button" className="btn-close" onClick={() => setError('')} />
      </div>}

      <div className="mb-3 col-md-4">
        <label className="form-label">Filter by Vacancy</label>
        <select className="form-select" value={filterVacancyId} onChange={e => setFilterVacancyId(e.target.value)}>
          <option value="">All Vacancies</option>
          {vacancies.map(v => (
            <option key={v.vacancyId} value={v.vacancyId}>{v.designation} — {v.location}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : displayed.length === 0 ? (
        <p className="text-muted">No interviews scheduled yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Candidate</th>
                <th>Vacancy</th>
                <th>Date &amp; Time</th>
                <th>Mode</th>
                <th>Interviewer</th>
                <th>App Status</th>
                <th>Outcome</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(iv => {
                const isTerminal = ['Withdrawn', 'Rejected', 'Selected'].includes(iv.appStatus);
                return (
                  <tr key={iv.interviewId} style={isTerminal ? { opacity: 0.45, background: '#f3f4f6', color: '#9ca3af' } : {}}>
                    <td>
                      {iv.candidateName}
                      {isTerminal && (
                        <span className={`ms-2 badge bg-${STATUS_BADGE[iv.appStatus] || 'secondary'}`} style={{ fontSize: 10 }}>
                          {iv.appStatus}
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: 13 }}>{iv.vacancyDesignation} — {iv.vacancyLocation}</td>
                    <td>
                      {iv.interviewDatetime
                        ? new Date(iv.interviewDatetime).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td>{iv.mode || '—'}</td>
                    <td>{iv.interviewerName || '—'}</td>
                    <td>
                      <span className={`badge bg-${STATUS_BADGE[iv.appStatus] || 'secondary'}`}>
                        {iv.appStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${STATUS_BADGE[iv.outcome] || 'secondary'}`}>
                        {iv.outcome || '—'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => openOutcomeModal(iv)}
                        disabled={isTerminal}
                      >
                        Update Outcome
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showOutcomeModal && selectedInterview && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Outcome — {selectedInterview.candidateName}</h5>
                <button className="btn-close" onClick={() => setShowOutcomeModal(false)} />
              </div>
              <form onSubmit={handleOutcomeSubmit}>
                <div className="modal-body row g-3">
                  <div className="col-12">
                    <label className="form-label">Outcome</label>
                    <select
                      className="form-select"
                      value={outcomeForm.outcome}
                      onChange={e => setOutcomeForm({ ...outcomeForm, outcome: e.target.value })}
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
                      onChange={e => setOutcomeForm({ ...outcomeForm, remarks: e.target.value })}
                      placeholder="Optional notes about this interview..."
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowOutcomeModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Outcome</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewsPage;
