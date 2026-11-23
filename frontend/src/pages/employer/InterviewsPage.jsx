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
  const [selectedVacancyId, setSelectedVacancyId] = useState('');
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState('');
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [outcomeForm, setOutcomeForm] = useState({ outcome: 'Completed', remarks: '' });

  useEffect(() => {
    api.get('/employer/vacancies')
      .then(res => setVacancies(res.data))
      .catch(() => setError('Failed to load vacancies.'));
  }, []);

  async function loadInterviews(vacancyId) {
    try {
      // Fetch applications for this vacancy, then fetch interviews per application
      const appsRes = await api.get(`/employer/applications?vacancyId=${vacancyId}`);
      const apps = appsRes.data;

      // Fetch interviews for each application in parallel
      const interviewLists = await Promise.all(
        apps.map(app =>
          api.get(`/employer/interviews?applicationId=${app.applicationId}`)
            .then(r => r.data.map(i => ({ ...i, candidateName: app.candidateName, appStatus: app.status })))
            .catch(() => [])
        )
      );
      setInterviews(interviewLists.flat());
    } catch {
      setError('Failed to load interviews.');
      setInterviews([]);
    }
  }

  function handleVacancyChange(e) {
    const id = e.target.value;
    setSelectedVacancyId(id);
    setInterviews([]);
    if (id) loadInterviews(id);
  }

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
      loadInterviews(selectedVacancyId);
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
        <label className="form-label">Select Vacancy</label>
        <select className="form-select" value={selectedVacancyId} onChange={handleVacancyChange}>
          <option value="">-- Select a Vacancy --</option>
          {vacancies.map(v => (
            <option key={v.vacancyId} value={v.vacancyId}>{v.designation} — {v.location}</option>
          ))}
        </select>
      </div>

      {selectedVacancyId && (
        interviews.length === 0
          ? <p className="text-muted">No interviews scheduled for this vacancy yet.</p>
          : (
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Candidate</th>
                  <th>Date &amp; Time</th>
                  <th>Mode</th>
                  <th>Interviewer</th>
                  <th>App Status</th>
                  <th>Outcome</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map(iv => {
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
                          {iv.outcome}
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
          )
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
