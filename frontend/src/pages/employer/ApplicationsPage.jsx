import { useState, useEffect } from 'react';
import api from '../../api/axios';

const APPLICATION_STATUSES = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Offered', 'Recruited', 'Rejected', 'Withdrawn'];
const INTERVIEW_MODES = ['Online', 'In-Person', 'Telephonic'];

// TODO: remove mock
const mockApplications = [
  { applicationId: 1, candidateName: 'Priya Sharma', appliedAt: '2026-11-16T10:00:00', status: 'Applied', coverNote: "I'm interested" },
];

function ApplicationsPage() {
  const [vacancies, setVacancies] = useState([]);
  const [selectedVacancyId, setSelectedVacancyId] = useState('');
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    roundNumber: 1, interviewDatetime: '', mode: 'Online', venue: '', interviewerName: '',
  });

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
      setApplications(mockApplications);
    }
  }

  function handleVacancyChange(e) {
    const id = e.target.value;
    setSelectedVacancyId(id);
    if (id) loadApplications(id);
    else setApplications([]);
  }

  async function handleStatusChange(appId, status) {
    try {
      await api.patch(`/employer/applications/${appId}/status`, { status });
      loadApplications(selectedVacancyId);
    } catch {
      setError('Failed to update status.');
    }
  }

  function openInterviewModal(appId) {
    setSelectedAppId(appId);
    setInterviewForm({ roundNumber: 1, interviewDatetime: '', mode: 'Online', venue: '', interviewerName: '' });
    setShowInterviewModal(true);
  }

  async function handleInterviewSubmit(e) {
    e.preventDefault();
    const datetime = interviewForm.interviewDatetime.length === 16
      ? interviewForm.interviewDatetime + ':00'
      : interviewForm.interviewDatetime;
    try {
      await api.post('/employer/interviews', {
        applicationId: selectedAppId,
        roundNumber: parseInt(interviewForm.roundNumber),
        interviewDatetime: datetime,
        mode: interviewForm.mode,
        venue: interviewForm.venue,
        interviewerName: interviewForm.interviewerName,
      });
      setShowInterviewModal(false);
    } catch {
      // TODO: remove mock
      setShowInterviewModal(false);
    }
  }

  function handleInterviewChange(e) {
    setInterviewForm({ ...interviewForm, [e.target.name]: e.target.value });
  }

  return (
    <div className="container mt-4">
      <h3>Applications</h3>
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
            <tr><th>Candidate Name</th><th>Applied Date</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.applicationId}>
                <td>{app.candidateName}</td>
                <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                <td>
                  <select
                    className="form-select form-select-sm"
                    value={app.status}
                    onChange={e => handleStatusChange(app.applicationId, e.target.value)}
                  >
                    {APPLICATION_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <button className="btn btn-sm btn-primary" onClick={() => openInterviewModal(app.applicationId)}>
                    Schedule Interview
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showInterviewModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Schedule Interview</h5>
                <button className="btn-close" onClick={() => setShowInterviewModal(false)}></button>
              </div>
              <form onSubmit={handleInterviewSubmit}>
                <div className="modal-body row g-3">
                  <div className="col-12">
                    <label className="form-label">Round Number</label>
                    <input className="form-control" type="number" name="roundNumber" value={interviewForm.roundNumber} onChange={handleInterviewChange} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Interview Date & Time</label>
                    <input className="form-control" type="datetime-local" name="interviewDatetime" value={interviewForm.interviewDatetime} onChange={handleInterviewChange} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Mode</label>
                    <select className="form-select" name="mode" value={interviewForm.mode} onChange={handleInterviewChange} required>
                      {INTERVIEW_MODES.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Venue</label>
                    <input className="form-control" name="venue" value={interviewForm.venue} onChange={handleInterviewChange} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Interviewer Name</label>
                    <input className="form-control" name="interviewerName" value={interviewForm.interviewerName} onChange={handleInterviewChange} required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowInterviewModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Schedule</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationsPage;
