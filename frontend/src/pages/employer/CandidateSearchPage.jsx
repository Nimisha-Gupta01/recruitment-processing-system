import { useState } from 'react';
import api from '../../api/axios';

// TODO: remove mock
const mockResults = [
  { candidateId: 1, fullName: 'Priya Sharma', degree: 'B.Tech CSE', institution: 'NIT Warangal', percentage: 82.5, totalExpYrs: 3, skills: ['Java', 'React'], locationPrefs: ['Bangalore'] },
];

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
      // TODO: remove mock
      setResults(mockResults);
    }
    setSearched(true);
    setError('');
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="container mt-4">
      <h3>Search Candidates</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSearch} className="row g-3 mb-4">
        <div className="col-md-4">
          <label className="form-label">Role</label>
          <input className="form-control" name="role" value={form.role} onChange={handleChange} placeholder="e.g. Software Engineer" />
        </div>
        <div className="col-md-4">
          <label className="form-label">Location</label>
          <input className="form-control" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bangalore" />
        </div>
        <div className="col-md-4">
          <label className="form-label">Max Salary</label>
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

      {searched && (
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Name</th><th>Degree</th><th>Institution</th><th>%</th>
              <th>Exp (yrs)</th><th>Skills</th><th>Location Prefs</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr><td colSpan={7} className="text-center">No candidates found.</td></tr>
            ) : results.map(c => (
              <tr key={c.candidateId}>
                <td>{c.fullName}</td>
                <td>{c.degree}</td>
                <td>{c.institution}</td>
                <td>{c.percentage}</td>
                <td>{c.totalExpYrs}</td>
                <td>{(c.skills || []).join(', ')}</td>
                <td>{(c.locationPrefs || []).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CandidateSearchPage;
