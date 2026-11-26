import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import api from '../../api/axios';

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

function CandidateSearchPage() {
  const [form, setForm] = useState({ role: '', location: '', salaryMax: '', qualification: '', minPercentage: '' });
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    const params = {};
    if (form.role) params.role = form.role;
    if (form.location) params.location = form.location;
    if (form.salaryMax) params.salaryMax = form.salaryMax;
    if (form.qualification) params.qualification = form.qualification;
    if (form.minPercentage) params.minPercentage = form.minPercentage;
    try {
      const res = await api.get('/employer/candidates/search', { params });
      setResults(res.data);
    } catch {
      setResults([]);
    }
    setSearched(true);
    setError('');
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <>
      <EmployerNavbar />
      <div className="container mt-4">
        <h3 className="mb-4">Search Candidates</h3>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card shadow-sm mb-4" style={{ borderRadius: 10 }}>
          <div className="card-body">
            <form onSubmit={handleSearch} className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Role</label>
                <input className="form-control" name="role" value={form.role} onChange={handleChange} placeholder="e.g. Software Engineer" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Location</label>
                <input className="form-control" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bangalore" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Max Salary (₹)</label>
                <input className="form-control" type="number" name="salaryMax" value={form.salaryMax} onChange={handleChange} placeholder="e.g. 1000000" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Qualification</label>
                <input className="form-control" name="qualification" value={form.qualification} onChange={handleChange} placeholder="e.g. B.Tech" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Min Percentage</label>
                <input className="form-control" type="number" name="minPercentage" value={form.minPercentage} onChange={handleChange} placeholder="e.g. 60" />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button type="submit" className="btn btn-primary w-100">Search</button>
              </div>
            </form>
          </div>
        </div>

        {searched && (
          results.length === 0 ? (
            <p className="text-muted">No candidates found matching your criteria.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {results.map(c => (
                <div key={c.candidateId} className="card shadow-sm" style={{ borderRadius: 10, border: '1px solid #e5e7eb' }}>
                  <div className="card-body py-3 px-4">
                    <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
                      <div>
                        <div className="fw-bold" style={{ fontSize: 15 }}>{c.fullName}</div>
                        <div className="text-muted small">{c.degree} · {c.institution}</div>
                        {c.skills?.length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mt-2">
                            {c.skills.map(s => (
                              <span key={s} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 500 }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-end">
                        {c.percentage != null && <div className="fw-semibold">{c.percentage}%</div>}
                        {c.totalExpYrs != null && <div className="text-muted small">{c.totalExpYrs} yr(s) exp</div>}
                        {c.locationPrefs?.length > 0 && <div className="text-muted small mt-1">📍 {c.locationPrefs.join(', ')}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </>
  );
}

export default CandidateSearchPage;
