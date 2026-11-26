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

const STATUS_COLORS = {
  'Applied':              { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  'Shortlisted':          { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
  'Interview Scheduled':  { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  'Interview Completed':  { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  'Selected':             { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Offered':              { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  'Recruited':            { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  'Rejected':             { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  'Withdrawn':            { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' };
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

function ScoreBadge({ score }) {
  if (score == null) return null;
  const color = score >= 80 ? '#198754' : score >= 60 ? '#fd7e14' : '#dc3545';
  const bg    = score >= 80 ? '#d1fae5' : score >= 60 ? '#fff3cd' : '#fee2e2';
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700, color, background: bg, border: `1px solid ${color}` }}>
      {score}/100
    </span>
  );
}

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="d-flex align-items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star}
          style={{ fontSize: 32, cursor: 'pointer', color: star <= (hovered || value) ? '#f59e0b' : '#d1d5db', transition: 'color 0.1s', lineHeight: 1, userSelect: 'none' }}
          onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)} onClick={() => onChange(star)}
        >★</span>
      ))}
      {(hovered || value) > 0 && <span className="ms-2 text-muted" style={{ fontSize: 13 }}>{STAR_LABELS[hovered || value]}</span>}
    </div>
  );
}

export default function ApplicationsPage() {
  const [vacancies, setVacancies]           = useState([]);
  const [filterVacancyId, setFilterVacancyId] = useState('');
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [viewApp, setViewApp]               = useState(null);

  // schedule interview state
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewForm, setInterviewForm]   = useState({ roundNumber: 1, interviewDatetime: '', mode: 'Online', venue: '', interviewerName: '' });
  const [interviewError, setInterviewError] = useState('');

  // AI analysis
  const [analysing, setAnalysing]   = useState(false);
  const [analysed, setAnalysed]     = useState(false);

  // report candidate
  const [reportRating, setReportRating]     = useState(0);
  const [reportCategory, setReportCategory] = useState('');
  const [reportDetails, setReportDetails]   = useState('');
  const [reportMsg, setReportMsg]           = useState({ text: '', type: '' });
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [showReportPanel, setShowReportPanel]   = useState(false);

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

  const applications = (filterVacancyId
    ? allApplications.filter(a => String(a.vacancyId) === String(filterVacancyId))
    : allApplications
  ).slice().sort((a, b) => {
    if (a.aiScore == null && b.aiScore == null) return 0;
    if (a.aiScore == null) return 1;
    if (b.aiScore == null) return -1;
    return b.aiScore - a.aiScore;
  });

  async function handleStatusChange(appId, status) {
    setAllApplications(prev => prev.map(a => a.applicationId === appId ? { ...a, status } : a));
    if (viewApp?.applicationId === appId) setViewApp(v => ({ ...v, status }));
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
      setAllApplications(prev => prev.map(a => {
        const updated = sorted.find(s => s.applicationId === a.applicationId);
        return updated ? { ...a, aiScore: updated.aiScore, aiSummary: updated.aiSummary } : a;
      }));
      setAnalysed(true);
    } catch (err) {
      setError('AI analysis failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setAnalysing(false);
    }
  }

  async function handleInterviewSubmit(e) {
    e.preventDefault();
    setInterviewError('');
    const datetime = interviewForm.interviewDatetime.length === 16
      ? interviewForm.interviewDatetime + ':00'
      : interviewForm.interviewDatetime;
    try {
      await api.post('/employer/interviews', {
        applicationId: viewApp.applicationId,
        interviewDatetime: datetime,
        mode: interviewForm.mode,
        venue: interviewForm.venue,
        interviewerName: interviewForm.interviewerName,
      });
      setShowInterviewModal(false);
      await loadAll();
      // refresh viewApp from updated list
      setViewApp(prev => ({ ...prev, status: 'Interview Scheduled' }));
    } catch (err) {
      setInterviewError(err.response?.data?.message || 'Failed to schedule interview.');
    }
  }

  async function handleReportCandidate() {
    if (!reportRating || !reportCategory || reportDetails.trim().length < 10) return;
    setReportSubmitting(true);
    const reason = `[Rating: ${reportRating}/5] [Issue: ${reportCategory}] ${reportDetails.trim()}`;
    try {
      await api.post(`/reports/candidate/${viewApp.candidateId}`, { reason });
      setReportMsg({ text: 'Report submitted. Admin will review it.', type: 'success' });
      setTimeout(() => { setShowReportPanel(false); setReportMsg({ text: '', type: '' }); }, 2500);
    } catch (err) {
      const raw = err.response?.data?.message || err.response?.data || 'Failed';
      setReportMsg({ text: typeof raw === 'string' ? raw : 'Failed to submit report', type: 'danger' });
    } finally {
      setReportSubmitting(false);
    }
  }

  function openView(app) {
    setViewApp(app);
    setShowInterviewModal(false);
    setShowReportPanel(false);
    setReportRating(0); setReportCategory(''); setReportDetails(''); setReportMsg({ text: '', type: '' });
  }

  const hasAnyScore = applications.some(a => a.aiScore != null);
  const isTerminal = viewApp ? ['Withdrawn', 'Rejected', 'Recruited'].includes(viewApp.status) : false;

  return (
    <div className="container-fluid mt-4 px-4">
      <h3 className="mb-4">Applications</h3>

      {error && (
        <div className="alert alert-danger alert-dismissible">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      {/* Filter + AI bar */}
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
            <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={handleRunAiAnalysis} disabled={analysing}>
              {analysing
                ? <><span className="spinner-border spinner-border-sm" /> Analysing resumes…</>
                : <>✨ {analysed ? 'Re-run AI Analysis' : 'Run AI Analysis'}</>}
            </button>
          </div>
        )}
        {analysed && <div className="col-auto"><span className="text-muted" style={{ fontSize: 13 }}>Candidates ranked by AI match score</span></div>}
      </div>

      {/* Two-panel layout when a candidate is being viewed */}
      <div className={viewApp ? 'row g-4' : ''}>

        {/* ── List panel ── */}
        <div className={viewApp ? 'col-lg-5' : 'col-12'}>
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : applications.length === 0 ? (
            <p className="text-muted">No applications found.</p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {applications.map(app => {
                const terminal = ['Withdrawn', 'Rejected', 'Recruited'].includes(app.status);
                const active = viewApp?.applicationId === app.applicationId;
                return (
                  <div
                    key={app.applicationId}
                    className="card"
                    style={{
                      cursor: 'pointer',
                      opacity: terminal ? 0.55 : 1,
                      border: active ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      borderRadius: 10,
                      transition: 'border 0.15s',
                    }}
                    onClick={() => openView(app)}
                  >
                    <div className="card-body py-3 px-3 d-flex align-items-center gap-3">
                      {/* Avatar initial */}
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                        {app.candidateName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="fw-semibold text-truncate">{app.candidateName}</div>
                        <div className="text-muted small text-truncate">{app.vacancyDesignation} · {app.vacancyLocation}</div>
                        <div className="text-muted" style={{ fontSize: 11 }}>{new Date(app.appliedAt).toLocaleDateString()}</div>
                      </div>
                      <div className="d-flex flex-column align-items-end gap-1 flex-shrink-0">
                        <StatusBadge status={app.status} />
                        {hasAnyScore && app.aiScore != null && <ScoreBadge score={app.aiScore} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Detail panel ── */}
        {viewApp && (
          <div className="col-lg-7">
            <div className="card shadow-sm" style={{ borderRadius: 12, border: '1px solid #e5e7eb' }}>
              {/* Header */}
              <div className="card-header d-flex align-items-center justify-content-between py-3 px-4" style={{ background: '#0f172a', borderRadius: '12px 12px 0 0' }}>
                <div>
                  <h5 className="mb-0 fw-bold text-white">{viewApp.candidateName}</h5>
                  <p className="mb-0 small" style={{ color: '#94a3b8' }}>
                    {viewApp.vacancyDesignation} · {viewApp.vacancyLocation} · Applied {new Date(viewApp.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <button className="btn-close btn-close-white" onClick={() => setViewApp(null)} />
              </div>

              <div className="card-body px-4 py-4">
                {/* Status + AI score row */}
                <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
                  <div>
                    <div className="text-muted small mb-1">Current Status</div>
                    <StatusBadge status={viewApp.status} />
                  </div>
                  {viewApp.aiScore != null && (
                    <div>
                      <div className="text-muted small mb-1">AI Match Score</div>
                      <ScoreBadge score={viewApp.aiScore} />
                    </div>
                  )}
                </div>

                {/* AI summary */}
                {viewApp.aiSummary && (
                  <div className="mb-4 p-3 rounded" style={{ background: '#fffbeb', border: '1px solid #fde68a', fontSize: 13, lineHeight: 1.7 }}>
                    <div className="fw-semibold mb-1" style={{ color: '#92400e' }}>✨ AI Analysis</div>
                    <div style={{ color: '#78350f' }}>{viewApp.aiSummary}</div>
                  </div>
                )}

                {/* Cover note */}
                {viewApp.coverNote && (
                  <div className="mb-4">
                    <div className="text-muted small mb-1 fw-semibold">Cover Note</div>
                    <div className="p-3 rounded" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {viewApp.coverNote}
                    </div>
                  </div>
                )}

                {/* Resume */}
                {viewApp.resumePath ? (
                  <div className="mb-4">
                    <div className="text-muted small mb-2 fw-semibold">Resume</div>
                    <a
                      href={`http://localhost:8080/api/resumes/${viewApp.resumePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-success btn-sm"
                    >
                      📄 View Resume (PDF)
                    </a>
                  </div>
                ) : (
                  <div className="mb-4 text-muted small">No resume uploaded.</div>
                )}

                <hr className="my-3" />

                {/* Change Status */}
                {!isTerminal && (
                  <div className="mb-4">
                    <div className="text-muted small mb-2 fw-semibold">Update Status</div>
                    <div className="d-flex gap-2 flex-wrap">
                      {APPLICATION_STATUSES.filter(s => !['Withdrawn'].includes(s) && s !== viewApp.status).map(s => (
                        <button
                          key={s}
                          className="btn btn-sm btn-outline-secondary"
                          style={{ borderRadius: 20, fontSize: 13 }}
                          onClick={() => handleStatusChange(viewApp.applicationId, s)}
                        >
                          → {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Schedule Interview */}
                {!isTerminal && (
                  <div className="mb-4">
                    <div className="text-muted small mb-2 fw-semibold">Interview</div>
                    {!showInterviewModal ? (
                      <button className="btn btn-primary btn-sm" onClick={() => setShowInterviewModal(true)}>
                        📅 Schedule Interview
                      </button>
                    ) : (
                      <div className="p-3 rounded border" style={{ background: '#f8fafc' }}>
                        <div className="fw-semibold mb-3">Schedule Interview</div>
                        {interviewError && <div className="alert alert-danger py-2 mb-3">{interviewError}</div>}
                        <form onSubmit={handleInterviewSubmit}>
                          <div className="row g-3">
                            <div className="col-12">
                              <label className="form-label form-label-sm">Date &amp; Time</label>
                              <input className="form-control form-control-sm" type="datetime-local" name="interviewDatetime"
                                value={interviewForm.interviewDatetime}
                                onChange={e => setInterviewForm(f => ({ ...f, interviewDatetime: e.target.value }))}
                                required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label form-label-sm">Mode</label>
                              <select className="form-select form-select-sm" name="mode" value={interviewForm.mode}
                                onChange={e => setInterviewForm(f => ({ ...f, mode: e.target.value }))} required>
                                {INTERVIEW_MODES.map(m => <option key={m}>{m}</option>)}
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label form-label-sm">Venue / Link</label>
                              <input className="form-control form-control-sm" name="venue" value={interviewForm.venue}
                                onChange={e => setInterviewForm(f => ({ ...f, venue: e.target.value }))} />
                            </div>
                            <div className="col-12">
                              <label className="form-label form-label-sm">Interviewer Name</label>
                              <input className="form-control form-control-sm" name="interviewerName" value={interviewForm.interviewerName}
                                onChange={e => setInterviewForm(f => ({ ...f, interviewerName: e.target.value }))} required />
                            </div>
                          </div>
                          <div className="d-flex gap-2 mt-3">
                            <button type="submit" className="btn btn-primary btn-sm">Confirm Schedule</button>
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowInterviewModal(false)}>Cancel</button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* Reject */}
                {!isTerminal && (
                  <div className="mb-4">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => { if (window.confirm(`Reject ${viewApp.candidateName}?`)) handleStatusChange(viewApp.applicationId, 'Rejected'); }}
                    >
                      ✕ Reject Application
                    </button>
                  </div>
                )}

                {/* Report candidate */}
                <div>
                  <button
                    className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
                    style={{ fontSize: 13 }}
                    onClick={() => { setShowReportPanel(r => !r); setReportRating(0); setReportCategory(''); setReportDetails(''); setReportMsg({ text: '', type: '' }); }}
                  >
                    🚩 Report this candidate
                  </button>
                  {showReportPanel && (
                    <div className="mt-3 p-3 rounded border" style={{ background: '#fef2f2' }}>
                      <div className="fw-semibold mb-3" style={{ fontSize: 14 }}>Report Candidate — {viewApp.candidateName}</div>
                      {reportMsg.text && <div className={`alert alert-${reportMsg.type} py-2 mb-3`}>{reportMsg.text}</div>}
                      <div className="mb-3">
                        <label className="form-label form-label-sm fw-semibold">Rating</label>
                        <StarRating value={reportRating} onChange={setReportRating} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label form-label-sm fw-semibold">Issue Category</label>
                        <div className="d-flex flex-wrap gap-2 mt-1">
                          {CANDIDATE_ISSUE_CATEGORIES.map(cat => (
                            <button key={cat} type="button" className="btn btn-sm"
                              style={{ borderRadius: 20, border: `1.5px solid ${reportCategory === cat ? '#dc3545' : '#dee2e6'}`, background: reportCategory === cat ? '#dc354520' : '#fff', color: reportCategory === cat ? '#dc3545' : '#495057', fontWeight: reportCategory === cat ? 600 : 400, fontSize: 13 }}
                              onClick={() => setReportCategory(cat)}
                            >{cat}</button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label form-label-sm fw-semibold">Details <span className="text-muted fw-normal">(min. 10 chars)</span></label>
                        <textarea className="form-control form-control-sm" rows={3} value={reportDetails}
                          onChange={e => setReportDetails(e.target.value)} style={{ resize: 'none' }} />
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-danger btn-sm" onClick={handleReportCandidate}
                          disabled={!reportRating || !reportCategory || reportDetails.trim().length < 10 || reportSubmitting}>
                          {reportSubmitting ? <><span className="spinner-border spinner-border-sm me-1" />Submitting…</> : 'Submit Report'}
                        </button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowReportPanel(false)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
