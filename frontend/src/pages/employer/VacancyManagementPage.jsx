import { useState, useEffect } from 'react';
import api from '../../api/axios';

const EMPLOYMENT_TYPES = ['Permanent', 'Temporary', 'Contract'];

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
    <div className="container mt-4">
      <h3>Vacancy Management</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <button className="btn btn-primary mb-3" onClick={openCreate}>+ Post New Vacancy</button>
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Designation</th><th>Department</th><th>Location</th>
            <th>Status</th><th>Openings</th><th>Deadline</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vacancies.map(v => (
            <tr key={v.vacancyId}>
              <td>{v.designation}</td>
              <td>{v.department}</td>
              <td>{v.location}</td>
              <td><span className={`badge bg-${v.status === 'Open' ? 'success' : 'secondary'}`}>{v.status}</span></td>
              <td>{v.numOpenings}</td>
              <td>{v.applicationDeadline}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => openEdit(v)}>Edit</button>
                {v.status === 'Open' && (
                  <button className="btn btn-sm btn-danger" onClick={() => handleClose(v.vacancyId)}>Close</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editId ? 'Edit Vacancy' : 'Post New Vacancy'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body row g-3">
                  {[['designation','Designation'],['department','Department'],['location','Location'],
                    ['requiredQual','Required Qualification'],['jobDescription','Job Description']].map(([name, label]) => (
                    <div className="col-md-6" key={name}>
                      <label className="form-label">{label}</label>
                      <input className="form-control" name={name} value={form[name]} onChange={handleChange} required />
                    </div>
                  ))}
                  <div className="col-md-6">
                    <label className="form-label">Employment Type</label>
                    <select className="form-select" name="employmentType" value={form.employmentType} onChange={handleChange} required>
                      {EMPLOYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  {[['requiredExpYrs','Required Exp (yrs)'],['salaryMin','Salary Min'],
                    ['salaryMax','Salary Max'],['numOpenings','Num Openings']].map(([name, label]) => (
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
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editId ? 'Save Changes' : 'Post Vacancy'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VacancyManagementPage;
