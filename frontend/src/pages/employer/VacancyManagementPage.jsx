import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import api from '../../api/axios';

const EMPLOYMENT_TYPES = ['Permanent', 'Temporary', 'Contract'];

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

const emptyForm = {
  designation: '', department: '', jobDescription: '', requiredQual: '',
  requiredExpYrs: '', salaryMin: '', salaryMax: '', employmentType: 'Permanent',
  numOpenings: '', location: '', applicationDeadline: '',
};

function VacancyManagementPage() {
  const [vacancies, setVacancies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => { loadVacancies(); }, []);

  async function loadVacancies() {
    try {
      const res = await api.get('/employer/vacancies');
      setVacancies(res.data);
    } catch {
      setError('Failed to load vacancies.');
    }
  }

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(v) {
    setEditId(v.vacancyId);
    setForm({
      designation: v.designation, department: v.department,
      jobDescription: v.jobDescription, requiredQual: v.requiredQual,
      requiredExpYrs: v.requiredExpYrs, salaryMin: v.salaryMin,
      salaryMax: v.salaryMax, employmentType: v.employmentType,
      numOpenings: v.numOpenings, location: v.location,
      applicationDeadline: v.applicationDeadline,
    });
    setShowModal(true);
  }

  async function handleClose(id) {
    if (!window.confirm('Close this vacancy?')) return;
    try {
      await api.patch(`/employer/vacancies/${id}/close`);
      loadVacancies();
    } catch {
      setError('Failed to close vacancy.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      requiredExpYrs: parseFloat(form.requiredExpYrs),
      salaryMin: parseInt(form.salaryMin),
      salaryMax: parseInt(form.salaryMax),
      numOpenings: parseInt(form.numOpenings),
    };
    try {
      if (editId) {
        await api.put(`/employer/vacancies/${editId}`, payload);
      } else {
        await api.post('/employer/vacancies', payload);
      }
      setShowModal(false);
      loadVacancies();
    } catch {
      setError('Failed to save vacancy.');
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <>
      <EmployerNavbar />
      <div className="container mt-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h3 className="mb-0">Vacancy Management</h3>
          <button className="btn btn-primary" onClick={openCreate}>+ Post New Vacancy</button>
        </div>
        {error && <div className="alert alert-danger alert-dismissible">{error}<button className="btn-close" onClick={() => setError('')} /></div>}

        <div className="d-flex flex-column gap-3">
          {vacancies.length === 0 && <p className="text-muted">No vacancies posted yet.</p>}
          {vacancies.map(v => (
            <div key={v.vacancyId} className="card shadow-sm" style={{ borderRadius: 10, border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4 d-flex align-items-start justify-content-between flex-wrap gap-3">
                <div>
                  <div className="fw-bold" style={{ fontSize: 15 }}>{v.designation}</div>
                  <div className="text-muted small">{v.department} · {v.location}</div>
                  <div className="mt-2 d-flex gap-2 align-items-center flex-wrap">
                    <span style={{
                      background: v.status === 'Open' ? '#f0fdf4' : '#f9fafb',
                      color: v.status === 'Open' ? '#16a34a' : '#6b7280',
                      border: `1px solid ${v.status === 'Open' ? '#bbf7d0' : '#e5e7eb'}`,
                      borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600,
                    }}>
                      {v.status}
                    </span>
                    {v.status === 'Open' && v.applicationDeadline && new Date(v.applicationDeadline) < new Date() && (
                      <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                        Deadline passed
                      </span>
                    )}
                    <span className="text-muted small">{v.numOpenings} opening{v.numOpenings !== 1 ? 's' : ''}</span>
                    <span className="text-muted small">· Deadline: {v.applicationDeadline}</span>
                  </div>
                </div>
                <div className="d-flex gap-2 flex-shrink-0">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(v)}>Edit</button>
                  {v.status === 'Open' && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleClose(v.vacancyId)}>Close</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header" style={{ background: '#0f172a', color: '#fff' }}>
                  <h5 className="modal-title fw-bold">{editId ? 'Edit Vacancy' : 'Post New Vacancy'}</h5>
                  <button className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body row g-3">
                    {[['designation','Designation'],['department','Department'],['location','Location'],
                      ['requiredQual','Required Qualification']].map(([name, label]) => (
                      <div className="col-md-6" key={name}>
                        <label className="form-label">{label}</label>
                        <input className="form-control" name={name} value={form[name]} onChange={handleChange} required />
                      </div>
                    ))}
                    <div className="col-12">
                      <label className="form-label">Job Description <span className="text-muted fw-normal" style={{ fontSize: 12 }}>(skills, responsibilities, requirements — supports multiple lines)</span></label>
                      <textarea
                        className="form-control"
                        name="jobDescription"
                        value={form.jobDescription}
                        onChange={handleChange}
                        rows={6}
                        placeholder={"e.g.\nResponsibilities:\n- Build and maintain REST APIs\n- Collaborate with frontend team\n\nRequired Skills:\n- Java, Spring Boot\n- 2+ years experience"}
                        required
                        style={{ resize: 'vertical', fontFamily: 'inherit' }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Employment Type</label>
                      <select className="form-select" name="employmentType" value={form.employmentType} onChange={handleChange} required>
                        {EMPLOYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    {[['requiredExpYrs','Required Exp (yrs)'],['salaryMin','Salary Min (₹)'],
                      ['salaryMax','Salary Max (₹)'],['numOpenings','Num Openings']].map(([name, label]) => (
                      <div className="col-md-6" key={name}>
                        <label className="form-label">{label}</label>
                        <input className="form-control" type="number" name={name} value={form[name]} onChange={handleChange} required />
                      </div>
                    ))}
                    <div className="col-md-6">
                      <label className="form-label">Application Deadline</label>
                      <input className="form-control" type="date" name="applicationDeadline" value={form.applicationDeadline} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{editId ? 'Save Changes' : 'Post Vacancy'}</button>
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

export default VacancyManagementPage;
