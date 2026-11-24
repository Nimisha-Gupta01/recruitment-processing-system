import { useState, useEffect } from 'react';
import api from '../../api/axios';

const APPLICATION_STATUSES = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Offered', 'Recruited', 'Rejected', 'Withdrawn'];
const INTERVIEW_MODES = ['Online', 'In-Person', 'Telephonic'];

const CANDIDATE_ISSUE_CATEGORIES = [
  'No-show for interview',
  'Fake credentials',
  'Unprofessional behavior',
  'Provided false information',
  'Unresponsive after selection',
  'Other',
];
const STAR_LABELS = ['', 'Very Poor', 'Poor', 'Average', 'Good', 'Excellent'];

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="d-flex align-items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          style={{ fontSize: 32, cursor: 'pointer', color: star <= (hovered || value) ? '#f59e0b' : '#d1d5db', transition: 'color 0.1s', lineHeight: 1, userSelect: 'none' }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >★</span>
      ))}
      {(hovered || value) > 0 && (
        <span className="ms-2 text-muted" style={{ fontSize: 13 }}>{STAR_LABELS[hovered || value]}</span>
      )}
    </div>
  );
}

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
  const [filterVacancyId, setFilterVacancyId] = useState('');
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [reportRating, setReportRating] = useState(0);
  const [reportCategory, setReportCategory] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportMsg, setReportMsg] = useState({ text: '', type: '' });
  const [reportSubmitting, setReportSubmitting] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const vacRes = await api.get('/employer/vacancies');
      const vacs = vacRes.data;
      setVacancies(vacs);
      const appResults = await Promise.all(
        vacs.map(v =>
          api.get(`/employer/applications?vacancyId=${v.vacancyId}`)
            .then(r => r.data.map(a => ({ ...a, vacancyDesignation: v.designation, vacancyLocation: v.location })))
            .catch(() => [])
        )
      );
      setAllApplications(appResults.flat());
    } catch {
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  const applications = filterVacancyId
    ? allApplications.filter(a => String(a.vacancyId) === String(filterVacancyId))
    : allApplications;

  async function handleStatusChange(appId, status) {
    setAllApplications(prev => prev.map(a => a.applicationId === appId ? { ...a, status } : a));
    try {
      await api.patch(`/employer/applications/${appId}/status`, { status });
    } catch {
      setError('Failed to update status.');
      loadAll();
    }
  }

  async function handleRunAiAnalysis() {
    if (!filterVacancyId) return;
    setAnalysing(true);
    setError('');
    try {
      const res = await api.post(`/employer/vacancies/${filterVacancyId}/ai-analyse`);
      const sorted = [...res.data].sort((a, b) => {
        if (a.aiScore == null && b.aiScore == null) return 0;
        if (a.aiScore == null) return 1;
        if (b.aiScore == null) return -1;
        return b.aiScore - a.aiScore;
      });
      // Merge AI scores back into allApplications
      setAllApplications(prev => prev.map(a => {
        const updated = sorted.find(s => s.applicationId === a.applicationId);
        return updated ? { ...a, aiScore: updated.aiScore, aiSummary: updated.aiSummary } : a;
      }));
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
      loadAll();
    } catch {
      setError('Failed to schedule interview.');
    }
  }

  async function handleReportCandidate() {
    if (!reportRating || !reportCategory || reportDetails.trim().length < 10) return;
    setReportSubmitting(true);
    const reason = `[Rating: ${reportRating}/5] [Issue: ${reportCategory}] ${reportDetails.trim()}`;
    try {
      await api.post(`/reports/candidate/${reportApp.candidateId}`, { reason });
      setReportMsg({ text: 'Report submitted. Admin will review it.', type: 'success' });
      setTimeout(() => { setReportApp(null); setReportMsg({ text: '', type: '' }); }, 2500);
    } catch (err) {
      const raw = err.response?.data?.message || err.response?.data || 'Failed';
      setReportMsg({ text: typeof raw === 'string' ? raw : 'Failed to submit report', type: 'danger' });
    } finally {
      setReportSubmitting(false);
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

      <div className="row g-2 mb-3 align-items-end">
        <div className="col-md-4">
          <label className="form-label">Filter by Vacancy</label>
          <select className="form-select" value={filterVacancyId} onChange={e => { setFilterVacancyId(e.target.value); setAnalysed(false); }}>
            <option value="">All Vacancies</option>
            {vacancies.map(v => (
              <option key={v.vacancyId} value={v.vacancyId}>{v.designation} — {v.location}</option>
            ))}
          </select>
        </div>
        {filterVacancyId && (
          <div className="col-auto">
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
          </div>
        )}
        {analysed && (
          <div className="col-auto">
            <span className="text-muted" style={{ fontSize: 13 }}>Candidates ranked by AI match score</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : applications.length === 0 ? (
        <p className="text-muted">No applications found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                {!filterVacancyId && <th>Vacancy</th>}
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
                    {!filterVacancyId && (
                      <td style={{ fontSize: 13 }}>{app.vacancyDesignation} — {app.vacancyLocation}</td>
                    )}
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
                      {app.resumePath && (
                        <a
                          href={`http://localhost:8080/api/resumes/${app.resumePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-success me-2"
                        >
                          View Resume
                        </a>
                      )}
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
                        onClick={() => { setReportApp(app); setReportRating(0); setReportCategory(''); setReportDetails(''); setReportMsg({ text: '', type: '' }); }}
                      >
                        Report
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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <div>
                  <h5 className="modal-title fw-bold mb-0">Report Candidate</h5>
                  <p className="text-muted small mb-0">{reportApp.candidateName}</p>
                </div>
                <button className="btn-close" onClick={() => setReportApp(null)} />
              </div>
              <div className="modal-body pt-3">
                {reportMsg.text && <div className={`alert alert-${reportMsg.type} mb-3`}>{reportMsg.text}</div>}
                <div className="mb-4">
                  <label className="form-label fw-semibold mb-2">Overall Rating of this Candidate</label>
                  <StarRating value={reportRating} onChange={setReportRating} />
                  <div className="text-muted mt-1" style={{ fontSize: 12 }}>Rate the candidate's conduct (1 = very poor, 5 = excellent)</div>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Issue Category</label>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {CANDIDATE_ISSUE_CATEGORIES.map(cat => (
                      <button key={cat} type="button" className="btn btn-sm"
                        style={{ borderRadius: 20, border: `1.5px solid ${reportCategory === cat ? '#dc3545' : '#dee2e6'}`, background: reportCategory === cat ? '#dc354520' : '#fff', color: reportCategory === cat ? '#dc3545' : '#495057', fontWeight: reportCategory === cat ? 600 : 400, fontSize: 13 }}
                        onClick={() => setReportCategory(cat)}
                      >{cat}</button>
                    ))}
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold">Details <span className="text-muted fw-normal ms-1" style={{ fontSize: 12 }}>(min. 10 characters)</span></label>
                  <textarea className="form-control" rows={4} placeholder="Describe the issue in detail. Your report is confidential." value={reportDetails} onChange={e => setReportDetails(e.target.value)} style={{ resize: 'none', fontSize: 14 }} />
                  <div className="text-end text-muted mt-1" style={{ fontSize: 11 }}>{reportDetails.length} chars</div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-outline-secondary" onClick={() => setReportApp(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleReportCandidate}
                  disabled={!reportRating || !reportCategory || reportDetails.trim().length < 10 || reportSubmitting}>
                  {reportSubmitting ? <><span className="spinner-border spinner-border-sm me-1" />Submitting…</> : 'Submit Report'}
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
