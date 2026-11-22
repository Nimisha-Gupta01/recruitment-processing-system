import { useState, useEffect } from 'react';
import api from '../../api/axios';

const OUTCOME_OPTIONS = ['Scheduled', 'Completed', 'Cancelled', 'Selected', 'Rejected'];

function InterviewsPage() {
  const [vacancies, setVacancies] = useState([]);
  const [selectedVacancyId, setSelectedVacancyId] = useState('');
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [outcomeForm, setOutcomeForm] = useState({ interviewId: '', outcome: 'Completed', remarks: '' });

  useEffect(() => {
    api.get('/employer/vacancies')
      .then(res => setVacancies(res.data))
      .catch(() => setError('Failed to load vacancies.'));
  }, []);

  async function loadApplications(vacancyId) {
    try {
      const res = await api.get(`/employer/applications?vacancyId=${vacancyId}`);
      setApplications(res.data);
    } catch {
      // TODO: remove mock
      setApplications([{ applicationId: 1, candidateName: 'Priya Sharma', status: 'Interview Scheduled' }]);
    }
  }

  function handleVacancyChange(e) {
    const id = e.target.value;
    setSelectedVacancyId(id);
    if (id) loadApplications(id);
    else setApplications([]);
  }

  function openOutcomeModal(app) {
    setOutcomeForm({ interviewId: '', outcome: 'Completed', remarks: '' });
    setShowOutcomeModal(true);
  }

  async function handleOutcomeSubmit(e) {
    e.preventDefault();
    if (!outcomeForm.interviewId) {
      alert('Please enter the Interview ID.');
      return;
    }
    try {
      await api.patch(`/employer/interviews/${outcomeForm.interviewId}/outcome`, {
        outcome: outcomeForm.outcome,
        remarks: outcomeForm.remarks,
      });
      setShowOutcomeModal(false);
    } catch {
      // TODO: remove mock
      setShowOutcomeModal(false);
    }
  }

  return (
    <div className="container mt-4">
      <h3>Interviews</h3>
      {error && <div className="alert alert-danger">{error}</div>}
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
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr><th>Candidate Name</th><th>Application Status</th><th>Update Outcome</th></tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.applicationId}>
                <td>{app.candidateName}</td>
                <td>{app.status}</td>
                <td>
                  <button className="btn btn-sm btn-warning" onClick={() => openOutcomeModal(app)}>
                    Update Outcome
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showOutcomeModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Interview Outcome</h5>
                <button className="btn-close" onClick={() => setShowOutcomeModal(false)}></button>
              </div>
              <form onSubmit={handleOutcomeSubmit}>
                <div className="modal-body row g-3">
                  <div className="col-12">
                    <label className="form-label">Interview ID</label>
                    <input
                      className="form-control"
                      type="number"
                      value={outcomeForm.interviewId}
                      onChange={e => setOutcomeForm({ ...outcomeForm, interviewId: e.target.value })}
                      placeholder="Enter interview ID from schedule step"
                      required
                    />
                  </div>
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
