import { useState, useEffect } from 'react';
import api from '../../api/axios';

const APPLICATION_STATUSES = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Offered', 'Recruited', 'Rejected', 'Withdrawn'];
const INTERVIEW_MODES = ['Online', 'In-Person', 'Telephonic'];

function ScoreBadge({ score }) {
  if (score == null) return null;
  const color = score >= 80 ? '#198754' : score >= 60 ? '#fd7e14' : '#dc3545';
  const bg = score >= 80 ? '#d1fae5' : score >= 60 ? '#fff3cd' : '#fee2e2';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 700,
        color,
        background: bg,
        border: `1px solid ${color}`,
        whiteSpace: 'nowrap',
      }}
    >
      {score}/100
    </span>
  );
}

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
  const [analysing, setAnalysing] = useState(false);
  const [analysed, setAnalysed] = useState(false);
  const [aiModalApp, setAiModalApp] = useState(null);
  const [reportApp, setReportApp] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportMsg, setReportMsg] = useState({ text: '', type: '' });

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
      setError('Failed to load applications.');
      setApplications([]);
    }
  }

  function handleVacancyChange(e) {
    const id = e.target.value;
    setSelectedVacancyId(id);
    setAnalysed(false);
    if (id) loadApplications(id);
    else setApplications([]);
  }

  async function handleStatusChange(appId, status) {
    setApplications(prev => prev.map(a => a.applicationId === appId ? { ...a, status } : a));
    try {
      await api.patch(`/employer/applications/${appId}/status`, { status });
    } catch {
      setError('Failed to update status.');
      loadApplications(selectedVacancyId);
    }
  }

  async function handleRunAiAnalysis() {
    setAnalysing(true);
    setError('');
    try {
      const res = await api.post(`/employer/vacancies/${selectedVacancyId}/ai-analyse`);
      // Sort by score descending (nulls last)
      const sorted = [...res.data].sort((a, b) => {
        if (a.aiScore == null && b.aiScore == null) return 0;
        if (a.aiScore == null) return 1;
        if (b.aiScore == null) return -1;
        return b.aiScore - a.aiScore;
      });
      setApplications(sorted);
      setAnalysed(true);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'AI analysis failed.';
      setError('AI analysis failed: ' + msg);
    } finally {
      setAnalysing(false);
    }
  }

  function openInterviewModal(appId) {
    setSelectedAppId(appId);
    setInterviewForm({ interviewDatetime: '', mode: 'Online', venue: '', interviewerName: '' });
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
        interviewDatetime: datetime,
        mode: interviewForm.mode,
        venue: interviewForm.venue,
        interviewerName: interviewForm.interviewerName,
      });
      setShowInterviewModal(false);
      loadApplications(selectedVacancyId);
    } catch {
      setError('Failed to schedule interview.');
    }
  }

  async function handleReportCandidate() {
    if (!reportReason.trim()) return;
    try {
      await api.post(`/reports/candidate/${reportApp.candidateId}`, { reason: reportReason });
      setReportMsg({ text: 'Report submitted.', type: 'success' });
      setReportReason('');
      setTimeout(() => { setReportApp(null); setReportMsg({ text: '', type: '' }); }, 2000);
    } catch (err) {
      const raw = err.response?.data?.message || err.response?.data || 'Failed';
      setReportMsg({ text: typeof raw === 'string' ? raw : 'Failed to submit report', type: 'danger' });
    }
  }

  function handleInterviewChange(e) {
    setInterviewForm({ ...interviewForm, [e.target.name]: e.target.value });
  }

  const hasAnyScore = applications.some(a => a.aiScore != null);

  return (
    <div className="container mt-4">
      <h3>Applications</h3>
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

      {selectedVacancyId && applications.length > 0 && (
        <div className="mb-3 d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={handleRunAiAnalysis}
            disabled={analysing}
          >
            {analysing ? (
              <><span className="spinner-border spinner-border-sm" /> Analysing resumes…</>
            ) : (
              <>✨ {analysed ? 'Re-run AI Analysis' : 'Run AI Analysis'}</>
            )}
          </button>
          {analysed && (
            <span className="text-muted" style={{ fontSize: 13 }}>
              Candidates ranked by AI match score
            </span>
          )}
        </div>
      )}

      {selectedVacancyId && (
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Candidate Name</th>
                <th>Applied Date</th>
                {hasAnyScore && <th>AI Score</th>}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => {
                const isTerminal = ['Withdrawn', 'Rejected', 'Recruited'].includes(app.status);
                return (
                  <tr
                    key={app.applicationId}
                    style={isTerminal ? { opacity: 0.5, background: '#f3f4f6', color: '#9ca3af', pointerEvents: 'none' } : {}}
                  >
                    <td>
                      {app.candidateName}
                      {isTerminal && (
                        <span className={`ms-2 badge ${app.status === 'Selected' ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: 11 }}>
                          {app.status}
                        </span>
                      )}
                    </td>
                    <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                    {hasAnyScore && (
                      <td style={{ minWidth: 140 }}>
                        <div className="d-flex align-items-center gap-2">
                          <ScoreBadge score={app.aiScore} />
                          {app.aiSummary && app.aiScore != null && (
                            <button
                              className="btn btn-sm p-0 border-0 bg-transparent"
                              style={{ fontSize: 16, lineHeight: 1 }}
                              onClick={() => setAiModalApp(app)}
                              title="View AI analysis"
                            >
                              ℹ️
                            </button>
                          )}
                          {app.aiScore == null && app.aiSummary && (
                            <span className="text-muted" style={{ fontSize: 12 }}>{app.aiSummary}</span>
                          )}
                        </div>
                      </td>
                    )}
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={app.status}
                        onChange={e => handleStatusChange(app.applicationId, e.target.value)}
                        disabled={isTerminal}
                      >
                        {APPLICATION_STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => openInterviewModal(app.applicationId)}
                        disabled={isTerminal}
                      >
                        Schedule Interview
                      </button>
                      {!isTerminal && (
                        <button
                          className="btn btn-sm btn-outline-danger me-2"
                          onClick={() => handleStatusChange(app.applicationId, 'Rejected')}
                        >
                          Reject
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        title="Report this candidate"
                        onClick={() => { setReportApp(app); setReportReason(''); setReportMsg({ text: '', type: '' }); }}
                      >
                        🚩
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
                    <label className="form-label">Interview Date &amp; Time</label>
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
      {aiModalApp && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setAiModalApp(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">✨ AI Analysis — {aiModalApp.candidateName}</h5>
                <button className="btn-close" onClick={() => setAiModalApp(null)} />
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <ScoreBadge score={aiModalApp.aiScore} />
                  <span className="text-muted" style={{ fontSize: 13 }}>
                    {aiModalApp.aiScore >= 80 ? 'Excellent match' : aiModalApp.aiScore >= 60 ? 'Good match' : aiModalApp.aiScore >= 40 ? 'Partial match' : 'Poor match'}
                  </span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>{aiModalApp.aiSummary}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setAiModalApp(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {reportApp && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Report Candidate — {reportApp.candidateName}</h5>
                <button className="btn-close" onClick={() => setReportApp(null)} />
              </div>
              <div className="modal-body">
                {reportMsg.text && <div className={`alert alert-${reportMsg.type}`}>{reportMsg.text}</div>}
                <label className="form-label">Reason for reporting</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Describe why you are reporting this candidate..."
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setReportApp(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleReportCandidate} disabled={!reportReason.trim()}>
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationsPage;
